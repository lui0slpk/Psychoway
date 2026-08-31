/**
 * Módulo de autenticación — capa de API centralizada.
 * Endpoints públicos (login/register) viven en la raíz `${API_BASE}` (sin
 * prefijo /api — quirk del backend); los flujos de password y verify viven
 * bajo `${API_URL}` (/api). Todos los públicos usan auth:false y
 * skipAuthRedirect:true para que un 401 por credenciales inválidas NO
 * redirija a "/" (la página decide qué mostrar).
 *
 * Uso:
 *   import authApi from "../api/auth.api";
 *   const data = await authApi.login(document, password);
 */
import { request } from "./client";
import { API_BASE, API_URL } from "./config";

const authApi = {
  /**
   * POST ${API_BASE}/login — público, sin /api.
   * Devuelve { message, token, user }.
   */
  login(document, password) {
    return request(`${API_BASE}/login`, {
      method: "POST",
      auth: false,
      skipAuthRedirect: true,
      body: JSON.stringify({ document, password }),
    });
  },

  /**
   * POST ${API_BASE}/register — público, sin /api.
   * Un 409 (documento/correo ya registrado) se rechaza como ApiError(409)
   * para que la página ramifique por err.status.
   */
  register(userData) {
    return request(`${API_BASE}/register`, {
      method: "POST",
      auth: false,
      skipAuthRedirect: true,
      body: JSON.stringify(userData),
    });
  },

  /**
   * POST ${API_URL}/password/forgot — público.
   * El mensaje del backend (p. ej. "Correo no encontrado") viaja en ApiError.
   */
  forgotPassword(correo) {
    return request(`${API_URL}/password/forgot`, {
      method: "POST",
      auth: false,
      skipAuthRedirect: true,
      body: JSON.stringify({ correo }),
    });
  },

  /**
   * POST ${API_URL}/password/reset — público.
   * El mensaje del backend (p. ej. "Token inválido o expirado") viaja en ApiError.
   */
  resetPassword(token, newPassword) {
    return request(`${API_URL}/password/reset`, {
      method: "POST",
      auth: false,
      skipAuthRedirect: true,
      body: JSON.stringify({ token, newPassword }),
    });
  },

  /**
   * GET ${API_URL}/auth/verify — protegido (Bearer) con el redirect de 401
   * por defecto: una sesión vencida limpia localStorage y redirige a "/".
   * Devuelve { valid, userId, role }.
   */
  verifySession() {
    return request(`${API_URL}/auth/verify`);
  },
};

export default authApi;
