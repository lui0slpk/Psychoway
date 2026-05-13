# 🧠 Psychoway - Plataforma de Apoyo Psicológico para Aprendices SENA

![Psychoway Banner](https://img.shields.io/badge/Psychoway-Mental%20Health%20Support-green)
![Status](https://img.shields.io/badge/status-In%20Development-yellow)
![Version](https://img.shields.io/badge/version-0.1.0-blue)

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

## 🏗️ Arquitectura del Sistema

<img width="1450" height="508" alt="image" src="https://github.com/user-attachments/assets/41c23d37-968e-4849-89c7-5610a648555f" />

```
┌─────────────────────────────────────────────────────────────┐
│                    PSYCHOWAY ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         HTTP REST API      ┌─────────┐
│  │   FRONTEND       │◄────────────────────────►  │ BACKEND │
│  │  (React 19)      │         JSON/HTTPS         │(Express)│
│  │  localhost:3000  │                           │ :5000   │
│  └──────────────────┘                           └────┬────┘
│         ▲                                              │
│         │ Bootstrap 5 + React Router                  │ SQL
│         │                                              │
│  ┌──────────────────────────────────────────────────┼──────┐
│  │              UI Components                         │      │
│  │  - Diario de Emociones                           ▼      │
│  │  - Agenda de Citas                         ┌──────────┐ │
│  │  - Dashboard Psicólogo                     │  MySQL   │ │
│  │  - Panel Admin                             │ Database │ │
│  │  - Autenticación                           └──────────┘ │
│  └──────────────────────────────────────────────────────────┘
│
│  ┌─────────────────────────────────────────────────────────┐
│  │            SERVICIOS EXTERNOS                            │
│  │  ┌──────────────┐  ┌──────────────────┐                 │
│  │  │ Gmail SMTP   │  │  Nodemailer      │                 │
│  │  │ (Email)      │  │ (Recuperación)   │                 │
│  │  └──────────────┘  └──────────────────┘                 │
│  └─────────────────────────────────────────────────────────┘
```

---

## 👥 Usuarios y Roles

### 1. 👨‍🎓 **Aprendiz (Estudiante SENA)**
**Funcionalidades:**
- ✅ Registrar emociones diarias en el diario
- ✅ Ver histórico y gráficos de emociones
- ✅ Crear y gestionar objetivos personales
- ✅ Agendar citas con psicólogos disponibles
- ✅ Acceder a chat IA (Psychobot)
- ✅ Gestionar cuenta personal
- ✅ Configurar privacidad

**Rutas privadas:**
```
/diario, /seguimiento, /agenda, /psychobot, /mi-cuenta, /privacidad
```

### 2. 👨‍⚕️ **Psicólogo**
**Funcionalidades:**
- ✅ Ver lista de aprendices asignados
- ✅ Consultar emociones y estado mental de aprendices
- ✅ Gestionar agenda de citas
- ✅ Ver historial de citas
- ✅ Editar perfil profesional

**Rutas privadas:**
```
/psi-seguimiento, /psi-agenda, /mi-cuenta-psi
```

### 3. 👨‍💼 **Administrador**
**Funcionalidades:**
- ✅ Crear/editar/eliminar usuarios
- ✅ Asignar roles (aprendiz, psicólogo, admin)
- ✅ Gestionar citas del sistema
- ✅ Moderar plataforma
- ✅ Ver reportes generales

**Rutas privadas:**
```
/gestion, /gestion-mod
```

---

## 🛠️ Stack Tecnológico

### **Frontend**
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| React | 19.2.1 | Framework UI |
| React Router DOM | 7.10.1 | Navegación y rutas |
| Bootstrap | 5.3.8 | Estilos responsivos |
| Bootstrap Icons | 1.13.1 | Iconografía |
| React Testing Library | 16.3.0 | Pruebas unitarias |

### **Backend**
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| Node.js | 18+ | Runtime |
| Express | 5.2.1 | Framework web |
| MySQL2 | 3.15.3 | Cliente de base de datos |
| Bcrypt | 6.0.0 | Hash de contraseñas |
| Nodemailer | 8.0.2 | Envío de emails |
| CORS | 2.8.5 | Control de acceso |

### **Base de Datos**
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| MySQL | 8.0+ | Base de datos relacional |
| InnoDB | - | Motor transaccional (ACID) |

### **Herramientas**
| Herramienta | Propósito |
|-----------|----------|
| npm | Gestor de dependencias |
| Git | Control de versiones |
| concurrently | Ejecutar Frontend + Backend simultáneamente |
| Create React App | Configuración de React |

---

## 📋 Instalación y Configuración

### ✅ Requisitos Previos
```bash
- Node.js v18.0.0 o superior
- npm 8.0.0 o superior
- MySQL 8.0.0 o superior
- Git
```

### 📥 Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/lui0slpk/Psychoway.git
cd Psychoway
```

### 📦 Paso 2: Instalar Dependencias
```bash
# Instalar dependencias del Frontend
npm install

# Instalar dependencias del Backend
cd Backend
npm install
cd ..
```

### 🗄️ Paso 3: Configurar Base de Datos

#### 3.1 Crear la base de datos
```sql
CREATE DATABASE psychoway;
USE psychoway;
```

#### 3.2 Crear tablas
```sql
-- Tabla de roles
CREATE TABLE rol (
  id_rol INT PRIMARY KEY,
  nombre_rol VARCHAR(50) NOT NULL
);

INSERT INTO rol VALUES 
  (1, 'aprendiz'),
  (2, 'psicologo'),
  (3, 'administrador');

-- Tabla de usuarios
CREATE TABLE users (
  id_user INT PRIMARY KEY AUTO_INCREMENT,
  document VARCHAR(20) UNIQUE NOT NULL,
  doc_type VARCHAR(10),
  names VARCHAR(100) NOT NULL,
  last_names VARCHAR(100) NOT NULL,
  birth_date DATE,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  id_rol INT DEFAULT 1,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

-- Tabla de emociones
CREATE TABLE emotions (
  id_emotions INT PRIMARY KEY AUTO_INCREMENT,
  emot_name VARCHAR(50) NOT NULL,
  emot_estado VARCHAR(50) NOT NULL
);

INSERT INTO emotions VALUES 
  (NULL, 'Muy Feliz', 'Positivo'),
  (NULL, 'Feliz', 'Positivo'),
  (NULL, 'Neutral', 'Neutral'),
  (NULL, 'Triste', 'Negativo'),
  (NULL, 'Muy Triste', 'Negativo');

-- Tabla de diario
CREATE TABLE diary (
  id_diary INT PRIMARY KEY AUTO_INCREMENT,
  id_user INT NOT NULL,
  fecha DATE,
  FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
);

-- Tabla de entradas del diario
CREATE TABLE diary_entries (
  id_diary_entries INT PRIMARY KEY AUTO_INCREMENT,
  id_diary INT NOT NULL,
  entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  id_emotions INT,
  id_objetives INT,
  FOREIGN KEY (id_diary) REFERENCES diary(id_diary) ON DELETE CASCADE,
  FOREIGN KEY (id_emotions) REFERENCES emotions(id_emotions)
);

-- Tabla de objetivos
CREATE TABLE objetivos (
  id_objetives INT PRIMARY KEY AUTO_INCREMENT,
  id_user INT NOT NULL,
  nombre_objetivo VARCHAR(100) NOT NULL,
  descripcion TEXT,
  estado VARCHAR(20),
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
);

-- Tabla de agenda de citas
CREATE TABLE meetings_agenda (
  id_meetings_agenda INT PRIMARY KEY AUTO_INCREMENT,
  id_user INT,
  id_professional INT,
  day DATE,
  hour TIME,
  descripcion TEXT,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
  FOREIGN KEY (id_professional) REFERENCES users(id_user) ON DELETE CASCADE
);
```

### ⚙️ Paso 4: Configurar Credenciales

#### 4.1 Actualizar conexión MySQL
Edita `Backend/server.js`:
```javascript
const db = mysql.createConnection({
  host: "localhost",
  user: "root",           // Tu usuario MySQL
  password: "",           // Tu contraseña MySQL
  database: "psychoway",
});
```

#### 4.2 Configurar Email (Opcional pero recomendado)
Edita `Backend/mailer.js`:
```javascript
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "tu-email@gmail.com",
    pass: "tu-app-password", // App Password (no la contraseña normal)
  },
});
```

**Nota:** Para Gmail, genera una [App Password](https://myaccount.google.com/apppasswords) en tu cuenta de Google.

### 🚀 Paso 5: Ejecutar el Proyecto

#### Opción A: Ejecutar Frontend y Backend simultáneamente
```bash
npm start
```
Esto ejecutará:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

#### Opción B: Ejecutar por separado
```bash
# Terminal 1: Frontend
npm run frontend

# Terminal 2: Backend
npm run server
```

---

## 📱 Uso de la Aplicación

### 🔐 1. Inicio de Sesión y Registro

**Crear cuenta:**
1. Ir a `http://localhost:3000`
2. Hacer clic en "¿No tienes cuenta? Regístrate"
3. Completar datos personales
4. Hacer clic en "Registrarse"

**Iniciar sesión:**
1. Ingresar documento y contraseña
2. Hacer clic en "Ingresar"
3. Se redirige automáticamente según el rol

### 📔 2. Para Aprendices - Diario de Emociones

**Registrar una entrada:**
1. Ir a `/diario`
2. Seleccionar emoción del día
3. Escribir descripción (opcional)
4. Hacer clic en "Guardar entrada"

**Ver historial:**
- Las entradas aparecen en orden cronológico inverso
- Ver gráficos de progreso emocional

### 🎯 3. Para Aprendices - Objetivos

**Crear objetivo:**
1. Ir a `/seguimiento`
2. Hacer clic en "Nuevo objetivo"
3. Completar nombre y descripción
4. Hacer clic en "Guardar"

**Actualizar objetivo:**
1. Seleccionar objetivo existente
2. Cambiar estado (Pendiente → En Progreso → Completado)
3. Guardar cambios

### 📅 4. Para Aprendices - Agendar Cita

**Agendar cita con psicólogo:**
1. Ir a `/agenda`
2. Seleccionar psicólogo disponible
3. Elegir fecha y hora
4. Agregar descripción (opcional)
5. Hacer clic en "Agendar cita"

**Ver historial de citas:**
- Las citas aparecen en la misma sección
- Ver detalles del psicólogo asignado

### 📊 5. Para Psicólogos - Seguimiento

**Ver aprendices asignados:**
1. Ir a `/psi-seguimiento`
2. Ver lista de aprendices con sus emociones
3. Consultar gráficos de estado emocional
4. Identificar patrones o casos de riesgo

### 📅 6. Para Psicólogos - Gestión de Agenda

**Ver citas:**
1. Ir a `/psi-agenda`
2. Consultar citas próximas y pasadas
3. Ver detalles del aprendiz (documento, email, teléfono)

### ⚙️ 7. Para Administrador - Gestión de Usuarios

**Crear usuario:**
1. Ir a `/gestion`
2. Hacer clic en "Nuevo usuario"
3. Seleccionar rol (aprendiz, psicólogo, admin)
4. Completar datos
5. Hacer clic en "Crear"

**Editar usuario:**
1. Buscar usuario por documento
2. Modificar datos
3. Hacer clic en "Actualizar"

**Eliminar usuario:**
1. Seleccionar usuario
2. Hacer clic en "Eliminar"
3. Confirmar acción

---

## 📡 Endpoints de la API

### 🔐 Autenticación
```
POST   /register                    # Registrar usuario
POST   /login                       # Iniciar sesión
POST   /api/password/forgot         # Solicitar recuperación
POST   /api/password/reset          # Restablecer contraseña
```

### 📔 Diario de Emociones
```
POST   /api/diary/entry             # Crear entrada
GET    /api/diary/entries/:userId   # Obtener historial
```

### 🎯 Objetivos
```
POST   /api/objectives              # Crear objetivo
GET    /api/objectives/:userId      # Obtener objetivos del usuario
PUT    /api/objectives/:id          # Actualizar objetivo
DELETE /api/objectives/:id          # Eliminar objetivo
```

### 📅 Citas / Agenda
```
GET    /api/psychologists           # Listar psicólogos
POST   /api/meetings                # Agendar cita
GET    /api/meetings/user/:id       # Historial aprendiz
GET    /api/meetings/professional-history/:id  # Historial psicólogo
```

### 👥 Gestión de Usuarios (Admin)
```
POST   /api/users/create            # Crear usuario
GET    /api/users/search/:document  # Buscar usuario
PUT    /api/users/update/:id        # Actualizar usuario
DELETE /api/users/delete/:id        # Eliminar usuario
```

### 😊 Emociones
```
GET    /api/emotions                # Obtener catálogo de emociones
GET    /api/psychologist/apprentices-with-emotions  # Dashboard psicólogo
```

---

## 📂 Estructura de Carpetas

```
Psychoway/
│
├── 📄 README.md                         # Documentación del proyecto
├── 📄 .gitignore                        # Archivos ignorados en Git
├── 📄 package.json                      # Dependencias del Frontend
│
├── 📁 src/                              # Código fuente Frontend
│   ├── 📁 pages/
│   │   ├── Inicio.js                   # Landing page / Login
│   │   ├── Registro.js                 # Página de registro
│   │   ├── RecuperarPassword.js        # Recuperación de contraseña
│   │   ├── ResetPassword.js            # Reset de contraseña
│   │   ├── 📁 aprendiz/
│   │   │   ├── DiarioPage.js           # Diario de emociones
│   │   │   ├── SeguimientoPage.js      # Seguimiento personal
│   │   │   ├── AgendaPage.js           # Agendar citas
│   │   │   ├── PsychobotPage.js        # Chat IA
│   │   │   ├── MiCuentaPage.js         # Perfil del aprendiz
│   │   │   └── PrivacidadPage.js       # Configuración privacidad
│   │   ├── 📁 psicologo/
│   │   │   ├── PsiSeguimientoPage.js   # Seguimiento aprendices
│   │   │   ├── PsiAgendaPage.js        # Gestión de agenda
│   │   │   └── MiCuentaPsiPage.js      # Perfil del psicólogo
│   │   └── 📁 administrador/
│   │       ├── GestionPage.js          # Gestión de usuarios
│   │       └── GestionModPage.js       # Gestión modular
│   │
│   ├── 📁 components/
│   │   └── ProtectedRoute.js           # Componente para rutas protegidas
│   │
│   ├── 📁 context/
│   │   └── AuthContext.js              # Contexto global de autenticación
│   │
│   ├── App.js                          # Componente raíz con rutas
│   ├── App.css                         # Estilos globales
│   ├── index.js                        # Punto de entrada React
│   └── index.css                       # Estilos base
│
├── 📁 public/                           # Archivos estáticos
│   ├── index.html                      # HTML principal
│   ├── favicon.ico                     # Ícono del sitio
│   ├── manifest.json                   # PWA manifest
│   └── logo192.png                     # Logo (PWA)
│
├── 📁 Backend/                          # Código fuente Backend
│   ├── 📄 server.js                    # Servidor Express principal
│   ├── 📄 mailer.js                    # Servicio de email (Nodemailer)
│   ├── 📄 package.json                 # Dependencias del Backend
│   ├── 📄 truncate_users.js            # Script para limpiar BD
│   └── 📁 node_modules/                # Dependencias instaladas
│
└── 📁 node_modules/                    # Dependencias del Frontend
```

---

## 🔐 Seguridad

### Medidas Implementadas
✅ **Contraseñas hasheadas** con Bcrypt (10 salts)  
✅ **Autenticación basada en roles** (RBAC)  
✅ **Rutas protegidas** con validación de permisos  
✅ **Tokens de recuperación** con expiración (1 hora)  
✅ **CORS configurado** para acceso seguro  
✅ **Validación de entrada** en endpoints  
✅ **Integridad referencial** en base de datos  
✅ **Contraseñas nunca se almacenan en texto plano**  

### 🚨 Mejoras de Seguridad Futuras
- [ ] Implementar JWT (JSON Web Tokens)
- [ ] Usar HTTPS en producción
- [ ] Implementar rate limiting
- [ ] Agregar autenticación 2FA
- [ ] Encriptar datos sensibles en la BD

---

## 🧪 Testing

### Ejecutar Pruebas
```bash
npm test
```

### Ejecutar Pruebas en Modo Watch
```bash
npm test -- --watch
```

---

## 📊 Diagrama de Arquitectura C4

### Nivel 1: Contexto
```
[Usuario: Aprendiz/Psicólogo/Admin] <--> [Psychoway Platform]
```

### Nivel 2: Contenedores
```
┌─────────────────────────────────────────────────────────┐
│  Psychoway                                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────┐    HTTP/REST    ┌────────────┐ │
│  │ React Frontend App │◄──────────────► │Express API │ │
│  │   :3000            │     (JSON)       │  :5000     │ │
│  └────────────────────┘                 └────┬───────┘ │
│                                               │ SQL     │
│                                               v         │
│                                        ┌──────────────┐ │
│                                        │ MySQL BD     │ │
│                                        │ psychoway    │ │
│                                        └──────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
           ↓ (Servicios externos)
    ┌─────────────────┐
    │ Gmail SMTP      │
    │ (Recuperación)  │
    └─────────────────┘
```

---

## 🚀 Despliegue en Producción

### Requisitos Adicionales
- Servidor web o plataforma en la nube
- Dominio personalizado
- Certificado SSL/TLS
- Base de datos productiva
- Variables de entorno

### Pasos Generales
1. **Build del Frontend**
   ```bash
   npm run build
   ```

2. **Preparar Backend**
   - Usar variables de entorno (.env)
   - Configurar base de datos productiva
   - Habilitar HTTPS

3. **Desplegar**
   - Opción A: Heroku, Vercel, Netlify
   - Opción B: DigitalOcean, AWS, Azure
   - Opción C: Servidor propio con Docker

---

## 🐛 Solución de Problemas

### Error: "No puedo conectar a MySQL"
```
Solución:
1. Verifica que MySQL esté corriendo
2. Verifica las credenciales en Backend/server.js
3. Verifica que la base de datos 'psychoway' exista
```

### Error: "Puerto 3000 ya está en uso"
```bash
Solución (macOS/Linux):
lsof -ti:3000 | xargs kill -9

Solución (Windows):
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: "CORS bloqueado"
```
Solución:
- Verifica que el Backend esté corriendo en :5000
- Verifica que app.use(cors()) esté en Backend/server.js
- Verifica que el Frontend apunte a http://localhost:5000
```

### Email de recuperación no se envía
```
Solución:
1. Verifica que Gmail SMTP esté configurado correctamente
2. Genera un App Password en tu cuenta de Google
3. Verifica que hayas permitido acceso a apps menos seguras
4. Revisa los logs en Backend/server.js
```

---

## 📚 Recursos Útiles

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Bootstrap Components](https://getbootstrap.com/docs)
- [React Router](https://reactrouter.com)
- [Bcrypt Security](https://github.com/kelektiv/node.bcrypt.js)
- [Nodemailer](https://nodemailer.com)

---

## 👨‍💻 Contribución

Estamos abiertos a contribuciones. Para contribuir:

1. **Fork el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/Psychoway.git
   ```

2. **Crear una rama feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

3. **Hacer cambios y commit**
   ```bash
   git commit -m "feat: agregar nueva funcionalidad"
   ```

4. **Hacer push a la rama**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

5. **Abrir Pull Request**
   - Describir los cambios
   - Referenciar issues relacionados

### Convenciones de Commit
```
feat: agregar nueva funcionalidad
fix: corregir error
docs: actualizar documentación
refactor: refactorizar código
test: agregar o actualizar tests
style: cambios de estilos
chore: tareas de mantenimiento
```

---

## 📋 Roadmap Futuro

### Fase 2 (Q2 2026)
- [ ] Videollamadas en tiempo real (WebRTC)
- [ ] Chat IA mejorado con ML
- [ ] Notificaciones push
- [ ] Reportes avanzados para psicólogos

### Fase 3 (Q3 2026)
- [ ] Aplicación móvil (React Native)
- [ ] Integración con sistema SENA
- [ ] Sistema de recomendaciones
- [ ] Analytics avanzado

### Fase 4 (Q4 2026)
- [ ] Integración con dispositivos wearables
- [ ] Análisis de emociones con IA
- [ ] Comunidad de apoyo (foros)
- [ ] Monetización (planes premium)

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver archivo `LICENSE` para más detalles.

```
MIT License

Copyright (c) 2026 Psychoway

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 📧 Contacto y Soporte

**Autor:** lui0slpk  
**Email:** itslucky535@gmail.com  
**GitHub:** [@lui0slpk](https://github.com/lui0slpk)  
**Repositorio:** [Psychoway](https://github.com/lui0slpk/Psychoway)

### ¿Preguntas o Sugerencias?
- Abrir un [Issue](https://github.com/lui0slpk/Psychoway/issues)
- Enviar un email de contacto
- Contribuir con un Pull Request

---

## 🙏 Agradecimientos

- **SENA** - Por la oportunidad de desarrollar esta plataforma
- **Comunidad React** - Por las herramientas y documentación
- **Bootstrap** - Por el framework CSS
- **Todos los contribuidores** - Por mejorar el proyecto

---

## 📈 Estado del Proyecto

| Aspecto | Estado |
|--------|--------|
| Frontend | ✅ En desarrollo |
| Backend | ✅ Funcional |
| Base de Datos | ✅ Estructura lista |
| Autenticación | ✅ Implementada |
| Pruebas | 🔄 En progreso |
| Documentación | ✅ Completa |
| Despliegue | ⏳ Pendiente |

---

## 📊 Estadísticas del Proyecto

```
Lenguajes:
├── JavaScript (Frontend)    60%
├── JavaScript (Backend)     30%
├── SQL                      10%

Dependencias:
├── Frontend: 15+
├── Backend: 5+

Líneas de Código:
├── Frontend: ~3,500 LOC
├── Backend: ~1,200 LOC
├── Queries SQL: ~500 LOC

Archivos:
├── Componentes React: 15+
├── Páginas: 12
├── Endpoints API: 20+
├── Tablas BD: 7
```

---

**¡Gracias por usar Psychoway! Juntos hacemos de la salud mental una prioridad.** 💚

*Última actualización: 21 de Abril de 2026*
