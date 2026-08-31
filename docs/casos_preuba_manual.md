# 🧑🔬 Psychoway — Pruebas Manuales (QA)

> **Proyecto**: Psychoway — Plataforma de Apoyo Psicológico para Aprendices SENA
>
> **Stack**: React 19 + Express.js + PostgreSQL (Supabase)
>
> **Propósito**: Verificación visual, de UX e integraciones reales (Gemini, envío de correo, Supabase realtime) que no cubren los tests automatizados de [casos_de_prueba.md](./casos_de_prueba.md).
>
> **Versión**: 0.2.0
>
> **Fecha**: 2026-08-10
> **Formato de comparación**: versión en tablas. La versión lista está en [pruebas_manuales.md](./pruebas_manuales.md).

---

## Entorno requerido

| Recurso | Detalle |
| --- | --- |
| Navegador | Navegador moderno (Chrome, Firefox o Edge en su última versión). |
| Frontend (local) | `http://localhost:5173` (o el puerto configurado por Vite). |
| Frontend (despliegue) | URL del despliegue de producción/staging si aplica. |
| Backend | Corriendo en `http://localhost:3000` conectado a una instancia **real** de Supabase (no mocks). |
| Llaves externas | API Key de Gemini configurada para el Psychobot; servicio de correo (nodemailer/Supabase) activo para recuperación de contraseña. |
| Cuentas de prueba | Una cuenta activa por rol (ver tabla debajo). |

### Cuentas de prueba por rol

| Rol | Documento | Contraseña | Nombre |
| --- | --- | --- | --- |
| Aprendiz | `1034567890` | `Aprendiz2026!` | Laura Martínez García |
| Psicólogo | `1045678901` | `Psicologo2026!` | Dr. Andrés Rojas |
| Admin | `1056789012` | `Admin2026!` | Mónica Herrera |

### Limpieza y reseteo de datos de prueba

- Antes de ejecutar cada caso, asegurarse de que las cuentas usadas estén en un estado conocido (sin entradas de diario, sin citas u objetivos residuales).
- Para resetear: crear cuentas limpias de prueba en Supabase (o reutilizar las anteriores y eliminar los registros creados por el paso anterior de la prueba).
- Las entradas de diario, objetivos, citas, sesiones y notificaciones creadas durante la prueba deben eliminarse al terminar, o registrarse como "dato residual" en **Observaciones**.
- La contraseña de la cuenta de recuperación debe restablecerse después de cada prueba de recuperación.

### Registro de resultado

| Caso | Resultado (Pasa / No pasa) | Evidencia |
| --- | --- | --- |
| MAN-### | | |
| MAN-### | | |

> En **Evidencia** el tester registra capturas de pantalla, grabaciones o un breve detalle del comportamiento observado.

---

## Índice

1. Autenticación (Auth)
2. Diario de Emociones
3. Objetivos
4. Agenda de Citas
5. Psychobot (Chat IA)
6. Panel del Psicólogo
7. Panel de Administración
8. Notificaciones
9. Privacidad del Diario
10. Perfil de Usuario
11. Recuperación de Contraseña
12. Frontend — Visual y UX

---

## 1. Autenticación (Auth)

