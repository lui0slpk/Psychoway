# Manual de Integración — Microservicio mysqlwithjpa

**PSYCHOWAY**

**Manual de Integración — Módulo Gestión JPA**

**Versión:** 1.1

**Fecha:** Septiembre de 2026

**Proyecto:** Psychoway

**Institución:** Servicio Nacional de Aprendizaje — SENA

---

| Versión | Fecha | Descripción | Responsable |
| --- | --- | --- | --- |
| 1.0 | Septiembre de 2026 | Elaboración inicial del Manual de Integración del módulo Gestión JPA | Equipo Psychoway |
| 1.1 | Septiembre de 2026 | Corrección del contrato de datos tras verificación en vivo: respuestas del microservicio en snake_case (normalización en la capa API), enum de tipo de documento real (CC/TI/CE/PP/RC/NIT) y límites corregidos (`fichaNumber` máx 50, tamaño de página por defecto 10) | Equipo Psychoway |

---

# TABLA DE CONTENIDO

1. OBJETIVO
2. ALCANCE
3. TÉRMINOS Y DEFINICIONES
4. PRERREQUISITOS
5. CONFIGURACIÓN DEL ENTORNO
6. VERIFICACIÓN DE LA INTEGRACIÓN PASO A PASO
   - 6.1. Acceder al módulo Gestión JPA
   - 6.2. Verificar el estado de salud del microservicio
   - 6.3. Verificar el listado y la paginación de usuarios
   - 6.4. Verificar los filtros de búsqueda
   - 6.5. Crear un usuario
   - 6.6. Editar un usuario
   - 6.7. Eliminar un usuario
   - 6.8. Verificar el contrato de errores
   - 6.9. Auditar los endpoints consumidos
7. PREGUNTAS FRECUENTES
8. SOLUCIÓN DE PROBLEMAS
9. REFERENCIAS

---

# 1. OBJETIVO

Este manual tiene como objetivo guiar, paso a paso, la configuración y la verificación de la integración entre la plataforma Psychoway y el microservicio externo **mysqlwithjpa** (Spring Boot + JPA), consumida por el módulo **Gestión JPA** de Psychoway.

El documento está dirigido al equipo de desarrollo y al personal administrador encargado de desplegar, configurar y comprobar el funcionamiento de la integración en cada entorno.

# 2. ALCANCE

El manual contempla la configuración de la variable de entorno del frontend y la verificación funcional completa del módulo: estado de salud, listado paginado, filtros, creación, edición y eliminación de usuarios, contrato de errores y auditoría de endpoints.

El módulo Gestión JPA:

- Vive en la ruta `/gestion-jpa` y está disponible exclusivamente para el rol **administrador**.
- Administra los usuarios del microservicio mysqlwithjpa; NO reemplaza ni modifica la gestión de usuarios existente de Psychoway (`/gestion`, `/gestion-mod`), que sigue operando contra el backend Express.
- Consume únicamente el conjunto autorizado de endpoints: `GET /actuator/health`, `GET /api/roles`, `GET/POST /api/users` y `PUT/DELETE /api/users/{id}`.

La referencia técnica del contrato real está en el [`README.md`](README.md) de este directorio (verificado contra el código fuente del microservicio); [`API_REFERENCE.md`](../../API_REFERENCE.md) permanece como referencia general con las salvedades de la nota siguiente.

**Nota sobre el contrato de datos (verificado contra el código fuente del microservicio):** las **respuestas** del microservicio viajan en `snake_case` (`id_user`, `doc_type`, `total_elements`, ...) mientras que los **request** (cuerpos de POST/PUT y query params) viajan en `camelCase`. `API_REFERENCE.md` está desactualizado en este punto (documenta respuestas en camelCase) y en el enum de `docType` (incluye un `PPT` que no existe en el servicio; el enum real es CC/TI/CE/PP/RC/NIT). El frontend normaliza las respuestas snake_case → camelCase **exclusivamente** en `Frontend/src/api/jpaUsers.api.js` (capa anticorrupción); ningún componente traduce nombres de campo. El contrato real de respuestas está documentado en la sección «Contrato de serialización de respuestas» del [`README.md`](README.md).

