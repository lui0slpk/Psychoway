# 🧪 Psychoway — Casos de Prueba (Vitest)

> **Proyecto**: Psychoway — Plataforma de Apoyo Psicológico para Aprendices SENA
> 
> **Stack**: React 19 + Express.js + PostgreSQL (Supabase)
> 
> **Framework de testing**: Vitest
> 
> **Versión**: 0.2.0
> 
> **Fecha**: 2026-07-27
> 
> **Última revisión**: 2026-08-03

---

## Índice

1. Autenticación (Auth)
2. Gestión de Usuarios (Admin)
3. Diario de Emociones
4. Objetivos
5. Agenda de Citas
6. Psychobot (Chat IA)
7. Panel del Psicólogo
8. Panel de Administración
9. Notificaciones
10. Privacidad del Diario
11. Perfil de Usuario
12. Recuperación de Contraseña
13. Middleware y Seguridad
14. Frontend — Componentes y UI

---

## Convenciones

| Etiqueta | Significado |
| --- | --- |
| ✅ Feliz | Flujo normal esperado |
| ❌ Error | Validación de errores / edge cases |
| 🔒 Seguridad | Pruebas de autenticación y autorización |
| ⚙️ Integración | Pruebas de integración entre capas |
| 📱 UI | Pruebas de interfaz de usuario |

Cada caso se documenta con 11 campos: **Número**, **Nombre / Identificador**, **Descripción**, **Precondiciones**, **Entradas**, **Pasos**, **Resultados esperados**, **Pos condiciones**, **Estado**, **Observaciones** y **Prioridad**.

---

## 1. Autenticación (Auth)

### 1.1 Registro de Usuario

### AUTH-001 — Registrar aprendiz con datos válidos

- **Número**: AUTH-001
- **Nombre / Identificador**: Registrar aprendiz con datos válidos (CC, >=18 años)
- **Descripción**: Registrar un aprendiz con datos completos y válidos (documento CC y edad >= 18 años).
- **Precondiciones**: No existir usuario con el mismo documento/correo.
- **Entradas**: POST `/register` con `{ document, doc_type: "CC", names, last_names, birth_date (>=18), email, password }`
- **Pasos**:
  1. Enviar POST `/register` con los datos válidos.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `{ message: "Usuario registrado correctamente" }`
- **Pos condiciones**: Usuario creado en BD con id_rol=1 (aprendiz) y contraseña hasheada con bcrypt.
- **Estado**: Pendiente
- **Observaciones**: El endpoint de registro responde `200` (no 201) según `auth.controller.js`.
- **Prioridad**: Alta

### AUTH-002 — Registrar con TI y edad < 18

- **Número**: AUTH-002
- **Nombre / Identificador**: Registrar con TI y edad menor a 18
- **Descripción**: Registrar un usuario con Tarjeta de Identidad y edad menor a 18 años.
- **Precondiciones**: No existir usuario con el mismo documento/correo.
- **Entradas**: POST `/register` con `doc_type: "TI"`, `birth_date` (<18), document TI válido (8-10 dígitos).
- **Pasos**:
  1. Enviar POST `/register` con `doc_type="TI"` y `birth_date` de menor de edad.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → Registro exitoso.
- **Pos condiciones**: Usuario creado en BD con id_rol=1.
- **Estado**: Pendiente
- **Observaciones**: Precondición "Misma" del caso base AUTH-001 (no existir el usuario).
- **Prioridad**: Alta

### AUTH-003 — Registrar con documento ya existente

- **Número**: AUTH-003
- **Nombre / Identificador**: Registrar con documento duplicado
- **Descripción**: Intentar registrar un usuario cuyo documento ya existe en la BD.
- **Precondiciones**: Usuario ya registrado con ese documento.
- **Entradas**: POST `/register` con el mismo `document` de un usuario existente.
- **Pasos**:
  1. Registrar un usuario con documento X.
  2. Enviar POST `/register` con el mismo documento X.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `409` → `"El documento o correo ya se encuentra registrado"`
- **Pos condiciones**: No se crea ningún usuario nuevo; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: Catch de duplicados PostgreSQL `23505` devuelve 409.
- **Prioridad**: Alta

### AUTH-004 — Registrar con correo ya existente

- **Número**: AUTH-004
- **Nombre / Identificador**: Registrar con correo duplicado
- **Descripción**: Intentar registrar un usuario cuyo correo ya existe en la BD.
- **Precondiciones**: Usuario ya registrado con ese email.
- **Entradas**: POST `/register` con el mismo `email` de un usuario existente.
- **Pasos**:
  1. Registrar un usuario con correo Y.
  2. Enviar POST `/register` con el mismo correo Y.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `409` → `"El documento o correo ya se encuentra registrado"`
- **Pos condiciones**: No se crea ningún usuario nuevo; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: Catch de duplicados PostgreSQL `23505` devuelve 409.
- **Prioridad**: Alta

### AUTH-005 — Registrar con CC pero edad < 18

- **Número**: AUTH-005
- **Nombre / Identificador**: Registrar con CC y edad menor a 18
- **Descripción**: Intentar registrar con Cédula de Ciudadanía pero edad menor a 18 años.
- **Precondiciones**: No existir usuario con el mismo documento/correo.
- **Entradas**: POST `/register` con `doc_type="CC"`, `birth_date` (<18), document CC válido (6-10 dígitos).
- **Pasos**:
  1. Enviar POST `/register` con `doc_type="CC"` y `birth_date` de menor de edad.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"Con Cédula de Ciudadanía o Extranjería el usuario debe tener al menos 18 años."`
- **Pos condiciones**: No se crea el usuario; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: Mensaje literal de `validateAgeByDocType` en `users.service.js`.
- **Prioridad**: Media

### AUTH-006 — Registrar con CE pero edad < 18

- **Número**: AUTH-006
- **Nombre / Identificador**: Registrar con CE y edad menor a 18
- **Descripción**: Intentar registrar con Cédula de Extranjería pero edad menor a 18 años.
- **Precondiciones**: No existir usuario con el mismo documento/correo.
- **Entradas**: POST `/register` con `doc_type="CE"`, `birth_date` (<18), document CE válido (5-12 dígitos).
- **Pasos**:
  1. Enviar POST `/register` con `doc_type="CE"` y `birth_date` de menor de edad.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"Con Cédula de Ciudadanía o Extranjería el usuario debe tener al menos 18 años."`
- **Pos condiciones**: No se crea el usuario; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: CC y CE comparten el mismo mensaje de error de edad mínima.
- **Prioridad**: Media

### AUTH-007 — Registrar con TI pero edad >= 18

- **Número**: AUTH-007
- **Nombre / Identificador**: Registrar con TI y edad mayor o igual a 18
- **Descripción**: Intentar registrar con Tarjeta de Identidad pero edad mayor o igual a 18 años.
- **Precondiciones**: No existir usuario con el mismo documento/correo.
- **Entradas**: POST `/register` con `doc_type="TI"`, `birth_date` (>=18), document TI válido (8-10 dígitos).
- **Pasos**:
  1. Enviar POST `/register` con `doc_type="TI"` y `birth_date` de mayor de edad.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"Con Tarjeta de Identidad el usuario debe ser menor de 18 años."`
- **Pos condiciones**: No se crea el usuario; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: Mensaje literal de `validateAgeByDocType` en `users.service.js`.
- **Prioridad**: Media

### AUTH-008 — Registrar sin campos obligatorios

- **Número**: AUTH-008
- **Nombre / Identificador**: Registrar sin campos obligatorios
- **Descripción**: Intentar registrar sin enviar campos obligatorios del formulario.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/register` con body vacío `{}`.
- **Pasos**:
  1. Enviar POST `/register` con body vacío.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → error de validación de campos.
- **Pos condiciones**: No se crea el usuario; la BD no se modifica.
- **Observaciones**: Con body vacío, la primera validación en `auth.service.js` es `doc_type` → `"Tipo de documento inválido: undefined"`.
- **Prioridad**: Media

### AUTH-009 — Registrar con password débil (< 5 chars)

- **Número**: AUTH-009
- **Nombre / Identificador**: Registrar con contraseña débil
- **Descripción**: Intentar registrar con una contraseña de menos de 5 caracteres.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/register` con `password="1234"`.
- **Pasos**:
  1. Enviar POST `/register` con `password="1234"`.
  2. Esperar la respuesta o validación.
- **Resultados esperados**: `400` (validación de longitud).
- **Pos condiciones**: No se crea el usuario si la validación lo impide.
- **Estado**: Pendiente
- **Observaciones**: El backend no valida longitud de contraseña; la validación aplica en el frontend del formulario de registro.
- **Prioridad**: Media

### AUTH-010 — Validaciones en cliente del formulario de registro

- **Número**: AUTH-010
- **Nombre / Identificador**: Validaciones en cliente del formulario de registro
- **Descripción**: El formulario de registro valida en cliente (ej. documento numérico).
- **Precondiciones**: Abrir `/registro`.
- **Entradas**: Campo documento con caracteres no numéricos (letras).
- **Pasos**:
  1. Abrir la página `/registro`.
  2. Escribir letras en el campo documento.
  3. Observar el comportamiento del input.
- **Resultados esperados**: El input rechaza caracteres no numéricos (pattern `\d+`).
- **Pos condiciones**: No se envía el formulario al servidor.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: componente del formulario de Registro.
- **Prioridad**: Baja

### 1.2 Inicio de Sesión

### AUTH-011 — Login exitoso con credenciales correctas

- **Número**: AUTH-011
- **Nombre / Identificador**: Login exitoso con credenciales correctas
- **Descripción**: Iniciar sesión con documento y contraseña correctos.
- **Precondiciones**: Usuario registrado.
- **Entradas**: POST `/login` con `document` + `password` correctos.
- **Pasos**:
  1. Enviar POST `/login` con credenciales correctas.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `{ message: "Login exitoso", token, user }`
- **Pos condiciones**: Sesión iniciada; token JWT emitido y asociado al usuario.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### AUTH-012 — Login retorna token JWT válido

- **Número**: AUTH-012
- **Nombre / Identificador**: Login retorna token JWT válido
- **Descripción**: Verificar que el login emite un token JWT con los claims esperados.
- **Precondiciones**: Usuario registrado.
- **Entradas**: POST `/login` → extraer `token` de la respuesta.
- **Pasos**:
  1. Enviar POST `/login` y capturar el token.
  2. Decodificar/verificar el token.
  3. Validar claims y expiración.
- **Resultados esperados**: El token contiene `userId`, `role`, `document` y expira en 8h.
- **Pos condiciones**: Token JWT válido emitido.
- **Estado**: Pendiente
- **Observaciones**: Expiración definida por `JWT_EXPIRES_IN`.
- **Prioridad**: Alta

### AUTH-013 — Login retorna datos de usuario correctos

- **Número**: AUTH-013
- **Nombre / Identificador**: Login retorna datos de usuario correctos
- **Descripción**: Verificar que el login retorna el objeto `user` con los datos completos.
- **Precondiciones**: Usuario registrado.
- **Entradas**: POST `/login` con credenciales correctas.
- **Pasos**:
  1. Enviar POST `/login`.
  2. Inspeccionar el objeto `user` de la respuesta.
- **Resultados esperados**: `user` contiene `id`, `id_user`, `document`, `names`, `last_names`, `id_rol`, `rol`, `profile_photo`.
- **Pos condiciones**: Sesión iniciada con los datos del usuario.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### AUTH-014 — Login con documento inexistente

- **Número**: AUTH-014
- **Nombre / Identificador**: Login con documento inexistente
- **Descripción**: Intentar iniciar sesión con un documento no registrado.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/login` con `document` no registrado y cualquier password.
- **Pasos**:
  1. Enviar POST `/login` con un documento inexistente.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"Documento o contraseña incorrectos"`
- **Pos condiciones**: No se emite token; la sesión no se inicia.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### AUTH-015 — Login con contraseña incorrecta

- **Número**: AUTH-015
- **Nombre / Identificador**: Login con contraseña incorrecta
- **Descripción**: Intentar iniciar sesión con contraseña errónea para un documento existente.
- **Precondiciones**: Usuario registrado.
- **Entradas**: POST `/login` con `document` correcto + `password` erróneo.
- **Pasos**:
  1. Enviar POST `/login` con documento correcto y password incorrecto.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"Documento o contraseña incorrectos"`
- **Pos condiciones**: No se emite token; la sesión no se inicia.
- **Estado**: Pendiente
- **Observaciones**: El mensaje es intencionalmente genérico para no revelar qué dato falló.
- **Prioridad**: Alta

### AUTH-016 — Login con body vacío

- **Número**: AUTH-016
- **Nombre / Identificador**: Login con body vacío
- **Descripción**: Intentar iniciar sesión sin enviar documento ni contraseña.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/login` sin `document` ni `password`.
- **Pasos**:
  1. Enviar POST `/login` con body vacío.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → error de validación del servidor.
- **Pos condiciones**: No se emite token; la sesión no se inicia.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### AUTH-017 — Login sin enviar password

- **Número**: AUTH-017
- **Nombre / Identificador**: Login sin enviar password
- **Descripción**: Intentar iniciar sesión enviando solo el documento.
- **Precondiciones**: Usuario registrado.
- **Entradas**: POST `/login` solo con `document`.
- **Pasos**:
  1. Enviar POST `/login` con `document` y sin `password`.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400`
- **Pos condiciones**: No se emite token; la sesión no se inicia.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### 1.3 Verificación de Sesión

### AUTH-018 — Verificar token JWT válido

- **Número**: AUTH-018
- **Nombre / Identificador**: Verificar token JWT válido
- **Descripción**: Verificar la sesión con un token JWT válido.
- **Precondiciones**: Token válido en header.
- **Entradas**: GET `/api/auth/verify` con `Authorization: Bearer {token}`.
- **Pasos**:
  1. Enviar GET `/api/auth/verify` con token válido.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `{ valid: true, userId, role }`
- **Pos condiciones**: Sesión verificada como válida.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### AUTH-019 — Verificar sin token

- **Número**: AUTH-019
- **Nombre / Identificador**: Verificar sin token
- **Descripción**: Verificar la sesión sin enviar header de autorización.
- **Precondiciones**: Ninguna.
- **Entradas**: GET `/api/auth/verify` sin header `Authorization`.
- **Pasos**:
  1. Enviar GET `/api/auth/verify` sin header de autorización.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `401` → `"Token no proporcionado. Inicie sesión."`
- **Pos condiciones**: La sesión no se verifica.
- **Estado**: Pendiente
- **Observaciones**: Mensaje literal de `auth.middleware.js`.
- **Prioridad**: Alta

### AUTH-020 — Verificar con token inválido

- **Número**: AUTH-020
- **Nombre / Identificador**: Verificar con token inválido
- **Descripción**: Verificar la sesión con un token malformado o inválido.
- **Precondiciones**: Token malformado.
- **Entradas**: GET `/api/auth/verify` con header `Bearer invalidtoken`.
- **Pasos**:
  1. Enviar GET `/api/auth/verify` con token inválido.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `401` → `"Token inválido. Inicie sesión nuevamente."`
- **Pos condiciones**: La sesión no se verifica.
- **Estado**: Pendiente
- **Observaciones**: Mensaje literal de `auth.middleware.js`.
- **Prioridad**: Alta

### AUTH-021 — Verificar con token expirado

- **Número**: AUTH-021
- **Nombre / Identificador**: Verificar con token expirado
- **Descripción**: Verificar la sesión con un token vencido.
- **Precondiciones**: Token vencido (más de 8h).
- **Entradas**: GET `/api/auth/verify` con token expirado.
- **Pasos**:
  1. Enviar GET `/api/auth/verify` con token expirado.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `401` → `"Sesión expirada. Inicie sesión nuevamente."`
- **Pos condiciones**: La sesión no se verifica.
- **Estado**: Pendiente
- **Observaciones**: Mensaje literal de `auth.middleware.js`.
- **Prioridad**: Alta

### AUTH-022 — AuthContext verifica token al cargar app

