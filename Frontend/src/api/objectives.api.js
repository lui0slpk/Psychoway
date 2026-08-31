/**
 * Módulo de Objetivos — capa de API centralizada.
 * Usa el cliente HTTP (client.js) en vez de recibir authFetch como parámetro:
 * el token se lee de localStorage, el 401 se centraliza y las respuestas llegan
 * ya parseadas (ApiError en errores).
 *
 * Uso:
 *   import objectivesApi from "../api/objectives.api";
 *   const objetivos = await objectivesApi.getByUser(userId);
 */
import { request } from "./client";
import { API_URL } from "./config";

const objectivesApi = {
  /**
   * POST ${API_URL}/objectives — protegido (Bearer).
   * Crea un objetivo para el usuario.
   */
  create(userId, nombre, descripcion, estado) {
    return request(`${API_URL}/objectives`, {
      method: "POST",
      body: JSON.stringify({ userId, nombre, descripcion, estado }),
    });
  },

  /**
   * GET ${API_URL}/objectives/:userId — protegido (Bearer).
   * Devuelve los objetivos del usuario (array).
   */
  getByUser(userId) {
    return request(`${API_URL}/objectives/${userId}`);
  },

  /**
   * PUT ${API_URL}/objectives/:id — protegido (Bearer).
   * Actualiza nombre, descripcion y estado de un objetivo.
   */
  update(id, nombre, descripcion, estado) {
    return request(`${API_URL}/objectives/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nombre, descripcion, estado }),
    });
  },

  /**
   * DELETE ${API_URL}/objectives/:id — protegido (Bearer).
   * Elimina un objetivo.
   */
  remove(id) {
    return request(`${API_URL}/objectives/${id}`, { method: "DELETE" });
  },
};

export default objectivesApi;
