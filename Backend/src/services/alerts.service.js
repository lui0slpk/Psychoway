import * as alertRepo from "../repositories/alert.repository.js";

/**
 * Obtiene todas las alertas.
 */
export async function getAll() {
  return alertRepo.findAll();
}

/**
 * Marca una alerta como leída.
 */
export async function markAsRead(alertId) {
  const updated = await alertRepo.markAsRead(alertId);
  if (!updated) {
    throw { status: 404, message: "Alerta no encontrada" };
  }
  return { message: "Alert marked as read" };
}