- **Número**: AUTH-022
- **Nombre / Identificador**: AuthContext verifica token al cargar app
- **Descripción**: Al recargar la aplicación, AuthContext verifica el token guardado en localStorage.
- **Precondiciones**: Token guardado en `localStorage`.
- **Entradas**: Recargar la página.
- **Pasos**:
  1. Guardar token y user en localStorage.
  2. Recargar la página.
  3. Observar la restauración de sesión.
- **Resultados esperados**: Si el token es válido → restaura sesión; si no → limpia y redirige.
- **Pos condiciones**: Sesión restaurada o limpiada según validez del token.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: `AuthContext`.
- **Prioridad**: Alta

### 1.4 Redirección por Rol

### AUTH-023 — Login como aprendiz redirige a `/diario`

- **Número**: AUTH-023
- **Nombre / Identificador**: Redirección de aprendiz a `/diario`
- **Descripción**: Tras un login exitoso, el aprendiz es redirigido a `/diario`.
- **Precondiciones**: Usuario con rol aprendiz.
- **Entradas**: POST `/login` exitoso con credenciales de aprendiz.
- **Pasos**:
  1. Iniciar sesión como aprendiz.
  2. Observar la navegación del frontend.
- **Resultados esperados**: El frontend navega a `/diario`.
- **Pos condiciones**: Sesión iniciada y redirigida por rol.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: `ProtectedRoute` + `AuthContext`.
- **Prioridad**: Alta

### AUTH-024 — Login como psicólogo redirige a `/psi-seguimiento`

- **Número**: AUTH-024
- **Nombre / Identificador**: Redirección de psicólogo a `/psi-seguimiento`
- **Descripción**: Tras un login exitoso, el psicólogo es redirigido a `/psi-seguimiento`.
- **Precondiciones**: Usuario con rol psicólogo.
- **Entradas**: POST `/login` exitoso con credenciales de psicólogo.
- **Pasos**:
  1. Iniciar sesión como psicólogo.
  2. Observar la navegación del frontend.
- **Resultados esperados**: El frontend navega a `/psi-seguimiento`.
- **Pos condiciones**: Sesión iniciada y redirigida por rol.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### AUTH-025 — Login como admin redirige a `/gestion`

- **Número**: AUTH-025
- **Nombre / Identificador**: Redirección de admin a `/gestion`
- **Descripción**: Tras un login exitoso, el administrador es redirigido a `/gestion`.
- **Precondiciones**: Usuario con rol administrador.
- **Entradas**: POST `/login` exitoso con credenciales de administrador.
- **Pasos**:
  1. Iniciar sesión como administrador.
  2. Observar la navegación del frontend.
- **Resultados esperados**: El frontend navega a `/gestion`.
- **Pos condiciones**: Sesión iniciada y redirigida por rol.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### AUTH-026 — Logout limpia token y redirige a `/`

- **Número**: AUTH-026
- **Nombre / Identificador**: Logout limpia token y redirige
- **Descripción**: Al cerrar sesión se limpia el token y el usuario vuelve al home.
- **Precondiciones**: Sesión activa.
- **Entradas**: Cerrar sesión desde la UI.
- **Pasos**:
  1. Estando autenticado, ejecutar logout.
  2. Observar el estado de localStorage y la redirección.
- **Resultados esperados**: `localStorage` se limpia y el usuario va al home.
- **Pos condiciones**: Sesión cerrada; sin token en localStorage.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### 1.5 Validaciones de Formato en Registro

### AUTH-027 — Registrar con email inválido

- **Número**: AUTH-027
- **Nombre / Identificador**: Registrar con correo electrónico inválido
- **Descripción**: Intentar registrar con un correo que no cumple el formato básico.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/register` con `email: "correo-invalido"` (sin `@` ni dominio).
- **Pasos**:
  1. Enviar POST `/register` con email sin formato válido.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"El correo no es válido"`
- **Pos condiciones**: No se crea el usuario; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: Validación `isValidEmail` en `validators.js`.
- **Prioridad**: Media

### AUTH-028 — Registrar con documento inválido

- **Número**: AUTH-028
- **Nombre / Identificador**: Registrar con documento inválido para el tipo
- **Descripción**: Intentar registrar con un documento cuyo formato no coincide con el `doc_type`.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/register` con `doc_type: "TI"`, `document: "123"` (no cumple 8-10 dígitos).
- **Pasos**:
  1. Enviar POST `/register` con documento no acorde al tipo.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"El documento no es válido para el tipo indicado"`
- **Pos condiciones**: No se crea el usuario; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: Reglas `isValidDocument`: TI 8-10 dígitos, CC 6-10, CE 5-12, PA alfanumérico 6-9.
- **Prioridad**: Media

### AUTH-029 — Registrar con doc_type no permitido

- **Número**: AUTH-029
- **Nombre / Identificador**: Registrar con tipo de documento no permitido
- **Descripción**: Intentar registrar con un `doc_type` fuera del dominio TI/CC/CE/PA.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/register` con `doc_type: "XYZ"`.
- **Pasos**:
  1. Enviar POST `/register` con `doc_type="XYZ"`.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"Tipo de documento inválido: XYZ"`
- **Pos condiciones**: No se crea el usuario; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: `DOC_TYPES = ["TI","CC","CE","PA"]` en `validators.js`.
- **Prioridad**: Media

### AUTH-030 — Email normalizado a minúsculas

- **Número**: AUTH-030
- **Nombre / Identificador**: Email normalizado a minúsculas y sin espacios
- **Descripción**: Verificar que el email se normaliza (trim + minúsculas) al registrar.
- **Precondiciones**: No existir usuario con ese email.
- **Entradas**: POST `/register` con `email: "  USUARIO@Example.COM  "`.
- **Pasos**:
  1. Enviar POST `/register` con email en mayúsculas y con espacios.
  2. Consultar el usuario creado.
- **Resultados esperados**: `200` → registro exitoso; el email guardado es `usuario@example.com`.
- **Pos condiciones**: Usuario creado con email normalizado.
- **Estado**: Pendiente
- **Observaciones**: `normalizeEmail` aplica `trim().toLowerCase()`.
- **Prioridad**: Media

---
## 2. Gestión de Usuarios (Admin)

### 2.1 Crear Usuario (Admin)

### USER-001 — Admin crea aprendiz

- **Número**: USER-001
- **Nombre / Identificador**: Admin crea aprendiz
- **Descripción**: Un administrador crea un usuario con rol aprendiz.
- **Precondiciones**: Sesión de administrador + token JWT válido.
- **Entradas**: POST `/api/users/create` con `Authorization: Bearer {token admin}` y body `{ documento, tipoDocumento, nombres, apellidos, fechaNacimiento, correo, password, rol: "aprendiz" }`.
- **Pasos**:
  1. Autenticarse como administrador.
  2. Enviar POST `/api/users/create` con rol `aprendiz`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `201` → `{ message: "Usuario creado exitosamente", userId }`
- **Pos condiciones**: Usuario creado en BD con el `id_rol` de aprendiz.
- **Estado**: Pendiente
- **Observaciones**: Ruta protegida por `requireAdmin`.
- **Prioridad**: Alta

### USER-002 — Admin crea psicólogo

- **Número**: USER-002
- **Nombre / Identificador**: Admin crea psicólogo
- **Descripción**: Un administrador crea un usuario con rol psicólogo.
- **Precondiciones**: Sesión de administrador + token JWT válido.
- **Entradas**: POST `/api/users/create` con `rol: "psicologo"`.
- **Pasos**:
  1. Autenticarse como administrador.
  2. Enviar POST `/api/users/create` con rol `psicologo`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `201` → `{ message: "Usuario creado exitosamente", userId }`
- **Pos condiciones**: Usuario creado en BD con el `id_rol` de psicólogo.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### USER-003 — Admin crea administrador

- **Número**: USER-003
- **Nombre / Identificador**: Admin crea administrador
- **Descripción**: Un administrador crea un usuario con rol administrador.
- **Precondiciones**: Sesión de administrador + token JWT válido.
- **Entradas**: POST `/api/users/create` con `rol: "administrador"`.
- **Pasos**:
  1. Autenticarse como administrador.
  2. Enviar POST `/api/users/create` con rol `administrador`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `201` → `{ message: "Usuario creado exitosamente", userId }`
- **Pos condiciones**: Usuario creado en BD con el `id_rol` de administrador.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### USER-004 — Crear usuario sin campos obligatorios

- **Número**: USER-004
- **Nombre / Identificador**: Crear usuario sin campos obligatorios
- **Descripción**: Intentar crear un usuario sin documento, nombres, correo o password.
- **Precondiciones**: Sesión de administrador + token JWT válido.
- **Entradas**: POST `/api/users/create` sin documento, nombres, apellidos, correo o password.
- **Pasos**:
  1. Autenticarse como administrador.
  2. Enviar POST `/api/users/create` con campos faltantes.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"Todos los campos son obligatorios"`
- **Pos condiciones**: No se crea el usuario; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: Mensaje literal de `users.service.js create()`.
- **Prioridad**: Media

### USER-005 — Crear usuario duplicado

- **Número**: USER-005
- **Nombre / Identificador**: Crear usuario duplicado
- **Descripción**: Intentar crear un usuario cuyo documento o correo ya existe.
- **Precondiciones**: Ya existe un usuario con ese documento o correo + sesión admin.
- **Entradas**: POST `/api/users/create` con documento/correo ya registrados.
- **Pasos**:
  1. Autenticarse como administrador.
  2. Enviar POST `/api/users/create` con datos duplicados.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `409` → `"El documento o correo ya existe"`
- **Pos condiciones**: No se crea el usuario; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: Pre-check de unicidad (`existsByDocumentOrEmail`) + catch `23505` devuelven 409.
- **Prioridad**: Alta

### 2.2 Buscar Usuario

### USER-006 — Buscar usuario por documento existente

- **Número**: USER-006
- **Nombre / Identificador**: Buscar usuario por documento existente
- **Descripción**: Buscar un usuario existente por su documento.
- **Precondiciones**: Usuario existe + usuario autenticado con rol administrador o psicólogo.
- **Entradas**: GET `/api/users/search/{document}` con `Authorization: Bearer {token}`.
- **Pasos**:
  1. Autenticarse como admin o psicólogo.
  2. Enviar GET `/api/users/search/{document}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → datos del usuario con rol.
- **Pos condiciones**: Se retorna el perfil del usuario consultado.
- **Estado**: Pendiente
- **Observaciones**: Ruta protegida por `requireRole("administrador", "psicologo")`.
- **Prioridad**: Alta

### USER-007 — Buscar usuario por documento inexistente

- **Número**: USER-007
- **Nombre / Identificador**: Buscar usuario por documento inexistente
- **Descripción**: Buscar un documento que no está registrado.
- **Precondiciones**: Usuario autenticado con rol administrador o psicólogo.
- **Entradas**: GET `/api/users/search/{documento_inexistente}`.
- **Pasos**:
  1. Autenticarse como admin o psicólogo.
  2. Enviar GET `/api/users/search/{documento_inexistente}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `404` → `"Usuario no encontrado"`
- **Pos condiciones**: No se retorna ningún dato.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### 2.3 Actualizar Usuario

### USER-008 — Actualizar datos de usuario

- **Número**: USER-008
- **Nombre / Identificador**: Actualizar datos de usuario
- **Descripción**: Actualizar los datos de un usuario existente.
- **Precondiciones**: Usuario existe + sesión de administrador.
- **Entradas**: PUT `/api/users/update/{id}` con nuevos `nombres`.
- **Pasos**:
  1. Autenticarse como administrador.
  2. Enviar PUT `/api/users/update/{id}` con nuevos nombres.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `"Usuario actualizado correctamente"`
- **Pos condiciones**: Los datos del usuario quedan actualizados en BD.
- **Estado**: Pendiente
- **Observaciones**: Ruta protegida por `requireAdmin`.
- **Prioridad**: Alta

### USER-009 — Actualizar con cambio de contraseña

- **Número**: USER-009
- **Nombre / Identificador**: Actualizar con cambio de contraseña
- **Descripción**: Actualizar un usuario incluyendo una nueva contraseña.
- **Precondiciones**: Usuario existe + sesión de administrador.
- **Entradas**: PUT `/api/users/update/{id}` con `password` nuevo.
- **Pasos**:
  1. Autenticarse como administrador.
  2. Enviar PUT con `password` nuevo.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → la contraseña se hashea con bcrypt.
- **Pos condiciones**: Password actualizado (hasheado) en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### USER-010 — Actualizar sin cambiar password

- **Número**: USER-010
- **Nombre / Identificador**: Actualizar sin cambiar password
- **Descripción**: Actualizar un usuario sin enviar el campo password.
- **Precondiciones**: Usuario existe + sesión de administrador.
- **Entradas**: PUT `/api/users/update/{id}` sin campo `password`.
- **Pasos**:
  1. Autenticarse como administrador.
  2. Enviar PUT sin el campo password.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → la contraseña no se modifica.
- **Pos condiciones**: El resto de campos se actualiza; el password permanece intacto.
- **Estado**: Pendiente
- **Observaciones**: Usa `updateWithoutPassword` cuando no hay password.
- **Prioridad**: Alta

### USER-011 — Actualizar usuario inexistente

- **Número**: USER-011
- **Nombre / Identificador**: Actualizar usuario inexistente
- **Descripción**: Intentar actualizar un id que no existe en BD.
- **Precondiciones**: Sesión de administrador + id inexistente.
- **Entradas**: PUT `/api/users/update/{id_inexistente}` con datos válidos.
- **Pasos**:
  1. Autenticarse como administrador.
  2. Enviar PUT `/api/users/update/{id_inexistente}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `404` → `"Usuario no encontrado"`
- **Pos condiciones**: La BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### USER-012 — Actualizar con documento duplicado

- **Número**: USER-012
- **Nombre / Identificador**: Actualizar con documento duplicado
- **Descripción**: Intentar asignar a un usuario un documento que ya usa otro usuario.
- **Precondiciones**: Otro usuario ya tiene ese documento + sesión admin.
- **Entradas**: PUT `/api/users/update/{id}` con documento ya ocupado.
- **Pasos**:
  1. Autenticarse como administrador.
  2. Enviar PUT con un documento ocupado por otro usuario.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `409` → `"El documento o correo ya existe"`
- **Pos condiciones**: La BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: Unicidad verificada excluyendo al propio usuario.
- **Prioridad**: Alta

### 2.4 Eliminar Usuario

### USER-013 — Eliminar usuario sin dependencias

- **Número**: USER-013
- **Nombre / Identificador**: Eliminar usuario sin dependencias
- **Descripción**: Eliminar un usuario que no tiene registros asociados.
- **Precondiciones**: Usuario sin registros asociados + sesión admin.
- **Entradas**: DELETE `/api/users/delete/{id}`.
- **Pasos**:
  1. Autenticarse como administrador.
  2. Enviar DELETE `/api/users/delete/{id}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `"Usuario eliminado correctamente"`
- **Pos condiciones**: Usuario eliminado de la BD.
- **Estado**: Pendiente
- **Observaciones**: Ruta protegida por `requireAdmin`.
- **Prioridad**: Alta

### USER-014 — Eliminar usuario con registros asociados

- **Número**: USER-014
- **Nombre / Identificador**: Eliminar usuario con registros asociados
- **Descripción**: Intentar eliminar un usuario que tiene diary/meetings/objetivos.
- **Precondiciones**: Usuario tiene registros asociados + sesión admin.
- **Entradas**: DELETE `/api/users/delete/{id}` de un usuario con dependencias.
- **Pasos**:
  1. Autenticarse como administrador.
  2. Enviar DELETE `/api/users/delete/{id}` sobre un usuario con dependencias.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"No se puede eliminar: El usuario tiene registros asociados."`
- **Pos condiciones**: El usuario no se elimina; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: Mensaje literal por catch de FK `23503`.
- **Prioridad**: Media

### USER-015 — Eliminar usuario inexistente

