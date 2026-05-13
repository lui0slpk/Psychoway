import { query, execute } from "../config/database.js";

/**
 * Obtiene todas las alertas para psicólogos.
 */
export async function findAll() {
  return query(
    `SELECT a.id_alert, a.id_user, a.motivo, a.leido, a.timestamp, 
            CONCAT(u.names, ' ', u.last_names) as aprendiz_nombre, 
            u.document
     FROM psychologist_alerts a
     JOIN users u ON a.id_user = u.id_user
     ORDER BY a.leido ASC, a.timestamp DESC`,
  );
}

/**
 * Marca una alerta como leída.
 */
export async function markAsRead(alertId) {
  const result = await execute(
    "UPDATE psychologist_alerts SET leido = TRUE WHERE id_alert = ?",
    [alertId],
  );
  return result.affectedRows > 0;
}

/**
 * Crea una nueva alerta.
 */
export async function create(userId, motivo) {
  await execute(
    "INSERT INTO psychologist_alerts (id_user, motivo) VALUES (?, ?)",
    [userId, motivo],
  );
}
