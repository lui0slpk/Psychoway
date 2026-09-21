# Arquitectura

Monorepo pnpm workspace: `Frontend/` (React SPA, CRA) + `Backend/` (Express 5, ESM). Base de datos: Supabase (PostgreSQL) vía `pg` con connection string.

## Modelo de capas del backend

```
routes → controllers → services → repositories → (pg, SQL parametrizado)
```

- `routes/` solo define endpoints y middlewares; sin lógica.
- `controllers/` manejan req/res.
- `services/` contienen la lógica de negocio.
- `repositories/` son los únicos que tocan SQL.
- Al agregar una feature: respetar esta cadena, no saltarse capas.

## Entry points

- Backend: `Backend/server.js` → monta `src/routes/index.js` y el `errorHandler` (debe ser el último middleware).
- Frontend: `Frontend/src/index.js` → `App.js` define todas las rutas.

## Autenticación y autorización

- JWT Bearer. El frontend guarda el token en `localStorage` con la clave `psychoway_token` (`Frontend/src/api/config.js`).
- En `routes/index.js`: las rutas públicas (`/login`, `/register`, `/api/password/*`) se definen **antes** de `router.use("/api", authMiddleware)`. Todo lo que esté bajo `/api/*` después de esa línea ya viene protegido — no re-agregar `authMiddleware` por ruta.
- Autorización por rol en `middlewares/`: `requireRole` / `requireAdmin`.
- Roles del sistema: `aprendiz`, `psicologo`, `administrador`. El frontend organiza `src/pages/` por rol (`aprendiz/`, `psicologo/`, `administrador/`) y protege rutas con `components/ProtectedRoute.jsx`.

## Servicios externos

- **Google Gemini** (`@google/genai`): chat Psychobot. Config en `Backend/src/config/gemini.js`.
- **Nodemailer**: recuperación de contraseña y notificaciones por email.
- Ambos fallan en runtime si faltan sus env vars (el server igual arranca).

## Docs de diseño existentes

- `ARCHITECTURE.puml` (diagrama PlantUML), `psychoway-erd-chen.*` (modelo Chen), `entidad_relacion.png`.
- `docs/` tiene manuales de usuario/técnico y casos de prueba (material del proyecto académico, útil como referencia de dominio, no como spec ejecutable).