| Número | Nombre / Identificador | Descripción | Precondiciones | Entradas | Pasos | Resultados esperados | Pos condiciones | Estado | Observaciones | Prioridad | Referencia | Resultado | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAN-001 | Registro completo de un aprendiz en el navegador | Verificar el formulario de registro completo de un aprendiz, incluyendo validaciones en cliente, persistencia en Supabase y redirección al primer ingreso. | Backend y Supabase activos; la cuenta de prueba NO existe previamente. | CC `1034567890`, nombre "Laura Martínez García", correo `laura.martinez.qa@example.com`, contraseña `Aprendiz2026!`, fecha de nacimiento 2005-03-12 (mayor de 18). | 1. Abrir la URL del frontend en el navegador.<br>2. Click en "Registrarse" en la página de inicio.<br>3. Completar el formulario con los datos de entrada y enviar.<br>4. Verificar el mensaje de éxito y la redirección.<br>5. Revisar en Supabase que se creó el registro en la tabla de usuarios con rol `aprendiz`. | El usuario se crea, se muestra confirmación y el sistema inicia sesión o redirige a `/diario`. | Usuario `1034567890` activo en BD para el resto de pruebas (limpiar al finalizar la jornada de QA). | Pendiente | Cubre el flujo manual del registro; las validaciones de backend ya están automatizadas en AUTH-001 a AUTH-009. | Alta | — |  |  |
| MAN-002 | Inicio y cierre de sesión (login/logout) reales | Verificar login real con credenciales correctas e incorrectas, redirección por rol y cierre de sesión que limpia el token en el navegador. | Cuentas de prueba creadas para los tres roles; sin sesión previa en el navegador. | Aprendiz `1034567890` / `Aprendiz2026!`; contraseña incorrecta `00000`. | 1. Abrir el frontend y completar el login con `1034567890` y `Aprendiz2026!`.<br>2. Verificar la redirección a `/diario` y el mensaje de bienvenida.<br>3. Cerrar sesión desde el menú de usuario y confirmar la vuelta a `/`.<br>4. Recargar la página y verificar que no hay sesión activa.<br>5. Intentar el login con la contraseña incorrecta y observar el error. | Login exitoso redirige por rol (aprendiz → `/diario`); logout limpia `localStorage`/token y redirige a `/`; contraseña incorrecta muestra mensaje de error y no inicia sesión. | Sesión cerrada al finalizar. | Pendiente | Complementa los casos automatizados AUTH-011 a AUTH-026 y UI-006/UI-007. | Alta | — |  |  |

---

## 2. Diario de Emociones

| Número | Nombre / Identificador | Descripción | Precondiciones | Entradas | Pasos | Resultados esperados | Pos condiciones | Estado | Observaciones | Prioridad | Referencia | Resultado | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAN-003 | Seleccionar emoción resalta la opción | Al seleccionar una emoción en el diario, la opción se marca visualmente con resaltado. | Sesión de aprendiz iniciada. | Click en el emoji "Feliz". | 1. Abrir `/diario`.<br>2. Click en el emoji "Feliz".<br>3. Observar el estado visual de la opción seleccionada.<br>4. Click en otro emoji y repetir la observación. | La opción seleccionada se marca visualmente (borde/resaltado verde). | Sin cambios en BD. | Pendiente | Verificación puramente visual (estado CSS/DOM resaltado); movido desde UI-010. | Baja | UI-010 |  |  |

---

## 3. Objetivos

> Los casos de Objetivos son funcionales y se cubren por completo en la suite automatizada (OBJ-001 a OBJ-010). No hay casos manuales dedicados; la interacción se valida dentro del flujo completo del aprendiz (MAN-020).

---

## 4. Agenda de Citas

| Número | Nombre / Identificador | Descripción | Precondiciones | Entradas | Pasos | Resultados esperados | Pos condiciones | Estado | Observaciones | Prioridad | Referencia | Resultado | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAN-004 | Crear y cancelar cita como aprendiz y psicólogo | Verificar en el navegador el agendamiento de una cita por el aprendiz, su visibilidad para el psicólogo y la cancelación por ambos roles. | Sesiones de aprendiz y psicólogo disponibles; psicólogo con horarios configurados. | Fecha futura (hoy + 3 días), hora `10:30`, psicólogo `1045678901`. | 1. Iniciar sesión como aprendiz y abrir `/agenda`.<br>2. Seleccionar fecha y hora disponible y confirmar la cita.<br>3. Verificar la confirmación y que la cita aparece en "mis citas".<br>4. Cerrar sesión; iniciar como psicólogo y abrir su agenda.<br>5. Verificar que la cita del aprendiz aparece en el horario.<br>6. Cancelar la cita y confirmar que desaparece para ambos roles. | La cita se crea y persiste en Supabase (`meetings`), ambas cuentas la ven, y la cancelación la elimina y libera el horario. | Cita cancelada; se debe desmarcar test-data manualmente si queda un registro residual. | Pendiente | Complementa los casos automatizados MEET-001 a MEET-012. | Media | — |  |  |

