import { request } from "./client";
import { JPA_API_BASE } from "./config";

/**
 * Servicio de Usuarios JPA — consume el microservicio externo mysqlwithjpa
 * (puerto 8080) sobre el cliente HTTP compartido (Bearer automático + 401
 * centralizado). Contrato verificado contra el código fuente del
 * microservicio; API_REFERENCE.md está DESACTUALIZADO en la serialización
 * de respuestas (documenta camelCase) y en el enum de docType (incluye un
 * "PPT" que no existe).
 *
 * CONTRATO DE SERIALIZACIÓN (capa anticorrupción — verificado en vivo):
 *   - RESPUESTAS en snake_case (Jackson @JsonProperty): los roles llegan
 *     como { id_rol, nombre_rol }; el listado como PageResponse con
 *     total_elements/total_pages; cada usuario como UserResponse con
 *     id_user, doc_type, last_names, ... — salvo document, names y email,
 *     que viajan con ese nombre exacto. NUNCA incluyen password.
 *   - REQUESTS en camelCase (cuerpos de POST/PUT y query params): el
 *     servidor vincula exactamente esas propiedades Java (docType,
 *     lastNames, idRol, ...) — NO se traducen ni se modifican.
 *   - ESTE módulo es el ÚNICO punto de traducción snake→camel: los
 *     componentes consumen camelCase (idUser, docType, totalElements, ...)
 *     y ningún componente traduce nombres de campo.
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
 * Mapa de traducción de claves de RESPUESTA (wire snake_case → UI
 * camelCase). Las claves que NO aparecen aquí pasan tal cual: incluye los
 * campos que ya viajan con nombre exacto (document, names, email, page,
 * size, first, last, content) y, defensivamente, claves que ya lleguen en
 * camelCase — la normalización debe ser un no-op para ellas.
 */
const SNAKE_TO_CAMEL = {
  id_user: "idUser",
  doc_type: "docType",
  last_names: "lastNames",
  birth_date: "birthDate",
  contact_number: "contactNumber",
  landline_number: "landlineNumber",
  training_program: "trainingProgram",
  ficha_number: "fichaNumber",
  id_rol: "idRol",
  nombre_rol: "nombreRol",
  profile_photo: "profilePhoto",
  last_update: "lastUpdate",
  total_elements: "totalElements",
  total_pages: "totalPages",
};

/**
 * Copia un objeto plano traduciendo SOLO las claves del mapa; el resto
 * pasa sin cambio. Tolerante con entradas ya camelCase (no duplica ni
 * pierde claves) y con valores no-objeto (se devuelven tal cual).
 */
const mapKeysToCamel = (obj) => {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return obj;
  }
  const mapped = {};
  Object.entries(obj).forEach(([key, value]) => {
    mapped[SNAKE_TO_CAMEL[key] ?? key] = value;
  });
  return mapped;
};

/**
 * UserResponse del wire (snake_case) → objeto de usuario de la UI
 * (camelCase). Aplica al cuerpo 201 de POST, al 200 de PUT y a cada fila
 * del listado. El servicio NUNCA devuelve password.
 */
const normalizeJpaUser = (user) => mapKeysToCamel(user);

/**
 * Rol del catálogo GET /api/roles: { id_rol, nombre_rol } →
 * { idRol, nombreRol } (lo que consumen los selects del módulo).
 */
const normalizeJpaRole = (role) => mapKeysToCamel(role);

/**
 * PageResponse del listado (snake_case) → envolvente camelCase de la UI:
 * total_elements→totalElements y total_pages→totalPages (page/size/
 * first/last ya viajan con esos nombres); cada fila de content pasa por
 * normalizeJpaUser.
 */
const normalizeJpaPage = (page) => {
  const normalized = mapKeysToCamel(page);
  if (normalized && Array.isArray(normalized.content)) {
    normalized.content = normalized.content.map(normalizeJpaUser);
  }
  return normalized;
};

/**
 * Consulta el health check público del microservicio.
 * SIN Authorization (auth: false) — el endpoint no consume rate limit.
 */
export const jpaHealth = () =>
  request(`${JPA_API_BASE}/actuator/health`, { auth: false });

/**
 * Catálogo de roles para poblar los selects del módulo
 * (valor numérico idRol + etiqueta nombreRol). El wire entrega
 * { id_rol, nombre_rol } — se traduce aquí, único punto.
 */
export const listJpaRoles = async () => {
  const roles = await request(`${JPA_API_BASE}/api/roles`);
  // Wire: [{ id_rol, nombre_rol }] → UI: [{ idRol, nombreRol }].
  return Array.isArray(roles) ? roles.map(normalizeJpaRole) : roles;
};

/**
 * Lista paginada de usuarios del microservicio JPA.
 *
 * `page` llega 1-indexado desde la UI y se convierte AQUÍ al índice 0-based
 * de la API — este es el ÚNICO punto de conversión del módulo (evita la
 * trampa de off-by-one en toda la clase). `size` se envía SIEMPRE explícito
 * (el default real de la API es 10 y no debe confiarse de eso). Los valores
 * de filtro vacíos/undefined/null no viajan como query params. La respuesta
 * (PageResponse snake_case) se normaliza a camelCase aquí — único punto.
 *
 * Filtros documentados: document, email (exactos); names, lastNames
 * (parciales); idRol (exacto).
 */
export const listJpaUsers = async ({ page = 1, size = 5, ...filters } = {}) => {
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

  // "wirePage" evita la colisión con el parámetro `page` (1-indexado, UI).
  const wirePage = await request(
    `${JPA_API_BASE}/api/users?${query.toString()}`,
  );
  // Wire (PageResponse snake_case) → camelCase + cada fila normalizada.
  return normalizeJpaPage(wirePage);
};

/**
 * Crea un usuario JPA con el payload exacto del contrato (CreateGroup:
 * todos los campos requeridos; los opcionales se omiten cuando van vacíos).
 * El request viaja camelCase tal cual; SOLO el UserResponse del 201 se
 * normaliza (wire snake_case → camelCase).
 */
export const createJpaUser = async (payload) => {
  const user = await request(`${JPA_API_BASE}/api/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeJpaUser(user);
};

/**
 * Actualiza un usuario enviando SOLO los campos cambiados (semántica
 * UpdateGroup: los campos no enviados no se modifican; password vacío
 * nunca viaja — el diff lo construye el modal antes de llamar). El
 * request viaja camelCase tal cual; el UserResponse del 200 se normaliza.
 */
export const updateJpaUser = async (id, diff) => {
  const user = await request(`${JPA_API_BASE}/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(diff),
  });
  return normalizeJpaUser(user);
};

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