# 3. TÉRMINOS Y DEFINICIONES

| Término | Definición |
| --- | --- |
| **mysqlwithjpa** | Microservicio externo (Spring Boot + JPA, puerto 8080) que expone el CRUD de usuarios, el catálogo de roles y el health check consumidos por el módulo. |
| **JWT** | Token de autenticación emitido por Express y validado por el microservicio, firmado con HS256 mediante el secreto compartido `JWT_SECRET`. |
| **Endpoint** | Ruta de API expuesta por un servicio (p. ej. `/api/users`). |
| **Health check** | Endpoint público (`/actuator/health`) que reporta el estado del microservicio y de sus dependencias (Supabase y MongoDB). |
| **Rate limit** | Límite de peticiones del microservicio: 100 solicitudes por minuto por IP. |
| **Paginación 0-indexada** | Convención de la API: la primera página es `page=0`. La interfaz la presenta como página 1 y la conversión ocurre en la capa API. |
| **snake_case / camelCase** | Convenciones de nombres del wire: las RESPUESTAS del microservicio viajan en snake_case (`total_elements`, `id_user`); los REQUEST viajan en camelCase (`lastNames`, `idRol`). El frontend traduce las respuestas a camelCase en la capa API (`jpaUsers.api.js`). |
| **CORS** | Mecanismo que autoriza al navegador a llamar el microservicio desde orígenes permitidos (`http://localhost:3000`, `https://psychoway.vercel.app`). |
| **`REACT_APP_JPA_API_URL`** | Variable de entorno del frontend que define la URL base del microservicio. |

# 4. PRERREQUISITOS

Antes de iniciar la verificación, confirme que se cumple cada requisito:

- Microservicio **mysqlwithjpa** en ejecución y accesible (desarrollo: `http://localhost:8080`).
- Backend de Psychoway (Express) en ejecución (puerto 5000) — es quien emite el JWT en `POST /api/auth/login`.
- Ambos servicios comparten el secreto `JWT_SECRET` (sin él, el microservicio rechazará el token con 401).
- Una cuenta con rol **administrador** en Psychoway.
- Catálogo de roles sembrado en el microservicio (1 Aprendiz, 2 Psicologo, 3 Administrador).
- Frontend de Psychoway instalado (`pnpm install`) y configurado según la sección 5.

# 5. CONFIGURACIÓN DEL ENTORNO

## 5.1. Configurar la variable `REACT_APP_JPA_API_URL`

La URL base del microservicio se define en `Frontend/src/api/config.js`:

```js
export const JPA_API_BASE =
  process.env.REACT_APP_JPA_API_URL || "http://localhost:8080";
```

**Paso 1.** Abra el archivo `Frontend/.env`.

**Paso 2.** Verifique la variable del backend existente:

```
REACT_APP_API_URL=http://localhost:5000
```

**Paso 3.** Para desarrollo local NO es necesario agregar nada: sin la variable, el módulo usa el valor por defecto `http://localhost:8080`.

**Paso 4.** Para cualquier despliegue que NO sea desarrollo, agregue obligatoriamente la URL pública del microservicio:

```
REACT_APP_JPA_API_URL=https://api.tudominio.com
```

**Paso 5.** Reinicie el servidor de desarrollo (o vuelva a ejecutar el build de producción). Las variables `REACT_APP_*` se leen en tiempo de compilación: cambiar el `.env` con el servidor corriendo no tiene efecto.

**Resultado esperado:** la variable queda configurada según el entorno; en despliegues no locales el módulo apunta al microservicio público y no a `localhost`.

> **Importante:** el valor por defecto `http://localhost:8080` solo sirve en desarrollo local. Omitir este paso en un despliegue hace que ninguna llamada del módulo se resuelva.

# 6. VERIFICACIÓN DE LA INTEGRACIÓN PASO A PASO