---

## 5. Psychobot (Chat IA)

| Número | Nombre / Identificador | Descripción | Precondiciones | Entradas | Pasos | Resultados esperados | Pos condiciones | Estado | Observaciones | Prioridad | Referencia | Resultado | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAN-005 | Conversación real del Psychobot con Gemini | Verificar una conversación real del chat con la API de Gemini, incluyendo la persistencia de la sesión y el comportamiento ante desconexión de la API. | API Key de Gemini configurada; sesión de aprendiz iniciada; conexión a internet estable al inicio. | Pregunta real: "¿Cómo manejo el estrés antes de una evaluación?". | 1. Abrir `/psychobot` como aprendiz.<br>2. Enviar la pregunta y esperar la respuesta del bot.<br>3. Verificar que la respuesta llega con formato de chat y que la sesión se guarda en el historial lateral.<br>4. Recargar la página y confirmar que el historial conserva la conversación.<br>5. Desconectar la red (o detener el backend/Gemini) y enviar otro mensaje.<br>6. Observar el mensaje de error o degradación del servicio. | Gemini responde de forma coherente; la sesión persiste tras recargar; ante desconexión se muestra un mensaje amigable (ver MAN-010 para la imagen Snoopy). | Sesión de chat creada en BD; eliminar la sesión de prueba al finalizar. | Pendiente | La respuesta de Gemini no se puede automatizar de forma determinista; cubierta parcialmente por BOT-009 a BOT-014 y BOT-025. | Alta | — |  |  |
| MAN-006 | Indicador de escritura (typing dots) | Mientras el bot responde se muestran tres puntos animados en el chat. | Sesión de aprendiz iniciada; API de Gemini respondiendo. | Enviar un mensaje largo para observar el tiempo de espera. | 1. Abrir `/psychobot`.<br>2. Enviar un mensaje.<br>3. Observar el indicador de escritura mientras llega la respuesta. | Aparecen 3 puntos animados durante la espera y desaparecen al mostrar la respuesta. | Sin cambios en BD. | Pendiente | Verificación de animación; movido desde UI-016. | Baja | UI-016 |  |  |
| MAN-007 | Mapa corporal muestra modal con silueta | El "Mapa de emociones corporal" abre un modal interactivo con una silueta (SVG) que permite marcar zonas. | Sesión de aprendiz iniciada. | Click en "Mapa de emociones corporal". | 1. Abrir `/psychobot` y localizar el botón del mapa corporal.<br>2. Click en "Mapa de emociones corporal".<br>3. Interactuar con la silueta (seleccionar zonas del cuerpo).<br>4. Cerrar el modal y verificar que se puede reabrir. | Se abre un modal con un SVG de cuerpo humano interactivo y sensible al click. | Sin cambios en BD. | Pendiente | Verificación de render SVG interactivo; movido desde UI-020. | Baja | UI-020 |  |  |
| MAN-008 | Termómetro de ánimo envía resultado al chat | El widget Termómetro envía el nivel de ánimo seleccionado como mensaje del usuario en el chat. | Sesión de aprendiz iniciada. | Seleccionar nivel de ánimo = 7/10. | 1. Abrir el widget Termómetro desde `/psychobot`.<br>2. Seleccionar un nivel de ánimo (p. ej. 7).<br>3. Verificar el mensaje generado en el chat y la respuesta del bot. | Aparece el mensaje "Mi nivel de ánimo es 7/10" y el bot responde. | Sin cambios en BD. | Pendiente | Verificación del widget interactivo; movido desde UI-021. | Baja | UI-021 |  |  |
| MAN-009 | Grounding 5-4-3-2-1 guía paso a paso | El ejercicio de grounding guía al usuario en 5 pasos secuenciales (5-4-3-2-1). | Sesión de aprendiz iniciada. | Iniciar el ejercicio de grounding. | 1. Abrir el widget Grounding desde `/psychobot`.<br>2. Click en "Iniciar".<br>3. Completar los 5 pasos guiados (ver, tocar, oír, oler, sentir).<br>4. Verificar el flujo hasta el cierre del ejercicio. | Se muestran 5 pasos secuenciales con iconos y guía visual, y el ejercicio finaliza correctamente. | Sin cambios en BD. | Pendiente | Verificación de UX guiada paso a paso; movido desde UI-022. | Baja | UI-022 |  |  |
| MAN-010 | Desconexión de API Gemini muestra imagen Snoopy | Cuando el bot responde con el tag `SN00PY:SAD` (desconexión de Gemini) se renderiza la imagen de Snoopy triste. | La API de Gemini no responde (desconectar red o key inválida). | Enviar un mensaje al bot sin conexión de Gemini. | 1. Abrir `/psychobot` con la API de Gemini desconectada.<br>2. Enviar un mensaje.<br>3. Observar la respuesta renderizada en el chat. | Se muestra la imagen `sad_snoopy.png` junto con un mensaje amigable de desconexión. | Sin cambios en BD. | Pendiente | Verificación de render de imagen; movido desde UI-023. | Baja | UI-023 |  |  |

