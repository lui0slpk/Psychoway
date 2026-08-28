# Manual Técnico - Psychoway

# **Índice**

# Control de versiones

---

| Fecha | Versión | Descripción | Autor |
| --- | --- | --- | --- |
| 28/07/2026 | 1.0 | Definición del contenido del manual técnico |   • Luis Angel Zapata Reyes.
  • Clever Amaya Vallejo
  • Kevin Castañeda Serna
  • Jerónimo Gil Serna |
| 18/08/2026 | 1.1 | Adiciones e implementaciones de diagrama UML, e información sobre documentación |   • Luis Angel Zapata Reyes.
  • Clever Amaya Vallejo
  • Kevin Castañeda Serna
  • Jerónimo Gil Serna |
| 19/08/2026 | 1.2 | Integración de DER y corrección de secciones, matriz de requisitos |   • Luis Angel Zapata Reyes |

# 1. Elementos de Contexto

## 1.1. Objetivo del Manual

---

El presente manual técnico tiene como objetivo principal proporcionar una guía técnica detallada y estructurada sobre la arquitectura, el diseño y la implementación de la aplicación web **Psychoway**. Este documento funciona como la fuente central de información para comprender el desarrollo interno del sistema, garantizando la continuidad del proyecto y facilitando el trabajo del equipo de desarrollo, administración, soporte técnico y futuros colaboradores.

## 1.2. Alcance

---

El presente manual comprende la documentación técnica formal y detallada de la aplicación web **Psychoway**. Su propósito es proporcionar la información necesaria para comprender la arquitectura, configuración, funcionamiento, mantenimiento y despliegue del sistema, abarcando las principales etapas relacionadas con su desarrollo e implementación. El contenido está dirigido exclusivamente a personal con perfil técnico, como ingenieros de software, desarrolladores, administradores de bases de datos, personal de DevOps y soporte técnico.

Dentro del alcance de este documento se incluyen las siguientes áreas técnicas:

- **Diseño Técnico e Ingeniería de Requisitos:** Especificación y trazabilidad de los requisitos funcionales (RF) y no funcionales (RNF) del sistema, así como la definición de los requisitos de hardware y software, además de los estándares y patrones de codificación adoptados durante el desarrollo.
- **Arquitectura de Software:** Descripción de la arquitectura implementada, el stack tecnológico utilizado en el frontend y backend, y la organización lógica de los componentes que conforman la aplicación.
- **Modelado Visual y Estructural:** Documentación de la estructura y el comportamiento del sistema mediante diagramas UML, incluyendo diagramas de casos de uso, clases, secuencia y mapa de navegación.
- **Modelo de Datos:** Descripción de la estructura de la base de datos, representada mediante el Diagrama Entidad-Relación (DER) y complementada con el diccionario de datos técnico.
- **Gestión de Instalación y Despliegue:** Procedimientos técnicos para la configuración del entorno, instalación de dependencias, ejecución de scripts de base de datos, parametrización de variables de entorno y lineamientos para el despliegue del sistema en entornos locales o servidores.
- **Operación y Mantenimiento:** Descripción de la estructura del código fuente, los procedimientos de mantenimiento y los protocolos para la identificación y resolución de incidentes mediante técnicas de *troubleshooting* y *debugging*.

# 2. Introducción

## 2.1. ¿Qué es Psychoway?

---

**Psychoway** es una solución de software basada en una aplicación web interactiva orientada a la gestión, atención y acompañamiento psicológico y emocional de los aprendices del Servicio Nacional de Aprendizaje (SENA). Desde una perspectiva técnica, la plataforma opera bajo una arquitectura cliente-servidor (desarrollada principalmente con React para su interfaz de usuario) diseñada para soportar concurrencia y proteger la integridad de los datos clínicos.

El propósito central de la plataforma es digitalizar y facilitar la comunicación directa e inmediata entre la población de estudiantes y los profesionales de la psicología de la institución. Para ello, el sistema proporciona un entorno digital estructurado que prioriza tres pilares fundamentales: **seguridad, accesibilidad y confidencialidad estricta de la información**.

## 2.2. Objetivos del Sistema

### 2.2.1. Objetivo general

---

Desarrollar, implementar y mantener una solución de software web robusta, segura y escalable que centralice u optimice los procesos de acompañamiento psicológico y emocional para los aprendices del SENA. El sistema tiene como finalidad proveer un entorno digital estructurado que facilite la comunicación confidencial y eficiente entre los estudiantes y los profesionales en psicología, apoyándose en herramientas tecnológicas modernas para promover un modelo de atención oportuno, preventivo e integral de la salud mental dentro de la institución.

### 2.2.2. Objetivos específicos

---

- **Implementar un sistema robusto de autenticación y autorización:** Diseñar un mecanismo de seguridad para gestionar el acceso basado en roles (ej. Aprendiz y Psicólogo), garantizando la protección, privacidad y confidencialidad estricta de los perfiles y datos clínicos.
- **Desarrollar módulos interactivos de apoyo psicológico:** Construir e integrar funcionalidades clave como un diario emocional y componentes de asistencia automatizada (chatbot), los cuales permitan un seguimiento continuo del estado anímico del aprendiz.
- **Crear un panel de gestión especializado para profesionales:** Diseñar un entorno administrativo dentro del sistema para que los psicólogos puedan centralizar la atención, gestionar citas, visualizar el estado de los pacientes y dar respuesta oportuna a las solicitudes de apoyo.
- **Consolidar un modelo de base de datos seguro y eficiente:** Estructurar el almacenamiento de la información de manera centralizada, asegurando la integridad referencial y permitiendo la trazabilidad inmutable del historial de los usuarios.
- **Diseñar una Interfaz de Usuario (UI) responsiva y accesible:** Construir el *Frontend* en React bajo principios modernos de UI/UX, asegurando que la plataforma sea intuitiva, rápida y adaptable a múltiples dispositivos y resoluciones de pantalla.
- **Establecer la infraestructura técnica de despliegue:** Configurar las bases arquitectónicas (variables, dependencias, enrutamiento) que permitan un despliegue y mantenimiento estable de la solución tanto en entornos de desarrollo local como en los servidores de producción de la escuela o institución.

# 3. Diseño Técnico del Sistema

## 3.1. Requisitos Funcionales (RF)

---

Los requisitos funcionales del sistema junto con sus respectivas reglas de negocio y módulo y subproceso

