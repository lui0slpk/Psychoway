import { query, execute } from "../config/database.js";

/**
 * Verifica si un horario está ocupado para un profesional.
 */
export async function isSlotTaken(professionalId, day, hour) {
  const rows = await query(
    "SELECT * FROM meetings_agenda WHERE id_professional = ? AND day = ? AND hour = ?",
    [professionalId, day, hour],
  );
  return rows.length > 0;
}

/**
 * Crea una nueva cita.
 */
export async function create(userId, professionalId, day, hour, description) {
  const result = await execute(
    `INSERT INTO meetings_agenda (id_user, id_professional, day, hour, descripcion, last_update)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [userId, professionalId, day, hour, description || ""],
  );
  return result.insertId;
}

/**
 * Obtiene la agenda ocupada de un psicólogo.
 */
export async function findByProfessionalId(professionalId) {
  return query(
    "SELECT day, hour FROM meetings_agenda WHERE id_professional = ?",
    [professionalId],
  );
}

/**
 * Obtiene el historial de citas de un usuario (aprendiz).
 */
export async function findByUserId(userId) {
  return query(
    `SELECT 
       m.id_meetings_agenda, m.day, m.hour, m.descripcion,
       u.names as prof_names, u.last_names as prof_last_names
     FROM meetings_agenda m
     LEFT JOIN users u ON m.id_professional = u.id_user
     WHERE m.id_user = ?
     ORDER BY m.day DESC, m.hour ASC`,
    [userId],
  );
}

/**
 * Obtiene el historial de citas de un profesional.
 */
export async function findByProfessionalHistory(professionalId) {
  return query(
    `SELECT 
       m.id_meetings_agenda, m.day, m.hour, m.descripcion,
       u.names as apprentice_names, u.last_names as apprentice_last_names,
       u.document as apprentice_document
     FROM meetings_agenda m
     LEFT JOIN users u ON m.id_user = u.id_user
     WHERE m.id_professional = ?
     ORDER BY m.day DESC, m.hour ASC`,
    [professionalId],
  );
}
