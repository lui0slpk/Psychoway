import { query, execute } from "../config/database.js";

/**
 * Cuenta alertas por día en un rango de fechas.
 * @param {Date} startDate - Fecha inicio (inclusive)
 * @param {Date} endDate - Fecha fin (exclusive)
 * @returns {Promise<Array>} Filas con date, count, unread
 */
export async function countAlertsByDay(startDate, endDate) {
  return query(
    `SELECT DATE(timestamp) as date, COUNT(*) as count, 
            COUNT(*) FILTER (WHERE leido = FALSE) as unread
     FROM psychologist_alerts
     WHERE timestamp >= $1 AND timestamp < $2
     GROUP BY DATE(timestamp)
     ORDER BY date`,
    [startDate, endDate]
  );
}

/**
 * Cuenta reuniones por día en un rango de fechas, opcionalmente filtrado por profesional.
 * @param {Date} startDate - Fecha inicio (inclusive)
 * @param {Date} endDate - Fecha fin (exclusive)
 * @param {number|null} professionalId - ID del profesional (null para todos)
 * @returns {Promise<Array>} Filas con date, count, asistio, no_asistio, pendiente
 */
export async function countMeetingsByDay(startDate, endDate, professionalId = null) {
  return query(
    `SELECT TO_DATE(m.day, 'YYYY-MM-DD') as date, COUNT(*) as count,
            COUNT(*) FILTER (WHERE m.asistencia = 'asistio') as asistio,
            COUNT(*) FILTER (WHERE m.asistencia = 'no_asistio') as no_asistio,
            COUNT(*) FILTER (WHERE m.asistencia = 'pendiente') as pendiente
     FROM meetings_agenda m
     WHERE TO_DATE(m.day, 'YYYY-MM-DD') >= $1 
       AND TO_DATE(m.day, 'YYYY-MM-DD') < $2
       AND ($3::int IS NULL OR m.id_professional = $3)
     GROUP BY TO_DATE(m.day, 'YYYY-MM-DD')
     ORDER BY date`,
    [startDate, endDate, professionalId]
  );
}

/**
 * Cuenta entradas de diario por día en un rango de fechas.
 * @param {Date} startDate - Fecha inicio (inclusive)
 * @param {Date} endDate - Fecha fin (exclusive)
 * @returns {Promise<Array>} Filas con date, count
 */
export async function countDiaryEntriesByDay(startDate, endDate) {
  return query(
    `SELECT DATE(de.entry_date) as date, COUNT(*) as count
     FROM diary_entries de
     JOIN diary d ON de.id_diary = d.id_diary
     WHERE de.entry_date >= $1 AND de.entry_date < $2
     GROUP BY DATE(de.entry_date)
     ORDER BY date`,
    [startDate, endDate]
  );
}

/**
 * Cuenta alertas por mes en un rango de fechas.
 * @param {Date} startDate - Fecha inicio (inclusive)
 * @param {Date} endDate - Fecha fin (exclusive)
 * @returns {Promise<Array>} Filas con date (primer día del mes), count, unread
 */
export async function countAlertsByMonth(startDate, endDate) {
  return query(
    `SELECT DATE_TRUNC('month', timestamp)::date as date, COUNT(*) as count,
            COUNT(*) FILTER (WHERE leido = FALSE) as unread
     FROM psychologist_alerts
     WHERE timestamp >= $1 AND timestamp < $2
     GROUP BY DATE_TRUNC('month', timestamp)
     ORDER BY date`,
    [startDate, endDate]
  );
}

/**
 * Cuenta reuniones por mes en un rango de fechas, opcionalmente filtrado por profesional.
 * @param {Date} startDate - Fecha inicio (inclusive)
 * @param {Date} endDate - Fecha fin (exclusive)
 * @param {number|null} professionalId - ID del profesional (null para todos)
 * @returns {Promise<Array>} Filas con date, count, asistio, no_asistio, pendiente
 */
