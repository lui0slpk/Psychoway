# Backend (`Backend/`)

Express 5 + `pg`. **ESM puro** (`"type": "module"`): todos los imports locales llevan extensión `.js` explícita. No usar `require` ni CommonJS.

## Estructura

| Directorio | Responsabilidad |
|---|---|
| `src/routes/` | Definición de endpoints por dominio; `index.js` centraliza todo |
| `src/controllers/` | req/res, códigos HTTP |
| `src/services/` | Lógica de negocio |
| `src/repositories/` | Queries SQL (único lugar donde vive SQL) |
| `src/middlewares/` | `auth.middleware.js` (JWT), `error.middleware.js` (handler centralizado) |
| `src/config/` | `environment.js` (env + validación), `database.js` (pool pg), `gemini.js` |
| `src/utils/` | `validators.js` (email, documento, doc_type), constantes |

## Reglas concretas

- **SQL siempre parametrizado** con placeholders `$1, $2...`. Jamás interpolar strings.
- El pool de conexiones está en `config/database.js` — no crear nuevos `Pool`/`Client` por repositorio.
- Errores: lanzar y dejar que `errorHandler` (último middleware de `server.js`) responda; no hacer `res.status(500)` disperso.
- Validación de entrada en `utils/validators.js`, no ad-hoc en cada controller.
- `express.json({ limit: "10mb" })` ya está montado globalmente (necesario para payloads con imágenes/base64).
- CORS ya configurado con `FRONTEND_URL` y `credentials: true`.

## Arranque

- `pnpm --dir Backend start` (node) o `pnpm --dir Backend dev` (nodemon).
- Al arrancar ejecuta `testConnection()` contra Supabase: si la DB no responde, el server no levanta.