---

## 6. Panel del Psicólogo

| Número | Nombre / Identificador | Descripción | Precondiciones | Entradas | Pasos | Resultados esperados | Pos condiciones | Estado | Observaciones | Prioridad | Referencia | Resultado | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAN-011 | Alertas no leídas en banner rojo | En `/psi-seguimiento` las alertas de riesgo no leídas se muestran en un banner rojo con el conteo. | Existen alertas no leídas para el aprendiz de prueba (crear una con la marca `[ALERT]` en el chat o por BD). | Ir a `/psi-seguimiento` como psicólogo. | 1. Crear una alerta de riesgo para un aprendiz (vía chat con `[ALERT]` o directo en BD).<br>2. Iniciar sesión como psicólogo y abrir `/psi-seguimiento`.<br>3. Observar el banner de alertas. | Banner rojo con "Alertas de Riesgo (N)" donde N ≥ 1. | Contar la alerta como leída al finalizar la verificación. | Pendiente | Verificación visual del banner; movido desde UI-030. | Media | UI-030 |  |  |
| MAN-012 | Click en aprendiz carga su gráfico e historial | Al hacer click en una fila de aprendiz se cargan su gráfico (donut) e historial de emociones. | El aprendiz de prueba tiene entradas de diario registradas. | Click en la fila del aprendiz `1034567890`. | 1. Abrir `/psi-seguimiento` como psicólogo.<br>2. Click en la fila del aprendiz con datos.<br>3. Observar la carga del gráfico y del historial en el panel lateral. | Se cargan el donut chart con la distribución de emociones y el historial de la tabla. | Sin cambios en BD. | Pendiente | Verificación de visualización de datos del aprendiz; movido desde UI-029. | Media | UI-029 |  |  |
| MAN-013 | Panel del psicólogo con datos reales | Verificar el panel del psicólogo con datos reales de Supabase: lista de aprendices, promedios emocionales y estados de seguimiento. | Al menos dos aprendices con entradas de diario en la BD real. | Iniciar sesión como psicólogo y consultar `/psi-seguimiento`. | 1. Registrar varias entradas de diario como aprendiz de prueba (2-3 por día).<br>2. Iniciar sesión como psicólogo y abrir `/psi-seguimiento`.<br>3. Verificar la lista de aprendices con nombre, promedio emocional y última emoción.<br>4. Verificar las alertas de riesgo generadas por entradas críticas. | La información coincide con los datos reales de Supabase (promedios, última emoción, alertas). | Sin cambios en BD más allá de las entradas de la prueba. | Pendiente | Complementa los casos automatizados PSI-001 a PSI-010. | Media | — |  |  |

---

## 7. Panel de Administración

