import { query, execute } from "../config/database.js";

/**
 * Busca el diario de un usuario.
 */
export async function findByUserId(userId) {
  const rows = await query("SELECT id_diary FROM diary WHERE id_user = ?", [
    userId,
  ]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Crea un nuevo diario para un usuario.
 */
export async function create(userId) {
  const result = await execute(
    "INSERT INTO diary (id_user, fecha) VALUES (?, CURDATE())",
    [userId],
  );
  return result.insertId;
}

/**
 * Crea un diario con visibilidad personalizada.
 */
export async function createWithVisibility(userId, visibility) {
  const result = await execute(
    "INSERT INTO diary (id_user, fecha, diary_visibility) VALUES (?, CURDATE(), ?)",
    [userId, visibility],
  );
  return result.insertId;
}

/**
 * Crea una entrada de diario.
 */
export async function createEntry(diaryId, description, emotionId, objectiveId = null) {
  const result = await execute(
    `INSERT INTO diary_entries (id_diary, entry_date, description, id_emotions, id_objetives)
     VALUES (?, NOW(), ?, ?, ?)`,
    [diaryId, description || null, emotionId, objectiveId],
  );
  return result.insertId;
}

/**
 * Obtiene las entradas de diario de un usuario.
 */
export async function getEntriesByUserId(userId) {
  return query(
    `SELECT 
       de.id_diary_entries, de.entry_date, de.description,
       e.emot_name, e.emot_estado,
       o.nombre_objetivo, o.estado as objetivo_estado
     FROM diary_entries de
     INNER JOIN diary d ON de.id_diary = d.id_diary
     LEFT JOIN emotions e ON de.id_emotions = e.id_emotions
     LEFT JOIN objetivos o ON de.id_objetives = o.id_objetives
     WHERE d.id_user = ?
     ORDER BY de.entry_date DESC`,
    [userId],
  );
}

/**
 * Obtiene la visibilidad del diario de un usuario.
 */
export async function getVisibility(userId) {
  const rows = await query(
    "SELECT diary_visibility FROM diary WHERE id_user = ?",
    [userId],
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Actualiza la visibilidad del diario.
 */
export async function updateVisibility(userId, visibility) {
  const result = await execute(
    "UPDATE diary SET diary_visibility = ? WHERE id_user = ?",
    [visibility, userId],
  );
  return result.affectedRows > 0;
}

/**
 * Obtiene entradas recientes del diario (para el chatbot).
 */
export async function getRecentEntries(userId, limit = 5) {
  return query(
    `SELECT de.description, e.emot_name, de.entry_date
     FROM diary_entries de
     JOIN diary d ON de.id_diary = d.id_diary
     JOIN emotions e ON de.id_emotions = e.id_emotions
     WHERE d.id_user = ?
     ORDER BY de.entry_date DESC LIMIT ?`,
    [userId, limit],
  );
}

/**
 * Obtiene entradas del diario de los últimos 7 días (para resumen semanal).
 */
export async function getWeeklyEntries(userId) {
  return query(
    `SELECT de.description, e.emot_name, de.entry_date
     FROM diary_entries de
     JOIN diary d ON de.id_diary = d.id_diary
     JOIN emotions e ON de.id_emotions = e.id_emotions
     WHERE d.id_user = ? AND de.entry_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    [userId],
  );
}
