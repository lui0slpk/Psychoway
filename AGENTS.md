# AGENTS.md — Psychoway

Plataforma de apoyo psicológico para aprendices SENA. Monorepo pnpm con React (CRA) + Express 5 + Supabase.

## Comandos esenciales

| Comando | Qué hace |
|---|---|
| `pnpm install` | Instala ambos paquetes (workspace) |
| `pnpm start` | Frontend (3000) + Backend (5000) juntos |
| `pnpm run frontend` / `pnpm run server` | Cada uno por separado |
| `pnpm test` | **Solo tests del Frontend** |
| `pnpm --dir Backend test` | Tests del Backend (no hay script raíz) |
| `pnpm --dir Frontend test` | Tests del Frontend (Vitest) |
| `pnpm --dir Frontend build` | Build de producción (CRA) |

## ⚠️ Trampas verificadas (el README miente aquí)

1. **El `.env` va en `Backend/`, no en la raíz.** `Backend/src/config/environment.js` llama `dotenv.config()` sin path → lee el `.env` del directorio de trabajo. Como el backend arranca con `pnpm --dir Backend start`, el cwd es `Backend/`. El README y el comentario del archivo dicen "raíz": **son incorrectos**. Además `docker-compose.yml` usa `Backend/.env`.
2. **`config/environment.js` lanza FATAL en import time** si faltan `JWT_SECRET`, `SUPABASE_URL` o `SUPABASE_DB_URL`. Cualquier script/test que importe la config necesita esas variables definidas primero.
3. **El README dice que `pnpm test` corre "los módulos API"**: hoy sí es cierto (el `include` de `Frontend/vitest.config.js` cubre `src/api/tests/`), pero esos tests venían escritos para Jest y fueron migrados a Vitest (`jest.*` → `vi.*`). Si agregás tests de API nuevos, usá `vi.*`, nunca `jest.*`.

## Documentación detallada por tema

- [Comandos y setup](docs/agents/comandos-y-setup.md)
- [Arquitectura](docs/agents/arquitectura.md)
- [Backend](docs/agents/backend.md)
- [Frontend](docs/agents/frontend.md)
- [Testing](docs/agents/testing.md)
- [Base de datos](docs/agents/base-de-datos.md)
- [Git y despliegue](docs/agents/git-y-despliegue.md)

## Convenciones rápidas

- **Idioma del dominio**: código y comentarios en español (rutas, tablas, páginas: `diary`, `aprendiz`, `psicologo` conviven — es histórico, no unificar sin pedirlo).
- **Commits**: Conventional Commits en inglés (`feat(scope): ...`, ver `git log`).
- **Backend es ESM puro** (`"type": "module"`): imports con extensión `.js` explícita, sin `require`.
- **SQL siempre parametrizado** (`$1, $2...`) — nunca interpolar strings en queries.