| RF | Módulo | Subproceso | Descripción del Requisito (RF) | Reglas de Negocio | Requisitos de Información (RI) |
| --- | --- | --- | --- | --- | --- |
| RF-01 | Usuarios | Registro de Usuarios | El sistema deberá solicitar al usuario | • Rol por defecto: aprendiz.• Debe redirigir a inicio de sesión al completar registro.• El correo debe tener formato válido y no estar registrado previamente.   | Documento, tipo de documento, nombres, apellidos   |
| RF-02 | Usuarios | Registro de Usuarios | El sistema deberá solicitar al usuario | • Ambas contraseñas deben coincidir. Mínimo 5 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.• Se envía encriptada a la BD.• Alerta visual de coincidencia bajo el campo de confirmación.   | Contraseña y validación de contraseña   |
| RF-03 | Usuarios | Registro de Usuarios | El sistema debe permitir visualizar | • Botón para mostrar en texto.• No se almacena en texto plano (se guarda cifrada).• Por defecto enmascarada (●).   | La contraseña al usuario   |
| RF-04 | Usuarios | Registro de Usuarios | El sistema debe verificar | • Identificador principal: número de documento.• Si existe, impide el registro y muestra mensaje informativo.   | Si el usuario ya está registrado   |
| RF-05 | Usuarios | Registro de Usuarios | El sistema debe notificar al usuario | • Redirige al inicio de sesión.   | Al completar el formulario de registro de que su   |
| RF-06 | Usuarios | Roles | El sistema debe asignarle al usuario | • Solo Administrador asigna/modifica roles.• Todo usuario debe tener un rol obligatorio.• Solo un rol activo a la vez.   | Un rol por defecto (Aprendiz)   |
| RF-07 | Usuarios | Roles | El sistema debe permitir al usuario | • Interfaz corresponde solo al rol activo.• Cada interfaz muestra únicamente funcionalidades autorizadas.• Sin acceso cruzado entre roles.   | Usar diferentes interfaces dependiendo del rol   |
| RF-08 | Usuarios | Gestión de Usuarios | El sistema permitirá al administrador | • Requiere confirmación explícita.• Elimina todos los datos asociados a la cuenta.• Solo Administrador puede ejecutar esta acción.   | Eliminar todos los datos de registro de los usuarios   |
| RF-09 | Usuarios | Gestión de Usuarios | El sistema permitirá al administrador | • Mensaje de confirmación de modificación.• Contraseña modificada se envía encriptada.• Cumple validaciones del registro (formato correo, unicidad documento, etc.).   | Modificar todos los datos de registro de los usuarios   |
| RF-10 | Usuarios | Gestión de Usuarios | El sistema permitirá al administrador | • Mensaje de creación de usuario.• Contraseña encriptada al guardar.• Usuario creado debe tener rol asignado.   | Crear usuarios   |
| RF-11 | Usuarios | Gestión de Usuarios | El sistema permitirá al administrador | • Mensaje de confirmación de modificación.• Contraseña modificada se envía encriptada.• Cumple validaciones del registro.   | Modificar el rol de los usuarios   |
| RF-12 | Usuarios | Gestión de Usuarios | El sistema debe permitir visualizar | • Botón para mostrar en texto.• Oculta por defecto.• Vuelve a ocultarse al enviar formulario o cambiar de vista.   | La contraseña al administrador   |
| RF-13 | Usuarios | Recuperación de Contraseña | El sistema solicitará al usuario | • Verifica si el correo pertenece a un usuario registrado.   | La dirección de correo electrónico   |
| RF-14 | Usuarios | Recuperación de Contraseña | El sistema enviará una página de recuperación al correo del usuario que solicita | • Solo se envía si el correo está registrado.• Enlace de un solo uso.• Vigencia máxima de 1 hora.   | La dirección de correo electrónico   |
| RF-15 | Usuarios | Recuperación de Contraseña | El sistema solicitará al usuario | • Ambas deben coincidir.• Mínimo 5 caracteres con mayúscula, minúscula, número y carácter especial.• Debe ser diferente a la anterior.• Se envía encriptada.   | El cambio de contraseña   |
| RF-16 | Usuarios | Recuperación de Contraseña | El sistema debe permitir visualizar | • Botón para mostrar en texto.• Oculta por defecto en todos los formularios.• Vuelve automáticamente al estado oculto.   | Una nueva contraseña y verificación de contraseña   |
| RF-17 | Usuarios | Recuperación de Contraseña | El sistema debe notificar al usuario | • Redirige al inicio de sesión.• Solo se muestra si se almacenó correctamente.• Mensaje explícito de éxito.   | Al completar el formulario de recuperación de que el   |
| RF-18 | Usuarios | Inicio de Sesión | El sistema le solicitará al usuario | • El número de documento y la contraseña serán obligatorios para iniciar sesión.• El sistema solo permitirá el acceso si el documento y la contraseña coinciden con una cuenta registrada.• En caso de credenciales incorrectas, el sistema mostrará un mensaje genérico sin especificar si el error es el documento o la contraseña.   | El documento y contraseña para iniciar sesión   |
| RF-19 | Usuarios | Inicio de Sesión | El sistema debe permitir visualizar | • Botón para mostrar en texto.• Oculta por defecto.• Vuelve automáticamente al estado oculto.   | La contraseña al usuario   |
| RF-20 | Usuarios | Inicio de Sesión | El sistema deberá permitir al usuario | • Hipervínculo de redirección.• Visible en pantalla de login.• Disponible sin sesión iniciada.   | Acceder al apartado de recuperación de contraseña   |
| RF-21 | Usuarios | Inicio de Sesión | El sistema deberá verificar | • Compara contra la BD.• Mensaje genérico si no coincide (sin revelar info sensible).• Redirige al dashboard según rol si coincide.   | Si los datos ingresados sí existen   |
| RF-22 | Usuarios | Inicio de Sesión | El sistema deberá incluir | • Redirige al registro.• Visible en pantalla de login.• No requiere sesión previa.   | Una opción para registrarse   |
| RF-23 | Diario | Registro de emociones | El sistema deberá permitir al aprendiz | • Se almacenan en el diario.• Emojis como botones.• Clasificación: positiva, negativa o neutral.   | Registrar emociones negativas y/o positivas   |
| RF-24 | Diario | Registro de emociones | El sistema deberá registrar | • Se generan automáticamente al guardar.   | La fecha y hora de cada registro   |
| RF-25 | Diario | Registro de emociones | El sistema solicitará al aprendiz | • No obligatoria.• No puede contener solo espacios en blanco.   | Una descripción para cada registro   |
| RF-26 | Diario | Seguimiento del diario | El sistema deberá mostrarle al aprendiz | • Muestra fecha, hora, emociones, descripción y objetivos.• Solo ve sus propios registros.• Solo rol Aprendiz accede.   | El historial de registros que se han realizado   |
| RF-27 | Diario | Seguimiento del diario | El sistema deberá mostrarle al aprendiz | • Dos datos identificados por color.• Se actualiza automáticamente.• Representa proporciones claras.   | Una gráfica de pastel de emociones negativas   |
| RF-28 | Diario | Seguimiento del diario | El sistema deberá mostrarle al psicólogo | • Datos: nombre, promedio de emociones, última emoción.• Solo rol Psicólogo accede.• No puede modificar datos salvo permiso específico.   | Una lista que tenga los datos de cada aprendiz   |
| RF-29 | Diario | Seguimiento del diario | El sistema deberá mostrarle al psicólogo | • Emociones previamente clasificadas.• Solo activas y validadas.• Individual por aprendiz, con filtro de fechas si aplica.   | Una gráfica de pastel de emociones negativas   |
| RF-30 | Diario | Seguimiento del diario | El sistema deberá mostrarle al psicólogo | • Determinada por fecha/hora más reciente.• Solo si el aprendiz activó "Compartir con mi psicólogo".• Individual, sin mezclar usuarios.   | La última emoción registrada del diario de cada   |
| RF-31 | Diario | Objetivos | El sistema deberá mostrarle al aprendiz | • Solo objetivos del aprendiz autenticado.• Se actualiza al cambiar de estado.• Estado obligatorio: cumplido/no cumplido.   | Un listado de todos sus objetivos activos   |
| RF-32 | Diario | Objetivos | El sistema deberá mostrarle al aprendiz | • Sin regla de negocio registrada en la matriz. | Un listado de todos sus objetivos cumplidos al   |
| RF-33 | Diario | Objetivos | El sistema debera mostrarle al aprendiz | • Estado obligatorio definido.• Cálculo solo con objetivos activos.• Solo objetivos del aprendiz autenticado.   | Un gráfico de barras en el que se evidencie la   |
| RF-34 | Diario | Objetivos | El sistema solicitará al aprendiz | • Campos obligatorios: nombre, descripción, estado.• Asociado automáticamente al aprendiz autenticado.• Clasificable como cumplido/no cumplido.   | Ingresar objetivos   |
| RF-35 | Diario | Objetivos | El sistema deberá permitirle al aprendiz | • Solo el creador puede editar.• Actualización refleja en gráficos.• Genera registro de fecha de modificación.   | Editar los objetivos previamente registrados   |
| RF-36 | Diario | Objetivos | El sistema deberá permitirle al aprendiz | • Estados válidos: Pendiente, En Proceso, Cumplido.• No se marca "Cumplido" sin pasar por "En Proceso".• Registra fecha/hora de cambio.   | Marcar un objetivo como "cumplido" o "no cumplido"   |
| RF-37 | Diario | Objetivos | El sistema deberá permitirle al aprendiz | • Orden obligatorio: Pendiente → En Proceso → Cumplido.• Se refleja en gráficos automáticamente.• Solo el propietario puede modificar.   | Cambiar el estado de los objetivos   |
| RF-38 | Diario | Objetivos | El sistema deberá permitirle al aprendiz | • Sin regla de negocio registrada. | Cambiar el estado de los objetivos |
| RF-39 | Diario | Objetivos | El sistema deberá permitir al aprendiz | • Antes de eliminarlos el sistema solicitará confirmación de la acción.   | Eliminar objetivos   |
| RF-40 | Agenda | Encuentros | El sistema deberá permitir al aprendiz | • Solo ve encuentros en los que participó.• Almacenado con fecha, hora y profesional.• No modificable ni eliminable por el aprendiz.   | Mostrar el historial de los encuentros   |
| RF-41 | Agenda | Encuentros | El sistema debe garantizar que solo el aprendiz y el psicólogo | • Solo aprendiz que agendó y psicólogo asignado acceden.• Administrador no accede salvo autorización especial.• Requiere relación directa en BD.   | Tengan acceso a la información del encuentro   |
| RF-42 | Agenda | Encuentros | El sistema deberá permitir al psicólogo | • Ingresando fecha deseada, muestra lista de eventos disponibles.   | Visualizar los espacios disponibles   |
| RF-43 | Agenda | Encuentros | El sistema deberá permitir al aprendiz | • Ingresando fecha deseada, muestra lista de eventos disponibles.   | Visualizar los espacios disponibles   |
| RF-44 | Agenda | Encuentros | El sistema deberá permitir al psicólogo | • Ingresando el documento del aprendiz.   | Consultar el historial de los encuentros del aprendiz   |
| RF-45 | Agenda | Encuentros | El sistema debe permitir al aprendiz | • Botón redirige a enlace único de Google Meet; espera admisión.   | Ingresar a una videollamada   |
| RF-46 | Agenda | Encuentros | El sistema debe permitir al psicólogo | • Botón redirige a enlace único de Google Meet.• Privilegios de administrador de la llamada.   | Ingresar a una videollamada   |
| RF-47 | Agenda | Gestión de Encuentros | El sistema deberá permitir al aprendiz. | • Según disponibilidad de los profesionales.   | Seleccionar una fecha   |
| RF-48 | Agenda | Gestión de Encuentros | El sistema deberá permitir al aprendiz. | • Según disponibilidad de los profesionales.   | Seleccionar una hora   |
| RF-49 | Agenda | Gestión de Encuentros | El sistema debe permitir al aprendiz. | • Descripción opcional.   | Agregar una descripción al encuentro   |
| RF-50 | Agenda | Gestión de Encuentros | El sistema deberá permitir al psicólogo. | • Solo fechas ≥ día actual.• Solo del calendario del psicólogo asignado.• Notificación a aprendiz y psicólogo al agendar.   | Seleccionar una fecha   |
| RF-51 | Agenda | Gestión de Encuentros | El sistema deberá permitir al psicólogo. | • Solo horas disponibles en su agenda.• Dentro del horario de atención institucional.• Hora confirmada no reasignable.   | Seleccionar una hora   |
| RF-52 | Agenda | Gestión de Encuentros | El sistema deberá permitir al psicólogo. | • Cita mediante el documento de identidad del aprendiz.   | Citar al aprendiz   |
| RF-53 | Agenda | Gestión de Encuentros | El sistema debera permitir visualizar al usuario. | • Campos de la tabla con información correspondiente: fecha, hora, descripción, nombre y documento.• Asistencia por defecto: "pendiente".   | Su historial de encuentros   |
| RF-54 | Agenda | Gestión de Encuentros | El sistema deberá permitir al psicólogo. | • Para seguimiento y control de asistencia.   | Registrar la asistencia del aprendiz   |
| RF-55 | Agenda | Gestión de Encuentros | El sistema debe permitir al psicólogo. | • Descripción opcional.   | Agregar una descripción al encuentro   |
| RF-56 | Chatbot | Gestión de Mensajes | El sistema deberá permitir al aprendiz. | • Mediante un chat.   | Interactuar con el chatbot   |
| RF-57 | Chatbot | Gestión de Mensajes | El chatbot deberá contar. | • Inicia con bienvenida amistosa.• Lenguaje empático y amigable.   | Con un chat para interactuar con el aprendiz   |
| RF-58 | Chatbot | Tecnicas de Apoyo Psicologico | El sistema debe de verificar. | • Si no hay acceso, lanza error.   | Que el usuario tenga acceso a internet   |
| RF-59 | Chatbot | Tecnicas de Apoyo Psicologico | El sistema debe verificar. | • Si no está activa, lanza error.   | Si la api del chatbot esté activa   |
| RF-60 | Chatbot | Tecnicas de Apoyo Psicologico | El chatbot debe ofrecer apoyo al aprendiz. | • Puede usar el nombre del usuario para personalizar.• Conversación fluida y contextual.   | Cuando este esté mal   |
| RF-61 | Chatbot | Tecnicas de Apoyo Psicologico | El chatbot debe ofrecer al aprendiz. | • Puede usar el nombre del usuario para personalizar.   | Técnicas de respiracion al aprendiz   |
| RF-62 | Chatbot | Tecnicas de Apoyo Psicologico | El chatbot debe proporcionar. | • Puede usar el nombre del usuario para personalizar.   | Frases de aliento y consejos al aprendiz   |
| RF-63 | Ajustes | Perfil | El sistema debe permitir al usuario. | • Solo el usuario autenticado modifica su info.   | Modificar nombres, apellidos y correo electrónico   |
| RF-64 | Ajustes | Perfil | El sistema debe permitir al usuario. | • Verificar que la imagen que se suba sea del formato correcto (Png, Jpg, etc.).   | Modificar la foto de perfil   |
| RF-65 | Ajustes | Perfil | El sistema debe verificar. | • Si ya está registrado, lanzar error.   | Si el usuario ya está registrado   |
| RF-66 | Ajustes | Perfil | El sistema debe solicitar. | • Si no coincide con la anterior, lanzar error.   | La contraseña del usuario   |
| RF-67 | Ajustes | Perfil | El sistema debe permitir al usuario. | • Ambas contraseñas deben coincidir.   | Modificar la contraseña   |
| RF-68 | Ajustes | Perfil | El sistema debe permitir al usuario. | • Lanzar un mensaje de guardado exitoso.   | Guardar la configuración   |
| RF-69 | Ajustes | Perfil | El sistema debe permitir al usuario. | • Lanzar un mensaje emergente de confirmación.   | Eliminar la cuenta   |
| RF-70 | Ajustes | Privacidad | El sistema debe permitir al aprendiz. | • Restringir la visibilidad del diario a las opciones válidas: "Yo y psicólogo/a" o "Solo yo".   | Modificar los permisos   |
| RF-71 | Ajustes | Privacidad | El sistema debe permitir al aprendiz. | • Lanzar un mensaje de guardado exitoso.   | Guardar la configuración   |