| Número | Nombre / Identificador | Descripción | Precondiciones | Entradas | Pasos | Resultados esperados | Pos condiciones | Estado | Observaciones | Prioridad | Referencia | Resultado | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAN-014 | CRUD de usuarios en el navegador | Verificar la creación, búsqueda, edición y eliminación de usuarios desde el panel de administración con datos reales. | Sesión de admin iniciada; un usuario de prueba existente para editar/eliminar. | Documento `1067890123`, nombre "Pedro Gómez", rol `aprendiz`, contraseña `Prueba2026!`. | 1. Iniciar sesión como admin y abrir `/gestion`.<br>2. Crear un usuario nuevo con los datos de entrada y confirmar.<br>3. Buscar el usuario por documento y verificar que aparece.<br>4. Editar el nombre/rol y guardar.<br>5. Eliminar el usuario con confirmación y verificar que desaparece. | El CRUD funciona en el navegador y los cambios persisten en Supabase tras recargar. | Usuario de prueba eliminado al finalizar. | Pendiente | Complementa los casos automatizados ADM-001 a ADM-004. | Alta | — |  |  |

---

## 8. Notificaciones

| Número | Nombre / Identificador | Descripción | Precondiciones | Entradas | Pasos | Resultados esperados | Pos condiciones | Estado | Observaciones | Prioridad | Referencia | Resultado | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAN-015 | Notificaciones en tiempo real | Verificar que las notificaciones llegan en tiempo real (check-in o nuevas entradas) sin recargar la página. | Sesión de aprendiz iniciada; backend con Supabase realtime habilitado. | Crear una notificación de check-in desde backend o BD mientras la sesión está abierta. | 1. Iniciar sesión como aprendiz y abrir el tablero.<br>2. En una pestaña del navegador usar la consola/BD para generar una notificación para el aprendiz.<br>3. Observar el panel de notificaciones sin recargar.<br>4. Marcar la notificación como leída y verificar la actualización. | La notificación aparece automáticamente (actualización en tiempo real) y al marcarla como leída se actualiza el estado. | Notificación marcada como leída. | Pendiente | Complementa los casos automatizados NOTIF-001 a NOTIF-008. | Media | — |  |  |

---

## 9. Privacidad del Diario

| Número | Nombre / Identificador | Descripción | Precondiciones | Entradas | Pasos | Resultados esperados | Pos condiciones | Estado | Observaciones | Prioridad | Referencia | Resultado | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAN-016 | Bloquear/desbloquear privacidad del diario en la UI | Verificar el bloqueo y desbloqueo de la privacidad del diario desde la interfaz (solo-yo vs. yo-psicólogo). | Sesión de aprendiz iniciada; al menos una entrada de diario creada. | Cambiar visibilidad a "Solo yo" y luego a "Yo + psicólogo". | 1. Iniciar sesión como aprendiz y abrir `/diario`.<br>2. Abrir la configuración de privacidad y marcar "Solo yo".<br>3. Guardar y verificar que el psicólogo ya no ve la entrada (revisar `/psi-seguimiento`).<br>4. Cambiar a "Yo + psicólogo" y repetir la verificación. | El cambio de visibilidad se guarda en Supabase y afecta la visibilidad real del psicólogo. | Dejar la privacidad en "Yo + psicólogo" al finalizar. | Pendiente | Complementa los casos automatizados PRIV-001 a PRIV-006. | Media | — |  |  |

---

## 10. Perfil de Usuario

> Los casos de Perfil son funcionales y se cubren por completo en la suite automatizada (PROF-001 a PROF-014). No hay casos manuales dedicados.

---

## 11. Recuperación de Contraseña

| Número | Nombre / Identificador | Descripción | Precondiciones | Entradas | Pasos | Resultados esperados | Pos condiciones | Estado | Observaciones | Prioridad | Referencia | Resultado | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAN-017 | Recuperación de contraseña real con envío de correo | Verificar el flujo completo de recuperación de contraseña con envío de correo real (nodemailer/Supabase) y restablecimiento mediante el enlace. | Cuenta de prueba con correo accesible por el tester; servicio de correo (nodemailer/Supabase) activo; la cuenta NO usa el correo de otro caso. | Correo `laura.martinez.qa@example.com`; nueva contraseña `Nueva2026!`. | 1. Abrir la página de login y click en "¿Olvidaste tu contraseña?".<br>2. Ingresar el correo de la cuenta de prueba y enviar la solicitud.<br>3. Verificar que llega el correo en la bandeja de entrada (revisar spam si no aparece).<br>4. Abrir el enlace del correo.<br>5. Establecer la nueva contraseña y confirmar.<br>6. Iniciar sesión con la nueva contraseña. | El correo llega con el enlace; el token permite restablecer la contraseña; el login funciona con la nueva contraseña y el token no puede reutilizarse. | Restablecer la contraseña de la cuenta a `Aprendiz2026!` al terminar para no romper el resto de pruebas. | Pendiente | Incluye integración real de correo; complementa los casos automatizados PASS-001 a PASS-009. | Alta | — |  |  |

