# Comandos y setup

## Setup inicial

```bash
pnpm install          # instala el workspace completo (raíz + Frontend + Backend)
# Copiar Backend/.env (las variables están documentadas abajo)
# Ejecutar supabase_schema.sql en el SQL Editor de Supabase (una sola vez, es idempotente)
pnpm start            # levanta todo
```

## Variables de entorno

Van en **`Backend/.env`** (ver trampa #1 en el AGENTS.md raíz). Requeridas o el backend explota al arrancar:

- `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_DB_URL` → obligatorias (throw FATAL si faltan)
- `GEMINI_API_KEY`, `EMAIL_USER`, `EMAIL_PASS` → el server arranca sin ellas pero Psychobot/email fallan en runtime
- `PORT` (default 5000), `FRONTEND_URL` (default `http://localhost:3000`)
- `EMAIL_HOST` (default `smtp.gmail.com`), `EMAIL_PORT` (default 465), `EMAIL_SECURE`

Frontend: `REACT_APP_API_URL` (default `http://localhost:5000`) — prefijo `REACT_APP_` obligatorio porque es CRA.

## Comandos por paquete

| Tarea | Comando |
|---|---|
| Dev completo | `pnpm start` (usa `concurrently`) |
| Solo backend con reload | `pnpm --dir Backend dev` (nodemon) |
| Tests frontend | `pnpm --dir Frontend test` |
| Tests backend | `pnpm --dir Backend test` |
| Un solo test | `pnpm --dir <Backend\|Frontend> exec vitest run <ruta/al.test.js>` |
| Coverage | `pnpm --dir Frontend exec vitest run --coverage` (v8) |

## Herramientas que NO existen (no las busques)

- **No hay ESLint/Prettier standalone** — solo el `eslintConfig` embebido de `react-scripts`.
- **No hay CI/CD en el repo** (sin `.github/workflows`).
- **No hay migraciones** — el esquema es un único `supabase_schema.sql` ejecutado a mano.
- `pnpm` es el gestor de paquetes del monorepo; existe un `Backend/package-lock.json` heredado, ignorarlo.
- `pnpm-workspace.yaml` tiene `allowBuilds` para `bcrypt`, `@google/genai`, `core-js`, `protobufjs` — necesario para que esos builds nativos no fallen en install.
