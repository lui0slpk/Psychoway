/**
 * Cliente HTTP standalone para la capa de API.
 * Independiente de React: lee el token de localStorage, inyecta headers,
 * parsea JSON/texto/blob y centraliza el manejo de 401.
 *
 * Uso:
 *   import { request } from "./client";
 *   const data = await request(`${API_URL}/diary/entries/1`);
 *   const user = await request(`${API_BASE}/login`, {
 *     method: "POST",
 *     auth: false,
 *     skipAuthRedirect: true,
 *     body: JSON.stringify({ document, password }),
 *   });
 */
import { TOKEN_KEY } from "./config";

// Clave con la que AuthContext persiste el objeto de usuario en localStorage.
const SESSION_USER_KEY = "psychoway_user";

const DEFAULT_ERROR_MESSAGE = "Error de comunicación con el servidor.";

/**
 * Error tipado de la capa de API.
 * `status`: código HTTP (0 = fallo de red); `message`: mensaje para el usuario;
 * `data`: cuerpo de error parseado (para pasar el mensaje del backend).
 */
export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.message = message;
    this.data = data;
  }
}

async function parseBody(response, responseType) {
  if (responseType === "blob") {
    return response.blob();
  }

  const text = await response.text();

  if (responseType === "text") {
    return text;
  }

  // "auto": text-then-JSON (paridad con login), con fallback a texto crudo
  // para no romper con cuerpos de error HTML.
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Realiza una petición HTTP con el contrato centralizado:
 * - inyecta `Authorization: Bearer <token>` (si auth, leyendo localStorage);
 * - agrega `Content-Type: application/json` solo si hay body y no es FormData;
 * - 401: limpia la sesión y redirige a "/" (salvo skipAuthRedirect);
 * - fallos de red → ApiError(0, "Error de conexión");
 * - respuestas !ok → ApiError(status, mensaje del backend || default);
 * - parsea según responseType ("auto" | "text" | "blob").
 */
export async function request(
  path,
  { method = "GET", body, auth = true, skipAuthRedirect = false, responseType = "auto" } = {}
) {
  const headers = {};

  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new ApiError(401, "No hay sesión activa");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  let response;
  try {
    response = await fetch(path, { method, headers, body });
  } catch {
    throw new ApiError(0, "Error de conexión");
  }

  if (response.status === 401 && !skipAuthRedirect) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
    window.location.href = "/";
    throw new ApiError(401, "Sesión expirada");
  }

  const data = await parseBody(response, responseType);

  if (!response.ok) {
    throw new ApiError(response.status, (data && data.message) || DEFAULT_ERROR_MESSAGE, data);
  }

  return data;
}

export default { request, ApiError };