- **Número**: USER-015
- **Nombre / Identificador**: Eliminar usuario inexistente
- **Descripción**: Intentar eliminar un id que no existe en BD.
- **Precondiciones**: Sesión admin + id inexistente.
- **Entradas**: DELETE `/api/users/delete/{id_inexistente}`.
- **Pasos**:
  1. Autenticarse como administrador.
  2. Enviar DELETE `/api/users/delete/{id_inexistente}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `404` → `"Usuario no encontrado"`
- **Pos condiciones**: La BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### 2.5 Obtener Psicólogos

### USER-016 — Listar psicólogos disponibles

- **Número**: USER-016
- **Nombre / Identificador**: Listar psicólogos disponibles
- **Descripción**: Obtener la lista de usuarios con rol psicólogo.
- **Precondiciones**: Existen usuarios con rol psicólogo.
- **Entradas**: GET `/api/psychologists`.
- **Pasos**:
  1. Enviar GET `/api/psychologists`.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → array de psicólogos.
- **Pos condiciones**: Se retornan los psicólogos registrados.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### USER-017 — Lista vacía si no hay psicólogos

- **Número**: USER-017
- **Nombre / Identificador**: Lista vacía si no hay psicólogos
- **Descripción**: Obtener la lista de psicólogos cuando no hay ninguno registrado.
- **Precondiciones**: No hay psicólogos registrados.
- **Entradas**: GET `/api/psychologists`.
- **Pasos**:
  1. Enviar GET `/api/psychologists`.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `[]`
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### 2.6 Autorización por Rol

### USER-018 — Crear usuario sin rol admin

- **Número**: USER-018
- **Nombre / Identificador**: Crear usuario sin rol administrador
- **Descripción**: Intentar crear un usuario estando autenticado sin rol administrador.
- **Precondiciones**: Usuario autenticado con rol aprendiz o psicólogo.
- **Entradas**: POST `/api/users/create` con `Authorization: Bearer {token aprendiz}`.
- **Pasos**:
  1. Iniciar sesión como aprendiz.
  2. Enviar POST `/api/users/create`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `403` → `"No tienes permisos para realizar esta acción."`
- **Pos condiciones**: No se crea ningún usuario; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: `requireAdmin` en `users.routes.js`.
- **Prioridad**: Alta

### USER-019 — Actualizar usuario sin rol admin

- **Número**: USER-019
- **Nombre / Identificador**: Actualizar usuario sin rol administrador
- **Descripción**: Intentar actualizar un usuario estando autenticado sin rol administrador.
- **Precondiciones**: Usuario autenticado con rol aprendiz o psicólogo.
- **Entradas**: PUT `/api/users/update/{id}` con `Authorization: Bearer {token aprendiz}`.
- **Pasos**:
  1. Iniciar sesión como aprendiz.
  2. Enviar PUT `/api/users/update/{id}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `403` → `"No tienes permisos para realizar esta acción."`
- **Pos condiciones**: La BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: `requireAdmin` en `users.routes.js`.
- **Prioridad**: Alta

### USER-020 — Eliminar usuario sin rol admin

- **Número**: USER-020
- **Nombre / Identificador**: Eliminar usuario sin rol administrador
- **Descripción**: Intentar eliminar un usuario estando autenticado sin rol administrador.
- **Precondiciones**: Usuario autenticado con rol aprendiz o psicólogo.
- **Entradas**: DELETE `/api/users/delete/{id}` con `Authorization: Bearer {token aprendiz}`.
- **Pasos**:
  1. Iniciar sesión como aprendiz.
  2. Enviar DELETE `/api/users/delete/{id}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `403` → `"No tienes permisos para realizar esta acción."`
- **Pos condiciones**: La BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: `requireAdmin` en `users.routes.js`.
- **Prioridad**: Alta

### USER-021 — Buscar usuario sin rol admin/psicólogo

- **Número**: USER-021
- **Nombre / Identificador**: Buscar usuario sin rol admin o psicólogo
- **Descripción**: Intentar buscar un usuario por documento siendo aprendiz.
- **Precondiciones**: Usuario autenticado con rol aprendiz.
- **Entradas**: GET `/api/users/search/{document}` con `Authorization: Bearer {token aprendiz}`.
- **Pasos**:
  1. Iniciar sesión como aprendiz.
  2. Enviar GET `/api/users/search/{document}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `403` → `"No tienes permisos para realizar esta acción."`
- **Pos condiciones**: No se retorna información del usuario consultado.
- **Estado**: Pendiente
- **Observaciones**: `requireRole("administrador", "psicologo")` en `users.routes.js`.
- **Prioridad**: Alta

---

## 3. Diario de Emociones

### 3.1 Crear Entrada

### DIARY-001 — Registrar entrada con emoción y descripción

- **Número**: DIARY-001
- **Nombre / Identificador**: Registrar entrada con emoción y descripción
- **Descripción**: Registrar una entrada de diario con emoción y descripción.
- **Precondiciones**: Usuario autenticado; el diario puede no existir aún.
- **Entradas**: POST `/api/diary/entry` con `{ userId, emotionIndex, description }`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar POST `/api/diary/entry` con userId, emotionIndex y description.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `{ message: "Entrada de diario registrada correctamente", entryId }`
- **Pos condiciones**: Entrada guardada en `diary_entries`; se crea `diary` si no existía.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### DIARY-002 — Registrar entrada sin descripción (opcional)

- **Número**: DIARY-002
- **Nombre / Identificador**: Registrar entrada sin descripción
- **Descripción**: Registrar una entrada solo con userId y emoción, sin descripción.
- **Precondiciones**: Usuario autenticado.
- **Entradas**: POST `/api/diary/entry` con `userId` + `emotionIndex`, sin `description`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar POST `/api/diary/entry` sin description.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → entrada creada.
- **Pos condiciones**: Entrada guardada en `diary_entries`.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### DIARY-003 — Mapeo emotionIndex 0 → Muy Feliz

- **Número**: DIARY-003
- **Nombre / Identificador**: Mapeo emotionIndex 0 → Muy Feliz
- **Descripción**: Verificar que `emotionIndex=0` mapea a la emoción "Muy Feliz" (Positivo).
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/diary/entry` con `emotionIndex=0`.
- **Pasos**:
  1. Enviar POST con `emotionIndex=0`.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: Se crea/usa la emoción "Muy Feliz".
- **Pos condiciones**: Entrada vinculada a la emoción "Muy Feliz".
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### DIARY-004 — Mapeo emotionIndex 1 → Feliz

- **Número**: DIARY-004
- **Nombre / Identificador**: Mapeo emotionIndex 1 → Feliz
- **Descripción**: Verificar que `emotionIndex=1` mapea a la emoción "Feliz" (Positivo).
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/diary/entry` con `emotionIndex=1`.
- **Pasos**:
  1. Enviar POST con `emotionIndex=1`.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: Se crea/usa la emoción "Feliz".
- **Pos condiciones**: Entrada vinculada a la emoción "Feliz".
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### DIARY-005 — Mapeo emotionIndex 2 → Neutral

- **Número**: DIARY-005
- **Nombre / Identificador**: Mapeo emotionIndex 2 → Neutral
- **Descripción**: Verificar que `emotionIndex=2` mapea a la emoción "Neutral".
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/diary/entry` con `emotionIndex=2`.
- **Pasos**:
  1. Enviar POST con `emotionIndex=2`.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: Se crea/usa la emoción "Neutral".
- **Pos condiciones**: Entrada vinculada a la emoción "Neutral".
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### DIARY-006 — Mapeo emotionIndex 3 → Triste

- **Número**: DIARY-006
- **Nombre / Identificador**: Mapeo emotionIndex 3 → Triste
- **Descripción**: Verificar que `emotionIndex=3` mapea a la emoción "Triste" (Negativo).
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/diary/entry` con `emotionIndex=3`.
- **Pasos**:
  1. Enviar POST con `emotionIndex=3`.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: Se crea/usa la emoción "Triste".
- **Pos condiciones**: Entrada vinculada a la emoción "Triste".
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### DIARY-007 — Mapeo emotionIndex 4 → Muy Triste

- **Número**: DIARY-007
- **Nombre / Identificador**: Mapeo emotionIndex 4 → Muy Triste
- **Descripción**: Verificar que `emotionIndex=4` mapea a la emoción "Muy Triste" (Negativo).
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/diary/entry` con `emotionIndex=4`.
- **Pasos**:
  1. Enviar POST con `emotionIndex=4`.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: Se crea/usa la emoción "Muy Triste".
- **Pos condiciones**: Entrada vinculada a la emoción "Muy Triste".
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### DIARY-008 — Índice de emoción inválido cae a Neutral

- **Número**: DIARY-008
- **Nombre / Identificador**: Índice de emoción inválido cae a Neutral
- **Descripción**: Verificar que un `emotionIndex` fuera de rango cae a "Neutral".
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/diary/entry` con `emotionIndex=99`.
- **Pasos**:
  1. Enviar POST con `emotionIndex=99`.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: Se usa la emoción por defecto "Neutral".
- **Pos condiciones**: Entrada vinculada a la emoción "Neutral".
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### DIARY-009 — Crear entrada crea diario automáticamente

- **Número**: DIARY-009
- **Nombre / Identificador**: Crear entrada crea diario automáticamente
- **Descripción**: Verificar que al crear una entrada sin diario previo se crea el diario.
- **Precondiciones**: Usuario sin diario previo.
- **Entradas**: POST `/api/diary/entry` con userId, emotionIndex, description.
- **Pasos**:
  1. Autenticarse como usuario sin diario.
  2. Enviar POST `/api/diary/entry`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: Se crea `diary` + `entry`.
- **Pos condiciones**: Diario y entrada creados en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### DIARY-010 — Crear entrada sin userId

- **Número**: DIARY-010
- **Nombre / Identificador**: Crear entrada sin userId
- **Descripción**: Intentar crear una entrada sin enviar `userId`.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/diary/entry` sin `userId`.
- **Pasos**:
  1. Enviar POST `/api/diary/entry` sin userId.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"userId y emotionIndex son requeridos"`
- **Pos condiciones**: No se crea entrada; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### DIARY-011 — Crear entrada sin emotionIndex

- **Número**: DIARY-011
- **Nombre / Identificador**: Crear entrada sin emotionIndex
- **Descripción**: Intentar crear una entrada sin enviar `emotionIndex`.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/diary/entry` sin `emotionIndex`.
- **Pasos**:
  1. Enviar POST `/api/diary/entry` sin emotionIndex.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"userId y emotionIndex son requeridos"`
- **Pos condiciones**: No se crea entrada; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### 3.2 Obtener Entradas

### DIARY-012 — Obtener entradas de usuario con registros

- **Número**: DIARY-012
- **Nombre / Identificador**: Obtener entradas de usuario con registros
- **Descripción**: Obtener las entradas de un usuario que tiene registros.
- **Precondiciones**: Usuario tiene entradas.
- **Entradas**: GET `/api/diary/entries/{userId}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar GET `/api/diary/entries/{userId}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → array de entradas con `emot_name`, `emot_estado`, `description`, `entry_date`.
- **Pos condiciones**: Se retornan las entradas del usuario.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### DIARY-013 — Obtener entradas de usuario sin registros

- **Número**: DIARY-013
- **Nombre / Identificador**: Obtener entradas de usuario sin registros
- **Descripción**: Obtener entradas de un usuario sin registros.
- **Precondiciones**: Usuario sin entradas.
- **Entradas**: GET `/api/diary/entries/{userId}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar GET `/api/diary/entries/{userId}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `[]`
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### DIARY-014 — Obtener entradas de userId inexistente

- **Número**: DIARY-014
- **Nombre / Identificador**: Obtener entradas de userId inexistente
- **Descripción**: Obtener entradas de un id de usuario que no existe.
- **Precondiciones**: Ninguna.
- **Entradas**: GET `/api/diary/entries/{id_inexistente}`.
- **Pasos**:
  1. Enviar GET `/api/diary/entries/{id_inexistente}`.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `[]` (comportamiento consistente: sin datos, sin fallo).
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### DIARY-015 — Índice no numérico o negativo cae a Neutral

