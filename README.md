# 🧠 Psychoway - Plataforma de Apoyo Psicológico para Aprendices SENA

![Psychoway Banner](https://img.shields.io/badge/Psychoway-Mental%20Health%20Support-green)
![Status](https://img.shields.io/badge/status-In%20Development-yellow)
![Version](https://img.shields.io/badge/version-0.2.0-blue)

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
✨ **Chat IA (Psychobot)** - Asistente disponible 24/7  
✨ **Dashboard Psicólogo** - Monitoreo de aprendices asignados  
✨ **Panel Admin** - Gestión completa del sistema  
✨ **Recuperación de Contraseña** - Segura con tokens  
✨ **Multi-rol** - Acceso diferenciado por perfil  

---

## 🏗️ Arquitectura del Sistema (v2.0)

La arquitectura de Psychoway sigue un modelo **moderno y escalable** con separación clara de responsabilidades:

### 📊 Diagrama Arquitectónico

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PSYCHOWAY ARCHITECTURE v2.0                      │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐                      ┌──────────────────────┐
│   CLIENT LAYER           │                      │  API GATEWAY LAYER   │
│  ┌──────────────────────┐│                      │  ┌──────────────────┐│
│  │  React SPA 19        ││  HTTP/REST + WS      │  │ Express.js       ││
│  │  • Emotion Diary     │├─────────────────────►│  │ Middleware Stack ││
│  │  • Scheduler         ││   JSON/HTTPS         │  │ • Auth           ││
│  │  • Psych Dashboard   ││                      │  │ • Validation     ││
│  │  • Admin Panel       ││                      │  │ • CORS           ││
│  │  Bootstrap 5 + RTK   │◄─────────────────────┤  │ • Error Handler  ││
│  │                      ││                      │  │ :5000            ││
│  │  :3000              ││                      │  │                  ││
│  └──────────────────────┘│                      │  └────────┬─────────┘│
└──────────────────────────┘                      └──────────┼──────────┘
        │                                                    │
        └────────────────────────────────────────────────────┘
                          JWT + Session

┌──────────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                                │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                │
│  │ Auth Module   │  │ Emotion Module│  │ Schedule Mgmt │                │
│  │ • Login       │  │ • Create      │  │ • Create Appt │                │
│  │ • Register    │  │ • Retrieve    │  │ • Manage Appt │                │
│  │ • Roles       │  │ • Update      │  │ • Notifications
│  │ • Permissions │  │ • Analytics   │  │ • Calendar    │                │
│  └───────────────┘  └───────────────┘  └───────────────┘                │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                │
│  │ AI Chat Module│  │ User Management  │ Admin Module  │                │
│  │ • Psychobot   │  │ • Profile      │ │ • Analytics   │                │
│  │ • Messages    │  │ • Stats        │ │ • Reports     │                │
│  │ • Context     │  │ • Preferences  │ │ • User Mgmt   │                │
│  │ • Integration │  │ • Settings     │ │ • Config      │                │
│  └───────────────┘  └───────────────┘  └───────────────┘                │
└──────────────────────────────────────────────────────────────────────────┘
        │                      │                        │
        └──────────────────────┼────────────────────────┘
                               │

┌──────────────────────────────────────────────────────────────────────────┐
│                   DATA PERSISTENCE & SERVICES LAYER                      │
│  ┌──────────────────────────┐         ┌──────────────────────────┐      │
│  │   DATABASE (MySQL)        │         │  EXTERNAL SERVICES      │      │
│  │  ┌────────────────────┐  │         │  ┌──────────────────────┤      │
│  │  │ Users Table        │  │         │  │ AI/LLM Integration   │      │
│  │  │ Emotions Log       │  │         │  │ (Psychobot Engine)   │      │
│  │  │ Appointments       │  │         │  │                      │      │
│  │  │ Sessions/Tokens    │  │         │  │ Email Service        │      │
│  │  │ Chat History       │  │         │  │ (Notifications)      │      │
│  │  │ Admin Logs         │  │         │  │                      │      │
│  │  └────────────────────┘  │         │  │ Video Call Service   │      │
│  │                           │         │  │ (Scheduled)          │      │
│  └──────────────────────────┘         │  └──────────────────────┤      │
│                                        └──────────────────────────┘      │
└──────────────────────────────────────────────────────────────────────────┘
```

### 🔧 Componentes Principales

#### **Frontend (React + TypeScript)**
- **SPA Responsiva**: Interfaz moderna con Bootstrap 5
- **State Management**: Redux Toolkit para gestión de estado
- **Routing**: React Router v6 para navegación
- **Real-time**: WebSocket para chat en vivo
- **Port**: `3000`

#### **Backend (Express.js + Node.js)**
- **API REST**: Endpoints RESTful siguiendo convenciones
- **Middleware**: Autenticación JWT, CORS, validación
- **Business Logic**: Servicios modularizados
- **Error Handling**: Manejo centralizado de errores
- **Port**: `5000`

#### **Base de Datos (MySQL)**
- **Relaciones**: Normalización de datos
- **Índices**: Optimización de consultas
- **Integridad**: Constraints y validaciones
- **Respaldo**: Scripts de migración

#### **Servicios Externos**
- **AI/Psychobot**: Integración con API de lenguaje natural
- **Email**: Notificaciones y recuperación de contraseña
- **Videollamadas**: Plataforma para citas psicológicas

---

## 📁 Estructura de Directorios

```
Psychoway/
├── Frontend/                      # Aplicación React
│   ├── src/
│   │   ├── components/           # Componentes reutilizables
│   │   ├── pages/                # Páginas principales
│   │   ├── services/             # Servicios API
│   │   ├── store/                # Redux store
│   │   ├── utils/                # Funciones auxiliares
│   │   └── App.jsx
│   ├── public/                   # Archivos estáticos
│   └── package.json
│
├── Backend/                       # Servidor Express
│   ├── src/
│   │   ├── controllers/          # Lógica de rutas
│   │   ├── models/               # Esquemas de datos
│   │   ├── middleware/           # Middleware personalizado
│   │   ├── services/             # Lógica de negocio
│   │   ├── routes/               # Definición de rutas
│   │   ├── config/               # Configuración
│   │   └── server.js
│   └── package.json
│
├── Database/
│   ├── psychoway.sql             # Script de creación
│   └── migrations/               # Migraciones
│
└── Documentation/
    ├── API.md                    # Documentación API
    ├── ARCHITECTURE.md           # Detalles arquitectónicos
    └── SETUP.md                  # Guía de instalación
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **React** 19
- **Bootstrap** 5
- **Redux Toolkit**
- **React Router** v6
- **Axios**
- **Socket.io** (WebSocket)

### Backend
- **Node.js**
- **Express.js**
- **MySQL2/Promise**
- **JWT** (Autenticación)
- **Bcrypt** (Contraseñas)
- **CORS**
- **Dotenv**

### DevOps & Tools
- **Git** / GitHub
- **npm** / yarn
- **Docker** (Contenedores)
- **Postman** (Testing API)

---

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js v16+
- MySQL 8.0+
- Git
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/lui0slpk/Psychoway.git
cd Psychoway
```

2. **Configurar Backend**
```bash
cd Backend
npm install
# Crear archivo .env con variables de entorno
cp .env.example .env
npm start
```

3. **Configurar Frontend**
```bash
cd Frontend
npm install
# Crear archivo .env con URL del backend
cp .env.example .env
npm start
```

4. **Configurar Base de Datos**
```bash
mysql -u root -p < psychoway.sql
```

---

## 📚 Documentación

- [🔌 API Documentation](./Backend/API.md)
- [🏗️ Architecture Details](./Documentation/ARCHITECTURE.md)
- [⚙️ Setup Guide](./Documentation/SETUP.md)

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver archivo `LICENSE` para detalles.

---

## 👥 Equipo

- **Desarrollador**: Luis Felipe López Pinto
- **Institución**: SENA
- **Mentor**: Equipo de Psicología SENA

---

## 📞 Soporte y Contacto

Para reportar bugs o sugerencias:
- 📧 Email: luis.lopez@sena.edu.co
- 🐛 Issues: [GitHub Issues](https://github.com/lui0slpk/Psychoway/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/lui0slpk/Psychoway/discussions)

---

## 🎓 Reconocimientos

Especial agradecimiento a:
- SENA por el apoyo institucional
- Equipo de Psicología por orientación profesional
- Community open source

---

**Última actualización**: 2026-05-13  
**Versión**: 0.2.0 | **Estado**: En Desarrollo ⚙️
