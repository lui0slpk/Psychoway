import { query, execute } from "../config/database.js";

/**
 * Busca un usuario por documento.
 */
export async function findByDocument(document) {
  const rows = await query("SELECT * FROM users WHERE document = $1", [document]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Busca un usuario por email.
 */
export async function findByEmail(email) {
  const rows = await query(
    "SELECT id_user, email, names FROM users WHERE email = $1",
    [email],
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Busca un usuario por ID.
 */
export async function findById(id) {
  const rows = await query("SELECT * FROM users WHERE id_user = $1", [id]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Verifica si un documento o email ya existen.
 */
export async function existsByDocumentOrEmail(document, email) {
  const rows = await query(
    "SELECT id_user FROM users WHERE document = $1 OR email = $2",
    [document, email],
  );
  return rows.length > 0;
}

/**
 * Verifica si un documento o email ya existen en otro usuario.
 * Excluye al usuario indicado (para validar unicidad en updates).
 */
export async function existsByDocumentOrEmailExcluding(document, email, excludeId) {
  const rows = await query(
    "SELECT id_user FROM users WHERE (document = $1 OR email = $2) AND id_user <> $3",
    [document, email, excludeId],
  );
  return rows.length > 0;
}

/**
 * Crea un nuevo usuario.
 */
export async function create(userData) {
  const { document, doc_type, names, last_names, birth_date, email, password, contact_number, landline_number, training_program, ficha_number, id_rol } = userData;
  const result = await execute(
<<<<<<< HEAD
    `INSERT INTO users (document, doc_type, names, last_names, birth_date, email, password, contact_number, landline_number, training_program, ficha_number, id_rol, last_update)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
     RETURNING id_user`,
    [document, doc_type || null, names, last_names, birth_date, email, password, contact_number || null, landline_number || null, training_program || null, ficha_number || null, id_rol],
=======
    `INSERT INTO users (document, doc_type, names, last_names, birth_date, email, password, id_rol, last_update)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING id_user`,
    [document, doc_type || null, names, last_names, birth_date, email, password, id_rol],
>>>>>>> origin/main
  );
  return result.rows[0].id_user;
}

/**
 * Actualiza la contraseña de un usuario.
 */
export async function updatePassword(userId, hashedPassword) {
  const result = await execute(
    "UPDATE users SET password = $1, last_update = NOW() WHERE id_user = $2",
    [hashedPassword, userId],
  );
  return result.rowCount > 0;
}

/**
 * Busca un usuario por documento con el nombre del rol (JOIN con tabla rol).
 */
export async function findByDocumentWithRole(document) {
  const rows = await query(
    `SELECT u.*, r.nombre_rol 
     FROM users u 
     LEFT JOIN rol r ON u.id_rol = r.id_rol 
     WHERE u.document = $1`,
    [document],
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Actualiza un usuario (con contraseña).
 */
export async function updateWithPassword(id, userData) {
  const { document, doc_type, names, last_names, birth_date, email, password, id_rol, profile_photo, contact_number, landline_number, training_program, ficha_number } = userData;
  const result = await execute(
    `UPDATE users SET document = $1, doc_type = $2, names = $3, last_names = $4, 
<<<<<<< HEAD
     birth_date = $5, email = $6, password = $7, id_rol = $8, profile_photo = $9, 
     contact_number = $10, landline_number = $11, training_program = $12, ficha_number = $13, 
     last_update = NOW() 
     WHERE id_user = $14`,
    [document, doc_type || null, names, last_names, birth_date, email, password, id_rol, profile_photo !== undefined ? profile_photo : null, contact_number || null, landline_number || null, training_program || null, ficha_number || null, id],
=======
     birth_date = $5, email = $6, password = $7, id_rol = $8, profile_photo = $9, last_update = NOW() 
     WHERE id_user = $10`,
    [document, doc_type || null, names, last_names, birth_date, email, password, id_rol, profile_photo !== undefined ? profile_photo : null, id],
>>>>>>> origin/main
  );
  return result.rowCount > 0;
}

/**
 * Actualiza un usuario (sin contraseña).
 */
export async function updateWithoutPassword(id, userData) {
  const { document, doc_type, names, last_names, birth_date, email, id_rol, profile_photo, contact_number, landline_number, training_program, ficha_number } = userData;
  const result = await execute(
    `UPDATE users SET document = $1, doc_type = $2, names = $3, last_names = $4, 
<<<<<<< HEAD
     birth_date = $5, email = $6, id_rol = $7, profile_photo = $8, 
     contact_number = $9, landline_number = $10, training_program = $11, ficha_number = $12, 
     last_update = NOW() 
     WHERE id_user = $13`,
    [document, doc_type || null, names, last_names, birth_date, email, id_rol, profile_photo !== undefined ? profile_photo : null, contact_number || null, landline_number || null, training_program || null, ficha_number || null, id],
=======
     birth_date = $5, email = $6, id_rol = $7, profile_photo = $8, last_update = NOW() 
     WHERE id_user = $9`,
    [document, doc_type || null, names, last_names, birth_date, email, id_rol, profile_photo !== undefined ? profile_photo : null, id],
>>>>>>> origin/main
  );
  return result.rowCount > 0;
}

/**
 * Elimina un usuario por ID.
 */
export async function deleteById(id) {
  const result = await execute("DELETE FROM users WHERE id_user = $1", [id]);
  return result.rowCount > 0;
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
  const rows = await query("SELECT names FROM users WHERE id_user = $1", [userId]);
  return rows.length > 0 ? rows[0].names : "Usuario";
}

/**
 * Actualiza solo la foto de perfil de un usuario.
 */
export async function updateProfilePhoto(id, profilePhoto) {
  const result = await execute(
    "UPDATE users SET profile_photo = $1, last_update = NOW() WHERE id_user = $2",
    [profilePhoto, id],
  );
  return result.rowCount > 0;
}

export async function updateProfile(id, data) {
<<<<<<< HEAD
  const { document, doc_type, names, last_names, birth_date, email, password, profile_photo, contact_number, landline_number, training_program, ficha_number } = data;

  let paramIndex = 1;
  const params = [document, doc_type || null, names, last_names, birth_date || null, email, contact_number || null, landline_number || null, training_program || null, ficha_number || null];
  paramIndex = 11;

  let queryStr = `UPDATE users SET document = $1, doc_type = $2, names = $3, last_names = $4, birth_date = $5, email = $6, contact_number = $7, landline_number = $8, training_program = $9, ficha_number = $10`;
=======
  const { document, doc_type, names, last_names, birth_date, email, password, profile_photo } = data;

  let paramIndex = 1;
  const params = [document, doc_type || null, names, last_names, birth_date || null, email];
  paramIndex = 7;

  let queryStr = `UPDATE users SET document = $1, doc_type = $2, names = $3, last_names = $4, birth_date = $5, email = $6`;
>>>>>>> origin/main

  if (password) {
    queryStr += `, password = $${paramIndex}`;
    params.push(password);
    paramIndex++;
  }

  if (profile_photo !== undefined) {
    queryStr += `, profile_photo = $${paramIndex}`;
    params.push(profile_photo);
    paramIndex++;
  }

  queryStr += `, last_update = NOW() WHERE id_user = $${paramIndex}`;
  params.push(id);

  const result = await execute(queryStr, params);
  return result.rowCount > 0;
}

// ==================== MÉTODOS PARA RESET DE CONTRASEÑA EN BD ====================

/**
 * Guarda el token de recuperación y su expiración en la tabla users.
 */
export async function saveResetToken(userId, token, expiresAt) {
  const result = await execute(
    "UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id_user = $3",
    [token, expiresAt, userId],
  );
  return result.rowCount > 0;
}

/**
 * Obtiene la foto de perfil de un usuario.
 */
export async function getProfilePhoto(id) {
  const rows = await query("SELECT profile_photo FROM users WHERE id_user = $1", [id]);
  return rows.length > 0 ? rows[0].profile_photo : null;
}

/**
 * Busca un usuario por su token de reset válido (no expirado).
 */
export async function findByResetToken(token) {
  const rows = await query(
    "SELECT id_user, email FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()",
    [token],
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Limpia el token de reset después de usarlo o al expirar.
 */
export async function clearResetToken(userId) {
  const result = await execute(
    "UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id_user = $1",
    [userId],
  );
  return result.rowCount > 0;
}