Inicie el frontend (`pnpm --dir Frontend start`) con el microservicio y el backend activos. Tenga abierta la pestaña **Network** de las herramientas de desarrollo del navegador: varios pasos la usan como evidencia.

## 6.1. Acceder al módulo Gestión JPA

**Paso 1.** Inicie sesión en Psychoway con la cuenta de administrador.

**Paso 2.** En el menú lateral, seleccione **Gestión JPA**.

**Paso 3.** Verifique que la página `/gestion-jpa` carga con sus secciones: salud, filtros y tabla, formulario de creación.

**Resultado esperado:** la página se abre sin errores. En la pestaña Network se registran exactamente tres peticiones al microservicio: `GET /actuator/health`, `GET /api/roles` y `GET /api/users?page=0&size=5`.

**Contraprueba (protección de ruta):** con una sesión de otro rol o sin sesión, el módulo no es visible en el menú ni accesible en `/gestion-jpa`.

## 6.2. Verificar el estado de salud del microservicio

**Paso 1.** En la parte superior de la página, ubique los dos bloques de estado: **Supabase** y **MongoDB**.

**Paso 2.** Verifique el color de cada bloque:
- **Verde**: componente operativo con latencia ≤ 200 ms.
- **Amarillo**: operativo con latencia > 200 ms (se muestra la latencia medida).
- **Rojo**: componente caído, ausente en la respuesta, o microservicio inalcanzable.

**Paso 3.** Pulse el botón **Actualizar** y observe la pestaña Network.

**Resultado esperado:** se emite exactamente una nueva petición `GET /actuator/health` (sin header `Authorization`) y los bloques se actualizan con la respuesta. Permaneciendo en la página más de 5 minutos sin interactuar, NO se registra ninguna petición adicional: el módulo no sondea automáticamente.

## 6.3. Verificar el listado y la paginación de usuarios

**Paso 1.** Confirme que la tabla muestra las columnas: documento, nombres y apellidos, correo y rol, con los botones de editar y eliminar por fila.

**Paso 2.** Verifique en Network que la carga inicial fue `GET /api/users?page=0&size=5` (tamaño 5 explícito, primera página como `page=0`).

**Paso 3.** Cambie el selector de registros por página a 10, 20 o 50.

**Paso 4.** Navegue a la página 2 con los controles de paginación.

**Resultado esperado:** cada cambio de tamaño reemite la consulta con el nuevo `size` (página reiniciada a la primera); la página "2" de la interfaz envía `page=1`. En la última página, el botón de avance queda deshabilitado. En todas las peticiones viaja el header `Authorization: Bearer <token>`. La respuesta del listado llega en `snake_case` (`total_elements`, `total_pages`, `id_user`, ...) — es el formato real del wire; la interfaz la consume normalizada (`totalElements`, `totalPages`, ...) gracias a la traducción de la capa API.

## 6.4. Verificar los filtros de búsqueda

**Paso 1.** Escriba un valor en el filtro **Correo** (p. ej. `juan@email.com`) y seleccione un rol en el filtro **Rol**.

**Paso 2.** Mientras escribe, observe la pestaña Network.

**Paso 3.** Pulse el botón **Buscar**.

**Paso 4.** Limpie todos los filtros y pulse **Buscar** de nuevo.

**Resultado esperado:** al escribir NO se emite ninguna petición. Al pulsar **Buscar** se emite `GET /api/users?page=0&size=<actual>&email=juan@email.com&idRol=1` — solo viajan los filtros diligenciados. Con los filtros vacíos se emite la consulta sin parámetros de filtro.

## 6.5. Crear un usuario

**Paso 1.** Ubique el formulario de creación y diligencie los campos obligatorios: documento, tipo de documento (CC, TI, CE, PP, RC o NIT), nombres, apellidos, fecha de nacimiento (fecha pasada), correo, contraseña (mínimo 8 caracteres) y rol.

**Paso 2.** Diligencie opcionalmente número de contacto, teléfono fijo, programa de formación, número de ficha (máximo 50 caracteres) o foto de perfil.