---

## 12. Frontend — Visual y UX

| Número | Nombre / Identificador | Descripción | Precondiciones | Entradas | Pasos | Resultados esperados | Pos condiciones | Estado | Observaciones | Prioridad | Referencia | Resultado | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAN-018 | Donut chart muestra distribución de emociones | En el seguimiento del aprendiz se muestra un donut con la distribución de emociones y el porcentaje positivo en el centro. | El aprendiz de prueba tiene entradas de diario de varios tipos. | Ir a `/seguimiento` con al menos 5 entradas. | 1. Registrar 3-5 entradas con emociones distintas como aprendiz.<br>2. Abrir `/seguimiento`.<br>3. Observar el donut chart y su leyenda. | Donut chart con colores por emoción y % positivo en el centro coherente con los datos. | Sin cambios en BD. | Pendiente | Verificación de render de gráfica (canvas); movido desde UI-024. | Media | UI-024 |  |  |
| MAN-019 | Bar chart muestra objetivos por día | En el seguimiento del aprendiz se muestra un bar chart con objetivos cumplidos y no cumplidos por día. | El aprendiz de prueba tiene objetivos creados y algunos marcados como cumplidos. | Ir a `/seguimiento` con objetivos mixtos. | 1. Crear 2-3 objetivos y marcar al menos uno como "Cumplido".<br>2. Abrir `/seguimiento`.<br>3. Observar el bar chart. | Bar chart con valores de cumplidos/no cumplidos por día. | Sin cambios en BD. | Pendiente | Verificación de render de gráfica (canvas); movido desde UI-025. | Media | UI-025 |  |  |
| MAN-020 | Flujo completo del aprendiz: diario → objetivos → agenda | Verificar el recorrido completo del aprendiz a lo largo de la aplicación: registrar emoción, crear objetivo y agendar cita, en una sola sesión. | Cuenta de aprendiz recién creada y sin datos; backend y Supabase activos. | Emoción "Feliz"; objetivo "Hacer ejercicio 3 veces por semana"; cita con psicólogo mañana a las `10:00`. | 1. Iniciar sesión como aprendiz.<br>2. En `/diario`, registrar la emoción "Feliz" con una descripción breve.<br>3. Crear el objetivo y verificar que aparece en la lista.<br>4. Abrir `/seguimiento` y verificar que el gráfico refleja la nueva entrada y el objetivo.<br>5. Ir a `/agenda`, elegir psicólogo y agendar la cita.<br>6. Recargar la página y verificar que los tres elementos persisten. | El flujo completo funciona en el navegador y todos los datos persisten en Supabase tras recargar. | Limpiar la cita, el objetivo y la entrada de prueba al finalizar. | Pendiente | Caso E2E de integración entre módulos; complementa las suites automatizadas de DIARY, OBJ y MEET. | Alta | — |  |  |

---
## Resumen de Cobertura

| Módulo | Casos manuales (MAN) |
| --- | --- |
| Autenticación (Auth) | 2 |
| Diario de Emociones | 1 |
| Objetivos | 0 |
| Agenda de Citas | 1 |
| Psychobot (Chat IA) | 6 |
| Panel del Psicólogo | 3 |
| Panel de Administración | 1 |
| Notificaciones | 1 |
| Privacidad del Diario | 1 |
| Perfil de Usuario | 0 |
| Recuperación de Contraseña | 1 |
| Frontend — Visual y UX | 3 |
| **TOTAL** | **20** |