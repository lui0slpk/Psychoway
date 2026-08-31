# Manual Técnico — Errores Comunes de Psychoway

**Stack cubierto:** React 19 (frontend, raíz) · Express 5 (backend, `Backend/`) · Supabase/PostgreSQL · Google Gemini (Psychobot) · Nodemailer · Deploy en Vercel (frontend) y Render (backend).

**Formato:** cada error se describe con 5 campos: **Error**, **Síntomas típicos**, **Posibles causas**, **Diagnóstico** y **Paso a paso de la solución**. Los códigos HTTP y los mensajes de error son los que produce el backend real.

---

## Índice

1. [El backend no arranca: mensaje FATAL de variables de entorno](#1-el-backend-no-arranca-mensaje-fatal-de-variables-de-entorno)
2. [El backend arranca pero no carga las variables del `.env`](#2-el-backend-arranca-pero-no-carga-las-variables-del-env)
3. [Error conectando a Supabase](#3-error-conectando-a-supabase)
4. [`relation "users" does not exist` — el esquema no se aplicó](#4-relation-users-does-not-exist--el-esquema-no-se-aplicó)
5. [Error 401 de autenticación (Token no proporcionado / Sesión expirada / Token inválido)](#5-error-401-de-autenticación)
6. [Error 403 — No tienes permisos para realizar esta acción](#6-error-403--no-tienes-permisos-para-realizar-esta-acción)
7. [Fallo de conexión con el Asistente IA (Psychobot)](#7-fallo-de-conexión-con-el-asistente-ia-psychobot)
8. [Gemini devuelve HTTP 429 (cuota agotada)](#8-gemini-devuelve-http-429-cuota-agotada)
9. [No llegan los correos de recuperación de contraseña](#9-no-llegan-los-correos-de-recuperación-de-contraseña)
10. [El enlace de recuperación da "Token inválido o expirado"](#10-el-enlace-de-recuperación-da-token-inválido-o-expirado)
11. [En producción el frontend apunta a `localhost:5000`](#11-en-producción-el-frontend-apunta-a-localhost5000)
12. [Error de CORS en la consola del navegador](#12-error-de-cors-en-la-consola-del-navegador)
13. [El build de Render falla o "Cannot find module"](#13-el-build-de-render-falla-o-cannot-find-module)
14. [El backend de Render se duerme y la primera petición falla](#14-el-backend-de-render-se-duerme-y-la-primera-petición-falla)
15. [404 al recargar una ruta del frontend](#15-404-al-recargar-una-ruta-del-frontend)

---

## 1. El backend no arranca: mensaje FATAL de variables de entorno

- **Error:**
  `FATAL: JWT_SECRET no está definido en las variables de entorno.` o `FATAL: SUPABASE_URL y SUPABASE_DB_URL deben estar definidos en .env`

- **Síntomas típicos:**
  El backend se detiene al instante al iniciar (`pnpm run server` o `node server.js`). En Render el deploy termina en error justo después del build. El frontend carga, pero toda petición a la API falla.

- **Posibles causas:**
  Falta el archivo `.env` en la ubicación esperada. Las variables `JWT_SECRET`, `SUPABASE_URL` y `SUPABASE_DB_URL` no están definidas en el panel de Render. El proceso se ejecuta desde una carpeta donde dotenv no encuentra el archivo (dotenv carga desde el directorio de trabajo actual, no desde la ubicación del archivo).

- **Diagnóstico:**
  Ejecutar el backend en local y observar el mensaje FATAL exacto al arrancar. En Render, entrar al servicio y revisar la pestaña **Environment** para confirmar si las variables existen.

- **Paso a paso de la solución:**
  1. Copiar `Backend/.env.example` a un archivo `.env` en la raíz del repositorio y completar `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_DB_URL`, `GEMINI_API_KEY`, `EMAIL_USER` y `EMAIL_PASS`.
  2. Si el deploy es en Render: definir manualmente cada variable en **Render → servicio → Environment** (Render no usa el `.env` del repositorio).
  3. Reiniciar el servicio y confirmar que arranca sin el mensaje FATAL.

---

## 2. El backend arranca pero no carga las variables del `.env`

- **Error:**
  El backend inicia con valores por defecto: Gemini advierte `⚠️ Gemini API Key no configurada. El chatbot no funcionará.`, el email advierte `⚠️ No se pudo verificar el transporter de email:` y Supabase responde con errores de conexión.

- **Síntomas típicos:**
  Funciona en una máquina pero no en otra. Se ejecutó `node server.js` desde la carpeta `Backend/` y el `.env` (que está en la raíz) no se cargó. El chatbot devuelve "Configuración de IA pendiente...".

- **Posibles causas:**
  `dotenv.config()` carga el `.env` desde `process.cwd()` (el directorio donde se lanza el proceso). Si el proceso se inicia desde otra carpeta y el `.env` está en la raíz, nunca se carga. También puede ocurrir que el `.env` se copió del `.env.example` y conserva los valores de ejemplo.

- **Diagnóstico:**
  Revisar los mensajes de advertencia al arrancar (Gemini/email) y confirmar desde qué directorio se lanzó el proceso. Verificar que `GEMINI_API_KEY` no tenga el valor por defecto `API_KEY_AQUI`.

- **Paso a paso de la solución:**
  1. Ejecutar siempre el backend desde la raíz del monorepo con `pnpm run server`, o desde `Backend/` teniendo el `.env` dentro de esa carpeta.
  2. Alternativa robusta: cargar la ruta explícitamente en `Backend/src/config/environment.js` con `dotenv.config({ path: <ruta-absoluta-al-.env> })`.
  3. En Render no usar `.env`: definir las variables en el panel **Environment** del servicio.
  4. Reiniciar y confirmar que los logs de arranque ya no muestran advertencias.

---

## 3. Error conectando a Supabase

- **Error:**
  Log del backend: `❌ Error conectando a Supabase:` seguido del mensaje de `pg`.

- **Síntomas típicos:**
  La aplicación arranca (el fallo de conexión no es fatal) pero toda consulta a la base de datos devuelve error 500: el login, el registro, el diario, la agenda, todo. En la consola del navegador, `Network` muestra peticiones a la API en 500.

- **Posibles causas:**
  `SUPABASE_DB_URL` incorrecta o incompleta (se debe usar la cadena de conexión del **modo Session**, puerto 5432). Contraseña de la base de datos mal escrita o rotada. La IP de origen no está permitida en Supabase. La base de datos está pausada o el proyecto fue eliminado.

- **Diagnóstico:**
  El log de arranque `testConnection()` ya reporta el fallo. Probar la cadena directamente contra el cliente de PostgreSQL (`psql`) o un cliente GUI. En Supabase, abrir **Database → Connect** y copiar la cadena de conexión exacta del modo Session.

- **Paso a paso de la solución:**
  1. En Supabase ir a **Database → Connect → Session pooler** y copiar la connection string completa (incluye usuario, contraseña, host y puerto 5432).
  2. Si la contraseña se rotó, actualizarla en Supabase **Database → Settings → Database password** y regenerar la cadena.
  3. Reemplazar `SUPABASE_DB_URL` en el `.env` local o en las variables de Render.
  4. Reiniciar el backend y confirmar el log `✅ Conectado a Supabase (PostgreSQL)`.

---

## 4. `relation "users" does not exist` — el esquema no se aplicó

- **Error:**
  `error: relation "users" does not exist` (código PostgreSQL `42P01`) en los logs del backend. Puede repetirse con cualquier tabla: `diary`, `meetings`, `psychobot_chats`, etc.

- **Síntomas típicos:**
  El login y el registro devuelven 500. En Supabase, el **Table Editor** no muestra las tablas del proyecto o muestra un esquema incompleto.

- **Posibles causas:**
  El archivo `supabase_schema.sql` nunca se ejecutó en el proyecto Supabase, se ejecutó en otro proyecto/distinta base, o las tablas se crearon en un schema distinto a `public`.

- **Diagnóstico:**
  Abrir Supabase → **SQL Editor**, ejecutar:
  ```sql
  SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
  ```
  y comparar contra las 12 tablas esperadas del proyecto.

- **Paso a paso de la solución:**
  1. Verificar que el proyecto Supabase conectado es el correcto (comparar `SUPABASE_URL`).
  2. Abrir `supabase_schema.sql` y ejecutarlo completo en el **SQL Editor** de Supabase. El script es idempotente, se puede volver a ejecutar sin dañar datos.
  3. Revisar que la ejecución termine sin errores.
  4. Reiniciar el backend y probar de nuevo.

---

## 5. Error 401 de autenticación

- **Error:**
  Respuesta **401** con uno de estos mensajes: `Token no proporcionado. Inicie sesión.` · `Sesión expirada. Inicie sesión nuevamente.` · `Token inválido. Inicie sesión nuevamente.`

- **Síntomas típicos:**
  El usuario es deslogueado de golpe. Todas las rutas `/api/*` devuelven 401. El token en `localStorage` (clave `psychoway_token`) desaparece o no se está enviando en las peticiones.

- **Posibles causas:**
  Sesión vencida (el JWT expira, por defecto en **8 horas** vía `JWT_EXPIRES_IN`). `JWT_SECRET` distinto entre entornos o entre reinicios: si el secreto cambia, todos los tokens emitidos quedan inválidos. El frontend no adjunta el header `Authorization: Bearer <token>`.

- **Diagnóstico:**
  DevTools → **Network** → abrir la petición 401 y leer el mensaje exacto. Verificar que el header `Authorization` se envía. Comparar `JWT_SECRET` entre desarrollo y Render: debe ser exactamente el mismo valor.

- **Paso a paso de la solución:**
  1. Si el mensaje es "Sesión expirada": pedir al usuario que vuelva a iniciar sesión; es comportamiento esperado a las 8 horas.
  2. Si el mensaje es "Token inválido": revisar que `JWT_SECRET` sea idéntico en todos los entornos y que no se regenere en cada deploy. Fijar un valor único y persistente.
  3. Verificar en `src/api/client.js` que el token se lee de `localStorage` (`psychoway_token`) y se agrega como `Authorization: Bearer` en cada petición.
  4. Probar el flujo completo: login → llamada autenticada → cierre de sesión.

---

## 6. Error 403 — No tienes permisos para realizar esta acción

- **Error:**
  Respuesta **403** con `No tienes permisos para realizar esta acción.` (o `No tienes permisos para acceder a este perfil.` en el caso de tocar el perfil de otro usuario).

- **Síntomas típicos:**
  Un aprendiz no puede entrar a rutas de psicólogo o administrador. Un psicólogo no puede hacer gestión de aprendices. El administrador no puede abrir su panel.

- **Posibles causas:**
  El campo `role` del usuario en la tabla `users` no coincide con el rol que exige la ruta (`requireRole` / `requireAdmin`). Usuario registrado con el rol incorrecto en la base de datos.

- **Diagnóstico:**
  Identificar qué ruta devuelve 403 y qué roles exige (revisar el código de la ruta o el controlador correspondiente). En Supabase, abrir la tabla `users` y verificar el valor de `role` del usuario afectado. Los roles válidos del sistema son `aprendiz`, `psicologo` y `administrador`.

- **Paso a paso de la solución:**
  1. Comparar el `role` almacenado con el rol exigido por la ruta (`requireRole("psicologo")`, `requireAdmin`, etc.).
  2. Si el rol está mal en la base de datos, corregirlo con un `UPDATE` en Supabase.
  3. Si el rol es correcto pero la ruta falla, revisar la lógica de la ruta/controlador.
  4. Probar con cada perfil (aprendiz, psicólogo, administrador) el acceso a sus rutas.

---

## 7. Fallo de conexión con el Asistente IA (Psychobot)

- **Error:**
  Fallo de conexión con el Asistente IA. La API de Gemini responde con error HTTP **403** (clave inválida) o **429** (cuota) y el chat no responde.

- **Síntomas típicos:**
  El chatbot no responde y se queda cargando. Devuelve `Lo siento, no pude entender tu solicitud.` o `Configuración de IA pendiente. Por favor, configura la API Key de Gemini.` El log del backend muestra el warning `⚠️ Gemini API Key no configurada. El chatbot no funcionará.`

- **Posibles causas:**
  API Key de Gemini expirada o inválida. Sin saldo/cuota en Google AI Studio (o la cuota del modelo `gemini-flash-latest` agotada). La clave tiene el valor por defecto `API_KEY_AQUI` porque el `.env` no se cargó o la variable de Render está vacía.

- **Diagnóstico:**
  Revisar los logs del backend (consola local o panel de **Render**) buscando el código de error HTTP de la API de Gemini, **403** para clave inválida o **429** para cuota agotada. Confirmar que `GEMINI_API_KEY` no sea `API_KEY_AQUI`.

- **Paso a paso de la solución:**
  1. Generar una nueva clave en **Google AI Studio** → API keys (https://aistudio.google.com/apikey).
  2. Actualizar la variable `GEMINI_API_KEY` en el archivo `.env` local o en el panel de Render (**Environment**).
  3. Reiniciar el backend y confirmar que desaparece el warning de arranque.
  4. Abrir el Psychobot y enviar un mensaje de prueba. Si sigue fallando con 429, ver el error 8 de este manual.

---

## 8. Gemini devuelve HTTP 429 (cuota agotada)

- **Error:**
  HTTP **429** `RESOURCE_EXHAUSTED` en los logs del backend al llamar a `generateContent`.

- **Síntomas típicos:**
  El chatbot deja de responder en horas pico. El backend reintenta automáticamente (espera 10 segundos en 429), pero con mucha carga el chat se siente colgado. El error aparece de forma intermitente.

- **Posibles causas:**
  Límite de peticiones por minuto (RPM) o de tokens por minuto (TPM) del modelo `gemini-flash-latest` superado en el plan gratuito de Google AI Studio; demasiados usuarios usando el chat a la vez.

- **Diagnóstico:**
  Contar en los logs cuántas veces aparece `429` / `RESOURCE_EXHAUSTED` y en qué momentos del día. Comprobar el panel de uso/limitaciones de Google AI Studio.

- **Paso a paso de la solución:**
  1. Esperar a que se restablezca la ventana de cuota (suele ser por minuto).
  2. Reducir la frecuencia de uso o el largo de los prompts (menos tokens por mensaje).
  3. Si el proyecto lo amerita, subir de plan o solicitar aumento de cuota en Google AI Studio.
  4. Mantener el reintento automático existente; si se quiere, aumentar la espera entre reintentos en `Backend/src/config/gemini.js` (`generateWithRetry`).

---

## 9. No llegan los correos de recuperación de contraseña

- **Error:**
  SMTP responde `535 Authentication Failed` / `Invalid login`. En el arranque aparece `⚠️ No se pudo verificar el transporter de email:` (no es fatal, el backend sigue).

- **Síntomas típicos:**
  El usuario pide restablecer la contraseña y no recibe el correo. Los emails de notificación tampoco llegan. El log del backend muestra el fallo del transporter al verificar.

- **Posibles causas:**
  `EMAIL_USER`/`EMAIL_PASS` vacíos o incorrectos. Con Gmail, la contraseña normal de la cuenta **no sirve** para SMTP: hace falta una *App Password*, y la cuenta requiere la verificación en 2 pasos activada. El host/port no coinciden con el proveedor (por defecto `smtp.gmail.com:465` con SSL).

- **Diagnóstico:**
  Revisar el warning del transporter al arrancar. Probar el envío desde el propio backend y leer el mensaje de error de SMTP (535 = credenciales). Confirmar el valor de `EMAIL_USER` y que `EMAIL_PASS` no esté vacío.

- **Paso a paso de la solución:**
  1. Activar la verificación en 2 pasos en la cuenta Gmail que envía.
  2. Crear una contraseña de aplicación: **Cuenta de Google → Seguridad → Contraseñas de aplicaciones** (16 caracteres).
  3. Poner esa contraseña en `EMAIL_PASS` (sin espacios) y el correo exacto en `EMAIL_USER`.
  4. Reiniciar el backend y confirmar `✅ Listo para enviar emails`.
  5. Enviar una recuperación de prueba y verificar que llega (revisar también Spam).

---

## 10. El enlace de recuperación da "Token inválido o expirado"

- **Error:**
  Error **400** `Token inválido o expirado` o `El token ha expirado` al abrir el enlace de recuperación de contraseña.

- **Síntomas típicos:**
  El enlace del correo funciona si se usa enseguida, pero falla pasados unos minutos. Falla **siempre** si el backend se reinició entre el envío del correo y el clic en el enlace.

- **Posibles causas:**
  Los tokens de recuperación se guardan **en memoria** (un `Map` en `auth.service.js`): se pierden al reiniciar el servidor, y expiran a la **1 hora**. En Render (plan free, reinicios frecuentes) esto ocurre con frecuencia.

- **Diagnóstico:**
  Revisar si el backend se reinició entre el envío y el clic (logs de Render: `Restarting`). Pedir un enlace nuevo y usarlo de inmediato para confirmar que el mecanismo base funciona.

- **Paso a paso de la solución:**
  1. Para el corto plazo: solicitar un nuevo enlace de recuperación y usarlo dentro de la hora.
  2. Para producción: **persistir los tokens** en la base de datos (una tabla `password_reset_tokens` con `token`, `user_id`, `expires_at`) en lugar del `Map` en memoria.
  3. Consumir el token al usarlo (marcarlo como usado) para evitar reutilización.
  4. Probar el flujo completo: solicitar → recibir → restablecer → iniciar sesión con la nueva contraseña.

---

## 11. En producción el frontend apunta a `localhost:5000`

- **Error:**
  En el build de producción todas las peticiones a la API van a `http://localhost:5000` y fallan (`ERR_CONNECTION_REFUSED` / `Failed to fetch`).

- **Síntomas típicos:**
  La app funciona en local pero no en Vercel: login, registro y el resto de llamadas fallan. DevTools → **Network** muestra peticiones hacia `localhost:5000`.

- **Posibles causas:**
  `src/api/config.js` usa `process.env.REACT_APP_API_URL || "http://localhost:5000"`. Si `REACT_APP_API_URL` no está definida en el entorno de build de Vercel, se usa el valor por defecto. Las variables `REACT_APP_*` se incrustan en el build, así que cambiarlas exige **recompilar** (no basta con redeploy con caché).

- **Diagnóstico:**
  DevTools → **Network** → abrir cualquier petición XHR y ver la URL base. Confirmar que apunta a `localhost:5000` en lugar de la URL de Render.

- **Paso a paso de la solución:**
  1. En Vercel → **Settings → Environment Variables**, crear `REACT_APP_API_URL` con el valor `https://<tu-backend>.onrender.com` (sin `/api`).
  2. Redesplegar **sin usar caché de build** (o cambiar la variable obliga a rebuild completo).
  3. Repetir en las vistas de preview si se usan ramas: definir la variable para los entornos correspondientes.
  4. Abrir la app desplegada y confirmar en Network que las peticiones usan la URL de Render y responden.

---

## 12. Error de CORS en la consola del navegador

- **Error:**
  `Access to fetch at 'https://<api>' from origin 'https://<front>' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present...`

- **Síntomas típicos:**
  La petición funciona con `curl`/Postman pero el navegador la bloquea. Solo falla cuando el frontend (Vercel) y el backend (Render) están en dominios distintos.

- **Posibles causas:**
  La configuración de `cors` del backend no incluye el origen real del frontend (por ejemplo `https://<app>.vercel.app`), o `FRONTEND_URL` quedó en `http://localhost:3000`.

- **Diagnóstico:**
  Leer el mensaje de CORS completo (indica el origen bloqueado). Revisar la configuración de `cors` en `Backend/server.js` y el valor de `FRONTEND_URL` en las variables de entorno.

- **Paso a paso de la solución:**
  1. Añadir el/los orígenes reales del frontend a la lista permitida de `cors` en el backend (o configurar `origin: FRONTEND_URL` con el valor correcto de producción).
  2. Ajustar `FRONTEND_URL` en las variables de entorno de Render si corresponde (se usa además para construir el enlace de recuperación).
  3. Reiniciar el backend.
  4. Probar de nuevo desde el navegador; verificar también el preflight `OPTIONS` en Network.

---

## 13. El build de Render falla o "Cannot find module"

- **Error:**
  El deploy en Render termina en error de build/start: `Cannot find module '...'`, `Module not found`, `npm ERR!`, o el servicio se inicia y se cae de inmediato.

- **Síntomas típicos:**
  El backend nunca queda disponible tras el deploy. Los logs de Render muestran el fallo en el paso de build o al ejecutar el Start Command.

- **Posibles causas:**
  **Root Directory** mal configurado: el backend está en `Backend/` y Render corre desde la raíz del repo, donde no hay `package.json` de servidor (el de la raíz es el del monorepo pnpm). Faltan variables de entorno (ver error 1). Versión de Node por defecto de Render incompatible (no hay campo `engines` en `Backend/package.json`).

- **Diagnóstico:**
  Revisar la pestaña **Logs** del build en Render y anotar en qué paso falla (install, build o start) y con qué mensaje.

- **Paso a paso de la solución:**
  1. En Render → **Settings** del servicio: **Root Directory** = `Backend`.
  2. **Build Command** = `pnpm install` (o `npm install` si se usa npm).
  3. **Start Command** = `pnpm start` (ejecuta `node server.js`).
  4. Definir todas las variables de entorno del backend en **Environment** (en especial `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_DB_URL`, `GEMINI_API_KEY`, `EMAIL_USER`, `EMAIL_PASS`).
  5. Fijar la versión de Node: añadir `"engines": { "node": ">=18" }` en `Backend/package.json`.
  6. Redeployar y verificar que el log muestre `✅ Conectado a Supabase` y `✅ Listo para enviar emails`.

---

## 14. El backend de Render se duerme y la primera petición falla

- **Error:**
  La primera petición tras un rato de inactividad tarda decenas de segundos o falla por timeout; el resto funciona normal.

- **Síntomas típicos:**
  El frontend tarda en cargar datos al abrir la app después de un tiempo. El Psychobot "no responde" la primera vez, y luego responde bien.

- **Posibles causas:**
  Render, en el plan gratuito, duerme el servicio después de ~15 minutos de inactividad (cold start): al recibir la primera petición el servicio tarda en levantarse. Es comportamiento esperado del plan.

- **Diagnóstico:**
  Revisar los logs de Render: el arranque del proceso ocurre justo en el momento de la primera petición (no antes).

- **Paso a paso de la solución:**
  1. Confirmar que el comportamiento es el cold start del plan free (revisar la hora de inicio en los logs).
  2. Si se necesita respuesta inmediata siempre: escalar a un plan de pago (sin sleep), o mantener el servicio "despierto" con un ping periódico (cron cada 10 minutos a una ruta pública de la API).
  3. En desarrollo/local este error no aplica.

---

## 15. 404 al recargar una ruta del frontend

- **Error:**
  Al recargar `https://<dominio>/dashboard` (o cualquier ruta interna) el servidor responde **404**, mientras que navegando desde la home todo funciona.

- **Síntomas típicos:**
  Recargar la página en una ruta concreta da pantalla de error del host. Las rutas de React Router solo fallan en recarga directa.

- **Posibles causas:**
  El host no devuelve `index.html` como fallback para rutas desconocidas (SPA fallback). En Vercel esto ya está cubierto por el `vercel.json` del proyecto (rewrites a `/index.html`), así que el error aparece sobre todo si el build se aloja en otro servidor (Nginx, Apache, GitHub Pages, etc.) sin esa regla.

- **Diagnóstico:**
  Intentar la recarga en una ruta interna y ver el error del servidor. Verificar que el `vercel.json` del repositorio contiene el bloque `rewrites` apuntando a `/index.html`.

- **Paso a paso de la solución:**
  1. En Vercel: verificar que `vercel.json` tenga el rewrite con `"source": "/(.*)", "destination": "/index.html"` y redesplegar.
  2. En otro host: configurar el fallback de SPA (Nginx: `try_files $uri /index.html;` · Apache: reescribir a `index.html` · Node/Express: `app.get('*', ...)` sirviendo el build).
  3. Recargar la ruta directa y comprobar que carga la app.

---

*Última actualización: 2026-08-12 · Repositorio: lui0slpk/Psychoway*