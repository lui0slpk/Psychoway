# Testing

Ambos paquetes usan **Vitest** con su propio `vitest.config.js`. No hay tests de integración que toquen servicios reales.

## Frontend (`pnpm --dir Frontend test`)

- Entorno `jsdom`, Testing Library, `globals: true`, setup en `src/tests/setup.js`.
- **Los tests viven en `src/tests/`** (auth, components, pages).
- `src/api/tests/*.test.js` (tests de los módulos `src/api/`) sí corren con `pnpm test` — están en el `include` de `vitest.config.js`.
- **Convención obligatoria en tests: usar `vi.*` (Vitest), nunca `jest.*`.** Estos tests fueron escritos originalmente para Jest y migrados (`jest.fn()` → `vi.fn()`, `jest.restoreAllMocks()` → `vi.restoreAllMocks()`); `jest` no existe como global y explota con `ReferenceError`.
- Nota de comportamiento de Vitest: ni el filtro posicional ni `--dir` escapan del `include` del config — un test fuera de los patrones de `include` simplemente no existe para el runner.
- Alias `@` → `/src` disponible solo en tests.

## Backend (`pnpm --dir Backend test`)

- Entorno `node`, `pool: 'forks'`, tests en `Backend/tests/` por dominio (auth, diary, meetings, users, validators, security, etc.).
- `tests/setup.js` define env vars falsas **antes** de importar módulos — necesario porque `config/environment.js` lanza FATAL en import time si falta `JWT_SECRET`/`SUPABASE_*`. Si escribes un test nuevo que importe config, el setup ya lo cubre; no cargues `.env` real en tests.
- **Los tests no tocan la base de datos real** (mock de repositorios/DB). Mantener esa regla: el comentario del config lo dice explícito.

## Casos de prueba del dominio

`docs/casos_preuba_manual.md` y `docs/casos_prueba_automaticos.md` documentan el plan de pruebas del proyecto (referencia funcional, no corre nada solo).
