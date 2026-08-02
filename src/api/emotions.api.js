import { API_URL } from "./config";
import { request } from "./client";

/**
 * Servicio de Emociones — lista de emociones para el selector de Diario.
 * Centraliza la llamada sobre el cliente HTTP compartido (Bearer automático +
 * redirect 401). Sin parámetro authFetch.
 * Paridad: Backend/src/routes/index.js L40
 * (`router.use("/api/emotions", emotionsRoutes)`, protegida por el middleware
 * JWT de /api) + Backend/src/routes/emotions.routes.js L6
 * (`router.get("/", ctrl.getAll)`). Sin caller actual (surface parity only).
 */
const emotionsApi = {
  getAll: () => request(`${API_URL}/emotions`),
};

export default emotionsApi;
