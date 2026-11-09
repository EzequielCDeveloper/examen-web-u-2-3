# Documento de Cumplimiento de Requisitos y Evidencias

**Proyecto:** Anime Recommended (Plataforma Full Stack Django & React)  
**Materia / Práctica:** Desarrollo Web - Práctica 2 (Unidades 2 y 3)  
**Manual de Referencia:** Manual de Desarrollo Full Stack con Django y ReactJS (Páginas 13 a 35)

---

## Índice de Cumplimiento

1. [Parte 1: Frontend en React (Basado en el Manual Págs. 13 a 35)](#parte-1-frontend-en-react)
   - [1.1 Inicialización de React con Vite y Dependencias](#11-inicialización-de-react-con-vite-y-dependencias)
   - [1.2 Configuración de Rutas y Layouts](#12-configuración-de-rutas-y-layouts)
   - [1.3 Página de Login y Obtención de JWT](#13-página-de-login-y-obtención-de-jwt)
   - [1.4 Contexto de Usuario (AuthContext y Hook useAuth)](#14-contexto-de-usuario-authcontext-y-hook-useauth)
   - [1.5 Página y Lógica de Registro de Nuevos Usuarios](#15-página-y-lógica-de-registro-de-nuevos-usuarios)
2. [Parte 2: Integración de API de Terceros (Unidad 3)](#parte-2-integración-de-api-de-terceros-unidad-3)
3. [Parte 3: Web Services Propios y Consumo SOAP (Unidad 3)](#parte-3-web-services-propios-y-consumo-soap-unidad-3)
   - [3.1 Web Service Propio Protegido (/auth/me/)](#31-web-service-propio-protegido-apiv1authme)
   - [3.2 Consumo de Servicio SOAP Público con Zeep](#32-consumo-de-servicio-soap-público-con-zeep)
4. [Galería de Evidencias y Capturas](#4-galería-de-evidencias-y-capturas)

---

## Parte 1: Frontend en React

### 1.1 Inicialización de React con Vite y Dependencias
- **Ubicación:** `front-end/package.json`, `front-end/vite.config.js`.
- **Implementación:** Proyecto configurado con Vite 8 y React 19. Dependencias instaladas: `react-router-dom`, `react-bootstrap`, `bootstrap`, `react-toastify`, `axios`, `zeep` (backend).

### 1.2 Configuración de Rutas y Layouts
- **Ubicación:** `front-end/src/layouts/` (`AdminLayout.jsx`, `ClientLayout.jsx`, `CommonLayout.jsx`), `front-end/src/App.jsx`.
- **Implementación:**
  - `AdminLayout`: Protege la vista del Dashboard verificando la existencia de la sesión activa en `AuthContext`.
  - `CommonLayout`: Contenedor para pantallas de autenticación (`/login`, `/register`, 404).
  - `ClientLayout`: Contenedor para el catálogo general (`/`, `/explorar`, `/populares`, `/anime/:id`).

### 1.3 Página de Login y Obtención de JWT
- **Ubicación:** `front-end/src/screens/LoginScreen.jsx`, `front-end/src/api/user.js`.
- **Implementación:** Conecta el formulario mediante `fetch()` al endpoint `POST /api/v1/auth/token/` de Django SimpleJWT. Tras una respuesta exitosa (HTTP 200), almacena el token en `localStorage`, actualiza el `AuthContext`, muestra el token en consola y redirige al `/dashboard`.

### 1.4 Contexto de Usuario (AuthContext y Hook useAuth)
- **Ubicación:** `front-end/src/context/AuthContext.jsx`, `front-end/src/hooks/useAuth.jsx`, `front-end/src/hooks/useUser.jsx`, `front-end/src/api/token.js`.
- **Implementación:**
  - `AuthProvider` envuelve la aplicación completa.
  - Al montar la aplicación (`useEffect`), comprueba `getToken()`. Si existe, invoca `getMeApi(token)` (`/api/v1/auth/me/`) para restaurar la sesión y el perfil del usuario de forma transparente.
  - Expone `{ auth, user, login, logout }` a través del hook personalizado `useAuth()`.

### 1.5 Página y Lógica de Registro de Nuevos Usuarios
- **Ubicación:**
  - Backend: `backend/users/serializers.py` (`RegisterUserSerializer`), `backend/users/views.py` (`RegisterUserView`), `backend/users/urls.py` (`auth/register/`).
  - Frontend: `front-end/src/screens/RegisterScreen.jsx`, `front-end/src/api/user.js` (`registerApi`).
- **Implementación:** Permite el alta pública de usuarios con validaciones de contraseña mínima de 8 caracteres, hashing seguro PBKDF2 y feedback con `react-toastify`.

---

## Parte 2: Integración de API de Terceros (Unidad 3)

- **Ubicación:** `front-end/src/components/ThirdPartyWidget.jsx` integrado dentro de `front-end/src/screens/admin/DashboardScreen.jsx`.
- **Implementación:**
  - Consumo en vivo de la API pública gratuita de Frases Inspiradoras (`https://dummyjson.com/quotes/random`) mediante `fetch()`.
  - Consumo en vivo de la API meteorológica Open-Meteo (`https://api.open-meteo.com/v1/forecast?...`) mediante `fetch()`.
  - Botón interactivo "↻ Nueva frase" para recargar datos en tiempo real sin recargar la página.

---

## Parte 3: Web Services Propios y Consumo SOAP (Unidad 3)

### 3.1 Web Service Propio Protegido (`/api/v1/auth/me/`)
- **Ubicación:** `backend/users/views.py` (`UserView`), `backend/users/serializers.py` (`UserProfileSerializer`).
- **Comportamiento:**
  - Petición sin token: Retorna `401 Unauthorized` (`Las credenciales de autenticación no se proveyeron`).
  - Petición con cabecera `Authorization: Bearer <token>`: Retorna los datos personales del usuario autenticado (ID, email, username, teléfono, estado y rol).

### 3.2 Consumo de Servicio SOAP Público con Zeep
- **Ubicación:** `backend/users/views.py` (`SoapCountryInfoView`), `backend/users/urls.py` (`/api/v1/soap/country/`).
- **Librería Utilizada:** `zeep==4.3.3`.
- **Servicio SOAP Consumido:** `CountryInfoService` (WSDL: `http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL`).
- **Métodos SOAP Consumidos:** `CountryName`, `CapitalCity`, `CountryIntPhoneCode`, `CountryCurrency`, `CountryFlag`.
- **Ejemplo de Consulta:**
  ```bash
  curl "http://127.0.0.1:8000/api/v1/soap/country/?code=JP"
  ```
  **Respuesta JSON devuelta por Django:**
  ```json
  {
    "service": "CountryInfoService (SOAP / WSDL)",
    "wsdl": "http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso?WSDL",
    "country_code": "JP",
    "country_name": "Japan",
    "capital": "Tokyo",
    "phone_code": "81",
    "currency": {
      "sISOCode": "JPY",
      "sName": "Yen"
    },
    "flag_url": "http://www.oorsprong.org/WebSamples.CountryInfo/Flags/Japan.jpg",
    "status": "success"
  }
  ```

---

## 4. Galería de Evidencias y Capturas

### Captura 1: Login funcionando (Pantalla de React y Consola con Token JWT)
Se observa la pantalla de inicio de sesión de React y el panel de DevTools Console desplegado mostrando la petición HTTP 200 OK y la obtención del token de acceso y refresh desde Django SimpleJWT:

![Captura 1: Login funcionando con Token](evidencias/captura_1_login_token.png)

---

### Captura 2: Dashboard protegido (Mostrando nombre del usuario logueado con AuthContext)
Se observa el Dashboard protegido por `AdminLayout` mostrando la bienvenida personalizada al usuario autenticado (`Bienvenido, AnimeVipUser`), el distintivo de sesión activa `● Sesión Activa (AuthContext)` y los botones de acción:

![Captura 2: Dashboard protegido con AuthContext](evidencias/captura_2_dashboard_authcontext.png)

---

### Captura 3: Widget de la API de Terceros (Datos externos consumidos con fetch)
Se observa el widget integrado en el Dashboard consumiendo en vivo datos de la API de Terceros (`dummyjson.com/quotes/random`) y el clima en tiempo real de Open-Meteo, incluyendo la cita, el autor y el botón para actualizar:

![Captura 3: Widget de API de Terceros](evidencias/captura_3_widget_api_terceros.png)

---

### Captura 4: Consumo SOAP (Respuesta del servicio consumido desde Django con Zeep)

#### A) Respuesta directa en el Navegador (`/api/v1/soap/country/?code=JP`):
![Captura 4A: Consumo SOAP en Navegador](evidencias/captura_4_consumo_soap_navegador.png)

#### B) Componente Interactivo en Dashboard consumiendo el endpoint SOAP de Django:
![Captura 4B: Consumo SOAP en Dashboard](evidencias/captura_4_consumo_soap_widget.png)

---

### Captura 5: Pantalla de Registro de Nuevos Usuarios
Formulario de registro conectado al endpoint `/api/v1/auth/register/` de Django:

![Captura 5: Registro de Usuario](evidencias/captura_5_registro_usuario.png)