## 3.2. Software Base y Pre-requisitos

---

Aquí se alojan los requisitos que debe tener el hardware del servidor y el hardware del cliente para correr Psychoway

### 3.2.1. Requerimientos del Hardware

---

#### **3.2.1.1. Hardware del Servidor (Hosting / Producción)**

Descripción de los componentes recomendados de hardware del servidor

| **Componente** | **Especificación Recomendada** |
| --- | --- |
| **Procesador (CPU)** | Intel Core i7 / i9 o AMD Ryzen 7 / 9 |
| **Memoria RAM** | 32 GB RAM DDR4 |
| **Almacenamiento** | 256 GB Disco NVMe SSD |
| **Conexión a Red** | 4 Gbps simétrico |
| **Arquitectura** | x64 |

---

### **3.2.2. Hardware del Cliente (Aprendiz / Psicólogo / Administrador)**

Descripción de los componentes recomendados de hardware para el cliente, disponible en computador de escritorio o laptop y dispositivos móviles.

#### **A. Computadores de Escritorio o Laptops (PC / Mac)**

| **Componente** | **Especificación Recomendada** |
| --- | --- |
| **Procesador (CPU)** | Quad-Core a 2.2 GHz o superior |
| **Memoria RAM** | 8 GB RAM o superior |
| **Pantalla / Resolución** | 1920 x 1080 px |
| **Conexión a Internet** | 10 Mbps+ (Banda ancha estable) |

#### **B. Dispositivos Móviles (Smartphones / Tablets)**

| **Componente** | **Especificación Recomendada** |
| --- | --- |
| **Procesador** | Octa-Core a 2.0 GHz+ |
| **Memoria RAM** | 2 GB RAM+ |
| **Conectividad** | Red 4G LTE / 5G / Wi-Fi de alta velocidad |

### 3.2.3. Requerimientos Recomendados de Software

---

Requerimientos recomendados de software que debe tener el servidor y el cliente para ejecutar correctamente la aplicación

### **3.2.4 Software para el Servidor (Backend & Infraestructura)**

- **Sistema Operativo:** Ubuntu Server 20.04 LTS / 22.04 LTS (Recomendado en Producción) o Windows Server 2019/2022.
- **Entorno de Ejecución Backend:** Node.js v18.0.0 LTS o superior.
- **Framework Backend:** Express.js v4.x.
- **Motor de Base de Datos & Plataforma Cloud:** Supabase (PostgreSQL 15+ con soporte para tipos de datos JSONB, consultas relacionales y alta disponibilidad).
- **Gestor de Procesos / Contenedor:** PM2 Process Manager o Docker / Docker Compose.
- **Servicios e Integraciones Cloud:**
    - Supabase Cloud Platform (Almacenamiento de base de datos relacional PostgreSQL).
    - Google Cloud / Google AI Studio API (`@google/genai` para el bot Psychobot y filtro de seguridad).
    - Gateway SMTP para envío de correos (SendGrid, Mailgun o Gmail SMTP via Nodemailer).

### **3.2.5 Software para el Cliente (Aprendiz / Psicólogo / Administrador)**

- **Sistema Operativo:** Windows 10/11, macOS 11+, Linux (Ubuntu/Debian), Android 9+ o iOS 13+.
- **Navegadores Web Soportados:**
    - Google Chrome v100+ (Recomendado)
    - Mozilla Firefox v100+
    - Microsoft Edge v100+
    - Apple Safari v15+

### **3.2.6 Stack Tecnológico y Dependencias del Proyecto**

- **Frontend:** React 19, Vite / Webpack, Bootstrap 5, Axios, Lucide React, SweetAlert2.
- **Backend:** Node.js, Express, `@supabase/supabase-js` / `pg` (PostgreSQL Client), `jsonwebtoken` (JWT), `bcryptjs`, `dotenv`, `cors`, `@google/genai`, `nodemailer`.

## 3.3 Estándares

---

Estándares de códificación utilizados en el sistema

### 3.3.1. Estándares de codificación

---

**Nomenclatura de archivos:**

- **Backend:**
    - **Carpetas backend:** todas de una sola palabra, sin separador: config, controllers, middlewares, repositories, routes, services, utils
    - **Archivos backend:** dot notiation como separador de capa: auth.routes.js, auth.controller.js, user.repository.js, error.middleware.js
- **Frontend:** camelCase para módulos (auth.api.js), .jsx obligatorio para componentes/páginas/layouts/contextos
- **Variables:** camelCase en JS; columnas y parámetros SQL en snake_case (id_user, doc_type, $1/$2)

**Idioma (mixto, por dominio):**

- **Identificadores JS** → inglés (findByDocument, verifySession)
- **Comentarios/JSDoc y mensajes de error** → español
- **Mensajes al usuario** → español ("Documento o contraseña incorrectos")
- **Tests** → inglés

### 3.3.1. Patrones de diseño utilizados

---

1. **Singleton del pool de conexiones:**
pg.Pool único en config/database.js, default-exported
2. **Singleton lazy del cliente IA:**
config/gemini.js con let ai = null e init protegido + retry/backoff
3. **Config por inyección:**
Un solo objeto env (dotenv validado con fail-fast); los services nunca leen process.env directo

# 4. Arquitectura de Software

---

La arquitectura que permite la separación de responsabilidades y la escalabilidad del código y software

## 4.1. Tipo de arquitectura

---

Este proyecto tiene una arquitectura cliente-servidor por capas:

- **Frontend:** SPA (Single Page Application) en React.
- **Backend:** API REST estructurada en capas verticales por dominio:
`routes → controllers → services → repositories`
(separación clara: HTTP → lógica de negocio → acceso a datos).
- **Comunicación:** HTTP/REST + JSON, autenticación con JWT (Bearer token).
- **Base de datos:** PostgreSQL como servicio externo (Supabase).

## 4.2. Tecnologías utilizadas

---

Tecnologías de desarrollo y producción que usa el software Psychoway

### 4.2.1. Frontend

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

### 4.2.2. Backend

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

### 4.2.3. DevOps & Herramientas

**Herramientas:**

- pnpm
- Git / GitHub
- Vercel (deploy frontend)
- Render (deploy backend)
- Jest + Testing Library

## 4.3. Organización de componentes

---

A continuación se muestran la organización de los 3 componentes principales  

### 4.3.1 Frontend (React 19 + JavaScript)

- **SPA Responsiva:** Interfaz con Bootstrap 5 y animaciones con Framer Motion
- **State Management:** Context API (AuthContext) para autenticación y sesión
- **Routing:** React Router v7 con rutas protegidas por rol (ProtectedRoute)
- **Consumo de API:** Cliente HTTP propio (src/api/client.js) basado en fetch
- **Port:** 3000

### 4.3.2. Backend (Node.js + Express 5)

- **API REST:** Endpoints RESTful organizados por dominio
- **Arquitectura por capas:** routes → controllers → services → repositories
- **Middleware:** Autenticación JWT, manejo centralizado de errores
- **ESM:** Módulos nativos de ES ("type": "module")
- **Port:** 5000

### 4.3.3. Base de Datos (Supabase / PostgreSQL)

- **Pool de conexiones:** pg con connection string de Supabase y SSL
- **Queries parametrizadas:** Sintaxis PostgreSQL ($1, $2, ...)
- **Migración:** supabase_schema.sql / psychoway.sql para inicializar el esquema
Servicios Externos
- **Google Gemini (@google/genai):** Motor del chat Psychobot
- **Nodemailer:** Notificaciones y recuperación de contraseña por email

# 5. Modelado del Sistema (UML)

En este apartado se encuentran los diagramas UML que se usaron para poder definir la arquitectura del software, así como sus requisitos y modelado de datos

