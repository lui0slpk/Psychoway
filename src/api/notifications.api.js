import { API_URL } from "./config";

/**
 * Servicio de Notificaciones — centraliza llamadas al backend.
 */
const notificationsApi = {
  getByUser: (authFetch, userId) =>
    authFetch(`${API_URL}/notifications/${userId}`),

  markAsRead: (authFetch, id) =>
    authFetch(`${API_URL}/notifications/${id}/read`, { method: "PUT" }),

  checkIn: (authFetch, userId) =>
    authFetch(`${API_URL}/notifications/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }),
};

export default notificationsApi;
