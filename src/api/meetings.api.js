import { API_URL } from "./config";

/**
 * Servicio de Agenda — centraliza llamadas al backend.
 */
const meetingsApi = {
  create: (authFetch, payload) =>
    authFetch(`${API_URL}/meetings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  getByProfessional: (authFetch, id) =>
    authFetch(`${API_URL}/meetings/psychologist/${id}`),

  getByUser: (authFetch, userId) =>
    authFetch(`${API_URL}/meetings/user/${userId}`),

  getProfessionalHistory: (authFetch, id) =>
    authFetch(`${API_URL}/meetings/professional-history/${id}`),

  getPsychologists: (authFetch) =>
    authFetch(`${API_URL}/psychologists`),
};

export default meetingsApi;