## 5.1. Diagramas de Casos de Uso

---

![image.png](Manual%20T%C3%A9cnico%20-%20Psychoway/image.png)

![image.png](Manual%20T%C3%A9cnico%20-%20Psychoway/image%201.png)

![image.png](Manual%20T%C3%A9cnico%20-%20Psychoway/image%202.png)

## 5.2. Diagramas de Clases

![image.png](Manual%20T%C3%A9cnico%20-%20Psychoway/image%203.png)

## 5.3. Diagrama de componentes del sistema

![image.png](Manual%20T%C3%A9cnico%20-%20Psychoway/image%204.png)

## 5.4. Diagrama de despliegue del sistema

![image.png](Manual%20T%C3%A9cnico%20-%20Psychoway/image%205.png)

# 6. Modelo de Datos

Este apartado es un espacio dedicado a la diagramación y estructuración de la base de datos

## 6.2 Diagrama Entidad-Relación

![psychoway-erd-chen.jpg](Manual%20T%C3%A9cnico%20-%20Psychoway/psychoway-erd-chen.jpg)

## 6.2. Diagrama Relacional

![entidad_relacion.png](Manual%20T%C3%A9cnico%20-%20Psychoway/entidad_relacion.png)

## 6.3. Diccionario de Datos

A continuación se encuentra el diccionario de datos, donde se encuentra la descripción de cada uno de los campos, el nombre de la columna ,su tipo de dato, su anulabilidad, y si es clave primaria o foranea.

**Tabla `rol`**

Catálogo de roles de la plataforma. Datos semilla: `1 = Aprendiz`, `2 = Psicologo`, `3 = Administrador`.

| PK/FK | Nombre de columna | Tipo de dato | Descripción | Null |
| --- | --- | --- | --- | --- |
| PK | `id_rol` | SERIAL | Identificador único del rol | NO |
|  | `nombre_rol` | VARCHAR(45) | Nombre del rol (Aprendiz, Psicologo, Administrador) | SÍ |

**Tabla `users`**

Usuarios de la plataforma: aprendices, psicólogos y administradores.

| PK/FK | Nombre de columna | Tipo de dato | Descripción | Null |
| --- | --- | --- | --- | --- |
| PK | `id_user` | SERIAL | Identificador único del usuario | NO |
| UNIQUE | `document` | VARCHAR(15) | Número de documento de identidad (único por usuario) | NO |
|  | `doc_type` | VARCHAR(45) | Tipo de documento (CC, TI, etc.) | NO |
|  | `names` | VARCHAR(45) | Nombre(s) del usuario | NO |
|  | `last_names` | VARCHAR(45) | Apellido(s) del usuario | NO |
|  | `birth_date` | DATE | Fecha de nacimiento | SÍ |
| UNIQUE | `email` | VARCHAR(100) | Correo electrónico del usuario (único) | NO |
|  | `password` | VARCHAR(255) | Contraseña cifrada (bcrypt) | NO |
|  | `contact_number` | VARCHAR(20) | Número de celular de contacto | SÍ |
|  | `landline_number` | VARCHAR(20) | Número de teléfono fijo | SÍ |
|  | `training_program` | VARCHAR(255) | Programa de formación (para aprendices) | SÍ |
|  | `ficha_number` | VARCHAR(50) | Número de ficha de formación (para aprendices) | SÍ |
| FK | `id_rol` | INT | Rol asignado al usuario → `rol(id_rol)` | NO |
|  | `profile_photo` | TEXT | URL o contenido de la foto de perfil | SÍ |
|  | `reset_token` | VARCHAR(255) | Token para restablecimiento de contraseña | SÍ |
|  | `reset_token_expires` | TIMESTAMP | Fecha y hora de expiración del token de reset | SÍ |
|  | `last_update` | TIMESTAMP | Última actualización del registro (default `NOW()`) | SÍ |

**Tabla `diary`**

Diario personal del usuario, con control de visibilidad.

| PK/FK | Nombre de columna | Tipo de dato | Descripción | Null |
| --- | --- | --- | --- | --- |
| PK | `id_diary` | SERIAL | Identificador único del diario | NO |
| FK | `id_user` | INT | Usuario dueño del diario → `users(id_user)` `ON DELETE CASCADE` | SÍ |
|  | `fecha` | DATE | Fecha del diario | SÍ |
|  | `last_update` | TIMESTAMP | Última actualización del registro (default `NOW()`) | SÍ |
|  | `diary_visibility` | VARCHAR(20) | Visibilidad del diario (default `'yo-psicologo'`) | SÍ |

**Tabla `emotions`**

Catálogo de emociones disponibles. Datos semilla: `1 = Muy Feliz (Positivo)`, `2 = Muy Triste (Negativo)`, `3 = Neutral`, `4 = Feliz (Positivo)`, `6 = Triste (Negativo)`.

| PK/FK | Nombre de columna | Tipo de dato | Descripción | Null |
| --- | --- | --- | --- | --- |
| PK | `id_emotions` | SERIAL | Identificador único de la emoción | NO |
|  | `emot_name` | VARCHAR(45) | Nombre de la emoción (ej. "Muy Feliz") | SÍ |
|  | `emot_estado` | VARCHAR(45) | Clasificación de la emoción (Positivo, Negativo, Neutral) | SÍ |
|  | `last_update` | TIMESTAMP | Última actualización del registro (default `NOW()`) | SÍ |

**Tabla `objetivos`**

Objetivos o metas registrados por el usuario.

| PK/FK | Nombre de columna | Tipo de dato | Descripción | Null |
| --- | --- | --- | --- | --- |
| PK | `id_objetives` | SERIAL | Identificador único del objetivo | NO |
|  | `nombre_objetivo` | VARCHAR(45) | Nombre del objetivo | SÍ |
|  | `descripcion` | VARCHAR(255) | Descripción detallada del objetivo | SÍ |
|  | `estado` | VARCHAR(45) | Estado del objetivo (ej. pendiente, en progreso, completado) | SÍ |
|  | `last_update` | TIMESTAMP | Última actualización del registro (default `NOW()`) | SÍ |
| FK | `id_user` | INT | Usuario dueño del objetivo → `users(id_user)` `ON DELETE CASCADE` | SÍ |

**Tabla `diary_entries`**

Entradas (registros) dentro de un diario, asociadas a una emoción y opcionalmente a un objetivo.

| PK/FK | Nombre de columna | Tipo de dato | Descripción | Null |
| --- | --- | --- | --- | --- |
| PK | `id_diary_entries` | SERIAL | Identificador único de la entrada del diario | NO |
| FK | `id_diary` | INT | Diario al que pertenece la entrada → `diary(id_diary)` `ON DELETE CASCADE` | SÍ |
|  | `entry_date` | TIMESTAMP | Fecha y hora de la entrada | SÍ |
|  | `description` | VARCHAR(255) | Contenido/descripción de la entrada | SÍ |
| FK | `id_emotions` | INT | Emoción asociada → `emotions(id_emotions)` `ON DELETE SET NULL` | SÍ |
| FK | `id_objetives` | INT | Objetivo relacionado → `objetivos(id_objetives)` | SÍ |
|  | `last_update` | TIMESTAMP | Última actualización del registro (default `NOW()`) | SÍ |

**Tabla `meetings_agenda`**

Agenda de reuniones entre un aprendiz (`id_user`) y un psicólogo (`id_professional`).

| PK/FK | Nombre de columna | Tipo de dato | Descripción | Null |
| --- | --- | --- | --- | --- |
| PK | `id_meetings_agenda` | SERIAL | Identificador único de la reunión | NO |
|  | `day` | VARCHAR(45) | Día de la reunión | SÍ |
|  | `hour` | TIME | Hora de la reunión | SÍ |
|  | `descripcion` | VARCHAR(255) | Descripción o motivo de la reunión | SÍ |
|  | `last_update` | TIMESTAMP | Última actualización del registro (default `NOW()`) | SÍ |
| FK | `id_user` | INT | Aprendiz participante → `users(id_user)` `ON DELETE CASCADE` | SÍ |
| FK | `id_professional` | INT | Psicólogo participante → `users(id_user)` `ON DELETE CASCADE` | SÍ |

**Tabla `psychobot_sessions`**

Sesiones de conversación del chatbot psicobot por usuario.

| PK/FK | Nombre de columna | Tipo de dato | Descripción | Null |
| --- | --- | --- | --- | --- |
| PK | `id_session` | SERIAL | Identificador único de la sesión | NO |
| FK | `id_user` | INT | Usuario dueño de la sesión → `users(id_user)` `ON DELETE CASCADE` | NO |
|  | `title` | VARCHAR(255) | Título de la conversación (default `'Nueva Conversación'`) | SÍ |
|  | `created_at` | TIMESTAMP | Fecha y hora de creación (default `NOW()`) | SÍ |

**Tabla `psychobot_chats`**

Mensajes individuales dentro de una sesión del psicobot.

| PK/FK | Nombre de columna | Tipo de dato | Descripción | Null |
| --- | --- | --- | --- | --- |
| PK | `id_chat` | SERIAL | Identificador único del mensaje | NO |
| FK | `id_user` | INT | Usuario que envía/recibe el mensaje → `users(id_user)` `ON DELETE CASCADE` | NO |
| FK | `id_session` | INT | Sesión a la que pertenece el mensaje → `psychobot_sessions(id_session)` `ON DELETE CASCADE` | SÍ |
| CHECK | `role` | TEXT | Emisor del mensaje: `'user'` o `'bot'` (`CHECK (role IN ('user','bot'))`) | NO |
|  | `message` | TEXT | Contenido del mensaje | NO |
|  | `timestamp` | TIMESTAMP | Fecha y hora del mensaje (default `NOW()`) | SÍ |

**Tabla `psychobot_memory`**

Memoria persistente del psicobot: hechos recordados por usuario.

