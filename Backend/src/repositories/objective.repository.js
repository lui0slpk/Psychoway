import { query, execute } from "../config/database.js";

/**
 * Crea un nuevo objetivo.
 */
export async function create(userId, nombre, descripcion, estado) {
  const result = await execute(
    `INSERT INTO objetivos (id_user, nombre_objetivo, descripcion, estado, last_update)
     VALUES (?, ?, ?, ?, NOW())`,
    [userId, nombre, descripcion || null, estado || "Pendiente"],
  );
  return result.insertId;
}

/**
 * Obtiene los objetivos de un usuario.
 */
export async function findByUserId(userId) {
  return query(
    `SELECT id_objetives, nombre_objetivo, descripcion, estado, last_update
     FROM objetivos WHERE id_user = ?
     ORDER BY last_update DESC`,
    [userId],
  );
}

/**
 * Actualiza un objetivo.
 */
export async function update(id, nombre, descripcion, estado) {
  const result = await execute(
    `UPDATE objetivos 
     SET nombre_objetivo = ?, descripcion = ?, estado = ?, last_update = NOW()
     WHERE id_objetives = ?`,
    [nombre, descripcion, estado, id],
  );
  return result.affectedRows > 0;
}

/**
 * Elimina un objetivo.
 */
export async function deleteById(id) {
  const result = await execute(
    "DELETE FROM objetivos WHERE id_objetives = ?",
    [id],
  );
  return result.affectedRows > 0;
}

/**
 * Obtiene el último objetivo creado (para asociar a entradas de diario).
 */
export async function findLatest() {
  const rows = await query(
    "SELECT id_objetives FROM objetivos ORDER BY last_update DESC LIMIT 1",
  );
  return rows.length > 0 ? rows[0].id_objetives : null;
}
