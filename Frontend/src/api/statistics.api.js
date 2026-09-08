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
 * Obtiene la agenda de un psicólogo.
 * @param {number} idProfessional - ID del profesional
 */
export function getPsychologistAgenda(idProfessional) {
  return request(`${API_URL}/statistics/psychologist-agenda/${idProfessional}`);
}
