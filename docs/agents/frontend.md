# Frontend (`Frontend/`)

React 19 con **Create React App** (`react-scripts`, puerto 3000). Importante: CRA para dev/build, pero **Vitest para tests** — no confundir (ver testing.md).

## Estructura

| Directorio | Qué tiene |
|---|---|
| `src/api/` | Módulos de consumo del backend: `client.js` (fetch + `ApiError`), `config.js` (URLs), `*.api.js` por dominio, `index.js` (barrel) |
| `src/pages/` | Organizadas por rol: `aprendiz/`, `psicologo/`, `administrador/` |
| `src/components/` | Reutilizables (`ProtectedRoute.jsx`, charts) |
| `src/context/` | `AuthContext` — única fuente de verdad de sesión |
| `src/layouts/` | `MainLayout`, Navbar, Sidebar, Footer |
| `src/utils/` | `alerts.js` (SweetAlert2) |

## Reglas concretas

- **Nunca hacer `fetch` directo** desde componentes: pasar por el módulo correspondiente en `src/api/`. El `client.js` ya inyecta el JWT desde `localStorage` y normaliza errores en `ApiError`.
- Base URL: `API_BASE` en `src/api/config.js` (`REACT_APP_API_URL` o `http://localhost:5000`). `API_URL` = base + `/api` (rutas protegidas), `PUBLIC_URL` = base (login/register).
- Sesión: leer `AuthContext`; no tocar `localStorage` en componentes.
- Alertas al usuario: SweetAlert2 vía `src/utils/alerts.js`.
- Alias `@` → `/src` existe **solo en Vitest** (`vitest.config.js`), no en CRA. En código de producción usar imports relativos.
- UI: Bootstrap 5 + Bootstrap Icons + Framer Motion + Recharts + Lucide. No agregar otra librería de componentes.
- Build de producción: `pnpm --dir Frontend build`. En Vercel se corre con `CI=false` porque CRA convierte warnings de ESLint en errores fatales en CI.