- **Número**: DIARY-015
- **Nombre / Identificador**: Índice no numérico o negativo cae a Neutral
- **Descripción**: Verificar que `emotionIndex` no numérico o negativo cae a "Neutral".
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/diary/entry` con `emotionIndex="abc"` o `-1`.
- **Pasos**:
  1. Enviar POST con emotionIndex no numérico o negativo.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: Se usa la emoción por defecto "Neutral".
- **Pos condiciones**: Entrada vinculada a la emoción "Neutral".
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

---
## 4. Objetivos

### 4.1 Crear Objetivo

### OBJ-001 — Crear objetivo con datos completos

- **Número**: OBJ-001
- **Nombre / Identificador**: Crear objetivo con datos completos
- **Descripción**: Crear un objetivo con todos los campos.
- **Precondiciones**: Usuario autenticado.
- **Entradas**: POST `/api/objectives` con `{ userId, nombre, descripcion, estado }`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar POST `/api/objectives` con datos completos.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `{ message: "Objetivo creado correctamente", objectiveId }`
- **Pos condiciones**: Objetivo guardado en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### OBJ-002 — Crear objetivo sin nombre

- **Número**: OBJ-002
- **Nombre / Identificador**: Crear objetivo sin nombre
- **Descripción**: Intentar crear un objetivo sin enviar el nombre.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/objectives` sin `nombre`.
- **Pasos**:
  1. Enviar POST `/api/objectives` sin nombre.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"userId y nombre son requeridos"`
- **Pos condiciones**: No se crea el objetivo; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### OBJ-003 — Crear objetivo sin userId

- **Número**: OBJ-003
- **Nombre / Identificador**: Crear objetivo sin userId
- **Descripción**: Intentar crear un objetivo sin enviar el userId.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/objectives` sin `userId`.
- **Pasos**:
  1. Enviar POST `/api/objectives` sin userId.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"userId y nombre son requeridos"`
- **Pos condiciones**: No se crea el objetivo; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### 4.2 Obtener Objetivos

### OBJ-004 — Obtener objetivos de usuario con registros

- **Número**: OBJ-004
- **Nombre / Identificador**: Obtener objetivos de usuario con registros
- **Descripción**: Obtener los objetivos de un usuario con registros.
- **Precondiciones**: Usuario tiene objetivos.
- **Entradas**: GET `/api/objectives/{userId}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar GET `/api/objectives/{userId}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → array de objetivos.
- **Pos condiciones**: Se retornan los objetivos del usuario.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### OBJ-005 — Obtener objetivos de usuario sin registros

- **Número**: OBJ-005
- **Nombre / Identificador**: Obtener objetivos de usuario sin registros
- **Descripción**: Obtener objetivos de un usuario sin registros.
- **Precondiciones**: Usuario sin objetivos.
- **Entradas**: GET `/api/objectives/{userId}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar GET `/api/objectives/{userId}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `[]`
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### 4.3 Actualizar Objetivo

### OBJ-006 — Actualizar nombre, descripción y estado

- **Número**: OBJ-006
- **Nombre / Identificador**: Actualizar nombre, descripción y estado
- **Descripción**: Actualizar los campos de un objetivo existente.
- **Precondiciones**: Objetivo existe.
- **Entradas**: PUT `/api/objectives/{id}` con `{ nombre, descripcion, estado }`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar PUT `/api/objectives/{id}` con los nuevos valores.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `"Objetivo actualizado correctamente"`
- **Pos condiciones**: Objetivo actualizado en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### OBJ-007 — Cambiar estado a Cumplido

- **Número**: OBJ-007
- **Nombre / Identificador**: Cambiar estado a Cumplido
- **Descripción**: Cambiar el estado de un objetivo de "No Cumplido" a "Cumplido".
- **Precondiciones**: Objetivo existe.
- **Entradas**: PUT `/api/objectives/{id}` con `estado="Cumplido"`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar PUT con `estado="Cumplido"`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `"Objetivo actualizado correctamente"`
- **Pos condiciones**: Estado del objetivo actualizado en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### OBJ-008 — Actualizar objetivo inexistente

- **Número**: OBJ-008
- **Nombre / Identificador**: Actualizar objetivo inexistente
- **Descripción**: Intentar actualizar un objetivo que no existe.
- **Precondiciones**: Ninguna.
- **Entradas**: PUT `/api/objectives/{id_inexistente}`.
- **Pasos**:
  1. Enviar PUT `/api/objectives/{id_inexistente}`.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `404` → `"Objetivo no encontrado"`
- **Pos condiciones**: La BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### 4.4 Eliminar Objetivo

### OBJ-009 — Eliminar objetivo existente

- **Número**: OBJ-009
- **Nombre / Identificador**: Eliminar objetivo existente
- **Descripción**: Eliminar un objetivo existente.
- **Precondiciones**: Objetivo existe.
- **Entradas**: DELETE `/api/objectives/{id}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar DELETE `/api/objectives/{id}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `"Objetivo eliminado correctamente"`
- **Pos condiciones**: Objetivo eliminado de la BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### OBJ-010 — Eliminar objetivo inexistente

- **Número**: OBJ-010
- **Nombre / Identificador**: Eliminar objetivo inexistente
- **Descripción**: Intentar eliminar un objetivo que no existe.
- **Precondiciones**: Ninguna.
- **Entradas**: DELETE `/api/objectives/{id_inexistente}`.
- **Pasos**:
  1. Enviar DELETE `/api/objectives/{id_inexistente}`.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `404` → `"Objetivo no encontrado"`
- **Pos condiciones**: La BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

---

## 5. Agenda de Citas

### 5.1 Crear Cita

### MEET-001 — Agendar cita en horario disponible

- **Número**: MEET-001
- **Nombre / Identificador**: Agendar cita en horario disponible
- **Descripción**: Agendar una cita con un psicólogo en un horario libre y fecha futura.
- **Precondiciones**: Psicólogo existe, horario libre, fecha futura.
- **Entradas**: POST `/api/meetings` con `{ userId, professionalId, day (futuro), hour, description }`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar POST `/api/meetings` con datos válidos.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `{ message: "Cita agendada exitosamente", id }`
- **Pos condiciones**: Cita guardada en BD y vinculada al profesional.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### MEET-002 — Agendar cita en fecha pasada

- **Número**: MEET-002
- **Nombre / Identificador**: Agendar cita en fecha pasada
- **Descripción**: Intentar agendar una cita en un día/hora anterior a la fecha actual.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/meetings` con `day`/`hour` anterior a `now`.
- **Pasos**:
  1. Enviar POST con día u hora pasados.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"No puedes agendar una cita en una fecha u hora que ya pasó"`
- **Pos condiciones**: No se crea la cita; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### MEET-003 — Agendar cita en horario ya ocupado

- **Número**: MEET-003
- **Nombre / Identificador**: Agendar cita en horario ocupado
- **Descripción**: Intentar agendar una cita en un horario ya tomado por ese profesional.
- **Precondiciones**: Ese profesional ya tiene una cita en ese día/hora.
- **Entradas**: POST `/api/meetings` con el mismo `professionalId` + `day` + `hour`.
- **Pasos**:
  1. Crear una cita para un profesional en un día/hora.
  2. Enviar POST con el mismo profesional, día y hora.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `409` → `"Ese horario ya está ocupado para este profesional"`
- **Pos condiciones**: No se crea la cita duplicada; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### MEET-004 — Agendar cita sin campos requeridos

- **Número**: MEET-004
- **Nombre / Identificador**: Agendar cita sin campos requeridos
- **Descripción**: Intentar agendar una cita sin userId, professionalId, day u hour.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/meetings` sin `userId`, `professionalId`, `day` u `hour`.
- **Pasos**:
  1. Enviar POST `/api/meetings` con campos faltantes.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"Todos los campos son requeridos"`
- **Pos condiciones**: No se crea la cita; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### MEET-005 — Agendar cita hoy con hora futura

- **Número**: MEET-005
- **Nombre / Identificador**: Agendar cita hoy con hora futura
- **Descripción**: Agendar una cita para hoy pero en una hora aún futura.
- **Precondiciones**: Hora actual < hora de la cita.
- **Entradas**: POST `/api/meetings` con `day=today`, `hour` > hora actual.
- **Pasos**:
  1. Enviar POST con `day=today` y hora posterior a la actual.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → cita creada exitosamente.
- **Pos condiciones**: Cita guardada en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### 5.2 Obtener Citas por Psicólogo

### MEET-006 — Obtener slots ocupados de un psicólogo

- **Número**: MEET-006
- **Nombre / Identificador**: Obtener slots ocupados de un psicólogo
- **Descripción**: Obtener los horarios ocupados de un psicólogo.
- **Precondiciones**: Psicólogo tiene citas.
- **Entradas**: GET `/api/meetings/psychologist/{id}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar GET `/api/meetings/psychologist/{id}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → array con `day`, `hour`.
- **Pos condiciones**: Se retornan los slots ocupados.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### MEET-007 — Psicólogo sin citas retorna array vacío

- **Número**: MEET-007
- **Nombre / Identificador**: Psicólogo sin citas retorna array vacío
- **Descripción**: Obtener los slots de un psicólogo sin citas.
- **Precondiciones**: Psicólogo sin citas.
- **Entradas**: GET `/api/meetings/psychologist/{id}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar GET `/api/meetings/psychologist/{id}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `[]`
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### 5.3 Obtener Citas por Usuario

### MEET-008 — Obtener historial de citas de aprendiz

- **Número**: MEET-008
- **Nombre / Identificador**: Obtener historial de citas de aprendiz
- **Descripción**: Obtener el historial de citas de un aprendiz.
- **Precondiciones**: Usuario tiene citas.
- **Entradas**: GET `/api/meetings/user/{id}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar GET `/api/meetings/user/{id}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → array con `day`, `hour`, `descripcion`, `prof_names`, `prof_last_names`.
- **Pos condiciones**: Se retornan las citas del usuario.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### MEET-009 — Usuario sin citas retorna array vacío

- **Número**: MEET-009
- **Nombre / Identificador**: Usuario sin citas retorna array vacío
- **Descripción**: Obtener el historial de citas de un usuario sin citas.
- **Precondiciones**: Usuario sin citas.
- **Entradas**: GET `/api/meetings/user/{id}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar GET `/api/meetings/user/{id}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `[]`
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### 5.4 Frontend — Agenda

### MEET-010 — Horas disponibles excluyen slots ocupados

- **Número**: MEET-010
- **Nombre / Identificador**: Horas disponibles excluyen slots ocupados
- **Descripción**: La agenda no muestra horarios ya ocupados por el psicólogo.
- **Precondiciones**: Psicólogo tiene una cita a las 10:00.
- **Entradas**: Seleccionar psicólogo + fecha en la agenda.
- **Pasos**:
  1. Abrir la agenda.
  2. Seleccionar un psicólogo con cita a las 10:00 y una fecha.
  3. Observar la tabla de horarios.
- **Resultados esperados**: La tabla de horarios no muestra 10:00.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: componente Agenda.
- **Prioridad**: Baja

### MEET-011 — Horas disponibles filtran horas pasadas si es hoy

- **Número**: MEET-011
- **Nombre / Identificador**: Horas disponibles filtran horas pasadas si es hoy
- **Descripción**: Si la fecha seleccionada es hoy, se ocultan las horas ya pasadas.
- **Precondiciones**: Hoy, hora actual 10:30.
- **Entradas**: Seleccionar fecha = hoy en la agenda.
- **Pasos**:
  1. Abrir la agenda.
  2. Seleccionar la fecha de hoy (hora actual 10:30).
  3. Observar la tabla de horarios.
- **Resultados esperados**: Las horas antes de 10:30 no aparecen.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Baja

### MEET-012 — No se muestran horarios sin psicólogo o fecha

- **Número**: MEET-012
- **Nombre / Identificador**: No se muestran horarios sin psicólogo o fecha
- **Descripción**: El panel de agenda muestra un mensaje si no hay psicólogo o fecha seleccionados.
- **Precondiciones**: Ninguna.
- **Entradas**: Abrir el panel sin seleccionar psicólogo ni fecha.
- **Pasos**:
  1. Abrir la agenda.
  2. No seleccionar psicólogo ni fecha.
  3. Observar el panel.
- **Resultados esperados**: Mensaje "Selecciona psicólogo y fecha".
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Baja

---

## 6. Psychobot (Chat IA)

### 6.1 Sesiones

### BOT-001 — Obtener sesiones de un usuario

- **Número**: BOT-001
- **Nombre / Identificador**: Obtener sesiones de un usuario
- **Descripción**: Obtener las sesiones de chat de un usuario.
- **Precondiciones**: Usuario tiene sesiones.
- **Entradas**: GET `/api/psychobot/sessions/{userId}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar GET `/api/psychobot/sessions/{userId}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → array de sesiones con `id_session`, `title`.
- **Pos condiciones**: Se retornan las sesiones del usuario.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### BOT-002 — Usuario sin sesiones retorna vacío

- **Número**: BOT-002
- **Nombre / Identificador**: Usuario sin sesiones retorna vacío
- **Descripción**: Obtener sesiones de un usuario sin sesiones de chat.
- **Precondiciones**: Ninguna.
- **Entradas**: GET `/api/psychobot/sessions/{userId}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar GET `/api/psychobot/sessions/{userId}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `[]`
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### BOT-003 — Crear nueva sesión

- **Número**: BOT-003
- **Nombre / Identificador**: Crear nueva sesión
- **Descripción**: Crear una nueva sesión de chat.
- **Precondiciones**: Usuario autenticado.
- **Entradas**: POST `/api/psychobot/sessions` con `{ userId, title }`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar POST `/api/psychobot/sessions`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `201` → `{ id_session, title }`
- **Pos condiciones**: Sesión creada en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### BOT-004 — Eliminar sesión existente

- **Número**: BOT-004
- **Nombre / Identificador**: Eliminar sesión existente
- **Descripción**: Eliminar una sesión de chat existente.
- **Precondiciones**: Sesión existe.
- **Entradas**: DELETE `/api/psychobot/sessions/{id}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar DELETE `/api/psychobot/sessions/{id}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `{ message: "Sesión eliminada" }`
- **Pos condiciones**: Sesión eliminada de la BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### BOT-005 — Eliminar sesión inexistente

- **Número**: BOT-005
- **Nombre / Identificador**: Eliminar sesión inexistente
- **Descripción**: Intentar eliminar una sesión que no existe.
- **Precondiciones**: Ninguna.
- **Entradas**: DELETE `/api/psychobot/sessions/{id_inexistente}`.
- **Pasos**:
  1. Enviar DELETE `/api/psychobot/sessions/{id_inexistente}`.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `404` → `"Sesión no encontrada"`
- **Pos condiciones**: La BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### 6.2 Chat

### BOT-006 — Enviar mensaje y recibir respuesta del bot

- **Número**: BOT-006
- **Nombre / Identificador**: Enviar mensaje y recibir respuesta del bot
- **Descripción**: Enviar un mensaje y recibir respuesta del bot.
- **Precondiciones**: Usuario autenticado.
- **Entradas**: POST `/api/psychobot/chat` con `{ userId, message }`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar POST `/api/psychobot/chat`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `{ type: "bot", text, id_session }`
- **Pos condiciones**: Respuesta del bot registrada en la sesión.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### BOT-007 — Chat crea sesión automáticamente si no existe

- **Número**: BOT-007
- **Nombre / Identificador**: Chat crea sesión automáticamente si no existe
- **Descripción**: Si no hay sesión activa, el chat crea una nueva sesión.
- **Precondiciones**: Sin sesión activa.
- **Entradas**: POST `/api/psychobot/chat` sin `id_session`.
- **Pasos**:
  1. Autenticarse sin sesiones previas.
  2. Enviar POST chat sin id_session.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: Retorna `id_session` nueva.
- **Pos condiciones**: Sesión creada y asociada al usuario.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### BOT-008 — Chat retoma sesión existente más reciente

- **Número**: BOT-008
- **Nombre / Identificador**: Chat retoma sesión existente más reciente
- **Descripción**: Si hay una sesión activa previa, el chat la retoma.
- **Precondiciones**: Sesión activa previa.
- **Entradas**: POST `/api/psychobot/chat` sin `id_session`.
- **Pasos**:
  1. Autenticarse con una sesión previa.
  2. Enviar POST chat sin id_session.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: Usa la latest session.
- **Pos condiciones**: Mensaje registrado en la sesión existente.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### BOT-009 — Respuesta del bot con Gemini configurado

- **Número**: BOT-009
- **Nombre / Identificador**: Respuesta del bot con Gemini configurado
- **Descripción**: El bot responde con texto generado por Gemini cuando la API está configurada.
- **Precondiciones**: `GEMINI_API_KEY` configurada.
- **Entradas**: POST `/api/psychobot/chat`.
- **Pasos**:
  1. Configurar la API key de Gemini.
  2. Enviar POST chat.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `text` con respuesta de IA.
- **Pos condiciones**: Respuesta del bot generada.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### BOT-010 — Sin API Key retorna mensaje graceful

- **Número**: BOT-010
- **Nombre / Identificador**: Sin API Key retorna mensaje graceful
- **Descripción**: Si no hay API key configurada, el bot responde un mensaje amigable.
- **Precondiciones**: `GEMINI_API_KEY = "API_KEY_AQUI"` (placeholder).
- **Entradas**: POST `/api/psychobot/chat`.
- **Pasos**:
  1. Dejar la API key en placeholder.
  2. Enviar POST chat.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `"Configuración de IA pendiente."`
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### BOT-011 — Enviar mensaje sin userId

- **Número**: BOT-011
- **Nombre / Identificador**: Enviar mensaje sin userId
- **Descripción**: Intentar enviar un mensaje sin userId.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/psychobot/chat` sin `userId`.
- **Pasos**:
  1. Enviar POST chat sin userId.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"userId y message son requeridos"`
- **Pos condiciones**: No se envía mensaje; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### BOT-012 — Enviar mensaje vacío

- **Número**: BOT-012
- **Nombre / Identificador**: Enviar mensaje vacío
- **Descripción**: Intentar enviar un mensaje sin contenido.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/psychobot/chat` sin `message`.
- **Pasos**:
  1. Enviar POST chat sin message.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"userId y message son requeridos"`
- **Pos condiciones**: No se envía mensaje; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### BOT-013 — Error 429 de Gemini → mensaje amigable

- **Número**: BOT-013
- **Nombre / Identificador**: Error 429 de Gemini → mensaje amigable
- **Descripción**: Si Gemini responde 429, se muestra un mensaje de límite alcanzado.
- **Precondiciones**: La API responde 429.
- **Entradas**: POST `/api/psychobot/chat`.
- **Pasos**:
  1. Simular respuesta 429 de Gemini.
  2. Enviar POST chat.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: Retorna texto con mensaje de límite alcanzado.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### BOT-014 — Error 503 de Gemini → mensaje de reintento

- **Número**: BOT-014
- **Nombre / Identificador**: Error 503 de Gemini → mensaje de reintento
- **Descripción**: Si Gemini responde 503, se sugiere reintentar.
- **Precondiciones**: La API responde 503.
- **Entradas**: POST `/api/psychobot/chat`.
- **Pasos**:
  1. Simular respuesta 503 de Gemini.
  2. Enviar POST chat.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: Retorna texto con sugerencia de reintento.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### BOT-025 — Error genérico de Gemini → mensaje amigable

- **Número**: BOT-025
- **Nombre / Identificador**: Error genérico de Gemini → mensaje amigable
- **Descripción**: Si Gemini responde otro error (500, etc.), se muestra un mensaje amigable.
- **Precondiciones**: La API responde 500 u otro error no 503/429.
- **Entradas**: POST `/api/psychobot/chat`.
- **Pasos**:
  1. Simular respuesta 500 de Gemini.
  2. Enviar POST chat.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `"Estoy teniendo dificultades técnicas 😔. Por favor, intenta de nuevo en unos minutos."`
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### 6.3 Tags Especiales del Bot

### BOT-015 — Tag [LEARN] guarda memoria del usuario

- **Número**: BOT-015
- **Nombre / Identificador**: Tag `[LEARN: "..."]` guarda memoria del usuario
- **Descripción**: Verificar que el tag `[LEARN]` guarda memoria del usuario.
- **Precondiciones**: Gemini responde con tag.
- **Entradas**: POST `/api/psychobot/chat`.
- **Pasos**:
  1. Hacer que Gemini responda con el tag `[LEARN]`.
  2. Enviar POST chat.
  3. Verificar la memoria guardada y la respuesta visible.
- **Resultados esperados**: Memoria guardada en BD; el tag se elimina de la respuesta visible.
- **Pos condiciones**: Memoria del usuario persistida.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### BOT-016 — Tag [DIARY] crea entrada de diario

- **Número**: BOT-016
- **Nombre / Identificador**: Tag `[DIARY: {...}]` crea entrada de diario
- **Descripción**: Verificar que el tag `[DIARY]` crea una entrada de diario.
- **Precondiciones**: Gemini responde con tag.
- **Entradas**: POST `/api/psychobot/chat` con response conteniendo `[DIARY:{"emotion_name":"Feliz","description":"test"}]`.
- **Pasos**:
  1. Hacer que Gemini responda con el tag `[DIARY]`.
  2. Enviar POST chat.
  3. Verificar la entrada creada y la respuesta visible.
- **Resultados esperados**: Entrada de diario creada; el tag se elimina.
- **Pos condiciones**: Entrada guardada en `diary_entries`.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### BOT-017 — Tag [ALERT] crea alerta de riesgo

- **Número**: BOT-017
- **Nombre / Identificador**: Tag `[ALERT: {...}]` crea alerta de riesgo
- **Descripción**: Verificar que el tag `[ALERT]` crea una alerta de riesgo.
- **Precondiciones**: Gemini responde con tag.
- **Entradas**: POST `/api/psychobot/chat` con response conteniendo `[ALERT]`.
- **Pasos**:
  1. Hacer que Gemini responda con el tag `[ALERT]`.
  2. Enviar POST chat.
  3. Verificar la alerta creada.
- **Resultados esperados**: Alerta creada en BD.
- **Pos condiciones**: Alerta de riesgo persistida.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### BOT-018 — Widget [WIDGET:THERMOMETER] → modal termómetro

- **Número**: BOT-018
- **Nombre / Identificador**: Widget `[WIDGET:THERMOMETER]` → modal termómetro
- **Descripción**: El frontend muestra un modal de termómetro cuando la respuesta incluye el widget.
- **Precondiciones**: La respuesta del bot incluye el widget.
- **Entradas**: Enviar mensaje → recibir response con `[WIDGET:THERMOMETER]`.
- **Pasos**:
  1. Enviar un mensaje al bot.
  2. Recibir respuesta con el widget.
  3. Observar el frontend.
- **Resultados esperados**: El frontend muestra el modal Thermometer.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: componente Thermometer.
- **Prioridad**: Baja

### BOT-019 — Widget [WIDGET:GROUNDING] → ejercicio grounding

- **Número**: BOT-019
- **Nombre / Identificador**: Widget `[WIDGET:GROUNDING]` → ejercicio grounding
- **Descripción**: El frontend muestra el ejercicio grounding cuando la respuesta incluye el widget.
- **Precondiciones**: La respuesta del bot incluye el widget.
- **Entradas**: Enviar mensaje → recibir response con `[WIDGET:GROUNDING]`.
- **Pasos**:
  1. Enviar un mensaje al bot.
  2. Recibir respuesta con el widget.
  3. Observar el frontend.
- **Resultados esperados**: El frontend muestra GroundingWidget.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: componente GroundingWidget.
- **Prioridad**: Baja

### BOT-020 — Widget [WIDGET:CHALLENGE] → reto express

- **Número**: BOT-020
- **Nombre / Identificador**: Widget `[WIDGET:CHALLENGE]` → reto express
- **Descripción**: El frontend muestra el reto express cuando la respuesta incluye el widget.
- **Precondiciones**: La respuesta del bot incluye el widget.
- **Entradas**: Enviar mensaje con response conteniendo `[WIDGET:CHALLENGE]`.
- **Pasos**:
  1. Enviar un mensaje al bot.
  2. Recibir respuesta con el widget.
  3. Observar el frontend.
- **Resultados esperados**: El frontend muestra ChallengeWidget.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: componente ChallengeWidget.
- **Prioridad**: Baja

### 6.4 Resumen Semanal

### BOT-021 — Generar resumen semanal con entradas

- **Número**: BOT-021
- **Nombre / Identificador**: Generar resumen semanal con entradas
- **Descripción**: Generar un resumen semanal cuando el usuario tiene entradas.
- **Precondiciones**: Usuario tiene entradas esta semana.
- **Entradas**: POST `/api/psychobot/weekly-summary` con `userId`.
- **Pasos**:
  1. Autenticarse con entradas esta semana.
  2. Enviar POST weekly-summary.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `{ type: "bot", text, id_session }`
- **Pos condiciones**: Resumen semanal generado.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### BOT-022 — Resumen semanal sin entradas

- **Número**: BOT-022
- **Nombre / Identificador**: Resumen semanal sin entradas
- **Descripción**: Generar un resumen semanal sin entradas en la semana.
- **Precondiciones**: Sin entradas esta semana.
- **Entradas**: POST `/api/psychobot/weekly-summary`.
- **Pasos**:
  1. Autenticarse sin entradas esta semana.
  2. Enviar POST weekly-summary.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → mensaje "Aún no tienes suficientes registros".
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### BOT-023 — Resumen semanal sin API Key

- **Número**: BOT-023
- **Nombre / Identificador**: Resumen semanal sin API Key
- **Descripción**: Generar un resumen semanal sin Gemini configurado.
- **Precondiciones**: Sin `GEMINI_API_KEY`.
- **Entradas**: POST `/api/psychobot/weekly-summary`.
- **Pasos**:
  1. Dejar la API key sin configurar.
  2. Enviar POST weekly-summary.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: Mensaje de IA no conectada.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### BOT-024 — Resumen semanal crea sesión si no existe

- **Número**: BOT-024
- **Nombre / Identificador**: Resumen semanal crea sesión si no existe
- **Descripción**: El resumen semanal crea una sesión "Resumen Semanal" si no hay sesiones previas.
- **Precondiciones**: Sin sesiones previas.
- **Entradas**: POST `/api/psychobot/weekly-summary`.
- **Pasos**:
  1. Autenticarse sin sesiones previas.
  2. Enviar POST weekly-summary.
  3. Verificar la sesión creada.
- **Resultados esperados**: Crea la sesión "Resumen Semanal".
- **Pos condiciones**: Sesión "Resumen Semanal" persistida en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

---
## 7. Panel del Psicólogo

### 7.1 Alertas de Riesgo

### PSI-001 — Obtener todas las alertas

- **Número**: PSI-001
- **Nombre / Identificador**: Obtener todas las alertas
- **Descripción**: Obtener todas las alertas de riesgo.
- **Precondiciones**: Existen alertas de riesgo.
- **Entradas**: GET `/api/psychologist/alerts`.
- **Pasos**:
  1. Autenticarse como psicólogo.
  2. Enviar GET `/api/psychologist/alerts`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → array de alertas con `id_alert`, `aprendiz_nombre`, `document`, `motivo`, `timestamp`, `leido`.
- **Pos condiciones**: Se retornan las alertas existentes.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### PSI-002 — Sin alertas retorna array vacío

- **Número**: PSI-002
- **Nombre / Identificador**: Sin alertas retorna array vacío
- **Descripción**: Obtener alertas cuando no existen.
- **Precondiciones**: Ninguna.
- **Entradas**: GET `/api/psychologist/alerts`.
- **Pasos**:
  1. Autenticarse como psicólogo.
  2. Enviar GET `/api/psychologist/alerts`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `[]`
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### PSI-003 — Marcar alerta como leída

- **Número**: PSI-003
- **Nombre / Identificador**: Marcar alerta como leída
- **Descripción**: Marcar una alerta existente como leída.
- **Precondiciones**: Alerta existe.
- **Entradas**: PUT `/api/psychologist/alerts/{id}/read`.
- **Pasos**:
  1. Autenticarse como psicólogo.
  2. Enviar PUT `/api/psychologist/alerts/{id}/read`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `{ message: "Alert marked as read" }`
- **Pos condiciones**: Alerta marcada como leída en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### PSI-004 — Marcar alerta inexistente como leída

- **Número**: PSI-004
- **Nombre / Identificador**: Marcar alerta inexistente como leída
- **Descripción**: Intentar marcar como leída una alerta que no existe.
- **Precondiciones**: Ninguna.
- **Entradas**: PUT `/api/psychologist/alerts/{id_inexistente}/read`.
- **Pasos**:
  1. Enviar PUT sobre una alerta inexistente.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `404` → `"Alerta no encontrada"`
- **Pos condiciones**: La BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### 7.2 Seguimiento de Aprendices

### PSI-005 — Obtener aprendices con estadísticas emocionales

- **Número**: PSI-005
- **Nombre / Identificador**: Obtener aprendices con estadísticas emocionales
- **Descripción**: Obtener aprendices con sus estadísticas emocionales.
- **Precondiciones**: Existen aprendices con entradas.
- **Entradas**: GET `/api/psychologist/apprentices-with-emotions`.
- **Pasos**:
  1. Autenticarse como psicólogo.
  2. Enviar GET `/api/psychologist/apprentices-with-emotions`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → array con `nombre`, `documento`, `ultima`, `promedio`, `estadisticas`.
- **Pos condiciones**: Se retornan las estadísticas calculadas.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### PSI-006 — Estadísticas calculan promedios correctamente

- **Número**: PSI-006
- **Nombre / Identificador**: Estadísticas calculan promedios correctamente
- **Descripción**: Verificar el cálculo de promedios con mayor cantidad de positivas.
- **Precondiciones**: Aprendiz con 3 positivas y 1 negativa.
- **Entradas**: GET `/api/psychologist/apprentices-with-emotions`.
- **Pasos**:
  1. Autenticarse como psicólogo.
  2. Enviar GET y revisar el `promedio`.
- **Resultados esperados**: `promedio = "Positivas"`.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### PSI-007 — Estadísticas con empate positivo-negativo

- **Número**: PSI-007
- **Nombre / Identificador**: Estadísticas con empate positivo-negativo
- **Descripción**: Verificar el promedio cuando hay empate entre positivas y negativas.
- **Precondiciones**: 2 positivas y 2 negativas.
- **Entradas**: GET `/api/psychologist/apprentices-with-emotions`.
- **Pasos**:
  1. Autenticarse como psicólogo.
  2. Enviar GET y revisar el `promedio`.
- **Resultados esperados**: `promedio = "Positivas"` (positivas >= negativas).
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### PSI-008 — Aprendiz sin emociones retorna N/D

- **Número**: PSI-008
- **Nombre / Identificador**: Aprendiz sin emociones retorna N/D
- **Descripción**: Verificar que un aprendiz sin registros retorna N/D.
- **Precondiciones**: Sin registros.
- **Entradas**: GET `/api/psychologist/apprentices-with-emotions`.
- **Pasos**:
  1. Autenticarse como psicólogo.
  2. Enviar GET y revisar los campos del aprendiz sin registros.
- **Resultados esperados**: `ultima = "N/D"`, `promedio = "Neutral"`.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### 7.3 Acceso Restringido

### PSI-009 — Acceder a ruta psicólogo sin rol

- **Número**: PSI-009
- **Nombre / Identificador**: Acceder a ruta psicólogo sin rol
- **Descripción**: Intentar navegar a una ruta de psicólogo sin tener ese rol.
- **Precondiciones**: Usuario NO es psicólogo.
- **Entradas**: Navegar a `/psi-seguimiento`.
- **Pasos**:
  1. Iniciar sesión con un rol distinto a psicólogo.
  2. Navegar a `/psi-seguimiento`.
  3. Observar el frontend.
- **Resultados esperados**: Pantalla "Acceso Denegado".
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: `ProtectedRoute`.
- **Prioridad**: Alta

### PSI-010 — Alerts polling cada 15s

- **Número**: PSI-010
- **Nombre / Identificador**: Alerts polling cada 15s
- **Descripción**: Las alertas se actualizan automáticamente cada 15 segundos.
- **Precondiciones**: En la página de seguimiento.
- **Entradas**: Esperar 15 segundos.
- **Pasos**:
  1. Estar en la página de seguimiento.
  2. Esperar 15 segundos.
  3. Observar las llamadas de red.
- **Resultados esperados**: Se llama a `fetchAlerts` automáticamente.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: componente PsiSeguimientoPage.
- **Prioridad**: Baja

---

## 8. Panel de Administración

*(Nota: las páginas de admin son GestionPage.jsx y GestionModPage.jsx; la lógica de negocio es la misma que users.controller)*

### ADM-001 — Admin busca usuarios por documento

- **Número**: ADM-001
- **Nombre / Identificador**: Admin puede buscar usuarios por documento
- **Descripción**: El admin busca usuarios escribiendo su documento.
- **Precondiciones**: En el panel de gestión.
- **Entradas**: Escribir documento en el buscador.
- **Pasos**:
  1. Abrir el panel de gestión.
  2. Escribir un documento en el buscador.
  3. Observar los resultados.
- **Resultados esperados**: Filtra resultados.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: GestionPage.jsx.
- **Prioridad**: Baja

### ADM-002 — Admin crea usuario desde formulario

- **Número**: ADM-002
- **Nombre / Identificador**: Admin puede crear usuario desde formulario
- **Descripción**: El admin crea un usuario desde el formulario del panel.
- **Precondiciones**: En el panel de gestión.
- **Entradas**: Llenar formulario + submit.
- **Pasos**:
  1. Abrir el panel de gestión.
  2. Llenar el formulario de creación.
  3. Enviar el formulario.
- **Resultados esperados**: Usuario creado exitosamente.
- **Pos condiciones**: Usuario creado en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: GestionPage.jsx.
- **Prioridad**: Alta

### ADM-003 — Admin edita usuario existente

- **Número**: ADM-003
- **Nombre / Identificador**: Admin puede editar usuario existente
- **Descripción**: El admin modifica los datos de un usuario desde el panel.
- **Precondiciones**: En el panel de gestión.
- **Entradas**: Seleccionar usuario + modificar datos.
- **Pasos**:
  1. Abrir el panel de gestión.
  2. Seleccionar un usuario.
  3. Modificar sus datos y guardar.
- **Resultados esperados**: Usuario actualizado.
- **Pos condiciones**: Datos del usuario actualizados en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: GestionPage.jsx.
- **Prioridad**: Alta

### ADM-004 — Admin elimina usuario con confirmación

- **Número**: ADM-004
- **Nombre / Identificador**: Admin puede eliminar usuario con confirmación
- **Descripción**: El admin elimina un usuario tras confirmar la acción.
- **Precondiciones**: En el panel de gestión.
- **Entradas**: Click eliminar + confirmar.
- **Pasos**:
  1. Abrir el panel de gestión.
  2. Click en eliminar sobre un usuario.
  3. Confirmar la acción.
- **Resultados esperados**: Usuario eliminado.
- **Pos condiciones**: Usuario eliminado de la BD (si no tiene dependencias).
- **Estado**: Pendiente
- **Observaciones**: Dependencia: GestionPage.jsx.
- **Prioridad**: Alta

---

## 9. Notificaciones

### NOTIF-001 — Obtener notificaciones de usuario

- **Número**: NOTIF-001
- **Nombre / Identificador**: Obtener notificaciones de usuario
- **Descripción**: Obtener las notificaciones de un usuario.
- **Precondiciones**: Usuario tiene notificaciones.
- **Entradas**: GET `/api/notifications/{userId}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar GET `/api/notifications/{userId}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → array de notificaciones.
- **Pos condiciones**: Se retornan las notificaciones del usuario.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### NOTIF-002 — Usuario sin notificaciones

- **Número**: NOTIF-002
- **Nombre / Identificador**: Usuario sin notificaciones
- **Descripción**: Obtener notificaciones de un usuario sin ninguna.
- **Precondiciones**: Ninguna.
- **Entradas**: GET `/api/notifications/{userId}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar GET `/api/notifications/{userId}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `[]`
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### NOTIF-003 — Marcar notificación como leída

- **Número**: NOTIF-003
- **Nombre / Identificador**: Marcar notificación como leída
- **Descripción**: Marcar una notificación existente como leída.
- **Precondiciones**: Notificación existe.
- **Entradas**: PUT `/api/notifications/{id}/read`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar PUT `/api/notifications/{id}/read`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200`
- **Pos condiciones**: Notificación marcada como leída en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### NOTIF-004 — Check-in crea notificación si >3 días sin chat