**Paso 3.** Pulse el botón de guardar.

**Resultado esperado:** se emite `POST /api/users` con exactamente los campos del contrato (los opcionales vacíos no viajan; `idRol` viaja como número). Con respuesta `201` se muestra el diálogo de éxito y la tabla se actualiza mostrando el usuario nuevo. Si la contraseña tiene menos de 8 caracteres, el formulario bloquea el envío localmente.

## 6.6. Editar un usuario

**Paso 1.** Pulse el nombre de un usuario en la tabla.

**Paso 2.** En el modal de detalle, pulse **Editar**.

**Paso 3.** Modifique únicamente el campo **Nombres** (deje los demás sin cambio, incluida la contraseña) y guarde.

**Resultado esperado:** se emite `PUT /api/users/{id}` cuyo cuerpo contiene SOLO el campo modificado (`{ "names": "..." }`); la contraseña vacía NO viaja. Con respuesta `200` se muestra el diálogo de éxito, el modal se cierra y la tabla refleja el cambio.

## 6.7. Eliminar un usuario

**Paso 1.** Pulse el botón de eliminar de una fila (o el botón de eliminar dentro del modal).

**Paso 2.** En el diálogo de confirmación, pulse **Cancelar**.

**Paso 3.** Repita la operación y esta vez confirme.

**Resultado esperado:** al cancelar NO se emite ninguna petición y la tabla no cambia. Al confirmar se emite `DELETE /api/users/{id}` y, con respuesta `204`, la fila desaparece de la tabla sin recargar la página y se muestra el diálogo de éxito.

## 6.8. Verificar el contrato de errores

Verifique que cada error del microservicio se traduce en un diálogo en español y que NINGUNO de estos errores cierra la sesión:

| Cómo provocarlo | Resultado esperado |
| --- | --- |
| Enviar el formulario de creación con un correo mal formado | `400`: el mensaje del campo aparece como indicador bajo el campo y un diálogo resume los errores de validación |
| Crear un usuario con un documento o correo ya existente | `409`: diálogo "Conflicto" que identifica el campo duplicado |
| Consumir un endpoint protegido con un rol distinto a administrador (p. ej. con curl) | `403`: en el módulo, diálogo "No tienes permisos suficientes para esta acción" |
| Editar un usuario eliminado en otra sesión (PUT con id inexistente) | `404`: diálogo "El recurso solicitado ya no existe" |
| Superar las 100 peticiones por minuto | `429`: diálogo "Demasiadas solicitudes. Intenta de nuevo en X segundos" (X = `retryAfterSeconds`); el módulo NO reintenta solo |
| Detener el microservicio y pulsar Buscar | Fallo de red: diálogo "El servicio no está disponible en este momento" y tabla en estado estable |

**Excepción — 401:** un token ausente, inválido o expirado produce el cierre de sesión global de Psychoway (comportamiento aceptado del cliente compartido; ver el [`README.md`](README.md)). Los errores de la tabla anterior conservan la sesión activa.

## 6.9. Auditar los endpoints consumidos

**Paso 1.** Repita los procedimientos 6.2 a 6.8 con la pestaña Network abierta y el filtro de peticiones activo para el dominio del microservicio.

**Paso 2.** Revise la lista completa de peticiones emitidas durante toda la sesión del módulo.

**Resultado esperado:** aparecen EXCLUSIVAMENTE `GET /actuator/health`, `GET /api/roles`, `GET/POST /api/users` y `PUT/DELETE /api/users/{id}`. En particular, NO aparece ninguna consulta `GET /api/users/{id}` (los datos de cada fila provienen del listado) ni ningún otro endpoint del microservicio.

# 7. PREGUNTAS FRECUENTES

### ¿El microservicio tiene pantalla de login?

No. El inicio de sesión se hace en Psychoway (Express), que emite el JWT; el microservicio únicamente lo valida porque ambos comparten `JWT_SECRET`.

