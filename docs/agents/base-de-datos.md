# Base de datos

Supabase (PostgreSQL). Conexión desde el backend con `pg` Pool sobre `SUPABASE_DB_URL` (con SSL).

## Regla principal

**`supabase_schema.sql` (raíz) es la fuente canónica y única.** No hay migraciones ni ORM.

- Es **idempotente** (`CREATE TABLE IF NOT EXISTS`, etc.): se ejecuta entero en el SQL Editor de Supabase.
- Cambios de esquema = editar ese archivo y re-ejecutarlo (o aplicar el delta a mano en Supabase). No crear archivos de migración nuevos sin pedirlo.
- Incluye: 12 tablas, UNIQUE en email/documento, FKs con CASCADE y seeds.

## Convenciones

- Queries parametrizadas con `$1, $2...` (ver backend.md).
- SQL solo en `Backend/src/repositories/`.
- Diagramas de referencia: `psychoway-erd-chen.drawio/.jpg`, `entidad_relacion.png`.
