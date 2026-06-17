import { query, execute } from "../config/database.js";

/**
 * Obtiene las notificaciones de un usuario.
 */
export async function findByUserId(userId) {
  return query(
    "SELECT * FROM notifications WHERE id_user = $1 ORDER BY created_at DESC",
    [userId],
  );
}

/**
 * Marca una notificación como leída.
 */
export async function markAsRead(notificationId) {
  const result = await execute(
    "UPDATE notifications SET is_read = TRUE WHERE id_notification = $1",
    [notificationId],
  );
  return result.rowCount > 0;
}

/**
 * Crea una nueva notificación.
 */
export async function create(userId, type, message, link = null) {
  await execute(
    "INSERT INTO notifications (id_user, type, message, link) VALUES ($1, $2, $3, $4)",
    [userId, type, message, link],
  );
}

/**
 * Verifica si ya existe una notificación de check-in no leída.
 */
export async function hasUnreadCheckIn(userId) {
  const rows = await query(
    "SELECT id_notification FROM notifications WHERE id_user = $1 AND type = 'check-in' AND is_read = FALSE",
    [userId],
  );
  return rows.length > 0;
}