### ¿Por qué la búsqueda no responde mientras escribo?

Por diseño: el microservicio limita las peticiones a 100 por minuto por IP, así que la búsqueda solo se ejecuta con el botón **Buscar**.

### ¿Por qué el estado de salud no se refresca solo?

Por la misma razón: no existe sondeo automático. La salud se consulta al entrar a la página o con el botón **Actualizar**.

### ¿Cuál es la diferencia entre Gestión y Gestión JPA?

**Gestión** administra los usuarios de Psychoway contra el backend Express. **Gestión JPA** administra los usuarios del microservicio mysqlwithjpa. Son módulos independientes; el contrato del microservicio usa nombres de campo en inglés y reglas propias (p. ej. contraseña mínima de 8 caracteres, tipo de documento con valores CC/TI/CE/PP/RC/NIT, `idRol` numérico).

### ¿Puedo usar el módulo en producción sin configurar nada?

No. En todo despliegue que no sea desarrollo debe definirse `REACT_APP_JPA_API_URL` en `Frontend/.env` con la URL pública del microservicio antes de construir.

# 8. SOLUCIÓN DE PROBLEMAS

### La sección de salud queda en rojo y la tabla muestra "servicio no disponible"

**Posible causa:** el microservicio no está en ejecución o la URL base es incorrecta.

**Solución:**
1. Verifique que el microservicio responde: `curl http://localhost:8080/actuator/health`.
2. Confirme el valor de `REACT_APP_JPA_API_URL` (o el default) en `Frontend/.env`.
3. Revise la consola del navegador por errores de CORS o de red.

### Al entrar al módulo la sesión se cierra sola

**Posible causa:** respuesta `401` del microservicio — los servicios no comparten `JWT_SECRET`, o el token expiró (dura 1 hora).

**Solución:**
1. Verifique que `JWT_SECRET` sea idéntico en el backend Express y en el microservicio.
2. Inicie sesión de nuevo para obtener un token nuevo.
3. Tenga en cuenta que este cierre global ante 401 es el comportamiento aceptado por diseño.

### Los selects de rol muestran "Sin roles disponibles"

**Posible causa:** falló la consulta del catálogo (`GET /api/roles`) o el catálogo no está sembrado.

**Solución:**
1. Revise en Network la respuesta de `GET /api/roles` (401/403/5xx o vacío).
2. Verifique la siembra de roles en la base del microservicio (1 Aprendiz, 2 Psicologo, 3 Administrador).
3. Vuelva a entrar a la página para reintentar la carga.

### Aparece "Demasiadas solicitudes" al operar el módulo

**Posible causa:** se superó el límite de 100 peticiones por minuto por IP, compartido entre todos los administradores de la misma red.

**Solución:**
1. Espere los segundos indicados en el diálogo (`retryAfterSeconds`).
2. Evite refrescar repetidamente; el módulo no reintenta automáticamente por diseño.

### El módulo carga, pero ninguna petición llega al microservicio

**Posible causa:** `REACT_APP_JPA_API_URL` apunta a un host incorrecto para el entorno (p. ej. `localhost` en un despliegue público).

**Solución:**
1. Corrija la variable en `Frontend/.env` con la URL real del microservicio.
2. Reconstruya o reinicie el frontend (las variables `REACT_APP_*` se leen en compilación).

# 9. REFERENCIAS

- [`API_REFERENCE.md`](../../API_REFERENCE.md) — referencia del contrato del microservicio mysqlwithjpa. **Advertencia: desactualizado en la serialización de respuestas (documenta camelCase; el wire real es snake_case), en el enum de `docType` (incluye un `PPT` que no existe) y en los límites de `fichaNumber`/tamaño de página.** El contrato real está en el [`README.md`](README.md).
- [`README.md`](README.md) — documento técnico de la integración: endpoints autorizados, contrato de serialización de respuestas, autenticación, contrato de errores y configuración.
- `openspec/changes/jpa-user-management/` — especificación, diseño y tareas del cambio que originó el módulo.
