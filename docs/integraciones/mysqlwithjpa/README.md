# Integración con el microservicio mysqlwithjpa

El módulo **Gestión JPA** de Psychoway (ruta `/gestion-jpa`, exclusiva del rol `administrador`) administra los usuarios del microservicio externo **mysqlwithjpa** (Spring Boot + JPA, puerto 8080). Este documento describe el contrato técnico que consume el módulo: endpoints autorizados, autenticación, manejo de errores y configuración por entorno.

La referencia completa del servicio está en [`API_REFERENCE.md`](../../API_REFERENCE.md) (fuente de verdad del contrato). La guía paso a paso para verificar la integración en ejecución está en [`manual-integracion.md`](manual-integracion.md).

## Ruta rápida

| Aspecto | Valor |
|---|---|
| Página | `Frontend/src/pages/administrador/GestionJpaPage.jsx` (ruta `/gestion-jpa`, protegida por rol `administrador`) |
| Capa API | `Frontend/src/api/jpaUsers.api.js` sobre el cliente HTTP compartido `Frontend/src/api/client.js` |
| URL base | `JPA_API_BASE` en `Frontend/src/api/config.js` → `process.env.REACT_APP_JPA_API_URL \|\| "http://localhost:8080"` |
| Pruebas | `Frontend/src/api/tests/jpaUsers.api.test.js` (Vitest, 21 tests del contrato de transporte) |

## Conjunto de endpoints autorizados

El módulo consume EXCLUSIVAMENTE este conjunto de endpoints. Ningún otro endpoint del microservicio puede aparecer en el código del módulo:

| Endpoint | Método | Autenticación | Uso en el módulo |
|---|---|---|---|
| `/actuator/health` | GET | No requerida (`auth: false`) | Estado de salud de Supabase (`components.db`) y MongoDB (`components.mongo`) |
| `/api/roles` | GET | Requerida (`ROLE_ADMINISTRADOR`) | Catálogo de roles para los selects de filtro y formularios |
| `/api/users` | GET | Requerida (`ROLE_ADMINISTRADOR`) | Listado paginado con filtros (`document`, `email`, `names`, `lastNames`, `idRol`) |
| `/api/users` | POST | Requerida (`ROLE_ADMINISTRADOR`) | Creación de usuarios |
| `/api/users/{id}` | PUT | Requerida (`ROLE_ADMINISTRADOR`) | Edición con campos modificados únicamente |
| `/api/users/{id}` | DELETE | Requerida (`ROLE_ADMINISTRADOR`) | Eliminación con confirmación previa |

> **Exclusión deliberada**: `GET /api/users/{id}` NO se consume. Los datos de cada fila provienen de la página ya cargada del listado; ninguna acción (detalle, edición, eliminación) realiza una consulta por usuario.

## Autenticación con JWT compartido

El microservicio NO tiene endpoint de login. El flujo de autenticación es:

1. El usuario inicia sesión en Express (`POST /api/auth/login`, puerto 5000).
2. Express emite un JWT firmado con **HS256** usando el secreto compartido `JWT_SECRET`.
3. El frontend almacena el token en `localStorage["psychoway_token"]` y el cliente HTTP compartido lo inyecta como header `Authorization: Bearer <token>` en cada llamada protegida.
4. El microservicio **solo valida** el token (filtro `JwtValidationFilter`, tolerancia de reloj de 60 segundos, expiración a 1 hora gestionada por Express). No lo emite ni lo renueva.

| Aspecto | Detalle |
|---|---|
| Algoritmo | HS256 (secreto simétrico compartido `JWT_SECRET` entre ambos servicios) |
| Claims esperados | `userId`, `role`, `document`, `exp`, `iat` |
| Mapeo de roles | `"administrador"` → `ROLE_ADMINISTRADOR`; `"psicologo"` → `ROLE_PSICOLOGO`; `"aprendiz"` → `ROLE_APRENDIZ` |
| Endpoints protegidos | Todos los de `/api/*` requieren rol `ROLE_ADMINISTRADOR` |

### Comportamiento 401 aceptado: cierre de sesión global

Cuando el microservicio responde `401` (token faltante, inválido o expirado), el módulo NO introduce un manejo propio: aplica el comportamiento existente del cliente compartido `client.js` — borrar la sesión (`psychoway_token` / `psychoway_user`) y redirigir a `/`, es decir, **cierre de sesión global**.

**Justificación**: el JWT es compartido (`JWT_SECRET`, HS256) entre Express y el microservicio. Un 401 del microservicio significa que la sesión de Express es igualmente inválida, por lo que el cierre global es coherente y es el comportamiento aceptado por diseño. El health check evita por completo esta vía (es público, `auth: false`).

**Importante**: ningún OTRO estado de error cierra la sesión. Los errores 403, 404, 409, 429 y 5xx/red se capturan por llamada y se muestran como diálogos SweetAlert2 en español (vía `Frontend/src/utils/alerts.js`), conservando la sesión activa.

## Contrato de errores

Toda llamada fallida se traduce con `mapJpaError(error)` → `{ title, text, fieldErrors? }` y se muestra al usuario en español:

