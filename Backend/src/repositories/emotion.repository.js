import { query, execute } from "../config/database.js";

/**
 * Busca una emoción por nombre.
 */
export async function findByName(name) {
  const rows = await query(
    "SELECT id_emotions FROM emotions WHERE emot_name = $1",
    [name],
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Crea una nueva emoción.
 */
export async function create(name, state) {
  const result = await execute(
    "INSERT INTO emotions (emot_name, emot_estado) VALUES ($1, $2) RETURNING id_emotions",
    [name, state],
  );
  return result.rows[0].id_emotions;
}

/**
 * Obtiene todas las emociones.
 */
export async function findAll() {
  return query("SELECT id_emotions, emot_name, emot_estado FROM emotions");
}
