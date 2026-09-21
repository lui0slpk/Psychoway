# Git y despliegue

## Git

- **Commits**: Conventional Commits en inglés: `feat(scope): ...`, `fix(scope): ...`, `refactor scope` (ver `git log`).
- **Ramas**: cada desarrollador trabaja en su rama (`kevin-rama`, `luis-rama`, `clever-rama`, `jero-rama`...) y merges a `main` vía Pull Request. PRs hacia `main`.
- No hay CI ni hooks: la verificación es local (`pnpm test` + `pnpm --dir Backend test`) antes de abrir PR.

## Despliegue

- **Frontend → Vercel**: `Frontend/vercel.json` (está en `Frontend/`, no en la raíz como dice el README). `installCommand: pnpm install`, `buildCommand: CI=false pnpm run build`, output `Frontend/build`, rewrites SPA a `/index.html`. El `CI=false` es deliberado: CRA trata warnings de ESLint como errores fatales cuando `CI=true`.
- **Backend → Render**: sin config en repo.
- **Docker**: `docker-compose.yml` (raíz) levanta backend (`Backend/Dockerfile`, `env_file: Backend/.env`, puerto 5000) y frontend (`Frontend/Dockerfile` + `Frontend/nginx.conf`, puerto 3000→80). Útil como referencia de arranque en producción.
