import { API_URL } from "./config";
import { request } from "./client";

/**
 * Servicio de Notificaciones — centraliza llamadas al backend sobre el cliente
 * HTTP compartido (Bearer automático + redirect 401). Sin parámetro authFetch.
 * Paridad: Backend/src/routes/notifications.routes.js
 * (GET /:userId, PUT /:id/read, POST /check-in) montado en routes/index.js L58
 * detrás del middleware JWT de /api (L27).
 */
const notificationsApi = {
  getByUser: (userId) => request(`${API_URL}/notifications/${userId}`),

  markAsRead: (id) =>
    request(`${API_URL}/notifications/${id}/read`, { method: "PUT" }),

  checkIn: (userId) =>
    request(`${API_URL}/notifications/check-in`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
};

export default notificationsApi;
