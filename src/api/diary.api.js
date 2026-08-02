/**
 * Módulo de Diario — capa de API centralizada.
 * Usa el cliente HTTP (client.js) en vez de recibir authFetch como parámetro:
 * el token se lee de localStorage, el 401 se centraliza y las respuestas llegan
 * ya parseadas (ApiError en errores).
 *
 * Uso:
 *   import diaryApi from "../api/diary.api";
 *   const entries = await diaryApi.getEntries(userId);
 */
import { request } from "./client";
import { API_URL } from "./config";

const diaryApi = {
  /**
   * POST ${API_URL}/diary/entry — protegido (Bearer).
   * Crea una entrada de diario para el usuario.
   */
  createEntry(userId, emotionIndex, description) {
    return request(`${API_URL}/diary/entry`, {
      method: "POST",
      body: JSON.stringify({ userId, emotionIndex, description }),
    });
  },

  /**
   * GET ${API_URL}/diary/entries/:userId — protegido (Bearer).
   * Devuelve el historial de entradas del usuario (array).
   */
  getEntries(userId) {
    return request(`${API_URL}/diary/entries/${userId}`);
  },
};

export default diaryApi;
