/**
 * Base URL del backend.
 * Centralizada para cambiar fácilmente entre entornos.
 */
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * URL del API protegida (con JWT).
 */
export const API_URL = `${API_BASE}/api`;

/**
 * URL pública (sin JWT).
 */
export const PUBLIC_URL = API_BASE;

export default API_BASE;
