# Reporte de Auditoría de Seguridad: Mass Assignment y Escalada de Privilegios

- **Proyecto:** Anime Recommended (Full Stack Django + React)
- **Componente:** Backend API (`users`)
- **Clasificación CWE:** CWE-915 (Improperly Controlled Modification of Dynamically Determined Object Attributes)
- **Clasificación OWASP:** A01:2021 – Broken Access Control / Privilege Escalation
- **Severidad:** Crítica (CVSS v3.1 Score: 8.8 - High/Critical)

---

## 1. ¿Qué es el error?

El error es una vulnerabilidad de **Asignación Masiva** (*Mass Assignment* o *Over-posting*) que deriva directamente en **Escalada Vertical de Privilegios** (*Privilege Escalation*).

En arquitecturas REST con Django REST Framework (DRF), los `ModelSerializer` generan automáticamente campos y validaciones a partir del modelo de base de datos. Si un serializer define campos sensibles en su lista `fields` (como `is_staff` o `is_active`) pero no los incluye explícitamente en `read_only_fields`, dichos campos quedan abiertos para ser deserializados y aplicados al modelo durante operaciones de escritura (`POST`, `PUT`, `PATCH`).

En este proyecto, la vista `UserView` encargada del endpoint de autoservicio del usuario autenticado (`/api/v1/auth/me/`):
```python
class UserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```
Utiliza `UserSerializer`, el cual tiene la siguiente configuración:
```python
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'telefono', 'password', 'is_active', 'is_staff', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']
```
Al omitir `is_staff` e `is_active` de `read_only_fields`, cualquier usuario con una cuenta estándar puede enviar un payload HTTP `PATCH` como:
```json
{
  "is_staff": true
}
```
El serializer valida la petición como legítima y ejecuta `serializer.save()`, mutando la bandera `user.is_staff = True` en la base de datos.

---

## 2. ¿Cómo se encontró?

La vulnerabilidad fue identificada mediante una **Auditoría de Código Estático (SAST manual)** y análisis de flujo de control (*data flow analysis*):

1. **Rastreo de rutas y permisos:** Se inspeccionó `users/urls.py`, detectando que `/auth/me/` permite a cualquier usuario autenticado (`IsAuthenticated`) interactuar con su perfil.
2. **Inspección del método de escritura:** En `users/views.py`, se constató que el método `patch()` alimenta los datos crudos del cliente (`request.data`) directamente a `UserSerializer(request.user, data=request.data, partial=True)` sin ningún filtrado de llaves a nivel de vista.
3. **Revisión del contrato del Serializer:** En `users/serializers.py`, se contrastaron los atributos mutables del modelo `User` contra `read_only_fields`. Se observó que mientras que `id` y `date_joined` estaban protegidos, las banderas booleanas de autorización (`is_staff`, `is_active`) no lo estaban.
4. **Verificación de impacto:** Se comprobó que `UserApiViewSet` restringe el acceso al CRUD completo de usuarios únicamente con `permission_classes = [IsAdminUser]`. La clase `IsAdminUser` de DRF solo evalúa `bool(request.user and request.user.is_staff)`. Por ende, el paso 3 otorga acceso inmediato e irrestricto al paso 4.

---

## 3. ¿Cómo se puede auditar en próximas auditorías?

Para institucionalizar la detección temprana de este vector de fallo en el ciclo de vida del software, se deben implementar tres mecanismos complementarios:

### A. Regla Heurística de Auditoría Manual / Code Review
En toda revisión de Pull Request que involucre endpoints de perfil o autoservicio de usuarios:
- **Verificar que ningún endpoint accesible por usuarios no administradores reutilice serializers administrativos.**
- **Lista de campos prohibidos en escritura no administrativa:** `is_staff`, `is_superuser`, `is_active`, `groups`, `user_permissions`, `role`, `permissions`, `balance`, `credits`.

### B. Análisis Estático Automatizado (SAST)
- **Semgrep / Bandit:** Configurar reglas personalizadas para advertir cuando un `ModelSerializer` contenga campos que inicien con `is_` o `role` y no figuren en `read_only_fields`.
  *Ejemplo de búsqueda rápida en consola:*
  ```bash
  grep -rn "is_staff" backend/ --include="*serializer*.py"
  ```
  Si `is_staff` aparece en `fields` sin estar en `read_only_fields` o en un serializer no restringido a admins, genera alerta roja.

### C. Pruebas de Regresión Negativas Automatizadas (Negative Unit Tests)
Cada suite de pruebas de autenticación debe incluir una prueba explícita de "Intento Malicioso de Escalada":
```python
def test_user_cannot_escalate_privileges_via_patch(self):
    self.client.force_authenticate(user=self.regular_user)
    response = self.client.patch('/api/v1/auth/me/', {'is_staff': True})
    self.regular_user.refresh_from_db()
    self.assertFalse(self.regular_user.is_staff)
```
Si alguien por error vuelve a exponer el campo en el serializer, la suite de integración continua (CI) fallará inmediatamente.

