import { request } from "./client";
import { API_URL } from "./config";

/**
 * Obtiene estadísticas de alertas.
 * @param {string} period - 'week' o 'month'
 */
export function getAlerts(period = "week") {
  return request(`${API_URL}/statistics/alerts?period=${period}`);
}

/**
 * Obtiene estadísticas de reuniones.
 * @param {string} period - 'week' o 'month'
 */
export function getMeetings(period = "week") {
  return request(`${API_URL}/statistics/meetings?period=${period}`);
}

/**
 * Obtiene estadísticas de entradas de diario.
 * @param {string} period - 'week' o 'month'
 */
export function getDiary(period = "week") {
  return request(`${API_URL}/statistics/diary?period=${period}`);
}

/**
 * Obtiene estadísticas mensuales agregadas (6 meses).
 * @param {string} type - 'alerts', 'meetings', o 'diary'
 */
export function getMonthlyStats(type) {
  return request(`${API_URL}/statistics/monthly/${type}`);
}

/**
 * Obtiene la agenda de un psicólogo.
 * @param {number} idProfessional - ID del profesional
 */
export function getPsychologistAgenda(idProfessional) {
  return request(`${API_URL}/statistics/psychologist-agenda/${idProfessional}`);
}
