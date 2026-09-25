# API Reference - mysqlwithjpa REST Microservice

**Base URL:** `http://localhost:8080` (dev) | `https://api.tudominio.com` (prod)  
**Auth:** JWT Bearer Token (HS256) - Header `Authorization: Bearer <token>`  
**Content-Type:** `application/json`  
**CORS:** `http://localhost:3000`, `https://psychoway.vercel.app`

---

## Autenticación

| Aspecto | Detalle |
|---------|---------|
| **Método** | JWT Bearer Token en header `Authorization: Bearer <token>` |
| **Emisor** | Express.js (POST `/api/auth/login`) |
| **Validador** | Spring Boot (filtro `JwtValidationFilter`) |
| **Algoritmo** | HS256 (shared secret `JWT_SECRET`) |
| **Clock Skew** | 60 segundos |
| **Claims esperados** | `userId` (number), `role` (string), `document` (string), `exp`, `iat` |
| **Roles mapeados** | `"administrador"` → `ROLE_ADMINISTRADOR`, `"psicologo"` → `ROLE_PSICOLOGO`, `"aprendiz"` → `ROLE_APRENDIZ` |
| **Expiración** | 1 hora (3600000 ms) - gestionada por Express.js |

> **Importante:** Spring Boot **NO tiene endpoint de login**. El login se hace en Express.js, que emite el JWT. Spring solo valida.

---

## Códigos de Error Estándar

| Código | Significado | Cuerpo de Respuesta |
|--------|-------------|---------------------|
| `200` | OK | Datos solicitados |
| `201` | Created | Recurso creado |
| `204` | No Content | Sin cuerpo (DELETE exitoso) |
| `400` | Bad Request | Errores de validación (ver formato abajo) |
| `401` | Unauthorized | Token faltante, inválido o expirado |
| `403` | Forbidden | Token válido pero sin permisos (rol insuficiente) |
| `404` | Not Found | Recurso no existe |
| `409` | Conflict | Duplicado (document/email ya existe) |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Internal Server Error | Error interno |

### Formato de Error (400, 401, 403, 404, 409, 500)

```json
{
  "timestamp": "2026-09-20T20:30:00.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/users",
  "details": [
    { "field": "email", "message": "Email inválido" },
    { "field": "document", "message": "El documento ya existe" }
  ]
}
```

### Error 429 (Rate Limit)

```json
{
  "timestamp": "2026-09-20T20:30:00.123Z",
  "status": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded",
  "path": "/api/users",
  "retryAfterSeconds": 45
}
```

**Headers de Rate Limit:**
- `X-RateLimit-Limit: 100`
- `X-RateLimit-Remaining: 0`
- `X-RateLimit-Reset: 1726945200`
- `Retry-After: 45`

---

## Endpoints

---

### 1. Health Check (Público)

#### `GET /actuator/health`

Verifica estado de la aplicación y dependencias.

**Auth:** ❌ No requerida  
**Rate Limit:** ❌ Excluido

