import { query, execute } from "../config/database.js";

/**
 * Obtiene las sesiones de chat de un usuario.
 */
export async function getSessionsByUserId(userId) {
  return query(
    "SELECT id_session, title, created_at FROM psychobot_sessions WHERE id_user = ? ORDER BY created_at DESC",
    [userId],
  );
}

/**
 * Crea una nueva sesión de chat.
 */
export async function createSession(userId, title) {
  const result = await execute(
    "INSERT INTO psychobot_sessions (id_user, title) VALUES (?, ?)",
    [userId, title || "Nueva Conversación"],
  );
  return result.insertId;
}

/**
 * Elimina una sesión de chat.
 */
export async function deleteSession(sessionId) {
  const result = await execute(
    "DELETE FROM psychobot_sessions WHERE id_session = ?",
    [sessionId],
  );
  return result.affectedRows > 0;
}

/**
 * Obtiene el historial de una sesión.
 */
export async function getHistoryBySessionId(sessionId) {
  const rows = await query(
    "SELECT role, message as text FROM psychobot_chats WHERE id_session = ? ORDER BY timestamp ASC",
    [sessionId],
  );
  return rows.map((row) => ({ type: row.role, text: row.text }));
}

/**
 * Guarda un mensaje en el historial.
 */
export async function saveMessage(userId, sessionId, role, message) {
  await execute(
    "INSERT INTO psychobot_chats (id_user, id_session, role, message) VALUES (?, ?, ?, ?)",
    [userId, sessionId, role, message],
  );
}

/**
 * Obtiene la sesión más reciente de un usuario.
 */
export async function getLatestSession(userId) {
  const rows = await query(
    "SELECT id_session FROM psychobot_sessions WHERE id_user = ? ORDER BY created_at DESC LIMIT 1",
    [userId],
  );
  return rows.length > 0 ? rows[0].id_session : null;
}

/**
 * Obtiene los recuerdos/memoria del usuario.
 */
export async function getMemory(userId) {
  return query("SELECT fact FROM psychobot_memory WHERE id_user = ?", [userId]);
}

/**
 * Guarda un recuerdo nuevo.
 */
export async function saveMemory(userId, fact) {
  await execute(
    "INSERT INTO psychobot_memory (id_user, fact) VALUES (?, ?)",
    [userId, fact],
  );
}

/**
 * Obtiene la fecha de la última sesión (para check-in).
 */
export async function getLastSessionDate(userId) {
  const rows = await query(
    "SELECT created_at FROM psychobot_sessions WHERE id_user = ? ORDER BY created_at DESC LIMIT 1",
    [userId],
  );
  return rows.length > 0 ? rows[0].created_at : null;
}
