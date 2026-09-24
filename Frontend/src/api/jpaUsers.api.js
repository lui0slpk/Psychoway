import { request } from "./client";
import { JPA_API_BASE } from "./config";

/**
 * Servicio de Usuarios JPA — consume el microservicio externo mysqlwithjpa
 * (puerto 8080) sobre el cliente HTTP compartido (Bearer automático + 401
 * centralizado). Contrato: API_REFERENCE.md.
 *
 * POLÍTICA 401 (aceptada por diseño, ver docs de integración): el
 * microservicio comparte el JWT_SECRET con Express (HS256); un 401 de JPA
 * significa que la sesión de Express es igualmente inválida. Este módulo NO
 * introduce manejo alternativo: client.js limpia la sesión y redirige a "/"
 * antes de que el código de este módulo vea el error. El health check es
 * público y se llama con { auth: false }, fuera de esa ruta. Todos los
 * errores NO-401 (403/404/409/429/5xx/red) se capturan por llamada y se
 * muestran con utils/alerts.js SIN cerrar la sesión.
 *
 * Endpoints autorizados — NINGUNO fuera de este conjunto puede aparecer aquí:
 *   GET  /actuator/health   (público, excluido del rate limit)
 *   GET  /api/roles
 *   GET  /api/users         (paginado + filtros)
 *   POST /api/users
 *   PUT  /api/users/{id}
 *   DELETE /api/users/{id}
 * En particular, GET /api/users/{id} NO está autorizado: los datos de fila
 * salen de la página ya cargada.
 */

/**
 * Consulta el health check público del microservicio.
 * SIN Authorization (auth: false) — el endpoint no consume rate limit.
 */
export const jpaHealth = () =>
  request(`${JPA_API_BASE}/actuator/health`, { auth: false });

/**
 * Catálogo de roles para poblar los selects del módulo
 * (valor numérico idRol + etiqueta nombreRol).
 */
export const listJpaRoles = () => request(`${JPA_API_BASE}/api/roles`);

/**
 * Lista paginada de usuarios del microservicio JPA.
 *
 * `page` llega 1-indexado desde la UI y se convierte AQUÍ al índice 0-based
 * de la API — este es el ÚNICO punto de conversión del módulo (evita la
 * trampa de off-by-one en toda la clase). `size` se envía SIEMPRE explícito
 * (la API por defecto responde 20 y no debe confiarse de eso). Los valores
 * de filtro vacíos/undefined/null no viajan como query params.
 *
 * Filtros documentados: document, email (exactos); names, lastNames
 * (parciales); idRol (exacto).
 */
export const listJpaUsers = ({ page = 1, size = 5, ...filters } = {}) => {
  const query = new URLSearchParams();
  // Única conversión 1-indexed (UI) → 0-indexed (API).
  query.set("page", String(page - 1));
  query.set("size", String(size));

  Object.entries(filters).forEach(([key, value]) => {
    // Descarta "", null, undefined y strings de solo espacios.
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      query.set(key, String(value).trim());
    }
  });

  return request(`${JPA_API_BASE}/api/users?${query.toString()}`);
};

/**
 * Crea un usuario JPA con el payload exacto del contrato (CreateGroup:
 * todos los campos requeridos; los opcionales se omiten cuando van vacíos).
 */
export const createJpaUser = (payload) =>
  request(`${JPA_API_BASE}/api/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

/**
 * Actualiza un usuario enviando SOLO los campos cambiados (semántica
 * UpdateGroup: los campos no enviados no se modifican; password vacío
 * nunca viaja — el diff lo construye el modal antes de llamar).
 */
export const updateJpaUser = (id, diff) =>
  request(`${JPA_API_BASE}/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(diff),
  });

/**
 * Elimina un usuario (borrado físico). Responde 204 sin cuerpo.
 */
export const deleteJpaUser = (id) =>
  request(`${JPA_API_BASE}/api/users/${id}`, { method: "DELETE" });

/**
 * Convierte un ApiError del microservicio al contrato de UI en español:
 * { title, text, fieldErrors? }. Mapeo determinístico por status; el
 * llamador muestra el resultado vía showError/showWarning de
 * utils/alerts.js sin re-parsear la envolvente de error.
 *
 *   400 → fieldErrors por campo (details[]) + mensajes en el texto.
 *   409 → Conflicto con el mensaje del servidor (document/email duplicado).
 *   403 → permisos insuficientes (sin logout: solo el 401 cierra sesión).
 *   404 → el recurso ya no existe.
 *   429 → rate limit con retryAfterSeconds; JAMÁS se auto-reintenta.
 *   0/5xx/red → servicio no disponible.
 */
export const mapJpaError = (error) => {
  const status = error?.status ?? 0;
  const data = error?.data ?? {};

  if (status === 400) {
    const details = Array.isArray(data.details) ? data.details : [];
    const fieldErrors = {};
    const messages = [];
    details.forEach(({ field, message }) => {
      if (field && message) fieldErrors[field] = message;
      if (message) messages.push(message);
    });
    return {
      title: "Datos inválidos",
      text:
        messages.length > 0
          ? messages.join("\n")
          : data.message || error?.message || "Revisa los datos enviados.",
      ...(Object.keys(fieldErrors).length > 0 ? { fieldErrors } : {}),
    };
  }

  if (status === 409) {
    return {
      title: "Conflicto",
      text:
        data.message ||
        error?.message ||
        "El documento o correo ya está registrado.",
    };
  }

  if (status === 403) {
    return {
      title: "Permisos insuficientes",
      text: "No tienes permisos suficientes para esta acción.",
    };
  }

  if (status === 404) {
    return {
      title: "Recurso no encontrado",
      text: "El recurso solicitado ya no existe.",
    };
  }

  if (status === 429) {
    const seconds = data.retryAfterSeconds;
    return {
      title: "Límite de solicitudes",
      text:
        typeof seconds === "number"
          ? `Demasiadas solicitudes. Intenta de nuevo en ${seconds} segundos.`
          : "Demasiadas solicitudes. Por favor intenta de nuevo más tarde.",
    };
  }

  // status 0 (fallo de red), 5xx o cualquier error fuera del contrato.
  return {
    title: "Servicio no disponible",
    text: "El servicio no está disponible en este momento.",
  };
};
