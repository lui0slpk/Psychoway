import { API_URL } from "./config";

/**
 * Servicio de Objetivos — centraliza llamadas al backend.
 */
const objectivesApi = {
  create: (authFetch, userId, nombre, descripcion, estado) =>
    authFetch(`${API_URL}/objectives`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, nombre, descripcion, estado }),
    }),

  getByUser: (authFetch, userId) =>
    authFetch(`${API_URL}/objectives/${userId}`),

  update: (authFetch, id, nombre, descripcion, estado) =>
    authFetch(`${API_URL}/objectives/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, descripcion, estado }),
    }),

  remove: (authFetch, id) =>
    authFetch(`${API_URL}/objectives/${id}`, { method: "DELETE" }),
};

export default objectivesApi;
