import { API_URL } from "./config";
import { request } from "./client";

/**
 * Servicio de Usuarios — centraliza llamadas al backend sobre el cliente HTTP
 * compartido (Bearer automático + redirect 401). Sin parámetro authFetch.
 * Paridad: Backend/src/routes/users.routes.js.
 */
const usersApi = {
  create: (formData) =>
    request(`${API_URL}/users/create`, {
      method: "POST",
      body: JSON.stringify(formData),
    }),

  search: (document) => request(`${API_URL}/users/search/${document}`),

  update: (id, formData) =>
    request(`${API_URL}/users/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(formData),
    }),

  remove: (id) =>
    request(`${API_URL}/users/delete/${id}`, { method: "DELETE" }),

  getProfile: (id) => request(`${API_URL}/users/profile/${id}`),

  updateProfile: (id, data) =>
    request(`${API_URL}/users/profile/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // La foto viaja como base64 data-URL en cuerpo JSON {profilePhoto} — NO FormData
  // (backend destructurea req.body.profilePhoto; MiCuentaPage lo envía igual).
  updateProfilePhoto: (id, profilePhoto) =>
    request(`${API_URL}/users/profile/${id}/photo`, {
      method: "PUT",
      body: JSON.stringify({ profilePhoto }),
    }),

  getProfilePhoto: (id) => request(`${API_URL}/users/profile/${id}/photo`),

  getPrivacy: (userId) => request(`${API_URL}/users/privacy/${userId}`),

  updatePrivacy: (userId, visibilidad) =>
    request(`${API_URL}/users/privacy/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ visibilidad }),
    }),
};

export default usersApi;
