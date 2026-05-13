import { API_URL } from "./config";

/**
 * Servicio de Usuarios — centraliza llamadas al backend.
 */
const usersApi = {
  create: (authFetch, formData) =>
    authFetch(`${API_URL}/users/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }),

  search: (authFetch, document) =>
    authFetch(`${API_URL}/users/search/${document}`),

  update: (authFetch, id, formData) =>
    authFetch(`${API_URL}/users/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }),

  remove: (authFetch, id) =>
    authFetch(`${API_URL}/users/delete/${id}`, { method: "DELETE" }),

  getPrivacy: (authFetch, userId) =>
    authFetch(`${API_URL}/users/privacy/${userId}`),

  updatePrivacy: (authFetch, userId, visibilidad) =>
    authFetch(`${API_URL}/users/privacy/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibilidad }),
    }),
};

export default usersApi;