- **Número**: NOTIF-004
- **Nombre / Identificador**: Check-in crea notificación si >3 días sin chat
- **Descripción**: El check-in crea una notificación si pasaron más de 3 días sin chat.
- **Precondiciones**: Última sesión hace más de 3 días.
- **Entradas**: POST `/api/notifications/check-in` con `userId`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar POST check-in.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: Crea una notificación tipo "check-in".
- **Pos condiciones**: Notificación de tipo check-in creada en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### NOTIF-005 — Check-in sin >3 días no duplica notificación

- **Número**: NOTIF-005
- **Nombre / Identificador**: Check-in sin >3 días no duplica notificación
- **Descripción**: El check-in no crea una notificación duplicada si ya existe una no leída.
- **Precondiciones**: Ya existe un check-in no leído.
- **Entradas**: POST `/api/notifications/check-in`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar POST check-in.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: No crea notificación duplicada.
- **Pos condiciones**: No se inserta una notificación duplicada.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### NOTIF-006 — Check-in sin actividad previa

- **Número**: NOTIF-006
- **Nombre / Identificador**: Check-in sin actividad previa
- **Descripción**: El check-in no crea notificación si no hay sesiones de chat previas.
- **Precondiciones**: Sin sesiones de chat.
- **Entradas**: POST `/api/notifications/check-in`.
- **Pasos**:
  1. Autenticarse sin sesiones de chat.
  2. Enviar POST check-in.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: No crea notificación (no hay `lastSessionDate`).