export async function countMeetingsByMonth(startDate, endDate, professionalId = null) {
  return query(
    `SELECT DATE_TRUNC('month', TO_DATE(m.day, 'YYYY-MM-DD'))::date as date, COUNT(*) as count,
            COUNT(*) FILTER (WHERE m.asistencia = 'asistio') as asistio,
            COUNT(*) FILTER (WHERE m.asistencia = 'no_asistio') as no_asistio,
            COUNT(*) FILTER (WHERE m.asistencia = 'pendiente') as pendiente
     FROM meetings_agenda m
     WHERE TO_DATE(m.day, 'YYYY-MM-DD') >= $1 
       AND TO_DATE(m.day, 'YYYY-MM-DD') < $2
       AND ($3::int IS NULL OR m.id_professional = $3)
     GROUP BY DATE_TRUNC('month', TO_DATE(m.day, 'YYYY-MM-DD'))
     ORDER BY date`,
    [startDate, endDate, professionalId]
  );
}

/**
 * Cuenta entradas de diario por mes en un rango de fechas.
 * @param {Date} startDate - Fecha inicio (inclusive)
 * @param {Date} endDate - Fecha fin (exclusive)
 * @returns {Promise<Array>} Filas con date, count
 */
export async function countDiaryEntriesByMonth(startDate, endDate) {
  return query(
    `SELECT DATE_TRUNC('month', de.entry_date)::date as date, COUNT(*) as count
     FROM diary_entries de
     JOIN diary d ON de.id_diary = d.id_diary
     WHERE de.entry_date >= $1 AND de.entry_date < $2
     GROUP BY DATE_TRUNC('month', de.entry_date)
     ORDER BY date`,
    [startDate, endDate]
  );
}

/**
 * Encuentra reuniones pendientes futuras para un psicólogo.
 * @param {number} professionalId - ID del profesional
 * @returns {Promise<Array>} Filas con detalles de reunión
 */
export async function findPendingMeetings(professionalId) {
  return query(
    `SELECT m.id_meetings_agenda, m.day, m.hour, m.descripcion, m.asistencia,
            u.names as apprentice_names, u.last_names as apprentice_last_names
     FROM meetings_agenda m
     LEFT JOIN users u ON m.id_user = u.id_user
     WHERE m.id_professional = $1 AND m.asistencia = 'pendiente'
       AND TO_DATE(m.day, 'YYYY-MM-DD') >= CURRENT_DATE
     ORDER BY m.day ASC, m.hour ASC`,
    [professionalId]
  );
}

/**
 * Encuentra historial de reuniones para un psicólogo.
 * @param {number} professionalId - ID del profesional
 * @returns {Promise<Array>} Filas con detalles de reunión
 */
export async function findMeetingHistory(professionalId) {
  return query(
    `SELECT m.id_meetings_agenda, m.day, m.hour, m.descripcion, m.asistencia,
            u.names as apprentice_names, u.last_names as apprentice_last_names
     FROM meetings_agenda m
     LEFT JOIN users u ON m.id_user = u.id_user
     WHERE m.id_professional = $1
     ORDER BY m.day DESC, m.hour ASC`,
    [professionalId]
  );
}

/**
 * Cuenta reuniones por semana para las últimas 12 semanas.
 * @param {number} professionalId - ID del profesional
 * @returns {Promise<Array>} Filas con week_start, count
 */
export async function countMeetingsByWeek(professionalId) {
  return query(
    `SELECT DATE_TRUNC('week', TO_DATE(m.day, 'YYYY-MM-DD')) as week_start, COUNT(*) as count
     FROM meetings_agenda m
     WHERE m.id_professional = $1
       AND TO_DATE(m.day, 'YYYY-MM-DD') >= CURRENT_DATE - INTERVAL '12 weeks'
     GROUP BY DATE_TRUNC('week', TO_DATE(m.day, 'YYYY-MM-DD'))
     ORDER BY week_start`,
    [professionalId]
  );
}

/**
 * Encuentra un psicólogo por ID (rol 2).
 * @param {number} id - ID del usuario
 * @returns {Promise<Array>} Filas con id_user, names, last_names
 */
export async function findPsychologistById(id) {
  return query(
    `SELECT id_user, names, last_names FROM users WHERE id_user = $1 AND id_rol = 2`,
    [id]
  );
}