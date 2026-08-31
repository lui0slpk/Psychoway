# 🧠 Psychoway - Plataforma de Apoyo Psicológico para Aprendices SENA

![Psychoway Banner](https://img.shields.io/badge/Psychoway-Mental%20Health%20Support-green)
![Status](https://img.shields.io/badge/status-In%20Development-yellow)
![Version](https://img.shields.io/badge/version-0.5-blue)

---

## 📖 Descripción del Proyecto

**Psychoway** es una plataforma web integral diseñada para **acercar a los aprendices del SENA al apoyo psicológico**. Nuestro objetivo es **reducir el estigma y miedo** asociado a buscar ayuda mental mediante herramientas digitales accesibles, amigables y confidenciales.

### 🎯 Visión

Crear un espacio seguro donde los aprendices SENA puedan:

- 📔 Registrar y monitorear sus emociones diariamente
- 📅 Agendar citas con psicólogos profesionales
- 🤖 Conversar con un asistente IA para apoyo inmediato
- 📊 Visualizar su progreso emocional
- 🎯 Establecer objetivos de bienestar mental

### 💡 Características Clave

✨ **Diario de Emociones** - Registro diario con seguimiento visual
✨ **Agenda de Citas** - Sistema de agendamiento con psicólogos
✨ **Chat IA (Psychobot)** - Asistente disponible 24/7 con Gemini
✨ **Dashboard Psicólogo** - Monitoreo de aprendices asignados
✨ **Panel Admin** - Gestión completa del sistema
✨ **Recuperación de Contraseña** - Segura con tokens
✨ **Multi-rol** - Acceso diferenciado por perfil (aprendiz, psicólogo, administrador)

---

## 🏗️ Arquitectura del Sistema

Psychoway es un **monorepo** organizado con **pnpm workspaces** que contiene un frontend SPA (en `Frontend/`) y un backend API (en `Backend/`). La aplicación sigue una arquitectura **cliente-servidor por capas** con separación clara de responsabilidades.

### 📊 Diagrama Arquitectónico

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PSYCHOWAY ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐                      ┌──────────────────────┐
│   CLIENT (React SPA)     │   HTTP/REST + JSON   │   BACKEND (Express)  │
│   ┌──────────────────────┐│      JWT (Bearer)    │  ┌──────────────────┐│
│   │  Frontend/src/       │├─────────────────────►│  │  routes/         ││
│  │  • pages/ (por rol)  ││                      │  │  controllers/    ││
│  │  • api/ (módulos)    │◄──────────────────────┤  │  services/       ││
│  │  • context/          ││   JSON + errores     │  │  repositories/   ││
│  │  • layouts/          ││                      │  │  middlewares/    ││
│  │  • components/       ││  :5000               │  │  config/         ││
│  │  :3000               ││                      │  └────────┬─────────┘│
│  └──────────────────────┘│                      └───────────┼──────────┘
└──────────────────────────┘                                  │
        │                                                     │
        └─────────────────────────────────────────────────────┘
                          SQL (parametrizado)

┌──────────────────────────────────────────────────────────────────────────┐
│                     DATA & EXTERNAL SERVICES                             │
│  ┌──────────────────────────┐         ┌──────────────────────────────┐   │
│  │  Supabase (PostgreSQL)   │         │  Google Gemini (Psychobot)   │   │
│  │  • Usuarios / Roles      │         │  Nodemailer (Email/SMTP)     │   │
│  │  • Emociones / Diario    │         │  JWT (Autenticación)         │   │
│  │  • Citas (meetings)      │         │  bcrypt (Hash de contraseñas)│   │
│  │  • Objetivos / Tracking  │         └──────────────────────────────┘   │
│  │  • Notificaciones        │                                            │
│  └──────────────────────────┘                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

### 🔧 Componentes Principales

#### **Frontend (React 19 + JavaScript)**

- **SPA Responsiva**: Interfaz con Bootstrap 5 y animaciones con Framer Motion
- **State Management**: Context API (`AuthContext`) para autenticación y sesión
- **Routing**: React Router v7 con rutas protegidas por rol (`ProtectedRoute`)
- **Consumo de API**: Cliente HTTP propio (`Frontend/src/api/client.js`) basado en `fetch`
- **Port**: `3000`

#### **Backend (Node.js + Express 5)**

- **API REST**: Endpoints RESTful organizados por dominio
- **Arquitectura por capas**: `routes → controllers → services → repositories`
- **Middleware**: Autenticación JWT, manejo centralizado de errores
- **Validación y autorización**: Entrada validada en `utils/validators.js` (email, documento, doc_type) y acceso por rol con `requireAdmin`/`requireRole`
- **ESM**: Módulos nativos de ES (`"type": "module"`)
- **Port**: `5000`

#### **Base de Datos (Supabase / PostgreSQL)**

- **Pool de conexiones**: `pg` con connection string de Supabase y SSL
- **Queries parametrizadas**: Sintaxis PostgreSQL (`$1, $2, ...`)
- **Schema único**: `supabase_schema.sql` es el archivo canónico e idempotente de BD — se ejecuta una vez en el SQL Editor de Supabase y deja el esquema listo (12 tablas, UNIQUE en email/documento, FKs con CASCADE, seeds). No hay migraciones en código.

#### **Servicios Externos**

- **Google Gemini** (`@google/genai`): Motor del chat Psychobot
- **Nodemailer**: Notificaciones y recuperación de contraseña por email

---

## 📁 Estructura de Directorios

```
Psychoway/                       # Monorepo (pnpm workspace)
├── Frontend/                    # Aplicación React (frontend SPA)
│   ├── src/
│   │   ├── api/                 # Módulos de consumo de API
│   │   │   ├── client.js        # Cliente HTTP compartido (fetch + ApiError)
│   │   │   ├── config.js        # Configuración de URLs
│   │   │   ├── auth.api.js      # Módulo: autenticación
│   │   │   ├── meetings.api.js  # Módulo: citas
│   │   │   ├── users.api.js     # Módulo: usuarios
│   │   │   ├── diary.api.js     # Módulo: diario
│   │   │   ├── emotions.api.js  # Módulo: emociones
│   │   │   ├── objectives.api.js# Módulo: objetivos
│   │   │   ├── tracking.api.js  # Módulo: seguimiento
│   │   │   ├── psychobot.api.js # Módulo: chat IA
│   │   │   ├── notifications.api.js # Módulo: notificaciones
│   │   │   ├── psychologists.api.js # Módulo: psicólogos
│   │   │   ├── index.js         # Barrel export
│   │   │   └── tests/           # Tests unitarios de los módulos API
│   │   ├── components/          # Componentes reutilizables (ProtectedRoute)
│   │   ├── context/             # Context API (AuthContext)
│   │   ├── layouts/             # Layouts (Navbar, Sidebar, Footer, MainLayout)
│   │   ├── pages/               # Páginas por rol
│   │   │   ├── aprendiz/        # Diario, Seguimiento, Agenda, Psychobot, MiCuenta, Privacidad
│   │   │   ├── psicologo/       # PsiSeguimiento, PsiAgenda, MiCuentaPsi
│   │   │   └── administrador/   # Gestion, GestionMod
│   │   ├── utils/               # Funciones auxiliares (alerts)
│   │   ├── assets/              # Imágenes y recursos estáticos
│   │   ├── App.js               # Definición de rutas
│   │   └── index.js             # Entry point
│   ├── public/                  # Archivos estáticos (index.html, favicon, manifest)
│   ├── package.json             # Dependencias y scripts del frontend
│   └── vitest.config.js         # Configuración de tests (Vitest)
│
├── Backend/                     # Servidor Express
│   ├── src/
│   │   ├── routes/              # Definición de rutas HTTP
│   │   ├── controllers/         # Manejo de peticiones/respuestas
│   │   ├── services/            # Lógica de negocio
│   │   ├── repositories/        # Acceso a datos (queries SQL)
│   │   ├── middlewares/         # Auth JWT, autorización por rol (requireRole/requireAdmin)
│   │   ├── config/              # database, environment, gemini
│   │   └── utils/               # Constantes y validadores (validators.js)
│   ├── server.js                # Entry point
│   ├── .env.example             # Plantilla de variables de entorno
│   └── package.json
│
├── supabase_schema.sql          # Esquema de base de datos (PostgreSQL)
├── pnpm-workspace.yaml          # Configuración de workspaces ('.', Frontend, Backend)
├── vercel.json                  # Configuración de deploy (Vercel)
├── package.json                 # Scripts del monorepo (orquestador)
└── README.md
```

---

## 🛠️ Stack Tecnológico

### Frontend

---

**Lenguajes:**

- JavaScript ES6+
- HTML5
- CSS3

**Frameworks:**

- React.js 19
- Bootstrap 5

**Librerías:**

- React Router v7
- Framer Motion
- Recharts
- SweetAlert2
- Lucide React
- Bootstrap Icons

**APIs y Estado:**

- Context API
- Fetch API

### Backend

---

**Lenguajes:**

- JavaScript ES6+ (ESM)
- SQL (PostgreSQL)

**Frameworks:**

- Express.js 5

**Librerías:**

- pg
- jsonwebtoken
- bcrypt
- @google/genai (Gemini)
- nodemailer
- cors
- dotenv

**Base de Datos:**

- Supabase (PostgreSQL)

### DevOps & Herramientas

---

**Herramientas:**

- pnpm
- Git / GitHub
- Vercel (deploy frontend)
- Render (deploy backend)
- Vitest/Jest + Testing Library

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- Node.js 18+ (recomendado)
- pnpm (opcional si usás npm: los scripts raíz usan pnpm)
- Una base de datos Supabase (PostgreSQL)
- API key de Google Gemini (para Psychobot)

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/lui0slpk/Psychoway.git
cd Psychoway
```

2. **Instalar dependencias** (frontend + backend, resueltas por el workspace pnpm)

```bash
pnpm install
```

3. **Configurar variables de entorno**

Copiá `Backend/.env.example` a `.env` en la **raíz** del proyecto (el backend lo busca 3 niveles arriba de `Backend/src/config/`):

```bash
# .env (raíz)
PORT=5000
SUPABASE_URL=tu_url_supabase
SUPABASE_DB_URL=tu_connection_string
JWT_SECRET=tu_secreto
GEMINI_API_KEY=tu_api_key
EMAIL_USER=tu_email
EMAIL_PASS=tu_password
```

4. **Inicializar la base de datos**

Ejecutá `supabase_schema.sql` en tu proyecto Supabase (SQL Editor) para crear las tablas.

5. **Ejecutar la aplicación**

```bash
pnpm start        # levanta frontend (3000) y backend (5000) juntos
pnpm run frontend # solo frontend
pnpm run server   # solo backend
```

6. **Correr tests** (módulos API del frontend)

```bash
pnpm test
```

---

## 📚 Documentación

- [🏗️ Diagrama de arquitectura](./ARCHITECTURE.puml)
- [⚙️ Esquema de base de datos](./supabase_schema.sql)
- [🔑 Variables de entorno](./Backend/.env.example)

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feat/descripcion`)
3. Commit cambios siguiendo [Conventional Commits](https://www.conventionalcommits.org/) (`git commit -m 'feat(scope): descripción'`)
4. Push a la rama (`git push origin feat/descripcion`)
5. Abre un Pull Request hacia `main`

---

## 👥 Equipo

- **Desarrolladores**:
  - Jerónimo Gil Serna
  - Luis Angel Zapata Reyes
  - Anderson Clever Amaya Vallejo
  - Kevin Castañeda Serna
- **Institución**: SENA

---

## 📞 Soporte y Contacto

Para reportar bugs o sugerencias:

- 📧 Email: psychowaysena@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/lui0slpk/Psychoway/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/lui0slpk/Psychoway/discussions)

---

## 🎓 Reconocimientos

Especial agradecimiento a:

- SENA por el apoyo institucional
- Equipo de Psicología por orientación profesional
- Community open source

---

**Última actualización**: 2026-08-31
**Versión**: 0.5 | **Estado**: En Desarrollo ⚙️