---

## 4. Alcance del error (Blast Radius)

El alcance de este fallo es de **compromiso total del sistema (Full System Compromise)**:

1. **Ruptura de la Confidencialidad:** El atacante, una vez convertido en Staff, puede listar todos los usuarios en `/api/v1/users/`, obteniendo emails, nombres y números telefónicos de toda la base de usuarios.
2. **Ruptura de la Integridad:** El atacante puede utilizar los métodos `PUT`/`PATCH`/`DELETE` de `/api/v1/users/{id}/` para alterar perfiles de otros usuarios, cambiar sus contraseñas o eliminarlos del sistema.
3. **Acceso al Panel Administrativo:** Al ser Staff, puede acceder a `/admin/` de Django. Si el panel administrativo tiene modelos expuestos, el atacante tiene control sobre la capa de persistencia completa.
4. **Disponibilidad:** El atacante puede enviar `{"is_active": false}` a cuentas legítimas o auto-inhabilitarse generando estados inconsistentes.
5. **Facilidad de Explotación:** Trivial. El endpoint `/api/v1/auth/register/` es público y no requiere aprobación manual ni verificación de correo. Cualquier atacante anónimo puede registrarse en 1 segundo y auto-promoverse en el siguiente segundo.

---

## 5. Solución que se implementará

La solución aplica el principio de **Segregación de Interfaces** y **Principio de Mínimo Privilegio**:

1. **Creación de `UserProfileSerializer`:**
   - Serializer específico y acotado para el endpoint de autoservicio `/api/v1/auth/me/`.
   - Campos permitidos: `id`, `username`, `email`, `first_name`, `last_name`, `telefono`, `is_staff`, `is_active`, `date_joined`.
   - Campos estrictamente de solo lectura (`read_only_fields`): `['id', 'is_staff', 'is_active', 'date_joined']`. De esta forma, el usuario puede consultar su estado en el `GET`, pero el motor de DRF descartará o rechazará cualquier intento de mutación en `PATCH`/`PUT`.
2. **Actualización de `UserView`:**
   - Sustituir `UserSerializer` por `UserProfileSerializer` en las operaciones `get` y `patch`.
3. **Blindaje de `UserSerializer`:**
   - Aunque `UserSerializer` se mantiene para `UserApiViewSet` (administración), se añade `date_joined` e `id` como inmutables y se refuerza la validación.
4. **Resolución de Colisión de Integridad en `User.save`:**
   - Asegurar que si dos usuarios se registran sin `username` con el mismo prefijo de correo (ej. `ana@a.com` y `ana@b.com`), el modelo genere automáticamente un sufijo incremental (`ana_1`, `ana_2`) evitando excepciones `IntegrityError` no capturadas (HTTP 500).

---

## 6. ¿Por qué esta decisión? (Justificación Arquitectónica)

1. **Single Responsibility Principle (SRP):** Un único serializer no debe asumir dos contratos con niveles de confianza dispares (el administrador del sistema vs. el usuario final anónimo autenticado). Separar `UserProfileSerializer` de `UserSerializer` refleja con precisión los dos contextos de uso de la aplicación.
2. **Defensa en Profundidad (Defense in Depth):** No dependemos de que la vista filtre campos manualmente (`request.data.pop('is_staff', None)`). La definición explícita en `read_only_fields` del serializer garantiza que la regla de negocio esté centralizada en la capa de esquema/validación.
3. **Mantenibilidad sin deuda técnica:** Si en el futuro se agregan más campos administrativos al modelo `User` (como `is_superuser`, `last_login`, o roles específicos), `UserProfileSerializer` no los expondrá accidentalmente, eliminando el riesgo de regresiones de seguridad.

---

## 7. ¿Cómo afecta la implementación al resto del proyecto?

1. **Compatibilidad con el Frontend:**
   - La respuesta del endpoint `GET /api/v1/auth/me/` mantiene exactamente la misma estructura JSON (`id`, `username`, `email`, `first_name`, `last_name`, `telefono`, `is_active`, `is_staff`, `date_joined`).
   - El frontend continuará consumiendo el perfil sin requerir ninguna modificación en sus componentes, selectores ni reducers de Redux.
2. **Compatibilidad con el Panel de Administración y Endpoints de Staff:**
   - `UserApiViewSet` (`/api/v1/users/`) sigue utilizando `UserSerializer`, permitiendo a los administradores legítimos gestionar usuarios, activarlos o desactivarlos según el diseño original.
3. **Documentación Swagger / OpenAPI (`drf-yasg`):**
   - La documentación interactiva en `/swagger/` y `/redoc/` reflejará con precisión que para `/auth/me/` los campos administrativos son informativos (`readOnly: true`), mejorando la calidad del contrato de API.
4. **Resiliencia de la Base de Datos:**
   - La corrección de `username` elimina errores 500 silenciosos durante registros concurrentes o con correos homónimos.
