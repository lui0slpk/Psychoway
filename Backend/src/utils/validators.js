/**
 * Utilidades de validación y normalización para el dominio de usuarios.
 */

/**
 * Tipos de documento válidos en el dominio.
 */
export const DOC_TYPES = ["TI", "CC", "CE", "PA"];

/**
 * Normaliza un correo: recorta espacios y lo pasa a minúsculas.
 */
export function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

/**
 * Normaliza textos (ej. nombres): recorta espacios y quita caracteres peligrosos (<, >) para evitar XSS.
 */
export function normalizeText(text) {
  if (!text) return "";
  return String(text).replace(/[<>]/g, "").trim();
}

/**
 * Normaliza teléfonos: quita cualquier carácter que no sea numérico.
 */
export function normalizePhone(phone) {
  if (!phone) return null;
  return String(phone).replace(/\D/g, "");
}

/**
 * Valida el formato básico de un correo.
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}

/**
 * Normaliza un documento: recorta espacios y elimina espacios internos.
 */
export function normalizeDocument(doc) {
  return (doc || "").trim().replace(/\s+/g, "");
}

/**
 * Valida que un documento sea coherente con su tipo.
 * - TI / CC / CE: solo dígitos (CC 6-10, TI 8-10, CE 5-12).
 * - PA: alfanumérico de 6-9 caracteres.
 * - Cualquier tipo fuera del dominio: inválido.
 */
export function isValidDocument(doc, docType) {
  const type = String(docType || "").toUpperCase();
  const value = String(doc || "");

  if (!DOC_TYPES.includes(type)) return false;
  if (!value) return false;

  switch (type) {
    case "TI":
      return /^\d{8,10}$/.test(value);
    case "CC":
      return /^\d{6,10}$/.test(value);
    case "CE":
      return /^\d{5,12}$/.test(value);
    case "PA":
      return /^[A-Za-z0-9]{6,9}$/.test(value);
    default:
      return false;
  }
}