- **Pos condiciones**: No se inserta notificación.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### NOTIF-007 — Check-in sin userId

- **Número**: NOTIF-007
- **Nombre / Identificador**: Check-in sin userId
- **Descripción**: Intentar ejecutar el check-in sin userId.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/notifications/check-in` sin `userId`.
- **Pasos**:
  1. Enviar POST check-in sin userId.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"userId required"`
- **Pos condiciones**: No se crea notificación; la BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### NOTIF-008 — Agenda crea notificación automática

- **Número**: NOTIF-008
- **Nombre / Identificador**: Agenda crea notificación automática
- **Descripción**: Al crear una cita se genera una notificación de tipo "cita".
- **Precondiciones**: Crear cita exitosamente.
- **Entradas**: POST `/api/meetings` con datos válidos.
- **Pasos**:
  1. Autenticarse.
  2. Enviar POST `/api/meetings`.
  3. Verificar las notificaciones del usuario.
- **Resultados esperados**: Se crea notificación tipo "cita".
- **Pos condiciones**: Notificación de tipo cita creada en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

---
## 10. Privacidad del Diario

### PRIV-001 — Obtener configuración de privacidad

- **Número**: PRIV-001
- **Nombre / Identificador**: Obtener configuración de privacidad
- **Descripción**: Obtener la configuración de privacidad del diario.
- **Precondiciones**: Usuario tiene diary.
- **Entradas**: GET `/api/users/privacy/{userId}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar GET `/api/users/privacy/{userId}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `{ diary_visibility }`
- **Pos condiciones**: Se retorna la visibilidad configurada.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### PRIV-002 — Obtener privacidad sin diary

- **Número**: PRIV-002
- **Nombre / Identificador**: Obtener privacidad sin diary
- **Descripción**: Obtener la privacidad de un usuario sin diario.
- **Precondiciones**: Usuario sin diary.
- **Entradas**: GET `/api/users/privacy/{userId}`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar GET `/api/users/privacy/{userId}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `{ diary_visibility: "yo-psicologo" }` (default).
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### PRIV-003 — Actualizar privacidad a "solo-yo"

- **Número**: PRIV-003
- **Nombre / Identificador**: Actualizar privacidad a "solo-yo"
- **Descripción**: Actualizar la visibilidad del diario a "solo-yo".
- **Precondiciones**: Usuario existe.
- **Entradas**: PUT `/api/users/privacy/{userId}` con `visibilidad="solo-yo"`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar PUT con `visibilidad="solo-yo"`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `"Privacidad actualizada correctamente"`
- **Pos condiciones**: Visibilidad actualizada en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### PRIV-004 — Actualizar privacidad a "yo-psicologo"

- **Número**: PRIV-004
- **Nombre / Identificador**: Actualizar privacidad a "yo-psicologo"
- **Descripción**: Actualizar la visibilidad del diario a "yo-psicologo".
- **Precondiciones**: Usuario existe.
- **Entradas**: PUT `/api/users/privacy/{userId}` con `visibilidad="yo-psicologo"`.
- **Pasos**:
  1. Autenticarse.
  2. Enviar PUT con `visibilidad="yo-psicologo"`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `"Privacidad actualizada correctamente"`
- **Pos condiciones**: Visibilidad actualizada en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### PRIV-005 — Actualizar privacidad crea diary si no existe

- **Número**: PRIV-005
- **Nombre / Identificador**: Actualizar privacidad crea diary si no existe
- **Descripción**: Al actualizar la privacidad se crea el diario si no existía.
- **Precondiciones**: Usuario sin diary previo.
- **Entradas**: PUT `/api/users/privacy/{userId}` con `visibilidad`.
- **Pasos**:
  1. Autenticarse sin diario previo.
  2. Enviar PUT con visibilidad.
  3. Verificar el diario creado.
- **Resultados esperados**: Se crea `diary` y se actualiza la visibilidad.
- **Pos condiciones**: Diario creado con la visibilidad configurada.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### PRIV-006 — Actualizar sin campo visibilidad

- **Número**: PRIV-006
- **Nombre / Identificador**: Actualizar sin campo visibilidad
- **Descripción**: Intentar actualizar la privacidad sin enviar visibilidad.
- **Precondiciones**: Ninguna.
- **Entradas**: PUT `/api/users/privacy/{userId}` sin `visibilidad` en el body.
- **Pasos**:
  1. Enviar PUT sin visibilidad.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"Visibilidad es requerida"`
- **Pos condiciones**: La BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

---

## 11. Perfil de Usuario

### 11.1 Perfil (dueño o administrador)

### PROF-001 — Obtener perfil completo

- **Número**: PROF-001
- **Nombre / Identificador**: Obtener perfil completo
- **Descripción**: Obtener el perfil completo del usuario autenticado.
- **Precondiciones**: Usuario existe + autenticado como dueño o administrador.
- **Entradas**: GET `/api/users/profile/{id}` con `Authorization: Bearer {token}`.
- **Pasos**:
  1. Autenticarse como dueño del perfil (o admin).
  2. Enviar GET `/api/users/profile/{id}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → datos completos del perfil.
- **Pos condiciones**: Se retorna el perfil.
- **Estado**: Pendiente
- **Observaciones**: `assertOwnProfile` permite el dueño o administrador; si no, 403.
- **Prioridad**: Alta

### PROF-002 — Obtener perfil de usuario inexistente

- **Número**: PROF-002
- **Nombre / Identificador**: Obtener perfil de usuario inexistente
- **Descripción**: Intentar obtener el perfil de un id que no existe en BD.
- **Precondiciones**: Usuario autenticado como dueño o administrador; el id no existe.
- **Entradas**: GET `/api/users/profile/{id_inexistente}`.
- **Pasos**:
  1. Autenticarse como dueño o admin.
  2. Enviar GET `/api/users/profile/{id_inexistente}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `404` → `"Usuario no encontrado"`
- **Pos condiciones**: No se retorna ningún dato.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### PROF-003 — Actualizar perfil sin cambiar contraseña

- **Número**: PROF-003
- **Nombre / Identificador**: Actualizar perfil sin cambiar contraseña
- **Descripción**: Actualizar los datos del perfil sin enviar contraseña.
- **Precondiciones**: Usuario autenticado como dueño del perfil.
- **Entradas**: PUT `/api/users/profile/{id}` con nuevos `nombres`.
- **Pasos**:
  1. Autenticarse como dueño del perfil.
  2. Enviar PUT `/api/users/profile/{id}` con nuevos nombres.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `{ message: "Perfil actualizado correctamente", user: {...} }`
- **Pos condiciones**: Datos del perfil actualizados en BD; el password no cambia.
- **Estado**: Pendiente
- **Observaciones**: Devuelve el `user` actualizado para sincronizar el frontend.
- **Prioridad**: Alta

### PROF-004 — Actualizar perfil con nueva contraseña

- **Número**: PROF-004
- **Nombre / Identificador**: Actualizar perfil con nueva contraseña
- **Descripción**: Actualizar el perfil incluyendo una nueva contraseña.
- **Precondiciones**: Usuario autenticado como dueño del perfil.
- **Entradas**: PUT `/api/users/profile/{id}` con `password`.
- **Pasos**:
  1. Autenticarse como dueño del perfil.
  2. Enviar PUT con `password` nuevo.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `{ message: "Perfil actualizado correctamente", user: {...} }`; el password se hashea.
- **Pos condiciones**: Password actualizado (hasheado) en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### PROF-005 — Actualizar foto de perfil (base64)

- **Número**: PROF-005
- **Nombre / Identificador**: Actualizar foto de perfil (base64)
- **Descripción**: Actualizar la foto de perfil con una imagen en base64.
- **Precondiciones**: Usuario autenticado como dueño del perfil.
- **Entradas**: PUT `/api/users/profile/{id}/photo` con `{ profilePhoto }` (base64).
- **Pasos**:
  1. Autenticarse como dueño del perfil.
  2. Enviar PUT `/api/users/profile/{id}/photo` con `profilePhoto`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `"Foto de perfil actualizada"`
- **Pos condiciones**: Foto de perfil guardada en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### PROF-006 — Obtener foto de perfil

- **Número**: PROF-006
- **Nombre / Identificador**: Obtener foto de perfil
- **Descripción**: Obtener la foto de perfil de un usuario con foto.
- **Precondiciones**: Usuario tiene foto + autenticado como dueño o administrador.
- **Entradas**: GET `/api/users/profile/{id}/photo`.
- **Pasos**:
  1. Autenticarse como dueño o admin.
  2. Enviar GET `/api/users/profile/{id}/photo`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `{ profile_photo }`
- **Pos condiciones**: Se retorna la foto del usuario.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### PROF-007 — Actualizar foto de usuario inexistente

- **Número**: PROF-007
- **Nombre / Identificador**: Actualizar foto de usuario inexistente
- **Descripción**: Intentar actualizar la foto de un id que no existe.
- **Precondiciones**: Autenticado como dueño o administrador; el id no existe.
- **Entradas**: PUT `/api/users/profile/{id_inexistente}/photo`.
- **Pasos**:
  1. Autenticarse como dueño o admin.
  2. Enviar PUT `/api/users/profile/{id_inexistente}/photo`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `404` → `"Usuario no encontrado"`
- **Pos condiciones**: La BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### PROF-008 — Frontend valida tipo de archivo (solo imágenes)

- **Número**: PROF-008
- **Nombre / Identificador**: Frontend valida tipo de archivo (solo imágenes)
- **Descripción**: El frontend rechaza archivos que no sean imágenes al subir la foto.
- **Precondiciones**: Subir PDF.
- **Entradas**: Drag & drop o file picker con un PDF.
- **Pasos**:
  1. Abrir el selector de foto de perfil.
  2. Seleccionar un archivo PDF.
  3. Observar la validación del frontend.
- **Resultados esperados**: `showError` → "Solo se permiten imágenes".
- **Pos condiciones**: No se envía el archivo al servidor.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: componente de perfil (MiCuenta).
- **Prioridad**: Baja

### PROF-009 — Frontend valida tamaño máximo 5MB

- **Número**: PROF-009
- **Nombre / Identificador**: Frontend valida tamaño máximo 5MB
- **Descripción**: El frontend rechaza imágenes mayores a 5 MB.
- **Precondiciones**: Subir imagen > 5MB.
- **Entradas**: File picker con una imagen grande.
- **Pasos**:
  1. Abrir el selector de foto de perfil.
  2. Seleccionar una imagen mayor a 5 MB.
  3. Observar la validación del frontend.
- **Resultados esperados**: `showError` → "La imagen no debe superar 5 MB".
- **Pos condiciones**: No se envía el archivo al servidor.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: componente de perfil (MiCuenta).
- **Prioridad**: Baja

### PROF-010 — Doble confirmación para eliminar cuenta

- **Número**: PROF-010
- **Nombre / Identificador**: Doble confirmación para eliminar cuenta
- **Descripción**: La eliminación de cuenta exige confirmación escribiendo "ELIMINAR".
- **Precondiciones**: Usuario autenticado.
- **Entradas**: Click "Eliminar cuenta" → confirmar → escribir "ELIMINAR".
- **Pasos**:
  1. Estar autenticado en la página de cuenta.
  2. Hacer click en "Eliminar cuenta".
  3. Confirmar escribiendo "ELIMINAR".
  4. Observar el flujo.
- **Resultados esperados**: Cuenta eliminada + logout + redirección.
- **Pos condiciones**: Cuenta eliminada y sesión cerrada.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: componente de perfil (MiCuenta).
- **Prioridad**: Baja

### 11.2 Autorización de Perfil (403)

### PROF-011 — Obtener perfil de otro usuario sin ser admin

- **Número**: PROF-011
- **Nombre / Identificador**: Obtener perfil de otro usuario sin ser admin
- **Descripción**: Intentar obtener el perfil de otro usuario siendo aprendiz.
- **Precondiciones**: Usuario autenticado (aprendiz) consultando el perfil de otro usuario.
- **Entradas**: GET `/api/users/profile/{id_otro}` con `Authorization: Bearer {token aprendiz}`.
- **Pasos**:
  1. Iniciar sesión como aprendiz.
  2. Enviar GET `/api/users/profile/{id_otro}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `403` → `"No tienes permisos para acceder a este perfil."`
- **Pos condiciones**: No se retorna información del perfil.
- **Estado**: Pendiente
- **Observaciones**: `assertOwnProfile` en `users.controller.js`.
- **Prioridad**: Alta

### PROF-012 — Actualizar perfil de otro usuario sin ser admin

- **Número**: PROF-012
- **Nombre / Identificador**: Actualizar perfil de otro usuario sin ser admin
- **Descripción**: Intentar actualizar el perfil de otro usuario siendo aprendiz.
- **Precondiciones**: Usuario autenticado (aprendiz) intentando actualizar otro perfil.
- **Entradas**: PUT `/api/users/profile/{id_otro}` con `Authorization: Bearer {token aprendiz}`.
- **Pasos**:
  1. Iniciar sesión como aprendiz.
  2. Enviar PUT `/api/users/profile/{id_otro}`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `403` → `"No tienes permisos para acceder a este perfil."`
- **Pos condiciones**: La BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: `assertOwnProfile` en `users.controller.js`.
- **Prioridad**: Alta

### PROF-013 — Actualizar foto de perfil de otro usuario sin ser admin

- **Número**: PROF-013
- **Nombre / Identificador**: Actualizar foto de perfil de otro usuario sin ser admin
- **Descripción**: Intentar actualizar la foto de otro usuario siendo aprendiz.
- **Precondiciones**: Usuario autenticado (aprendiz) intentando cambiar la foto de otro.
- **Entradas**: PUT `/api/users/profile/{id_otro}/photo` con `Authorization: Bearer {token aprendiz}`.
- **Pasos**:
  1. Iniciar sesión como aprendiz.
  2. Enviar PUT `/api/users/profile/{id_otro}/photo`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `403` → `"No tienes permisos para acceder a este perfil."`
- **Pos condiciones**: La BD no se modifica.
- **Estado**: Pendiente
- **Observaciones**: `assertOwnProfile` en `users.controller.js`.
- **Prioridad**: Alta

### PROF-014 — Obtener foto de perfil de otro usuario sin ser admin

- **Número**: PROF-014
- **Nombre / Identificador**: Obtener foto de perfil de otro usuario sin ser admin
- **Descripción**: Intentar obtener la foto de otro usuario siendo aprendiz.
- **Precondiciones**: Usuario autenticado (aprendiz) consultando la foto de otro.
- **Entradas**: GET `/api/users/profile/{id_otro}/photo` con `Authorization: Bearer {token aprendiz}`.
- **Pasos**:
  1. Iniciar sesión como aprendiz.
  2. Enviar GET `/api/users/profile/{id_otro}/photo`.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `403` → `"No tienes permisos para acceder a este perfil."`
- **Pos condiciones**: No se retorna la foto.
- **Estado**: Pendiente
- **Observaciones**: `assertOwnProfile` en `users.controller.js`.
- **Prioridad**: Alta

---

## 12. Recuperación de Contraseña

### PASS-001 — Solicitar restablecimiento de contraseña

- **Número**: PASS-001
- **Nombre / Identificador**: Solicitar restablecimiento de contraseña
- **Descripción**: Solicitar el restablecimiento de contraseña con un correo existente.
- **Precondiciones**: El correo existe en BD.
- **Entradas**: POST `/api/password/forgot` con `correo` existente.
- **Pasos**:
  1. Enviar POST `/api/password/forgot` con un correo registrado.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `"Correo de recuperación enviado exitosamente"`
- **Pos condiciones**: Se genera un token y se envía el correo de recuperación.
- **Estado**: Pendiente
- **Observaciones**: El controlador usa el campo `correo` del body.
- **Prioridad**: Alta

### PASS-002 — Solicitar restablecimiento con correo inexistente

- **Número**: PASS-002
- **Nombre / Identificador**: Solicitar restablecimiento con correo inexistente
- **Descripción**: Intentar solicitar recuperación con un correo no registrado.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/password/forgot` con `correo` no registrado.
- **Pasos**:
  1. Enviar POST `/api/password/forgot` con un correo inexistente.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `404` → `"Correo no encontrado"`
