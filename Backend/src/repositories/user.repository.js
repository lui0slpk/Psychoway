import { query, execute } from "../config/database.js";

/**
 * Busca un usuario por documento.
 */
export async function findByDocument(document) {
  const rows = await query("SELECT * FROM users WHERE document = ?", [
    document,
  ]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Busca un usuario por email.
 */
export async function findByEmail(email) {
  const rows = await query(
    "SELECT id_user, email, names FROM users WHERE email = ?",
    [email],
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Busca un usuario por ID.
 */
export async function findById(id) {
  const rows = await query("SELECT * FROM users WHERE id_user = ?", [id]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Verifica si un documento o email ya existen.
 */
export async function existsByDocumentOrEmail(document, email) {
  const rows = await query(
    "SELECT * FROM users WHERE document = ? OR email = ?",
    [document, email],
  );
  return rows.length > 0;
}

/**
 * Crea un nuevo usuario.
 */
export async function create(userData) {
  const { document, doc_type, names, last_names, birth_date, email, password, id_rol } = userData;
  const result = await execute(
    `INSERT INTO users (document, doc_type, names, last_names, birth_date, email, password, id_rol, last_update)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [document, doc_type || null, names, last_names, birth_date, email, password, id_rol],
  );
  return result.insertId;
}

/**
 * Actualiza la contraseña de un usuario.
 */
export async function updatePassword(userId, hashedPassword) {
  const result = await execute(
    "UPDATE users SET password = ?, last_update = NOW() WHERE id_user = ?",
    [hashedPassword, userId],
  );
  return result.affectedRows > 0;
}

/**
 * Busca un usuario por documento con el nombre del rol (JOIN con tabla rol).
 */
export async function findByDocumentWithRole(document) {
  const rows = await query(
    `SELECT u.*, r.nombre_rol 
     FROM users u 
     LEFT JOIN rol r ON u.id_rol = r.id_rol 
     WHERE u.document = ?`,
    [document],
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Actualiza un usuario (con contraseña).
 */
export async function updateWithPassword(id, userData) {
  const { document, doc_type, names, last_names, birth_date, email, password, id_rol, profile_photo } = userData;
  const result = await execute(
    `UPDATE users SET document = ?, doc_type = ?, names = ?, last_names = ?, 
     birth_date = ?, email = ?, password = ?, id_rol = ?, profile_photo = ?, last_update = NOW() 
     WHERE id_user = ?`,
    [document, doc_type || null, names, last_names, birth_date, email, password, id_rol, profile_photo !== undefined ? profile_photo : null, id],
  );
  return result.affectedRows > 0;
}

/**
 * Actualiza un usuario (sin contraseña).
 */
export async function updateWithoutPassword(id, userData) {
  const { document, doc_type, names, last_names, birth_date, email, id_rol, profile_photo } = userData;
  const result = await execute(
    `UPDATE users SET document = ?, doc_type = ?, names = ?, last_names = ?, 
     birth_date = ?, email = ?, id_rol = ?, profile_photo = ?, last_update = NOW() 
     WHERE id_user = ?`,
    [document, doc_type || null, names, last_names, birth_date, email, id_rol, profile_photo !== undefined ? profile_photo : null, id],
  );
  return result.affectedRows > 0;
}

/**
 * Elimina un usuario por ID.
 */
export async function deleteById(id) {
  const result = await execute("DELETE FROM users WHERE id_user = ?", [id]);
  return result.affectedRows > 0;
}

/**
 * Obtiene la lista de psicólogos.
 */
export async function findPsychologists() {
  return query("SELECT id_user, names, last_names FROM users WHERE id_rol = 2");
}

/**
 * Obtiene el nombre de un usuario por ID.
 */
export async function getNameById(userId) {
  const rows = await query("SELECT names FROM users WHERE id_user = ?", [
    userId,
  ]);
  return rows.length > 0 ? rows[0].names : "Usuario";
}

/**
 * Actualiza solo la foto de perfil de un usuario.
 */
export async function updateProfilePhoto(id, profilePhoto) {
  const result = await execute(
    "UPDATE users SET profile_photo = ?, last_update = NOW() WHERE id_user = ?",
    [profilePhoto, id],
  );
  return result.affectedRows > 0;
}

/**
 * Obtiene la foto de perfil de un usuario.
 */
export async function getProfilePhoto(id) {
  const rows = await query("SELECT profile_photo FROM users WHERE id_user = ?", [id]);
  return rows.length > 0 ? rows[0].profile_photo : null;
}
