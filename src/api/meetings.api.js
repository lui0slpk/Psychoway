import { API_URL } from "./config";
import { request } from "./client";

/**
 * Servicio de Agenda — centraliza llamadas al backend sobre el cliente HTTP
 * compartido (Bearer automático + redirect 401). Sin parámetro authFetch.
 * Paridad: Backend/src/routes/meetings.routes.js
 * (POST /meetings, GET /meetings/psychologist/:id, GET /meetings/user/:id,
 * GET /meetings/professional-history/:id).
 * Nota: la lista de psicólogos vive en psychologists.api.js (getAll), no aquí.
 */
const meetingsApi = {
  create: (payload) =>
    request(`${API_URL}/meetings`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getByProfessional: (id) =>
    request(`${API_URL}/meetings/psychologist/${id}`),

  getByUser: (userId) =>
    request(`${API_URL}/meetings/user/${userId}`),

  getProfessionalHistory: (id) =>
    request(`${API_URL}/meetings/professional-history/${id}`),
};

export default meetingsApi;