- **Pos condiciones**: No se genera token ni se envía correo.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### PASS-003 — Solicitar sin correo

- **Número**: PASS-003
- **Nombre / Identificador**: Solicitar restablecimiento sin correo
- **Descripción**: Intentar solicitar recuperación sin enviar el correo.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/password/forgot` sin body.
- **Pasos**:
  1. Enviar POST `/api/password/forgot` sin correo.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"El correo es requerido"`
- **Pos condiciones**: No se genera token ni se envía correo.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### PASS-004 — Resetear contraseña con token válido

- **Número**: PASS-004
- **Nombre / Identificador**: Resetear contraseña con token válido
- **Descripción**: Restablecer la contraseña con un token válido y vigente.
- **Precondiciones**: Token generado y vigente.
- **Entradas**: POST `/api/password/reset` con `token` + `newPassword`.
- **Pasos**:
  1. Obtener un token de recuperación válido.
  2. Enviar POST `/api/password/reset` con token y nueva contraseña.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `200` → `"Contraseña actualizada correctamente"`
- **Pos condiciones**: Contraseña actualizada (hasheada) en BD; token consumido.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### PASS-005 — Resetear con token inválido

- **Número**: PASS-005
- **Nombre / Identificador**: Resetear con token inválido
- **Descripción**: Intentar restablecer la contraseña con un token inexistente.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/password/reset` con token inexistente.
- **Pasos**:
  1. Enviar POST `/api/password/reset` con un token inválido.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"Token inválido o expirado"`
- **Pos condiciones**: La contraseña no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### PASS-006 — Resetear con token expirado (>1 hora)