| Estado | Condición | Comportamiento en la interfaz |
|---|---|---|
| `400` | Validación fallida: cuerpo con `details[]` (`{ field, message }`) | Cada entrada se mapea al indicador del campo correspondiente del formulario activo (`fieldErrors`); el resto se muestra en el cuerpo del diálogo |
| `403` | Token válido pero rol insuficiente | Diálogo "No tienes permisos suficientes para esta acción". La sesión se conserva |
| `404` | Recurso inexistente | Diálogo "El recurso solicitado ya no existe". La sesión se conserva |
| `409` | `document` o `email` duplicados | Diálogo "Conflicto" con el mensaje del servidor que identifica el campo duplicado. La sesión se conserva |
| `429` | Rate limit excedido: cuerpo con `retryAfterSeconds` | Diálogo "Demasiadas solicitudes. Intenta de nuevo en X segundos". **Nunca se reintenta automáticamente** |
| `0` / `5xx` / fallo de red | Servicio caído o error interno | Diálogo "El servicio no está disponible en este momento"; la tabla/formulario quedan en estado estable, sin datos parciales |

## Health check

- Es un endpoint **público**: se llama con `auth: false` (sin header `Authorization`) y **no consume cuota del rate limit** (excluido por el servicio).
- La sección de salud muestra dos bloques: **Supabase** (desde `components.db`) y **MongoDB** (desde `components.mongo`).
- Colores por bloque, evaluados en orden: **rojo** si el componente falta, si `status !== "UP"` o si la petición falló; **amarillo** si `status === "UP"` pero `details.responseTimeMs > 200`; **verde** si `status === "UP"` y `responseTimeMs <= 200`. La latencia se muestra cuando está presente.
- Actualización SOLO al entrar a la página y con el botón manual "Actualizar".

## Rate limit: por qué no existe debounce ni sondeo

El microservicio limita a **100 peticiones por minuto por IP** (ventana móvil, cuota compartida entre todos los administradores detrás de la misma IP). Por esa razón el módulo toma estas decisiones estructurales:

- **Sin debounce ni búsqueda al escribir**: los filtros se aplican únicamente con el botón "Buscar". Escribir no genera ninguna petición.
- **Sin sondeo automático (polling)**: no existe `setInterval` en el módulo; el health check y el listado solo se consultan al entrar a la página o por acción explícita.
- **Una única ráfaga al entrar**: exactamente tres peticiones (`/actuator/health`, `/api/roles`, `/api/users?page=0&size=5`) mediante `Promise.allSettled`, con fallos independientes.
- **Sin reintento automático ante 429**: se informa `retryAfterSeconds` y la siguiente acción la decide el usuario.

## Otras decisiones de integración

| Decisión | Detalle |
|---|---|
| Paginación 0↔1 | La API es 0-indexada y la interfaz muestra páginas 1-indexadas; la conversión (`page - 1`) vive únicamente en `jpaUsers.api.js` |
| Tamaño explícito | El listado siempre envía `size` explícitamente (por defecto `5`; opciones 5/10/20/50). El default de la API (`20`) no se usa implícitamente |
| Edición por diferencia | El PUT envía solo los campos modificados; `password` solo se envía cuando se llena; los campos opcionales vacíos se omiten |
| Eliminación local | Tras un 204 exitoso la fila se remueve localmente sin recargar la página; si la página queda vacía y no es la primera, retrocede una página y reconsulta |
| Retroalimentación | Todos los diálogos (éxito, error, advertencia, confirmación) usan exclusivamente el wrapper SweetAlert2 `Frontend/src/utils/alerts.js` |

## Configuración por entorno: `REACT_APP_JPA_API_URL`

| Entorno | Valor requerido |
|---|---|
| Desarrollo | No se configura: la constante cae al default `http://localhost:8080` |
| Cualquier despliegue que NO sea desarrollo | **Obligatorio**: definir `REACT_APP_JPA_API_URL` con la URL pública del microservicio (p. ej. `https://api.tudominio.com`) en el archivo `Frontend/.env` del entorno correspondiente, antes de construir |

La variable se declara en `Frontend/src/api/config.js`:

```js
export const JPA_API_BASE =
  process.env.REACT_APP_JPA_API_URL || "http://localhost:8080";
```

> **Nota de despliegue** (pregunta abierta #3 del diseño, resuelta): el default `localhost:8080` SOLO sirve para desarrollo local. Todo despliegue a otro entorno debe fijar `REACT_APP_JPA_API_URL` antes del build; de lo contrario el módulo apuntará a `localhost` y ninguna llamada se resolverá. El CORS del microservicio ya admite `http://localhost:3000` y `https://psychoway.vercel.app`.

## Archivos del módulo

| Archivo | Rol |
|---|---|
| `Frontend/src/api/config.js` | Declara `JPA_API_BASE` (única constante de configuración del módulo) |
| `Frontend/src/api/jpaUsers.api.js` | Transporte: `jpaHealth`, `listJpaRoles`, `listJpaUsers`, `createJpaUser`, `updateJpaUser`, `deleteJpaUser`, `mapJpaError` |
| `Frontend/src/api/tests/jpaUsers.api.test.js` | Cobertura Vitest del contrato de transporte (`vi.*`) |
| `Frontend/src/pages/administrador/GestionJpaPage.jsx` | Orquestador: estado de servidor/UI, tres consultas de entrada, flujos CRUD |
| `Frontend/src/components/admin/gestion-jpa/` | Secciones presentacionales: `JpaHealthSection`, `JpaUserFilters`, `JpaUsersTable`, `JpaPagination`, `JpaUserCreateForm`, `JpaUserModal` |