**Response 200:**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL (Supabase)",
        "url": "jdbc:postgresql://db.gokhnbphdmanstwprxqm.supabase.co:5432/postgres",
        "responseTimeMs": 45
      }
    },
    "mongo": {
      "status": "UP",
      "details": {
        "database": "MongoDB",
        "databaseName": "mysqlwithjpa",
        "responseTimeMs": 32
      }
    },
    "ping": { "status": "UP" }
  }
}
```

---

### 2. Catálogo de Roles (Solo ADMINISTRADOR)

#### `GET /api/roles`

Obtiene lista de roles disponibles para asignación.

**Auth:** ✅ Requerida (`ROLE_ADMINISTRADOR`)  
**Rate Limit:** ✅ 100 req/min

**Response 200:**
```json
[
  { "idRol": 1, "nombreRol": "Aprendiz" },
  { "idRol": 2, "nombreRol": "Psicologo" },
  { "idRol": 3, "nombreRol": "Administrador" }
]
```

**Errors:**
- `401` - Token faltante/inválido
- `403` - Rol no es ADMINISTRADOR

---

### 3. Gestión de Usuarios (Solo ADMINISTRADOR)

#### `GET /api/users`

Lista paginada con filtros opcionales.

**Auth:** ✅ Requerida (`ROLE_ADMINISTRADOR`)  
**Rate Limit:** ✅ 100 req/min

**Query Parameters:**

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | integer | `0` | Número de página (0-indexed) |
| `size` | integer | `20` | Elementos por página (máx 100) |
| `document` | string | - | Filtro exacto por documento |
| `email` | string | - | Filtro exacto por email |
| `names` | string | - | Filtro parcial por nombres |
| `lastNames` | string | - | Filtro parcial por apellidos |
| `idRol` | integer | - | Filtro exacto por rol (1, 2, 3) |

**Ejemplo:** `GET /api/users?page=0&size=20&email=juan@email.com&idRol=1`

**Response 200:**
```json
{
  "content": [
    {
      "idUser": 1,
      "document": "1234567890",
      "docType": "CC",
      "names": "Juan Carlos",
      "lastNames": "Pérez Gómez",
      "birthDate": "2000-01-15",
      "email": "juan@email.com",
      "idRol": 1,
      "nombreRol": "Aprendiz",
      "profilePhoto": "https://cdn.example.com/photo.jpg",
      "contactNumber": "3001234567",
      "landlineNumber": "6012345678",
      "trainingProgram": "Psicología",
      "fichaNumber": "1234567",
      "lastUpdate": "2026-09-20T10:30:00"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 150,
  "totalPages": 8,
  "first": true,
  "last": false
}
```

**Errors:**
- `400` - `size > 100` o parámetros inválidos
- `401` / `403` - Auth/permisos

---

#### `GET /api/users/{id}`

Obtiene un usuario por ID.

**Auth:** ✅ Requerida (`ROLE_ADMINISTRADOR`)  
**Rate Limit:** ✅ 100 req/min

**Path Parameter:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID del usuario (PK) |

**Response 200:**
```json
{
  "idUser": 1,
  "document": "1234567890",
  "docType": "CC",
  "names": "Juan Carlos",
  "lastNames": "Pérez Gómez",
  "birthDate": "2000-01-15",
  "email": "juan@email.com",
  "idRol": 1,
  "nombreRol": "Aprendiz",
  "profilePhoto": "https://cdn.example.com/photo.jpg",
  "contactNumber": "3001234567",
  "landlineNumber": "6012345678",
  "trainingProgram": "Psicología",
  "fichaNumber": "1234567",
  "lastUpdate": "2026-09-20T10:30:00"
}
```

**Errors:**
- `404` - Usuario no encontrado
- `401` / `403` - Auth/permisos

---

#### `POST /api/users`

Crea un nuevo usuario.

**Auth:** ✅ Requerida (`ROLE_ADMINISTRADOR`)  
**Rate Limit:** ✅ 100 req/min  
**Validación:** `CreateGroup` (todos los campos requeridos)

**Request Body:**
```json
{
  "document": "1234567890",
  "docType": "CC",
  "names": "Juan Carlos",
  "lastNames": "Pérez Gómez",
  "birthDate": "2000-01-15",
  "email": "juan@email.com",
  "password": "secret123",
  "idRol": 1,
  "profilePhoto": "https://cdn.example.com/photo.jpg",
  "contactNumber": "3001234567",
  "landlineNumber": "6012345678",
  "trainingProgram": "Psicología",
  "fichaNumber": "1234567"
}
```

**Validaciones (CreateGroup):**

| Campo | Reglas |
|-------|--------|
| `document` | Requerido, máx 15 chars, único, alfanumérico |
| `docType` | Requerido, valores: `CC`, `TI`, `CE`, `PP`, `PPT`, `NIT` |
| `names` | Requerido, 3-100 chars, solo letras y espacios |
| `lastNames` | Requerido, 3-100 chars, solo letras y espacios |
| `birthDate` | Requerido, fecha pasada (ISO: `YYYY-MM-DD`) |
| `email` | Requerido, formato email válido, máx 100, único |
| `password` | Requerido, mín 8 chars |
| `idRol` | Requerido, debe existir (1, 2, 3) |
| `profilePhoto` | Opcional, URL válida, máx 500 chars |
| `contactNumber` | Opcional, máx 20 chars |
| `landlineNumber` | Opcional, máx 20 chars |
| `trainingProgram` | Opcional, máx 100 chars |
| `fichaNumber` | Opcional, máx 20 chars |

**Response 201:**
```json
{
  "idUser": 1,
  "document": "1234567890",
  "docType": "CC",
  "names": "Juan Carlos",
  "lastNames": "Pérez Gómez",
  "birthDate": "2000-01-15",
  "email": "juan@email.com",
  "idRol": 1,
  "nombreRol": "Aprendiz",
  "profilePhoto": "https://cdn.example.com/photo.jpg",
  "contactNumber": "3001234567",
  "landlineNumber": "6012345678",
  "trainingProgram": "Psicología",
  "fichaNumber": "1234567",
  "lastUpdate": "2026-09-20T10:30:00"
}
```

**Errors:**
- `400` - Validación fallida (ver `details` por campo)
- `409` - `document` o `email` ya existen
- `401` / `403` - Auth/permisos

---

#### `PUT /api/users/{id}`

Actualiza un usuario existente.

**Auth:** ✅ Requerida (`ROLE_ADMINISTRADOR`)  
**Rate Limit:** ✅ 100 req/min  
**Validación:** `UpdateGroup` (campos opcionales, validados si se envían)

**Path Parameter:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID del usuario a actualizar |

**Request Body (todos opcionales):**
```json
{
  "document": "1234567890",
  "docType": "CC",
  "names": "Juan Carlos",
  "lastNames": "Pérez Gómez",
  "birthDate": "2000-01-15",
  "email": "juan@email.com",
  "password": "newSecret123",
  "idRol": 2,
  "profilePhoto": "https://cdn.example.com/new-photo.jpg",
  "contactNumber": "3001234567",
  "landlineNumber": "6012345678",
  "trainingProgram": "Psicología Clínica",
  "fichaNumber": "1234567"
}
```

**Reglas de Actualización:**
- Campos no enviados → **no se modifican**
- `password` → solo se actualiza si se envía (se hashea con BCrypt)
- `document` / `email` → validan unicidad **solo si cambian**
- `idRol` → debe existir en BD
- `document` en body → **se ignora si no coincide con el path** (400 si difiere)

**Response 200:**
```json
{
  "idUser": 1,
  "document": "1234567890",
  "docType": "CC",
  "names": "Juan Carlos",
  "lastNames": "Pérez Gómez",
  "birthDate": "2000-01-15",
  "email": "juan@email.com",
  "idRol": 2,
  "nombreRol": "Psicologo",
  "profilePhoto": "https://cdn.example.com/new-photo.jpg",
  "contactNumber": "3001234567",
  "landlineNumber": "6012345678",
  "trainingProgram": "Psicología Clínica",
  "fichaNumber": "1234567",
  "lastUpdate": "2026-09-20T11:15:00"
}
```

**Errors:**
- `400` - Validación o `document` en body no coincide con path
- `404` - Usuario no encontrado
- `409` - `document` o `email` nuevo ya existe en otro usuario
- `401` / `403` - Auth/permisos

---

#### `DELETE /api/users/{id}`

Elimina un usuario (borrado físico).

**Auth:** ✅ Requerida (`ROLE_ADMINISTRADOR`)  
**Rate Limit:** ✅ 100 req/min

**Path Parameter:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID del usuario a eliminar |

**Response 204:** Sin cuerpo

**Errors:**
- `404` - Usuario no encontrado
- `401` / `403` - Auth/permisos

---

## Resumen de Permisos

| Endpoint | Método | Roles Permitidos |
|----------|--------|------------------|
| `/actuator/health` | GET | Público |
| `/actuator/info` | GET | Público |
| `/api/roles` | GET | `ROLE_ADMINISTRADOR` |
| `/api/users` | GET | `ROLE_ADMINISTRADOR` |
| `/api/users/{id}` | GET | `ROLE_ADMINISTRADOR` |
| `/api/users` | POST | `ROLE_ADMINISTRADOR` |
| `/api/users/{id}` | PUT | `ROLE_ADMINISTRADOR` |
| `/api/users/{id}` | DELETE | `ROLE_ADMINISTRADOR` |

---

## Rate Limiting

| Límite | Valor |
|--------|-------|
| Requests por minuto | 100 por IP |
| Burst inicial | 20 tokens |
| Ventana | 1 minuto (sliding) |
| Key Resolver | IP real (`X-Forwarded-For` → `remoteAddr`) |
| Excluidos | `/actuator/health`, `/actuator/info` |

---

## Headers de Respuesta Comunes

| Header | Descripción |
|--------|-------------|
| `X-Request-ID` | UUID único por request (para tracing) |
| `X-RateLimit-Limit` | Límite total (100) |
| `X-RateLimit-Remaining` | Tokens restantes |
| `X-RateLimit-Reset` | Timestamp Unix de reset |
| `Retry-After` | Segundos hasta reset (solo 429) |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Content-Security-Policy` | `default-src 'self'` |

---

## Ejemplos de Uso (curl)

```bash
# Health check
curl http://localhost:8080/actuator/health

# Listar roles (con token)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/roles

# Listar usuarios paginados
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/api/users?page=0&size=10&email=juan"

# Crear usuario
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"document":"1234567890","docType":"CC","names":"Juan","lastNames":"Pérez","birthDate":"2000-01-15","email":"juan@test.com","password":"secret123","idRol":1}' \
  http://localhost:8080/api/users

# Actualizar usuario
curl -X PUT -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"names":"Juan Carlos","idRol":2}' \
  http://localhost:8080/api/users/1

# Eliminar usuario
curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/users/1
```

---

## Modelo de Datos (Referencia)

### User (Tabla `users`)

| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id_user` | SERIAL | PK |
| `document` | VARCHAR(15) | UNIQUE, NOT NULL |
| `doc_type` | VARCHAR | NOT NULL |
| `names` | VARCHAR | NOT NULL |
| `last_names` | VARCHAR | NOT NULL |
| `birth_date` | DATE | NOT NULL |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL |
| `password` | VARCHAR(255) | NOT NULL (BCrypt) |
| `contact_number` | VARCHAR | NULLABLE |
| `landline_number` | VARCHAR | NULLABLE |
| `training_program` | VARCHAR | NULLABLE |
| `ficha_number` | VARCHAR | NULLABLE |
| `id_rol` | INTEGER | FK → rol.id_rol, NOT NULL |
| `profile_photo` | TEXT | NULLABLE |
| `reset_token` | VARCHAR | NULLABLE |
| `reset_token_expires` | TIMESTAMP | NULLABLE |
| `last_update` | TIMESTAMP | DEFAULT NOW() |

### Rol (Tabla `rol`)

| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id_rol` | SERIAL | PK |
| `nombre_rol` | VARCHAR(45) | NULLABLE |

**Datos semilla:**
| id_rol | nombre_rol |
|--------|------------|
| 1 | Aprendiz |
| 2 | Psicologo |
| 3 | Administrador |

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2026-09-20 | Release inicial - CRUD usuarios, roles, JWT validation, rate limiting, logging MongoDB |

---

*Generado automáticamente desde especificación SDD - mysqlwithjpa v1.0.0*