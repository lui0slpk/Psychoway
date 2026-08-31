import { API_URL } from "./config";
import { request } from "./client";

/**
 * Servicio de Psicólogos — lista de profesionales para el selector de Agenda.
 * Centraliza la llamada sobre el cliente HTTP compartido (Bearer automático +
 * redirect 401). Sin parámetro authFetch.
 * Paridad: Backend/src/routes/index.js
 * (`router.get("/api/psychologists", usersCtrl.getPsychologists)`, protegida
 * por el middleware JWT de /api). Antes vivía desubicado en meetings.api.js.
 */
const psychologistsApi = {
  getAll: () => request(`${API_URL}/psychologists`),
};

export default psychologistsApi;