- **Número**: PASS-006
- **Nombre / Identificador**: Resetear con token expirado (>1 hora)
- **Descripción**: Intentar restablecer con un token generado hace más de una hora.
- **Precondiciones**: Token generado hace más de 1h.
- **Entradas**: POST `/api/password/reset` con token expirado.
- **Pasos**:
  1. Generar un token y esperar más de 1 hora (o simular vencimiento).
  2. Enviar POST `/api/password/reset` con el token expirado.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"El token ha expirado"`
- **Pos condiciones**: La contraseña no se modifica; el token se elimina.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### PASS-007 — Resetear sin token o password

- **Número**: PASS-007
- **Nombre / Identificador**: Resetear sin token o password
- **Descripción**: Intentar restablecer sin enviar token o nueva contraseña.
- **Precondiciones**: Ninguna.
- **Entradas**: POST `/api/password/reset` sin `token` o `newPassword`.
- **Pasos**:
  1. Enviar POST `/api/password/reset` con campos faltantes.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → `"Token y nueva contraseña son requeridos"`
- **Pos condiciones**: La contraseña no se modifica.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### PASS-008 — Enlace de recuperación incluye token en URL

- **Número**: PASS-008
- **Nombre / Identificador**: Enlace de recuperación incluye token en URL
- **Descripción**: Verificar que el correo de recuperación incluye el token en la URL.
- **Precondiciones**: Token generado.
- **Entradas**: Revisar el correo enviado.
- **Pasos**:
  1. Solicitar la recuperación de contraseña.
  2. Revisar el correo recibido.
  3. Inspeccionar el enlace del correo.
- **Resultados esperados**: La URL contiene `?token={token}`.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### PASS-009 — Token usado no puede reutilizarse

- **Número**: PASS-009
- **Nombre / Identificador**: Token usado no puede reutilizarse
- **Descripción**: Un token ya utilizado no puede reutilizarse para otro reset.
- **Precondiciones**: Reset exitoso previo con ese token.
- **Entradas**: POST `/api/password/reset` con el mismo token otra vez.
- **Pasos**:
  1. Realizar un reset exitoso con un token.
  2. Reintentar POST `/api/password/reset` con el mismo token.
  3. Esperar la respuesta del servidor.
- **Resultados esperados**: `400` → Token inválido (fue eliminado al usarse).
- **Pos condiciones**: La contraseña no se modifica nuevamente.
- **Estado**: Pendiente
- **Observaciones**: El token se elimina tras el primer uso.
- **Prioridad**: Alta

---
## 13. Middleware y Seguridad

### SEC-001 — Endpoint protegido sin token retorna 401

- **Número**: SEC-001
- **Nombre / Identificador**: Endpoint protegido sin token retorna 401
- **Descripción**: Un endpoint protegido rechaza peticiones sin token.
- **Precondiciones**: Ninguna.
- **Entradas**: GET `/api/diary/entries/1` sin header `Authorization`.
- **Pasos**:
  1. Enviar GET `/api/diary/entries/1` sin header de autorización.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `401` → `"Token no proporcionado. Inicie sesión."`
- **Pos condiciones**: La petición no se procesa.
- **Estado**: Pendiente
- **Observaciones**: Mensaje literal de `auth.middleware.js`.
- **Prioridad**: Alta

### SEC-002 — Endpoint protegido con token inválido retorna 401

- **Número**: SEC-002
- **Nombre / Identificador**: Endpoint protegido con token inválido retorna 401
- **Descripción**: Un endpoint protegido rechaza peticiones con token malformado.
- **Precondiciones**: Ninguna.
- **Entradas**: GET `/api/diary/entries/1` con `Bearer` token malformado.
- **Pasos**:
  1. Enviar GET con un token malformado.
  2. Esperar la respuesta del servidor.
- **Resultados esperados**: `401` → `"Token inválido. Inicie sesión nuevamente."`
- **Pos condiciones**: La petición no se procesa.
- **Estado**: Pendiente
- **Observaciones**: Mensaje literal de `auth.middleware.js`.
- **Prioridad**: Alta

### SEC-003 — AuthContext detecta 401 y cierra sesión

- **Número**: SEC-003
- **Nombre / Identificador**: AuthContext detecta 401 y cierra sesión
- **Descripción**: Cuando `authFetch` recibe 401, AuthContext cierra la sesión.
- **Precondiciones**: Sesión activa.
- **Entradas**: `authFetch` recibe una respuesta 401.
- **Pasos**:
  1. Estar autenticado.
  2. Provocar una respuesta 401 en una llamada autenticada.
  3. Observar el estado de la sesión.
- **Resultados esperados**: Limpia localStorage y redirige a `/`.
- **Pos condiciones**: Sesión cerrada; sin token en localStorage.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: `AuthContext` + `authFetch`.
- **Prioridad**: Alta

### SEC-004 — PublicPaths no requieren token

- **Número**: SEC-004
- **Nombre / Identificador**: PublicPaths no requieren token
- **Descripción**: Las rutas públicas (`/api/password/forgot`, `/api/password/reset`) no exigen token.
- **Precondiciones**: Ninguna.
- **Entradas**: POST a `/api/password/forgot` y `/api/password/reset` sin token.
- **Pasos**:
  1. Enviar POST a las rutas públicas sin token.
  2. Observar que pasan el middleware.
- **Resultados esperados**: Pasan el middleware sin token.
- **Pos condiciones**: La petición llega al controlador.
- **Estado**: Pendiente
- **Observaciones**: `publicPaths` en `auth.middleware.js`.
- **Prioridad**: Alta

### SEC-005 — CORS configurado solo para FRONTEND_URL

- **Número**: SEC-005
- **Nombre / Identificador**: CORS configurado solo para FRONTEND_URL
- **Descripción**: Las peticiones desde orígenes no permitidos son bloqueadas por CORS.
- **Precondiciones**: Ninguna.
- **Entradas**: Request desde un origen no permitido.
- **Pasos**:
  1. Enviar una petición desde un origen distinto a `FRONTEND_URL`.
  2. Observar la respuesta del servidor.
- **Resultados esperados**: Bloqueado por CORS.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

### SEC-006 — Email service timeouts aplicados

- **Número**: SEC-006
- **Nombre / Identificador**: Email service timeout 30s + greeting timeout 15s
- **Descripción**: El servicio de email tiene timeouts configurados (30s y 15s).
- **Precondiciones**: Ninguna.
- **Entradas**: Configuración de nodemailer.
- **Pasos**:
  1. Revisar la configuración de nodemailer.
  2. Verificar los timeouts.
- **Resultados esperados**: Timeouts aplicados.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Media

### SEC-007 — Error handler responde errores consistentes

- **Número**: SEC-007
- **Nombre / Identificador**: Error handler captura y responde errores consistentes
- **Descripción**: El error handler central captura errores y responde JSON consistente.
- **Precondiciones**: Error en un controller.
- **Entradas**: Llamar un endpoint que lanza un error.
- **Pasos**:
  1. Llamar un endpoint que lanza un error.
  2. Observar la respuesta del servidor.
- **Resultados esperados**: Respuesta JSON con status code y mensaje.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: —
- **Prioridad**: Alta

---

## 14. Frontend — Componentes y UI

### 14.1 AuthContext

### UI-001 — AuthContext carga usuario desde localStorage

- **Número**: UI-001
- **Nombre / Identificador**: AuthContext carga usuario desde localStorage al iniciar
- **Descripción**: Al iniciar, AuthContext restaura el usuario guardado en localStorage.
- **Precondiciones**: Token + user guardados.
- **Entradas**: Refrescar página.
- **Pasos**:
  1. Guardar token y user en localStorage.
  2. Refrescar la página.
  3. Observar el estado de autenticación.
- **Resultados esperados**: `user` se restaura, `isAuthenticated = true`.
- **Pos condiciones**: Sesión restaurada.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: `AuthContext`.
- **Prioridad**: Alta

### UI-002 — AuthContext limpia sesión si token expiró

- **Número**: UI-002
- **Nombre / Identificador**: AuthContext limpia sesión si token expiró
- **Descripción**: Si el token expiró en el servidor, la sesión se limpia al refrescar.
- **Precondiciones**: Token expirado en el servidor.
- **Entradas**: Refrescar página.
- **Pasos**:
  1. Tener un token expirado en localStorage.
  2. Refrescar la página.
  3. Observar el estado de la sesión.
- **Resultados esperados**: `user = null`, localStorage limpio.
- **Pos condiciones**: Sesión cerrada.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: `AuthContext`.
- **Prioridad**: Alta

### UI-003 — hasRole funciona para strings y arrays

- **Número**: UI-003
- **Nombre / Identificador**: hasRole funciona para strings y arrays
- **Descripción**: Verificar que `hasRole` acepta un rol o una lista de roles.
- **Precondiciones**: `user.rol = "aprendiz"`.
- **Entradas**: `hasRole("aprendiz")`, `hasRole(["admin", "psicologo"])`.
- **Pasos**:
  1. Llamar `hasRole("aprendiz")`.
  2. Llamar `hasRole(["admin", "psicologo"])`.
- **Resultados esperados**: `true` y `false` respectivamente.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: `AuthContext`.
- **Prioridad**: Alta

### 14.2 ProtectedRoute

### UI-004 — Ruta protegida renderiza si autenticado

- **Número**: UI-004
- **Nombre / Identificador**: Ruta protegida renderiza si autenticado
- **Descripción**: Una ruta protegida renderiza su componente hijo si el usuario está autenticado.
- **Precondiciones**: `user != null`.
- **Entradas**: Navegar a una ruta protegida.
- **Pasos**:
  1. Estar autenticado.
  2. Navegar a una ruta protegida.
  3. Observar el renderizado.
- **Resultados esperados**: Se renderiza el componente hijo.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: `ProtectedRoute`.
- **Prioridad**: Alta

### UI-005 — Ruta protegida redirige si no autenticado

- **Número**: UI-005
- **Nombre / Identificador**: Ruta protegida redirige si no autenticado
- **Descripción**: Una ruta protegida redirige al home si el usuario no está autenticado.
- **Precondiciones**: `user = null`.
- **Entradas**: Navegar a una ruta protegida.
- **Pasos**:
  1. No estar autenticado.
  2. Navegar a una ruta protegida.
  3. Observar la navegación.
- **Resultados esperados**: Redirección a `/`.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: `ProtectedRoute`.
- **Prioridad**: Alta

### 14.3 Inicio (Login)

### UI-006 — Login con credenciales incorrectas muestra error animado

- **Número**: UI-006
- **Nombre / Identificador**: Login con credenciales incorrectas muestra error animado
- **Descripción**: El login con datos incorrectos muestra una alerta roja animada.
- **Precondiciones**: Ninguna.
- **Entradas**: Submit con datos incorrectos.
- **Pasos**:
  1. Abrir la página de login.
  2. Ingresar credenciales incorrectas y enviar.
  3. Observar la alerta.
- **Resultados esperados**: Alerta roja con shake animation + mensaje.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: componente de Login.
- **Prioridad**: Baja

### UI-007 — Login exitoso muestra bienvenida y redirige

- **Número**: UI-007
- **Nombre / Identificador**: Login exitoso muestra bienvenida y redirige
- **Descripción**: El login exitoso muestra una bienvenida y redirige.
- **Precondiciones**: Credenciales correctas.
- **Entradas**: Submit con credenciales correctas.
- **Pasos**:
  1. Ingresar credenciales correctas.
  2. Enviar el formulario.
  3. Observar la alerta y la redirección.
- **Resultados esperados**: Alerta verde "¡Bienvenido/a!" → redirige en 1.5s.
- **Pos condiciones**: Sesión iniciada y redirigida por rol.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: componente de Login.
- **Prioridad**: Alta

### UI-008 — Toggle mostrar/ocultar contraseña

- **Número**: UI-008
- **Nombre / Identificador**: Toggle mostrar/ocultar contraseña
- **Descripción**: El ícono de ojo alterna la visibilidad de la contraseña.
- **Precondiciones**: Ninguna.
- **Entradas**: Click en el ícono eye.
- **Pasos**:
  1. Abrir el login.
  2. Click en el ícono eye.
  3. Observar el campo de contraseña.
- **Resultados esperados**: Campo password ↔ text.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: componente de Login.
- **Prioridad**: Baja

### UI-009 — Input documento acepta solo números

- **Número**: UI-009
- **Nombre / Identificador**: Input documento acepta solo números
- **Descripción**: El campo documento del login rechaza caracteres no numéricos.
- **Precondiciones**: Ninguna.
- **Entradas**: Escribir letras en el campo documento.
- **Pasos**:
  1. Abrir el login.
  2. Escribir letras en el campo documento.
  3. Observar el input.
- **Resultados esperados**: Los caracteres no numéricos son rechazados.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: componente de Login.
- **Prioridad**: Baja

### 14.4 DiarioPage

### UI-010 — Seleccionar emoción resalta la opción

- **Número**: UI-010
- **Nombre / Identificador**: Seleccionar emoción resalta la opción
- **Descripción**: Al seleccionar una emoción, esta se marca visualmente.
- **Precondiciones**: Ninguna.
- **Entradas**: Click en un emoji.
- **Pasos**:
  1. Abrir DiarioPage.
  2. Click en un emoji.
  3. Observar la selección.
- **Resultados esperados**: Se marca visualmente con gradient verde.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: DiarioPage.
- **Prioridad**: Baja

### UI-011 — Registrar sin emoción muestra advertencia

- **Número**: UI-011
- **Nombre / Identificador**: Registrar sin emoción seleccionada muestra advertencia
- **Descripción**: Al registrar sin emoción seleccionada se muestra una advertencia.
- **Precondiciones**: Ninguna.
- **Entradas**: Click "Registrar" sin emoción.
- **Pasos**:
  1. Abrir DiarioPage.
  2. Click en "Registrar" sin emoción.
  3. Observar la advertencia.
- **Resultados esperados**: `showWarning` → "Por favor selecciona una emoción".
- **Pos condiciones**: No se envía la entrada.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: DiarioPage.
- **Prioridad**: Baja

### UI-012 — Registrar entrada exitosa muestra confirmación

- **Número**: UI-012
- **Nombre / Identificador**: Registrar entrada exitosa muestra confirmación
- **Descripción**: Al registrar una entrada exitosamente se muestra confirmación.
- **Precondiciones**: Emoción + texto (opcional).
- **Entradas**: Click "Registrar" con emoción seleccionada.
- **Pasos**:
  1. Seleccionar una emoción.
  2. Click en "Registrar".
  3. Observar la confirmación.
- **Resultados esperados**: `showSuccess` + limpia selección.
- **Pos condiciones**: Entrada guardada en `diary_entries`.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: DiarioPage.
- **Prioridad**: Alta

### UI-013 — Crear objetivo sin nombre muestra advertencia

- **Número**: UI-013
- **Nombre / Identificador**: Crear objetivo sin nombre muestra advertencia
- **Descripción**: Al crear un objetivo sin nombre se muestra una advertencia.
- **Precondiciones**: Ninguna.
- **Entradas**: Click "Crear Objetivo" sin nombre.
- **Pasos**:
  1. Abrir DiarioPage.
  2. Click en "Crear Objetivo" sin nombre.
  3. Observar la advertencia.
- **Resultados esperados**: `showWarning`.
- **Pos condiciones**: No se crea el objetivo.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: DiarioPage.
- **Prioridad**: Baja

### 14.5 PsychobotPage

### UI-014 — Mensaje de usuario se alinea a la derecha

- **Número**: UI-014
- **Nombre / Identificador**: Mensaje de usuario se alinea a la derecha
- **Descripción**: Los mensajes del usuario se alinean a la derecha.
- **Precondiciones**: Ninguna.
- **Entradas**: Enviar un mensaje.
- **Pasos**:
  1. Abrir PsychobotPage.
  2. Enviar un mensaje.
  3. Observar la alineación.
- **Resultados esperados**: Burbuja verde a la derecha.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: PsychobotPage.
- **Prioridad**: Baja

### UI-015 — Mensaje del bot se alinea a la izquierda

- **Número**: UI-015
- **Nombre / Identificador**: Mensaje del bot se alinea a la izquierda
- **Descripción**: Los mensajes del bot se alinean a la izquierda.
- **Precondiciones**: Ninguna.
- **Entradas**: Recibir respuesta del bot.
- **Pasos**:
  1. Abrir PsychobotPage.
  2. Enviar un mensaje y recibir respuesta.
  3. Observar la alineación.
- **Resultados esperados**: Burbuja gris a la izquierda con label "Psychobot".
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: PsychobotPage.
- **Prioridad**: Baja

### UI-016 — Indicador de escritura (typing dots)

- **Número**: UI-016
- **Nombre / Identificador**: Indicador de escritura (typing dots)
- **Descripción**: Mientras el bot responde se muestran tres puntos animados.
- **Precondiciones**: Ninguna.
- **Entradas**: Enviar un mensaje.
- **Pasos**:
  1. Abrir PsychobotPage.
  2. Enviar un mensaje.
  3. Observar el indicador mientras responde.
- **Resultados esperados**: 3 dots animados aparecen.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: PsychobotPage.
- **Prioridad**: Baja

### UI-017 — Sidebar de historial se abre/cierra

- **Número**: UI-017
- **Nombre / Identificador**: Sidebar de historial se abre/cierra
- **Descripción**: El sidebar de historial se abre y cierra con el botón clock.
- **Precondiciones**: Ninguna.
- **Entradas**: Click en el botón clock.
- **Pasos**:
  1. Abrir PsychobotPage.
  2. Click en el botón clock.
  3. Observar el sidebar.
- **Resultados esperados**: Sidebar animado desde la izquierda.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: PsychobotPage.
- **Prioridad**: Baja

### UI-018 — Nueva conversación se crea desde sidebar

- **Número**: UI-018
- **Nombre / Identificador**: Nueva conversación se crea desde sidebar
- **Descripción**: "Nuevo Chat" crea una conversación nueva desde el sidebar.
- **Precondiciones**: Ninguna.
- **Entradas**: Click en "Nuevo Chat".
- **Pasos**:
  1. Abrir PsychobotPage.
  2. Click en "Nuevo Chat".
  3. Observar la sesión creada.
- **Resultados esperados**: Se crea una sesión y se muestra vacía.
- **Pos condiciones**: Sesión creada en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: PsychobotPage.
- **Prioridad**: Baja

### UI-019 — Eliminar conversación requiere confirmación

- **Número**: UI-019
- **Nombre / Identificador**: Eliminar conversación requiere confirmación
- **Descripción**: Antes de borrar una conversación se pide confirmación.
- **Precondiciones**: Ninguna.
- **Entradas**: Click en el ícono trash.
- **Pasos**:
  1. Abrir PsychobotPage.
  2. Click en el ícono trash.
  3. Observar el diálogo.
- **Resultados esperados**: Confirm dialog antes de borrar.
- **Pos condiciones**: La conversación se borra solo si se confirma.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: PsychobotPage.
- **Prioridad**: Baja

### UI-020 — Mapa corporal muestra modal con silueta

- **Número**: UI-020
- **Nombre / Identificador**: Mapa corporal muestra modal con silueta
- **Descripción**: El "Mapa de emociones corporal" abre un modal interactivo.
- **Precondiciones**: Ninguna.
- **Entradas**: Click en "Mapa de emociones corporal".
- **Pasos**:
  1. Abrir PsychobotPage.
  2. Click en "Mapa de emociones corporal".
  3. Observar el modal.
- **Resultados esperados**: Modal con SVG de cuerpo humano interactivo.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: PsychobotPage.
- **Prioridad**: Baja

### UI-021 — Termómetro de ánimo envía resultado al chat

- **Número**: UI-021
- **Nombre / Identificador**: Termómetro de ánimo envía resultado al chat
- **Descripción**: El widget Thermometer envía el nivel de ánimo como mensaje al chat.
- **Precondiciones**: Ninguna.
- **Entradas**: Usar el widget Thermometer.
- **Pasos**:
  1. Abrir el widget Thermometer.
  2. Seleccionar un nivel de ánimo.
  3. Observar el chat.
- **Resultados esperados**: Mensaje "Mi nivel de ánimo es X/10" se envía al chat.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: componente Thermometer.
- **Prioridad**: Baja

### UI-022 — Grounding 5-4-3-2-1 guía paso a paso

- **Número**: UI-022
- **Nombre / Identificador**: Grounding 5-4-3-2-1 guía paso a paso
- **Descripción**: El ejercicio grounding guía en 5 pasos secuenciales.
- **Precondiciones**: Ninguna.
- **Entradas**: Iniciar el grounding.
- **Pasos**:
  1. Abrir el widget Grounding.
  2. Iniciar el ejercicio.
  3. Seguir los pasos.
- **Resultados esperados**: 5 pasos secuenciales con iconos.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: componente GroundingWidget.
- **Prioridad**: Baja

### UI-023 — Desconexión de API Gemini muestra imagen Snoopy

- **Número**: UI-023
- **Nombre / Identificador**: Desconexión de API Gemini muestra imagen Snoopy triste
- **Descripción**: Cuando el bot responde con `SN00PY:SAD` se muestra la imagen Snoopy.
- **Precondiciones**: La respuesta del bot incluye `SN00PY:SAD`.
- **Entradas**: Enviar un mensaje.
- **Pasos**:
  1. Enviar un mensaje que devuelva `SN00PY:SAD`.
  2. Observar la respuesta en el chat.
- **Resultados esperados**: La imagen `sad_snoopy.png` se renderiza.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: PsychobotPage.
- **Prioridad**: Baja

### 14.6 SeguimientoPage (Aprendiz)

### UI-024 — Donut chart muestra distribución de emociones

- **Número**: UI-024
- **Nombre / Identificador**: Donut chart muestra distribución de emociones
- **Descripción**: El seguimiento muestra un donut con la distribución de emociones.
- **Precondiciones**: Usuario tiene entradas.
- **Entradas**: Ir a `/seguimiento`.
- **Pasos**:
  1. Abrir `/seguimiento`.
  2. Observar el gráfico.
- **Resultados esperados**: PieChart con 3 colores + % positivo en el centro.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: SeguimientoPage.
- **Prioridad**: Media

### UI-025 — Bar chart muestra objetivos por día

- **Número**: UI-025
- **Nombre / Identificador**: Bar chart muestra objetivos por día
- **Descripción**: El seguimiento muestra un bar chart con objetivos por día.
- **Precondiciones**: Usuario tiene objetivos.
- **Entradas**: Ir a `/seguimiento`.
- **Pasos**:
  1. Abrir `/seguimiento`.
  2. Observar el gráfico de barras.
- **Resultados esperados**: BarChart con cumplidos/no cumplidos.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: SeguimientoPage.
- **Prioridad**: Media

### UI-026 — Tabla de emociones paginada (5 por página)

- **Número**: UI-026
- **Nombre / Identificador**: Tabla de emociones paginada (5 por página)
- **Descripción**: La tabla de emociones se pagina de a 5 filas.
- **Precondiciones**: Más de 5 entradas.
- **Entradas**: Ir a `/seguimiento`.
- **Pasos**:
  1. Abrir `/seguimiento` con más de 5 entradas.
  2. Observar la tabla.
- **Resultados esperados**: Solo 5 filas visibles + paginación.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: SeguimientoPage.
- **Prioridad**: Baja

### UI-027 — Sin datos muestra mensaje vacío

- **Número**: UI-027
- **Nombre / Identificador**: Sin datos muestra mensaje vacío
- **Descripción**: Sin registros, el seguimiento muestra un mensaje vacío.
- **Precondiciones**: Ninguna.
- **Entradas**: Ir a `/seguimiento` sin datos.
- **Pasos**:
  1. Abrir `/seguimiento` sin datos.
  2. Observar la página.
- **Resultados esperados**: "No hay registros aún".
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: SeguimientoPage.
- **Prioridad**: Baja

### 14.7 PsiSeguimientoPage

### UI-028 — Lista de aprendices con promedio emocional

- **Número**: UI-028
- **Nombre / Identificador**: Lista de aprendices con promedio emocional
- **Descripción**: El psicólogo ve la lista de aprendices con su promedio.
- **Precondiciones**: Psicólogo autenticado.
- **Entradas**: Ir a `/psi-seguimiento`.
- **Pasos**:
  1. Iniciar sesión como psicólogo.
  2. Abrir `/psi-seguimiento`.
  3. Observar la tabla.
- **Resultados esperados**: Tabla con nombre, promedio y última emoción.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: PsiSeguimientoPage.
- **Prioridad**: Alta

### UI-029 — Click en aprendiz carga su gráfico e historial

- **Número**: UI-029
- **Nombre / Identificador**: Click en aprendiz carga su gráfico e historial
- **Descripción**: Al hacer click en un aprendiz se cargan su gráfico e historial.
- **Precondiciones**: Ninguna.
- **Entradas**: Click en una fila de aprendiz.
- **Pasos**:
  1. Abrir `/psi-seguimiento`.
  2. Click en una fila de aprendiz.
  3. Observar el panel.
- **Resultados esperados**: Donut chart + historial de emociones.
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: PsiSeguimientoPage.
- **Prioridad**: Media

### UI-030 — Alertas no leídas en banner rojo

- **Número**: UI-030
- **Nombre / Identificador**: Alertas no leídas se muestran en banner rojo
- **Descripción**: Las alertas no leídas aparecen en un banner rojo.
- **Precondiciones**: Existen alertas no leídas.
- **Entradas**: Ir a `/psi-seguimiento`.
- **Pasos**:
  1. Abrir `/psi-seguimiento` con alertas no leídas.
  2. Observar el banner.
- **Resultados esperados**: Banner rojo con "Alertas de Riesgo (N)".
- **Pos condiciones**: Sin cambios en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: PsiSeguimientoPage.
- **Prioridad**: Media

### UI-031 — Marcar alerta como leída la oculta

- **Número**: UI-031
- **Nombre / Identificador**: Marcar alerta como leída la oculta
- **Descripción**: Al marcar una alerta como leída, desaparece del banner.
- **Precondiciones**: Ninguna.
- **Entradas**: Click en "Leído" en una alerta.
- **Pasos**:
  1. Abrir `/psi-seguimiento`.
  2. Click en "Leído" en una alerta.
  3. Observar el banner.
- **Resultados esperados**: La alerta desaparece del banner.
- **Pos condiciones**: Alerta marcada como leída en BD.
- **Estado**: Pendiente
- **Observaciones**: Dependencia: PsiSeguimientoPage.
- **Prioridad**: Baja

---

## Resumen de Cobertura

| Módulo | Casos Feliz | Casos Error | Seguridad | UI | Total |
| --- | --- | --- | --- | --- | --- |
| Autenticación | 10 | 17 | 2 | 1 | **30** |
| Gestión Usuarios | 10 | 7 | 4 | 0 | **21** |
| Diario Emociones | 13 | 2 | 0 | 0 | **15** |
| Objetivos | 6 | 4 | 0 | 0 | **10** |
| Agenda Citas | 6 | 3 | 0 | 3 | **12** |
| Psychobot | 22 | 3 | 0 | 0 | **25** |
| Panel Psicólogo | 7 | 1 | 1 | 1 | **10** |
| Panel Admin | 0 | 0 | 0 | 4 | **4** |
| Notificaciones | 7 | 1 | 0 | 0 | **8** |
| Privacidad | 5 | 1 | 0 | 0 | **6** |
| Perfil Usuario | 5 | 2 | 4 | 3 | **14** |
| Recuperación Pass | 3 | 5 | 1 | 0 | **9** |
| Middleware/Seguridad | 0 | 0 | 7 | 0 | **7** |
| Frontend UI | 0 | 0 | 0 | 31 | **31** |
| **TOTAL** | **94** | **46** | **19** | **43** | **202** |

---

## Notas para Implementación

- **Framework de testing**: Usar **Vitest** para frontend (Vitest + React Testing Library) y backend (Vitest + Supertest).
- **Migración desde CRA/Jest**: Los tests actuales en `src/api/tests/` corren con Jest (`react-scripts test`). Al adoptar Vitest hay que crear `vitest.config.*` (con `environment: "jsdom"` para componentes y `node` para services), adaptar los mocks existentes y reemplazar el runner de CRA por `vitest`.
- **Base de datos**: Usar base de datos de prueba separada o mockear el pool de PostgreSQL.
- **Psychobot**: Mockear `generateWithRetry` y el cliente de Gemini para pruebas del chat.
- **Email**: Mockear nodemailer para pruebas de recuperación de contraseña.
- **JWT**: Usar secretos de prueba y tokens generados en tests.
- **Prioridad**: Empezar por Auth (los test de login/registro desbloquean el resto) y los services core (diary, objectives, meetings).




