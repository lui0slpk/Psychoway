import { API_URL } from "./config";

/**
 * Servicio de Seguimiento (Psicólogo) — centraliza llamadas al backend.
 */
const trackingApi = {
  getApprenticesWithEmotions: (authFetch) =>
    authFetch(`${API_URL}/psychologist/apprentices-with-emotions`),

  getAlerts: (authFetch) =>
    authFetch(`${API_URL}/psychologist/alerts`),

  markAlertAsRead: (authFetch, id) =>
    authFetch(`${API_URL}/psychologist/alerts/${id}/read`, { method: "PUT" }),
};

export default trackingApi;
