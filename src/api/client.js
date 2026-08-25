/**
 * Cliente HTTP centralizado para Psychoway.
 *
 * Lee el token JWT desde localStorage y lo agrega automáticamente
 * a cada petición. Si el servidor responde 401, redirige al login.
 *
 * Uso:
 *   import { request } from "./client";
 *   const data = await request("/api/objectives/1");
 */

const TOKEN_KEY = "psychoway_token";

/**
 * Lanza un error enriquecido con status y data del body.
 * Permite hacer: catch(e) => e.status, e.data?.message
 */
class ApiError extends Error {
  constructor(status, data) {
    super(data?.message || `Error HTTP ${status}`);
    this.status = status;
    this.data = data;
  }
}

/**
 * Realiza una petición autenticada al backend.
 *
 * @param {string} url   - URL completa o path
 * @param {RequestInit} options - Opciones de fetch (method, body, headers...)
 * @returns {Promise<any>} - Respuesta ya parseada como JSON
 */
export async function request(url, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    window.location.href = "/";
    throw new ApiError(401, { message: "No hay sesión activa" });
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  // Sesión expirada
  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("psychoway_user");
    window.location.href = "/";
    throw new ApiError(401, { message: "Sesión expirada" });
  }

  // Intentar parsear JSON
  let data;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new ApiError(response.status, typeof data === "object" ? data : { message: data });
  }

  return data;
}

export default request;
