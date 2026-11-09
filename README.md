# Anime Recommended - Full Stack Platform (Django & React)

Proyecto Full Stack para la plataforma de recomendaciones y catálogo de anime **Anime Recommended**.
Construido siguiendo las directrices del **Manual de Desarrollo Full Stack con Django y ReactJS** (Unidades 2 y 3).

---

## 🛠️ Stack Tecnológico

- **Backend:**
  - Python 3.10+ / Django 6.1
  - Django REST Framework (DRF)
  - Autenticación JWT (`djangorestframework_simplejwt`)
  - Consumo SOAP público (`zeep` 4.3)
  - Documentación interactiva Swagger UI & ReDoc (`drf-yasg`)
  - SQLite (Base de datos local)
  - Django CORS Headers
- **Frontend:**
  - React 19 + Vite
  - React Router DOM v6 / v7
  - React Bootstrap 5 & CSS Moderno
  - Contexto global de autenticación (`AuthContext` + Hook `useAuth`)
  - Consumo de API de Terceros vía `fetch()` nativo (Quotes & Weather)
  - React Toastify

---

## 📋 Estructura del Repositorio

```text
├── backend/                  # Proyecto Backend en Django
│   ├── anime_backend/        # Configuración principal (settings, urls, wsgi)
│   ├── users/                # App de gestión de usuarios, JWT y endpoint SOAP
│   ├── reviews/              # App de valoraciones y reseñas comunitarias
│   ├── manage.py             # CLI de administración de Django
│   ├── requirements.txt      # Dependencias de Python (incluye zeep y SimpleJWT)
│   └── README.md             # Documentación específica del backend
├── front-end/                # Proyecto Frontend en React + Vite
│   ├── src/
│   │   ├── api/              # Llamadas API (token.js, user.js, client.js)
│   │   ├── context/          # AuthContext (proveedor de sesión activa)
│   │   ├── hooks/            # Custom Hooks (useAuth, useUser)
│   │   ├── layouts/          # Layouts (AdminLayout, ClientLayout, CommonLayout)
│   │   ├── components/       # Componentes y Widgets (ThirdPartyWidget, SoapViewerWidget)
│   │   ├── screens/          # Páginas (LoginScreen, RegisterScreen, DashboardScreen, etc.)
│   │   └── App.jsx           # Sistema central de rutas y ToastContainer
│   ├── package.json          # Dependencias y scripts de npm
│   └── .env                  # Variables de entorno frontend
├── docs/                     # Documentación y auditorías
│   ├── EVIDENCIAS_REQUISITOS.md # Documento con capturas y cumplimiento de requisitos
│   └── evidencias/           # Capturas de pantalla generadas
├── requirements.txt          # Dependencias globales de Python
└── .gitignore                # Reglas de exclusión (venv, db.sqlite3, node_modules)
```

---

## 🚀 Guía de Instalación y Ejecución

### 1. Requisitos Previos
- **Python:** 3.10 o superior (`python3 --version`)
- **Node.js:** 18 o superior (`node -v`)
- **npm** o **bun**

---

### 2. Configuración del Backend (Django)

1. **Crear y activar el entorno virtual:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate    # En Linux / macOS
   # venv\Scripts\activate     # En Windows PowerShell
   ```

2. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Ejecutar migraciones de la base de datos:**
   ```bash
   python manage.py migrate
   ```

4. **(Opcional) Crear un Superusuario:**
   ```bash
   python manage.py createsuperuser
   ```

5. **Iniciar el servidor de desarrollo:**
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```
   *El backend estará disponible en `http://127.0.0.1:8000/`.*

---

### 3. Configuración del Frontend (React + Vite)

1. **Abrir una nueva terminal y acceder a la carpeta del frontend:**
   ```bash
   cd front-end
   ```

2. **Instalar dependencias de Node.js:**
   ```bash
   npm install
   ```

3. **Verificar variables de entorno:**
   Asegúrate de contar con el archivo `.env` en la raíz de `front-end`:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000
   VITE_BASE_API_URL=http://127.0.0.1:8000
   VITE_LOCAL_STORAGE_ITEM_NAME=anime_token
   ```

4. **Iniciar el servidor de desarrollo de Vite:**
   ```bash
   npm run dev
   ```
   *El frontend estará disponible en `http://127.0.0.1:5173/`.*

---

## 🔑 Credenciales de Acceso de Prueba

| Rol | Correo Electrónico | Contraseña | Descripción |
| :--- | :--- | :--- | :--- |
| **Administrador (Staff)** | `admin@animerecommended.com` | `Admin1234!` | Acceso completo al Panel Admin y CRUD de usuarios |
| **Usuario VIP (Demo)** | `usuario_vip@selectanime.com` | `Anime1234!` | Usuario estándar registrado con acceso al Dashboard |

*Nota: La pantalla de login incluye botones de acceso rápido demo para facilitar la evaluación.*

---

## 📡 Endpoints de la API Backend

| Método | Endpoint | Permisos | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/token/` | Público | Autenticación y obtención de tokens JWT (`access` y `refresh`) |
| `POST` | `/api/v1/auth/token/refresh/` | Público | Renovación de token de acceso JWT |
| `POST` | `/api/v1/auth/register/` | Público | Registro de nuevos usuarios con contraseña segura |
| `GET` | `/api/v1/auth/me/` | Autenticado (`Bearer`) | **Web Service Propio:** Datos del perfil del usuario en sesión |
| `GET` | `/api/v1/soap/country/?code=JP` | Público | **Consumo SOAP:** Consulta SOAP pública con `zeep` (CountryInfoService) |
| `GET` | `/api/v1/users/` | `IsAdminUser` | CRUD administrativo de cuentas de usuario |
| `GET` | `/swagger/` | Público | Documentación interactiva Swagger UI |
| `GET` | `/redoc/` | Público | Documentación interactiva ReDoc |

---

## 🧪 Pruebas Rápidas con cURL

### 1. Iniciar sesión y obtener token JWT:
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario_vip@selectanime.com","password":"Anime1234!"}'
```

### 2. Consultar Web Service Propio protegido (`/auth/me/`):
```bash
curl http://127.0.0.1:8000/api/v1/auth/me/ \
  -H "Authorization: Bearer <TU_ACCESS_TOKEN>"
```

### 3. Consultar servicio SOAP consumido en Django con Zeep:
```bash
curl "http://127.0.0.1:8000/api/v1/soap/country/?code=JP"
curl "http://127.0.0.1:8000/api/v1/soap/country/?code=MX"
```

---

## 📷 Evidencias de Requisitos
Para consultar las capturas de pantalla de los requisitos solicitados, dirígete al documento:
👉 **[`docs/EVIDENCIAS_REQUISITOS.md`](docs/EVIDENCIAS_REQUISITOS.md)**
