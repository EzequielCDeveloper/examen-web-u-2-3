from django.shortcuts import render
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from zeep import Client
from zeep.helpers import serialize_object

from users.models import User
from users.serializers import UserSerializer, UserProfileSerializer, RegisterUserSerializer


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """
    Endpoint para autenticación con tokens JWT protegido por limitación de tasa (Rate Limiting).
    Mitiga ataques de fuerza bruta y credential stuffing sobre las credenciales de los usuarios.
    """
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'


class UserApiViewSet(ModelViewSet):
    """
    CRUD completo de usuarios administrable exclusivamente por usuarios Staff / Admin.
    
    CORRECCIÓN DE SEGURIDAD DEL MANUAL:
    1. Nunca expone el hash de contraseñas en las respuestas (controlado en UserSerializer).
    2. Al actualizar mediante PUT o PATCH sin enviar 'password', la contraseña del usuario
       a modificar permanece intacta. El código erróneo del manual asignaba `request.user.password`,
       lo que sobrescribía la contraseña de la víctima con la del usuario que realizaba la petición.
    """
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def partial_update(self, request, *args, **kwargs):
        """
        Actualización parcial segura (PATCH).
        Si no se envía 'password', se actualizan los demás campos sin alterar la contraseña.
        Si se envía 'password', el UserSerializer aplica `set_password` de forma segura.
        """
        return super().partial_update(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        Actualización total segura (PUT).
        """
        return super().update(request, *args, **kwargs)


class UserView(APIView):
    """
    Endpoint para consultar y actualizar los datos del usuario autenticado (auth/me/).
    
    CORRECCIÓN DE SEGURIDAD (MASS ASSIGNMENT & ESCALADA DE PRIVILEGIOS - CWE-915):
    Utiliza UserProfileSerializer, blindando 'is_staff' e 'is_active' como campos de solo lectura,
    e impidiendo que usuarios comunes eleven sus privilegios en la aplicación.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Obtiene los datos del perfil del usuario actualmente autenticado.",
        responses={200: UserProfileSerializer}
    )
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Actualiza los datos del perfil del usuario actualmente autenticado.",
        request_body=UserProfileSerializer,
        responses={200: UserProfileSerializer}
    )
    def patch(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterUserView(ModelViewSet):
    """
    Endpoint público para el registro de nuevos usuarios en la plataforma.
    Solo permite el método POST para evitar listar usuarios a personas no autorizadas.
    Protegido con Rate Limiting para evitar inundación de registros automatizados.
    """
    permission_classes = [AllowAny]
    serializer_class = RegisterUserSerializer
    queryset = User.objects.all()
    http_method_names = ['post', 'head', 'options']
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    @swagger_auto_schema(
        operation_description="Registra una nueva cuenta de usuario en la plataforma.",
        request_body=RegisterUserSerializer,
        responses={
            201: "Usuario registrado exitosamente",
            400: "Datos inválidos o contraseñas no coincidentes"
        }
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'status': 'success',
                'message': 'Usuario registrado exitosamente',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'telefono': user.telefono,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SoapCountryInfoView(APIView):
    """
    Endpoint de Consumo de Web Service SOAP (Unidad 3).
    Consume el servicio público SOAP CountryInfoService mediante la librería Zeep.
    Permite consultar datos de países (nombre, capital, código telefónico, moneda y bandera)
    especificando el código ISO de 2 letras (ej. MX, JP, US, ES).
    """
    permission_classes = [AllowAny]
    WSDL_URL = "http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL"

    @swagger_auto_schema(
        operation_description=(
            "Consume un Web Service SOAP público (CountryInfoService) utilizando la librería Zeep.\n"
            "Retorna información estructurada del país solicitado (Capital, Moneda, Teléfono, Bandera)."
        ),
        manual_parameters=[
            openapi.Parameter(
                'code',
                openapi.IN_QUERY,
                description="Código ISO de 2 letras del país (ej. JP, MX, US, ES, FR, DE)",
                type=openapi.TYPE_STRING,
                default='JP',
                required=False
            )
        ],
        responses={
            200: "Datos del servicio SOAP consumidos con éxito",
            400: "Código ISO inválido",
            503: "Error al comunicar con el servicio SOAP externo"
        }
    )
    def get(self, request):
        country_code = request.query_params.get('code', 'JP').strip().upper()
        if not country_code or len(country_code) != 2:
            return Response(
                {"error": "El código ISO debe ser de exactamente 2 letras (ej. JP, MX, US)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            client = Client(self.WSDL_URL)
            country_name = client.service.CountryName(sCountryISOCode=country_code)
            capital = client.service.CapitalCity(sCountryISOCode=country_code)
            phone_code = client.service.CountryIntPhoneCode(sCountryISOCode=country_code)
            currency_obj = client.service.CountryCurrency(sCountryISOCode=country_code)
            flag_url = client.service.CountryFlag(sCountryISOCode=country_code)

            currency_serialized = serialize_object(currency_obj) if currency_obj else {}

            return Response({
                "service": "CountryInfoService (SOAP / WSDL)",
                "wsdl": self.WSDL_URL,
                "country_code": country_code,
                "country_name": country_name,
                "capital": capital,
                "phone_code": phone_code,
                "currency": currency_serialized,
                "flag_url": flag_url,
                "status": "success",
            })
        except Exception as exc:
            return Response(
                {
                    "error": f"Error consumiendo el servicio SOAP: {str(exc)}",
                    "wsdl": self.WSDL_URL,
                    "country_code": country_code,
                    "status": "soap_service_unavailable"
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

