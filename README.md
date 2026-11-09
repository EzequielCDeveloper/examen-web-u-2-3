# Anime Recommended - Full Stack Platform (Django & React)

Plataforma comercial de recomendaciones, catálogo y streaming de anime **Anime Recommended**.
Integra el catálogo en tiempo real de **Kitsu API**, persistencia de reseñas y usuarios en **Django REST Framework**, autenticación JWT con sesiones en **React Context**, y arquitectura de microservicios con consumo **SOAP (Zeep)** y **REST (Fetch)**.

---

## 🛠️ Stack Tecnológico de Producción

- **Backend:**
  - Python 3.12 / Django 6.1
  - Django REST Framework (DRF)
  - Autenticación JWT (`djangorestframework_simplejwt`)
  - Consumo SOAP público empresarial (`zeep` 4.3)
  - Servidor WSGI de producción: **Gunicorn**
  - Soporte de base de datos dual: **PostgreSQL 16** (Producción) / SQLite (Desarrollo local)
  - Documentación interactiva Swagger UI & ReDoc (`drf-yasg`)
- **Frontend:**
  - React 19 + Vite 8
  - React Router DOM v6 / v7
  - React Bootstrap 5 & CSS Moderno
  - Servidor de producción: **Nginx** (Reverse Proxy & Compresión Gzip)
  - Contexto global de autenticación (`AuthContext` + Hook `useAuth`)
  - Consumo de API de Terceros vía `fetch()` nativo (Kitsu API Edge)
  - React Toastify

---

## 📋 Estructura del Proyecto

```text
├── backend/                  # API REST en Django
│   ├── anime_backend/        # Configuración principal (settings, urls, wsgi)
│   ├── users/                # App de usuarios, JWT y Gateway SOAP
│   ├── reviews/              # App de valoraciones y reseñas comunitarias
│   ├── Dockerfile            # Imagen Docker optimizada con Gunicorn
│   ├── requirements.txt      # Dependencias de Python (zeep, gunicorn, psycopg2)
│   └── manage.py             # CLI de Django
├── front-end/                # Cliente Web en React + Vite
│   ├── src/
│   │   ├── api/              # Clientes de API (token.js, user.js, client.js)
│   │   ├── context/          # AuthContext (proveedor de sesión activa)
│   │   ├── hooks/            # Custom Hooks (useAuth, useUser)
│   │   ├── layouts/          # Layouts (AdminLayout, ClientLayout, CommonLayout)
│   │   ├── components/       # Widgets integrados (ThirdPartyWidget, SoapViewerWidget)
│   │   └── screens/          # Vistas (HomeScreen, AnimeScreen, DashboardScreen, etc.)
│   ├── Dockerfile            # Construcción multi-stage Nginx
│   └── nginx.conf            # Configuración Nginx para SPA y Reverse Proxy
├── docs/                     # Evidencias y auditorías
│   ├── EVIDENCIAS_REQUISITOS.md # Documento con capturas y cumplimiento de rúbrica
│   └── evidencias/           # Capturas de pantalla generadas
├── docker-compose.yml        # Despliegue completo (Postgres + Gunicorn + Nginx)
├── requirements.txt          # Dependencias globales de Python
└── .gitignore                # Exclusiones de Git (venv, db.sqlite3, node_modules)
```

---

## 🐳 Despliegue en Producción con Docker (Recomendado)

Para levantar la infraestructura completa con **PostgreSQL**, **Django (Gunicorn)** y **React (Nginx)** en un solo comando:

```bash
docker compose up --build -d
```

- **Frontend (Web):** `http://localhost/` (Puerto 80)
- **Backend API:** `http://localhost:8000/api/v1/`
- **Swagger UI:** `http://localhost:8000/swagger/`
- **Base de Datos:** PostgreSQL en puerto `5432`

Para detener los contenedores:
```bash
docker compose down
```

---

## 💻 Ejecución Local en Modo Desarrollo

### 1. Backend (Django)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate       # Linux/macOS (en Windows: venv\Scripts\activate)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

### 2. Frontend (React + Vite)
```bash
cd front-end
npm install
npm run dev
```
*Frontend disponible en `http://127.0.0.1:5173/`.*

---

## 🔑 Credenciales de Acceso de Prueba

| Rol | Correo Electrónico | Contraseña | Descripción |
| :--- | :--- | :--- | :--- |
| **Administrador (Staff)** | `admin@animerecommended.com` | `Admin1234!` | Acceso completo al Panel Admin y gestión de usuarios |
| **Usuario VIP (Demo)** | `usuario_vip@selectanime.com` | `Anime1234!` | Usuario regular con acceso a Dashboard y Mi Lista |

*(La pantalla de login incluye botones de acceso rápido para demostración inmediata).*

---

## 📡 Endpoints de la API Backend

| Método | Endpoint | Permisos | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/token/` | Público | Autenticación y obtención de tokens JWT (`access` y `refresh`) |
| `POST` | `/api/v1/auth/token/refresh/` | Público | Renovación de token de acceso JWT |
| `POST` | `/api/v1/auth/register/` | Público | Registro de nuevos usuarios con contraseña segura |
| `GET` | `/api/v1/auth/me/` | Autenticado (`Bearer`) | **Web Service Propio:** Perfil del usuario en sesión |
| `GET` | `/api/v1/soap/country/?code=JP` | Público | **Consumo SOAP:** Gateway de Licenciamiento Regional con `zeep` |
| `GET` | `/api/v1/users/` | `IsAdminUser` | CRUD administrativo de cuentas de usuario |
| `GET` | `/swagger/` | Público | Documentación interactiva Swagger UI |

---

## 📷 Evidencias de Requisitos
Para consultar las capturas de pantalla de los requisitos solicitados, dirígete a:
👉 **[`docs/EVIDENCIAS_REQUISITOS.md`](docs/EVIDENCIAS_REQUISITOS.md)**