| PK/FK | Nombre de columna | Tipo de dato | Descripción | Null |
| --- | --- | --- | --- | --- |
| PK | `id_memory` | SERIAL | Identificador único del recuerdo | NO |
| FK | `id_user` | INT | Usuario al que pertenece el recuerdo → `users(id_user)` `ON DELETE CASCADE` | NO |
|  | `fact` | TEXT | Hecho o dato recordado por el psicobot | NO |
|  | `importance` | INT | Nivel de importancia del hecho (default `1`) | SÍ |
|  | `updated_at` | TIMESTAMP | Última actualización del recuerdo (default `NOW()`) | SÍ |

**Tabla `psychologist_alerts`**

Alertas dirigidas al psicólogo sobre un aprendiz.

| PK/FK | Nombre de columna | Tipo de dato | Descripción | Null |
| --- | --- | --- | --- | --- |
| PK | `id_alert` | SERIAL | Identificador único de la alerta | NO |
| FK | `id_user` | INT | Usuario (aprendiz) sobre el que se genera la alerta → `users(id_user)` `ON DELETE CASCADE` | NO |
|  | `motivo` | TEXT | Motivo/descripción de la alerta | NO |
|  | `leido` | BOOLEAN | Indica si la alerta fue leída (default `FALSE`) | SÍ |
|  | `timestamp` | TIMESTAMP | Fecha y hora de la alerta (default `NOW()`) | SÍ |

**Tabla `notifications`**

Notificaciones generales enviadas a los usuarios.

| PK/FK | Nombre de columna | Tipo de dato | Descripción | Null |
| --- | --- | --- | --- | --- |
| PK | `id_notification` | SERIAL | Identificador único de la notificación | NO |
| FK | `id_user` | INT | Usuario destinatario → `users(id_user)` `ON DELETE CASCADE` | NO |
|  | `type` | VARCHAR(50) | Tipo de notificación (default `'info'`) | SÍ |
|  | `message` | TEXT | Contenido del mensaje de la notificación | NO |
|  | `link` | VARCHAR(255) | Enlace/URL asociado a la notificación | SÍ |
|  | `is_read` | BOOLEAN | Indica si la notificación fue leída (default `FALSE`) | SÍ |
|  | `created_at` | TIMESTAMP | Fecha y hora de creación (default `NOW()`) | SÍ |

# 7. Despliegue, Configuración e Instalación

Llegado a este apartado, se describe la configuración, instalación y despliegue del software Psychoway, orientado al equipo de servicio técnico y redes.

## 7.1. Guía de instalación paso a paso

Antes de comenzar, asegúrate de tener instalado en tu sistema:

