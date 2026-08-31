/**
 * Módulo de Seguimiento (Psicólogo) — capa de API centralizada.
 * Usa el cliente HTTP (client.js) en vez de recibir authFetch como parámetro:
 * el token se lee de localStorage, el 401 se centraliza y las respuestas llegan
 * ya parseadas (ApiError en errores). Endpoints protegidos (Bearer + 401 redirect).
 *
 * Uso:
 *   import trackingApi from "../api/tracking.api";
 *   const apprentices = await trackingApi.getApprenticesWithEmotions();
 */
import { request } from "./client";
import { API_URL } from "./config";

const trackingApi = {
  /**
   * GET ${API_URL}/psychologist/apprentices-with-emotions — protegido (Bearer).
   * Devuelve los aprendices con sus estadísticas emocionales (array).
   */
  getApprenticesWithEmotions() {
    return request(`${API_URL}/psychologist/apprentices-with-emotions`);
  },

  /**
   * GET ${API_URL}/psychologist/alerts — protegido (Bearer).
   * Devuelve las alertas de riesgo detectadas por la AI (array).
   */
  getAlerts() {
    return request(`${API_URL}/psychologist/alerts`);
  },

  /**
   * PUT ${API_URL}/psychologist/alerts/:id/read — protegido (Bearer).
   * Marca una alerta como leída (sin body, paridad con el PUT original).
   */
  markAlertAsRead(id) {
    return request(`${API_URL}/psychologist/alerts/${id}/read`, {
      method: "PUT",
    });
  },
};

export default trackingApi;
