import { query, execute } from "../config/database.js";

/**
 * Verifica si un horario está ocupado para un profesional.
 */
export async function isSlotTaken(professionalId, day, hour) {
  const rows = await query(
    "SELECT id_meetings_agenda FROM meetings_agenda WHERE id_professional = $1 AND day = $2 AND hour = $3",
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
     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id_meetings_agenda`,
    [userId, professionalId, day, hour, description || ""],
  );
  return result.rows[0].id_meetings_agenda;
}

/**
 * Obtiene la agenda ocupada de un psicólogo.
 */
export async function findByProfessionalId(professionalId) {
  return query(
    "SELECT day, hour FROM meetings_agenda WHERE id_professional = $1",
    [professionalId],
  );
}

/**
 * Obtiene el historial de citas de un usuario (aprendiz).
 */
export async function findByUserId(userId) {
  return query(
    `SELECT 
       m.id_meetings_agenda, m.day, m.hour, m.descripcion, m.asistencia,
       u.names as prof_names, u.last_names as prof_last_names
     FROM meetings_agenda m
     LEFT JOIN users u ON m.id_professional = u.id_user
     WHERE m.id_user = $1
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
       m.id_meetings_agenda, m.day, m.hour, m.descripcion, m.asistencia,
       u.names as apprentice_names, u.last_names as apprentice_last_names,
       u.document as apprentice_document
     FROM meetings_agenda m
     LEFT JOIN users u ON m.id_user = u.id_user
     WHERE m.id_professional = $1
     ORDER BY m.day DESC, m.hour ASC`,
    [professionalId],
  );
}

/**
 * Actualiza la asistencia de una cita.
 */
export async function updateAttendance(meetingId, asistencia) {
  return execute(
    "UPDATE meetings_agenda SET asistencia = $1, last_update = NOW() WHERE id_meetings_agenda = $2",
    [asistencia, meetingId],
  );
}