1. **Node.js** (versión 18.x o superior): [Descargar Node.js](https://nodejs.org/)
2. **Gestor de paquetes**: `npm` (incluido con Node) o `pnpm` (recomendado para la arquitectura workspace).
3. **Git**: [Descargar Git](https://git-scm.com/)
4. **Cuenta en Supabase** (o un servidor PostgreSQL): [Supabase.com](https://supabase.com/)
5. **API Key de Google Gemini** (para el asistente de IA Psychobot): [Google AI Studio](https://aistudio.google.com/)

### **7.1.1 Paso 1: Clonar el Repositorio**

Abre la terminal o PowerShell y ejecuta:

```bash
git clone https://github.com/lui0slpk/Psychoway.git
cd Psychoway
```

### **7.1.2 Paso 2: Configurar la Base de Datos (Supabase / PostgreSQL)**

1. Ingresa a tu panel de **Supabase** y crea un nuevo proyecto.
2. Ve a **SQL Editor** → **New Query**.
3. Abre el archivo de esquema  ubicado en la raíz del proyecto.
    
    **supabase_schema.sql**
    
4. Copia su contenido, pégalo en el editor SQL de Supabase y presiona **Run** para crear todas las tablas, relaciones y secuencias necesarias.
5. Ve a **Project Settings** → **Database** y copia la **URI de Conexión en formato Session Mode (Puerto 5432)**:
    
    ```
    postgresql://postgres:[TU-PASSWORD]@db.[TU-PROJECT-ID].supabase.co:5432/postgres
    ```
    

### **7.1.3 Paso 3: Instalación de Dependencias**

El proyecto está configurado como un monorepositorio con el Frontend React en la raíz (`.`) y el Backend Express en la subcarpeta `/Backend`.

**Opción A: Usando `pnpm` (Recomendado)**

Desde la raíz del proyecto, ejecuta un único comando para instalar todas las dependencias (root + backend):

```bash
pnpm install
```

**Opción B: Usando `npm`**

1. Instalar dependencias del Frontend (raíz):
    
    ```bash
    npm install
    ```
    
2. Instalar dependencias del Backend:
    
    ```bash
    cd Backend
    npm install
    cd ..
    ```
    

### **7.1.4 Paso 4: Configurar Variables de Entorno**

1. Navega al directorio **Backend**.
2. Duplica o renombra el archivo de ejemplo **.env.example** para crear el archivo `.env`:
    
    **En PowerShell:**
    
    ```powershell
    Copy-Item Backend\.env.example Backend\.env
    ```
    
    **En Linux / Mac:**
    
    ```bash
    cp Backend/.env.example Backend/.env
    ```
    
3. Abre el archivo `Backend/.env` y completa las variables clave:

```
# Servidor
PORT=5000
NODE_ENV=development

# Base de Datos (Supabase / PostgreSQL)
SUPABASE_URL=https://TU-PROJECT-ID.supabase.co
SUPABASE_DB_URL=postgresql://postgres:TU_PASSWORD@db.TU-PROJECT-ID.supabase.co:5432/postgres

# Autenticación JWT
JWT_SECRET=genera_un_secreto_seguro_de_32_bytes
JWT_EXPIRES_IN=8h

# IA - Google Gemini
GEMINI_API_KEY=TU_API_KEY_DE_GEMINI

# Servicio de Correo (Nodemailer para recuperar contraseña)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_password_de_aplicacion_gmail
EMAIL_FROM="Psychoway" <tu_correo@gmail.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

> **Tip para JWT Secret**: Puedes generar una clave aleatoria ejecutando en la terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
> 

### **7.1.5 Paso 5: Ejecución del Proyecto**

**Modo Simultáneo (Frontend + Backend juntos)**

Ejecuta el script principal configurado en **package.json**:

**Con pnpm:**

```bash
pnpm start
```

**Con npm:**

```bash
npm start
```

Esto iniciará:

- 🟢 **Backend Express**: `http://localhost:5000`
- 🔵 **Frontend React**: `http://localhost:3000`

---

**Modo Manual (Ejecución por separado)**

Si prefieres ejecutar cada parte en terminales independientes:

1. **Terminal 1 - Backend**:
    
    ```bash
    cd Backend
    npm run dev
    ```
    
2. **Terminal 2 - Frontend**:
    
    ```bash
    npm run frontend
    ```
    

---

### **7.1.6 Paso 6: Verificación de Funcionamiento**

1. Abre tu navegador e ingresa a `http://localhost:3000`.
2. En la terminal del backend deberás ver el mensaje de confirmación:
    
    ```
    ✅ Conectado a Supabase (PostgreSQL)
    Servidor corriendo en puerto 5000
    ```
    
3. Registra una nueva cuenta para probar el flujo de autenticación e interacción con el Diario emocional y Psychobot.

## 7.2. Procedimiento del Backup del software

---

Esta es la guía de procedimiento para hacer un backup o copia de seguridad del software, y así proteger los datos del software

### **7.2.1. Objetivo y Alcance**

Garantizar la **integridad, disponibilidad y confidencialidad** de la información mediante un esquema estandarizado de copias de seguridad de los tres pilares del sistema:

1. **Base de Datos Relacional (MySQL):** Usuarios, registros emocionales, citas, chats y alertas.
2. **Archivos de Configuración y Secretos:** Archivos `.env` y certificados.
3. **Código Fuente y Recursos Multimedia:** Repositorio y archivos estáticos.

---

### **7.2.2. Estrategia de Respaldo - Backup (Regla 3-2-1)**

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                        REGLA DE RESPALDO 3-2-1                         │
  ├──────────────────┬──────────────────────┬──────────────────────────────┤
  │  3 Copias de     │  2 Medios Diferentes │  1 Copia Off-site (Nube)     │
  │  Datos           │  (Disco Servidor +   │  (AWS S3 / Google Drive /    │
  │                  │   NAS/Disco Ext)     │   Servidor Remoto SFTP)      │
  └──────────────────┴──────────────────────┴──────────────────────────────┘
```

---

### **7.2.3. Procedimiento Manual de Copias de Seguridad**

---

#### A. Para generar un archivo SQL comprimido con la estructura y todos los datos

```bash
bash
# 1. Crear directorio de respaldos si no existe
mkdir-p/var/backups/psychoway

# 2. Ejecutar mysqldump y comprimir en gzip (Reemplazar tu_usuario y tu_password)
mysqldump-uroot-p--single-transaction--quick--lock-tables=falsepsychoway|gzip>/var/backups/psychoway/db_psychoway_$(date+%Y%m%d_%H%M%S).sql.gz
```

- **Solo Estructura (Sin datos):**
    
    ```bash
    bash
    mysqldump-uroot-p--no-datapsychoway>schema_psychoway.sql
    ```
    

---

#### **B. Respaldo del Código Fuente y Multimedia**

Empaquetar el código fuente sin la carpeta `node_modules` para optimizar espacio:

```bash
cd /var/www/
tar --exclude='Psychoway/node_modules'\
--exclude='Psychoway/Backend/node_modules'\
--exclude='Psychoway/.git'\
-czvf/var/backups/psychoway/code_psychoway_$(date+%Y%m%d_%H%M%S).tar.gzPsychoway/
```

---

#### **C. Respaldo de Archivos de Configuración (`.env`)**

Los archivos de configuración contienen credenciales sensibles. Se deben empaquetar y cifrar de forma segura:

```bash
# Copiar y cifrar el archivo .env con contraseña
tar-czvf-/var/www/Psychoway/Backend/.env | opensslenc-aes-256-cbc-e-pbkdf2-out/var/backups/psychoway/env_psychoway_$(date+%Y%m%d).tar.gz.en
```

---

### **7.2.4. Automatización de Backups (Script Bash & Cron)**

---

#### **7.2.4.1 Script Automatizado (`backup_psychoway.sh`)**

Crear un script en `/usr/local/bin/backup_psychoway.sh`:

```bash
#!/bin/bash

# ==============================================================================
# SCRIPT DE RESPALDO AUTOMÁTICO - PSYCHOWAY
# ==============================================================================

# Variables de Configuración
BACKUP_DIR="/var/backups/psychoway"
DATE=$(date+%Y%m%d_%H%M%S)
DB_USER="root"
DB_PASS="tu_password_segura"
DB_NAME="psychoway"
RETENTION_DAYS=30

# 1. Crear carpeta si no existe
mkdir-p$BACKUP_DIR

# 2. Respaldo de Base de Datos
echo"[$(date)] Iniciando respaldo de Base de Datos..."
mysqldump-u$DB_USER-p$DB_PASS--single-transaction$DB_NAME|gzip>$BACKUP_DIR/db_${DB_NAME}_${DATE}.sql.gz

# 3. Respaldo de Configuración .env
echo"[$(date)] Respaldo de variables de entorno..."
cp/var/www/Psychoway/Backend/.env$BACKUP_DIR/env_${DATE}.env

# 4. Eliminar respaldos más antiguos a RETENTION_DAYS días
echo"[$(date)] Depurando respaldos de más de$RETENTION_DAYS días..."
find$BACKUP_DIR-typef-name"*.gz"-mtime+$RETENTION_DAYS-delete
find$BACKUP_DIR-typef-name"*.env"-mtime+$RETENTION_DAYS-delete

echo"[$(date)] Copia de seguridad completada con éxito."
```

Dar permisos de ejecución al script:

```bash
chmod+x/usr/local/bin/backup_psychoway.sh
```

---

#### **7.2.4.2 Programación con Cron Job (Frecuencia Automática)**

Configurar la tarea programada en el servidor:

```bash
crontab-e
```

Añadir las siguientes reglas de frecuencia:

```bash
# 1. Respaldo DIARIO de Base de Datos a las 2:00 AM
0 2 * * * /usr/local/bin/backup_psychoway.sh >> /var/log/psychoway_backup.log 2>&1

# 2. Respaldo SEMANAL Completo (Código + BD) los domingos a las 3:00 AM
0 3 * * 0 tar --exclude='Psychoway/node_modules' -czvf /var/backups/psychoway/full_site_$(date +\%Y\%m\%d).tar.gz /var/www/Psychoway
```

---

### **7.2.5. Matriz y Política de Retención de Backups**

| **Tipo de Backup** | **Frecuencia** | **Retención** | **Destino Almacenamiento** |
| --- | --- | --- | --- |
| **Base de Datos (Diferencial)** | Cada 6 horas | 7 días | Disco Local Servidor |
| **Base de Datos (Completo)** | Diario (2:00 AM) | 30 días | Disco Local + Almacenamiento Nube (AWS S3) |
| **Código Fuente y `.env`** | Semanal / Por versión | 60 días | Repositorio Privado + Almacenamiento Nube |
| **Logs del Sistema** | Mensual | 90 días | Servidor de Logs |

## 7.3. Procedimiento de restauración del sistema

---

Guía de restauración del sistema.

### **7.3.1. Objetivo y Alcance**

Este procedimiento establece los pasos técnicos necesarios para **restaurar la plataforma Psychoway a su estado operativo** normal a partir de copias de seguridad de la Base de Datos (`psychoway.sql`), el código fuente y los archivos de configuración (`.env`).

---

### **7.3.2. Prerrequisitos del Servidor de Destino**

Antes de iniciar la restauración, el servidor debe contar con el siguiente software instalado:

- **Git**: `v2.30+`
- **Node.js**: `v18.x` o superior (`node -v`)
- **MySQL Server**: `8.0+` o MariaDB `10.4+` (`mysql --version`)
- **Gestor de Procesos**: PM2 (`npm install -g pm2`)

---

### **7.3.3. Pasos del Procedimiento de Restauración**

```
  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌───────────────┐
  │ 1. Clonar      │ ──► │ 2. Restaurar   │ ──► │ 3. Configurar  │ ──► │ 4. Desplegar     │ 
  │    Repositorio │     │    Base Datos  │     │    Variables   │     │    y Verificar│
  └────────────────┘     └────────────────┘     └────────────────┘     └────────────────┘
```

#### **7.3.3.1 Paso 1: Obtención del Código Fuente**

Clonar el repositorio de la versión estable en el servidor:

```bash
bash
cd/var/www/
gitclonehttps://github.com/lui0slpk/Psychoway.git
cdPsychoway
```

---

#### **7.3.3.2 Paso 2: Restauración de la Base de Datos (MySQL)**

1. **Acceder a la consola de MySQL** e iniciar sesión como administrador:
    
    ```bash
    bash
    mysql-uroot-p
    ```
    
2. **Crear la base de datos limpia** con codificación `utf8mb4`:
    
    ```
    sql
    DROPDATABASEIFEXISTS psychoway;
    CREATEDATABASEpsychowayCHARACTERSET utf8mb4COLLATE utf8mb4_general_ci;
    EXIT;
    ```
    
3. **Restaurar el respaldo de la base de datos** utilizando el script **psychoway.sql**:
    
    ```
    bash
    mysql-uroot-ppsychoway<psychoway.sql
    ```
    
4. **Verificar la restauración**:
    
    ```
    bash
    mysql-uroot-p-e"USE psychoway; SHOW TABLES;"
    ```
    
    *(Deberán visualizarse las tablas: `users`, `emotions`, `appointments`, `chatbot`, `agenda`, `alerts`, etc.)*
    

---

#### **7.3.3.3 Paso 3: Configuración y Restauración del Backend**

1. **Ingresar a la carpeta del backend e instalar dependencias**:
    
    ```
    bash
    cd/var/www/Psychoway/Backend
    npminstall--production
    ```
    
2. **Restaurar el archivo de configuración de variables de entorno** (`.env`): Crear o copiar el archivo `.env` en `Backend/.env`:
    
    ```
    ini
    PORT=5000
    NODE_ENV=production
    
    # Conexión a Base de Datos
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=tu_contraseña_segura
    DB_NAME=psychoway
    DB_PORT=3306
    
    # Seguridad JWT
    JWT_SECRET=tu_jwt_secret_super_seguro_key
    
    # Integración IA Google Gemini
    GEMINI_API_KEY=tu_api_key_de_gemini
    
    # Servicio de Correo SMTP
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=notificaciones@psychoway.edu.co
    SMTP_PASS=tu_app_password
    ```
    
3. **Iniciar el servidor backend con PM2**:
    
    ```
    bash
    pm2startsrc/server.js--name"psychoway-backend"
    pm2save
    ```
    

---

#### **7.3.3.4 Paso 4: Configuración y Despliegue del Frontend**

1. **Ingresar a la carpeta raíz del proyecto e instalar dependencias de React**:
    
    ```bash
    bash
    cd/var/www/Psychoway
    npminstall
    ```
    
2. **Compilar la versión de producción**:
    
    ```bash
    bash
    npmrunbuild
    ```
    
3. **Desplegar el frontend**:
    - **Opción A (NGINX / Servidor local):** Apuntar el servidor web NGINX a la carpeta `dist/` o `build/`.
    - **Opción B (Servicios Cloud Vercel/Netlify):** Ejecutar `vercel --prod` o sincronizar el repositorio.

---

### **7.3.4. Pruebas de Verificación post-Restauración (Smoke Tests)**

Una vez completados los pasos anteriores, realizar las siguientes comprobaciones:

| **Prueba** | **Comando / Acción** | **Resultado Esperado** |
| --- | --- | --- |
| **Comprobación API Backend** | `curl http://localhost:5000/api/v1/health` | Respuesta HTTP 200 OK (`{"status": "ok"}`) |
| **Verificación de Login** | Probar inicio de sesión desde la web | Retorna JWT válido y redirige al Dashboard |
| **Verificación de la Base de Datos** | Registrar una nueva emoción en el Diario | Registro almacenado en la tabla `emotions` |
| **Verificación del Bot IA** | Enviar mensaje en el chat con Psychobot | Genera respuesta empática usando Gemini API |

---

### **7.3.5. Plan de Respaldo Preventivo (Automatización de Backups)**

Para evitar la pérdida de información futura, se recomienda configurar una tarea programada (`cron`) en el servidor para realizar respaldos automáticos diarios de la base de datos:

```bash
bash
# Editar las tareas cron del servidor
crontab-e
```

Añadir la siguiente línea (ejecuta backup todos los días a las 2:00 AM):

```bash
bash
02***mysqldump-uroot-ptu_contraseñapsychoway>/var/backups/psychoway_backup_$(date+\%Y\%m\%d).sql
```

# 8. Operación y Mantenimiento

---

La operación y mantenimiento del software es vital para su correcto funcionamiento, y es por eso que aquí hay una recopilación de errores comunes que pueden ocurrir en el software y su solución.

## 8.1. Errores Comunes y su Solución

---

### **8.1.1. El backend no arranca: mensaje FATAL de variables de entorno**

- **Error:** `FATAL: JWT_SECRET no está definido en las variables de entorno.` o `FATAL: SUPABASE_URL y SUPABASE_DB_URL deben estar definidos en .env`
- **Síntomas típicos:** El backend se detiene al instante al iniciar (`pnpm run server` o `node server.js`). En Render el deploy termina en error justo después del build. El frontend carga, pero toda petición a la API falla.
- **Posibles causas:** Falta el archivo `.env` en la ubicación esperada. Las variables `JWT_SECRET`, `SUPABASE_URL` y `SUPABASE_DB_URL` no están definidas en el panel de Render. El proceso se ejecuta desde una carpeta donde dotenv no encuentra el archivo (dotenv carga desde el directorio de trabajo actual, no desde la ubicación del archivo).
- **Diagnóstico:** Ejecutar el backend en local y observar el mensaje FATAL exacto al arrancar. En Render, entrar al servicio y revisar la pestaña **Environment** para confirmar si las variables existen.
- **Paso a paso de la solución:**
    1. Copiar `Backend/.env.example` a un archivo `.env` en la raíz del repositorio y completar `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_DB_URL`, `GEMINI_API_KEY`, `EMAIL_USER` y `EMAIL_PASS`.
    2. Si el deploy es en Render: definir manualmente cada variable en **Render → servicio → Environment** (Render no usa el `.env` del repositorio).
    3. Reiniciar el servicio y confirmar que arranca sin el mensaje FATAL.

---

### **8.1.2. El backend arranca pero no carga las variables del `.env`**

- **Error:** El backend inicia con valores por defecto: Gemini advierte `⚠️ Gemini API Key no configurada. El chatbot no funcionará.`, el email advierte `⚠️ No se pudo verificar el transporter de email:` y Supabase responde con errores de conexión.
- **Síntomas típicos:** Funciona en una máquina pero no en otra. Se ejecutó `node server.js` desde la carpeta `Backend/` y el `.env` (que está en la raíz) no se cargó. El chatbot devuelve "Configuración de IA pendiente...".
- **Posibles causas:** `dotenv.config()` carga el `.env` desde `process.cwd()` (el directorio donde se lanza el proceso). Si el proceso se inicia desde otra carpeta y el `.env` está en la raíz, nunca se carga. También puede ocurrir que el `.env` se copió del `.env.example` y conserva los valores de ejemplo.
- **Diagnóstico:** Revisar los mensajes de advertencia al arrancar (Gemini/email) y confirmar desde qué directorio se lanzó el proceso. Verificar que `GEMINI_API_KEY` no tenga el valor por defecto `API_KEY_AQUI`.
- **Paso a paso de la solución:**
    1. Ejecutar siempre el backend desde la raíz del monorepo con `pnpm run server`, o desde `Backend/` teniendo el `.env` dentro de esa carpeta.
    2. Alternativa robusta: cargar la ruta explícitamente en `Backend/src/config/environment.js` con `dotenv.config({ path: <ruta-absoluta-al-.env> })`.
    3. En Render no usar `.env`: definir las variables en el panel **Environment** del servicio.
    4. Reiniciar y confirmar que los logs de arranque ya no muestran advertencias.

---

### **8.1.3. Error conectando a Supabase**

- **Error:** Log del backend: `❌ Error conectando a Supabase:` seguido del mensaje de `pg`.
- **Síntomas típicos:** La aplicación arranca (el fallo de conexión no es fatal) pero toda consulta a la base de datos devuelve error 500: el login, el registro, el diario, la agenda, todo. En la consola del navegador, `Network` muestra peticiones a la API en 500.
- **Posibles causas:** `SUPABASE_DB_URL` incorrecta o incompleta (se debe usar la cadena de conexión del **modo Session**, puerto 5432). Contraseña de la base de datos mal escrita o rotada. La IP de origen no está permitida en Supabase. La base de datos está pausada o el proyecto fue eliminado.
- **Diagnóstico:** El log de arranque `testConnection()` ya reporta el fallo. Probar la cadena directamente contra el cliente de PostgreSQL (`psql`) o un cliente GUI. En Supabase, abrir **Database → Connect** y copiar la cadena de conexión exacta del modo Session.
- **Paso a paso de la solución:**
    1. En Supabase ir a **Database → Connect → Session pooler** y copiar la connection string completa (incluye usuario, contraseña, host y puerto 5432).
    2. Si la contraseña se rotó, actualizarla en Supabase **Database → Settings → Database password** y regenerar la cadena.
    3. Reemplazar `SUPABASE_DB_URL` en el `.env` local o en las variables de Render.
    4. Reiniciar el backend y confirmar el log `✅ Conectado a Supabase (PostgreSQL)`.

---

### **8.1.4. `relation "users" does not exist` — el esquema no se aplicó**

- **Error:** `error: relation "users" does not exist` (código PostgreSQL `42P01`) en los logs del backend. Puede repetirse con cualquier tabla: `diary`, `meetings`, `psychobot_chats`, etc.
- **Síntomas típicos:** El login y el registro devuelven 500. En Supabase, el **Table Editor** no muestra las tablas del proyecto o muestra un esquema incompleto.
- **Posibles causas:** El archivo `supabase_schema.sql` nunca se ejecutó en el proyecto Supabase, se ejecutó en otro proyecto/distinta base, o las tablas se crearon en un schema distinto a `public`.
- **Diagnóstico:** Abrir Supabase → **SQL Editor**, ejecutar:
    
    ```sql
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
    ```
    
    y comparar contra las 12 tablas esperadas del proyecto.
    
- **Paso a paso de la solución:**
    1. Verificar que el proyecto Supabase conectado es el correcto (comparar `SUPABASE_URL`).
    2. Abrir `supabase_schema.sql` y ejecutarlo completo en el **SQL Editor** de Supabase. El script es idempotente, se puede volver a ejecutar sin dañar datos.
    3. Revisar que la ejecución termine sin errores.
    4. Reiniciar el backend y probar de nuevo.

---

### **8.1.5. Error 401 de autenticación**

- **Error:** Respuesta **401** con uno de estos mensajes: `Token no proporcionado. Inicie sesión.` · `Sesión expirada. Inicie sesión nuevamente.` · `Token inválido. Inicie sesión nuevamente.`
- **Síntomas típicos:** El usuario es deslogueado de golpe. Todas las rutas `/api/*` devuelven 401. El token en `localStorage` (clave `psychoway_token`) desaparece o no se está enviando en las peticiones.
- **Posibles causas:** Sesión vencida (el JWT expira, por defecto en **8 horas** vía `JWT_EXPIRES_IN`). `JWT_SECRET` distinto entre entornos o entre reinicios: si el secreto cambia, todos los tokens emitidos quedan inválidos. El frontend no adjunta el header `Authorization: Bearer <token>`.
- **Diagnóstico:** DevTools → **Network** → abrir la petición 401 y leer el mensaje exacto. Verificar que el header `Authorization` se envía. Comparar `JWT_SECRET` entre desarrollo y Render: debe ser exactamente el mismo valor.
- **Paso a paso de la solución:**
    1. Si el mensaje es "Sesión expirada": pedir al usuario que vuelva a iniciar sesión; es comportamiento esperado a las 8 horas.
    2. Si el mensaje es "Token inválido": revisar que `JWT_SECRET` sea idéntico en todos los entornos y que no se regenere en cada deploy. Fijar un valor único y persistente.
    3. Verificar en `src/api/client.js` que el token se lee de `localStorage` (`psychoway_token`) y se agrega como `Authorization: Bearer` en cada petición.
    4. Probar el flujo completo: login → llamada autenticada → cierre de sesión.

---

### **8.1.6. Error 403 — No tienes permisos para realizar esta acción**

- **Error:** Respuesta **403** con `No tienes permisos para realizar esta acción.` (o `No tienes permisos para acceder a este perfil.` en el caso de tocar el perfil de otro usuario).
- **Síntomas típicos:** Un aprendiz no puede entrar a rutas de psicólogo o administrador. Un psicólogo no puede hacer gestión de aprendices. El administrador no puede abrir su panel.
- **Posibles causas:** El campo `role` del usuario en la tabla `users` no coincide con el rol que exige la ruta (`requireRole` / `requireAdmin`). Usuario registrado con el rol incorrecto en la base de datos.
- **Diagnóstico:** Identificar qué ruta devuelve 403 y qué roles exige (revisar el código de la ruta o el controlador correspondiente). En Supabase, abrir la tabla `users` y verificar el valor de `role` del usuario afectado. Los roles válidos del sistema son `aprendiz`, `psicologo` y `administrador`.
- **Paso a paso de la solución:**
    1. Comparar el `role` almacenado con el rol exigido por la ruta (`requireRole("psicologo")`, `requireAdmin`, etc.).
    2. Si el rol está mal en la base de datos, corregirlo con un `UPDATE` en Supabase.
    3. Si el rol es correcto pero la ruta falla, revisar la lógica de la ruta/controlador.
    4. Probar con cada perfil (aprendiz, psicólogo, administrador) el acceso a sus rutas.

---

### **8.1.7. Fallo de conexión con el Asistente IA (Psychobot)**

- **Error:** Fallo de conexión con el Asistente IA. La API de Gemini responde con error HTTP **403** (clave inválida) o **429** (cuota) y el chat no responde.
- **Síntomas típicos:** El chatbot no responde y se queda cargando. Devuelve `Lo siento, no pude entender tu solicitud.` o `Configuración de IA pendiente. Por favor, configura la API Key de Gemini.` El log del backend muestra el warning `⚠️ Gemini API Key no configurada. El chatbot no funcionará.`
- **Posibles causas:** API Key de Gemini expirada o inválida. Sin saldo/cuota en Google AI Studio (o la cuota del modelo `gemini-flash-latest` agotada). La clave tiene el valor por defecto `API_KEY_AQUI` porque el `.env` no se cargó o la variable de Render está vacía.
- **Diagnóstico:** Revisar los logs del backend (consola local o panel de **Render**) buscando el código de error HTTP de la API de Gemini, **403** para clave inválida o **429** para cuota agotada. Confirmar que `GEMINI_API_KEY` no sea `API_KEY_AQUI`.
- **Paso a paso de la solución:**
    1. Generar una nueva clave en **Google AI Studio** → API keys ([https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)).
    2. Actualizar la variable `GEMINI_API_KEY` en el archivo `.env` local o en el panel de Render (**Environment**).
    3. Reiniciar el backend y confirmar que desaparece el warning de arranque.
    4. Abrir el Psychobot y enviar un mensaje de prueba. Si sigue fallando con 429, ver el error 8 de este manual.

---

### **8.1.8. Gemini devuelve HTTP 429 (cuota agotada)**

- **Error:** HTTP **429** `RESOURCE_EXHAUSTED` en los logs del backend al llamar a `generateContent`.
- **Síntomas típicos:** El chatbot deja de responder en horas pico. El backend reintenta automáticamente (espera 10 segundos en 429), pero con mucha carga el chat se siente colgado. El error aparece de forma intermitente.
- **Posibles causas:** Límite de peticiones por minuto (RPM) o de tokens por minuto (TPM) del modelo `gemini-flash-latest` superado en el plan gratuito de Google AI Studio; demasiados usuarios usando el chat a la vez.
- **Diagnóstico:** Contar en los logs cuántas veces aparece `429` / `RESOURCE_EXHAUSTED` y en qué momentos del día. Comprobar el panel de uso/limitaciones de Google AI Studio.
- **Paso a paso de la solución:**
    1. Esperar a que se restablezca la ventana de cuota (suele ser por minuto).
    2. Reducir la frecuencia de uso o el largo de los prompts (menos tokens por mensaje).
    3. Si el proyecto lo amerita, subir de plan o solicitar aumento de cuota en Google AI Studio.
    4. Mantener el reintento automático existente; si se quiere, aumentar la espera entre reintentos en `Backend/src/config/gemini.js` (`generateWithRetry`).

---

### **8.1.9. No llegan los correos de recuperación de contraseña**

- **Error:** SMTP responde `535 Authentication Failed` / `Invalid login`. En el arranque aparece `⚠️ No se pudo verificar el transporter de email:` (no es fatal, el backend sigue).
- **Síntomas típicos:** El usuario pide restablecer la contraseña y no recibe el correo. Los emails de notificación tampoco llegan. El log del backend muestra el fallo del transporter al verificar.
- **Posibles causas:** `EMAIL_USER`/`EMAIL_PASS` vacíos o incorrectos. Con Gmail, la contraseña normal de la cuenta **no sirve** para SMTP: hace falta una *App Password*, y la cuenta requiere la verificación en 2 pasos activada. El host/port no coinciden con el proveedor (por defecto `smtp.gmail.com:465` con SSL).
- **Diagnóstico:** Revisar el warning del transporter al arrancar. Probar el envío desde el propio backend y leer el mensaje de error de SMTP (535 = credenciales). Confirmar el valor de `EMAIL_USER` y que `EMAIL_PASS` no esté vacío.
- **Paso a paso de la solución:**
    1. Activar la verificación en 2 pasos en la cuenta Gmail que envía.
    2. Crear una contraseña de aplicación: **Cuenta de Google → Seguridad → Contraseñas de aplicaciones** (16 caracteres).
    3. Poner esa contraseña en `EMAIL_PASS` (sin espacios) y el correo exacto en `EMAIL_USER`.
    4. Reiniciar el backend y confirmar `✅ Listo para enviar emails`.
    5. Enviar una recuperación de prueba y verificar que llega (revisar también Spam).

---

### **8.1.10. El enlace de recuperación da "Token inválido o expirado"**

- **Error:** Error **400** `Token inválido o expirado` o `El token ha expirado` al abrir el enlace de recuperación de contraseña.
- **Síntomas típicos:** El enlace del correo funciona si se usa enseguida, pero falla pasados unos minutos. Falla **siempre** si el backend se reinició entre el envío del correo y el clic en el enlace.
- **Posibles causas:** Los tokens de recuperación se guardan **en memoria** (un `Map` en `auth.service.js`): se pierden al reiniciar el servidor, y expiran a la **1 hora**. En Render (plan free, reinicios frecuentes) esto ocurre con frecuencia.
- **Diagnóstico:** Revisar si el backend se reinició entre el envío y el clic (logs de Render: `Restarting`). Pedir un enlace nuevo y usarlo de inmediato para confirmar que el mecanismo base funciona.
- **Paso a paso de la solución:**
    1. Para el corto plazo: solicitar un nuevo enlace de recuperación y usarlo dentro de la hora.
    2. Para producción: **persistir los tokens** en la base de datos (una tabla `password_reset_tokens` con `token`, `user_id`, `expires_at`) en lugar del `Map` en memoria.
    3. Consumir el token al usarlo (marcarlo como usado) para evitar reutilización.
    4. Probar el flujo completo: solicitar → recibir → restablecer → iniciar sesión con la nueva contraseña.

---

### **8.1.11. En producción el frontend apunta a `localhost:5000`**

- **Error:** En el build de producción todas las peticiones a la API van a `http://localhost:5000` y fallan (`ERR_CONNECTION_REFUSED` / `Failed to fetch`).
- **Síntomas típicos:** La app funciona en local pero no en Vercel: login, registro y el resto de llamadas fallan. DevTools → **Network** muestra peticiones hacia `localhost:5000`.
- **Posibles causas:** `src/api/config.js` usa `process.env.REACT_APP_API_URL || "http://localhost:5000"`. Si `REACT_APP_API_URL` no está definida en el entorno de build de Vercel, se usa el valor por defecto. Las variables `REACT_APP_*` se incrustan en el build, así que cambiarlas exige **recompilar** (no basta con redeploy con caché).
- **Diagnóstico:** DevTools → **Network** → abrir cualquier petición XHR y ver la URL base. Confirmar que apunta a `localhost:5000` en lugar de la URL de Render.
- **Paso a paso de la solución:**
    1. En Vercel → **Settings → Environment Variables**, crear `REACT_APP_API_URL` con el valor `https://<tu-backend>.onrender.com` (sin `/api`).
    2. Redesplegar **sin usar caché de build** (o cambiar la variable obliga a rebuild completo).
    3. Repetir en las vistas de preview si se usan ramas: definir la variable para los entornos correspondientes.
    4. Abrir la app desplegada y confirmar en Network que las peticiones usan la URL de Render y responden.

---

### **8.1.12. Error de CORS en la consola del navegador**

- **Error:** `Access to fetch at 'https://<api>' from origin 'https://<front>' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present...`
- **Síntomas típicos:** La petición funciona con `curl`/Postman pero el navegador la bloquea. Solo falla cuando el frontend (Vercel) y el backend (Render) están en dominios distintos.
- **Posibles causas:** La configuración de `cors` del backend no incluye el origen real del frontend (por ejemplo `https://<app>.vercel.app`), o `FRONTEND_URL` quedó en `http://localhost:3000`.
- **Diagnóstico:** Leer el mensaje de CORS completo (indica el origen bloqueado). Revisar la configuración de `cors` en `Backend/server.js` y el valor de `FRONTEND_URL` en las variables de entorno.
- **Paso a paso de la solución:**
    1. Añadir el/los orígenes reales del frontend a la lista permitida de `cors` en el backend (o configurar `origin: FRONTEND_URL` con el valor correcto de producción).
    2. Ajustar `FRONTEND_URL` en las variables de entorno de Render si corresponde (se usa además para construir el enlace de recuperación).
    3. Reiniciar el backend.
    4. Probar de nuevo desde el navegador; verificar también el preflight `OPTIONS` en Network.

---

### **8.1.13. El build de Render falla o "Cannot find module"**

- **Error:** El deploy en Render termina en error de build/start: `Cannot find module '...'`, `Module not found`, `npm ERR!`, o el servicio se inicia y se cae de inmediato.
- **Síntomas típicos:** El backend nunca queda disponible tras el deploy. Los logs de Render muestran el fallo en el paso de build o al ejecutar el Start Command.
- **Posibles causas:** **Root Directory** mal configurado: el backend está en `Backend/` y Render corre desde la raíz del repo, donde no hay `package.json` de servidor (el de la raíz es el del monorepo pnpm). Faltan variables de entorno (ver error 1). Versión de Node por defecto de Render incompatible (no hay campo `engines` en `Backend/package.json`).
- **Diagnóstico:** Revisar la pestaña **Logs** del build en Render y anotar en qué paso falla (install, build o start) y con qué mensaje.
- **Paso a paso de la solución:**
    1. En Render → **Settings** del servicio: **Root Directory** = `Backend`.
    2. **Build Command** = `pnpm install` (o `npm install` si se usa npm).
    3. **Start Command** = `pnpm start` (ejecuta `node server.js`).
    4. Definir todas las variables de entorno del backend en **Environment** (en especial `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_DB_URL`, `GEMINI_API_KEY`, `EMAIL_USER`, `EMAIL_PASS`).
    5. Fijar la versión de Node: añadir `"engines": { "node": ">=18" }` en `Backend/package.json`.
    6. Redeployar y verificar que el log muestre `✅ Conectado a Supabase` y `✅ Listo para enviar emails`.

---

### **8.1.14. El backend de Render se duerme y la primera petición falla**

- **Error:** La primera petición tras un rato de inactividad tarda decenas de segundos o falla por timeout; el resto funciona normal.
- **Síntomas típicos:** El frontend tarda en cargar datos al abrir la app después de un tiempo. El Psychobot "no responde" la primera vez, y luego responde bien.
- **Posibles causas:** Render, en el plan gratuito, duerme el servicio después de ~15 minutos de inactividad (cold start): al recibir la primera petición el servicio tarda en levantarse. Es comportamiento esperado del plan.
- **Diagnóstico:** Revisar los logs de Render: el arranque del proceso ocurre justo en el momento de la primera petición (no antes).
- **Paso a paso de la solución:**
    1. Confirmar que el comportamiento es el cold start del plan free (revisar la hora de inicio en los logs).
    2. Si se necesita respuesta inmediata siempre: escalar a un plan de pago (sin sleep), o mantener el servicio "despierto" con un ping periódico (cron cada 10 minutos a una ruta pública de la API).
    3. En desarrollo/local este error no aplica.

---

### **8.1.15. 404 al recargar una ruta del frontend**

- **Error:** Al recargar `https://<dominio>/dashboard` (o cualquier ruta interna) el servidor responde **404**, mientras que navegando desde la home todo funciona.
- **Síntomas típicos:** Recargar la página en una ruta concreta da pantalla de error del host. Las rutas de React Router solo fallan en recarga directa.
- **Posibles causas:** El host no devuelve `index.html` como fallback para rutas desconocidas (SPA fallback). En Vercel esto ya está cubierto por el `vercel.json` del proyecto (rewrites a `/index.html`), así que el error aparece sobre todo si el build se aloja en otro servidor (Nginx, Apache, GitHub Pages, etc.) sin esa regla.
- **Diagnóstico:** Intentar la recarga en una ruta interna y ver el error del servidor. Verificar que el `vercel.json` del repositorio contiene el bloque `rewrites` apuntando a `/index.html`.
- **Paso a paso de la solución:**
    1. En Vercel: verificar que `vercel.json` tenga el rewrite con `"source": "/(.*)", "destination": "/index.html"` y redesplegar.
    2. Recargar la ruta directa y comprobar que carga la app.

---