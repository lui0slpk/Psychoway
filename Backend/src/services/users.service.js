import bcrypt from "bcrypt";
import * as userRepo from "../repositories/user.repository.js";
import { ROLES, ROLE_IDS } from "../utils/constants.js";

/**
 * Crea un nuevo usuario (desde panel de admin).
 */
export async function create(userData) {
  const { rol, documento, tipoDocumento, nombres, apellidos, fechaNacimiento, correo, password } =
    userData;

  if (!documento || !nombres || !apellidos || !correo || !password || !rol) {
    throw { status: 400, message: "Todos los campos son obligatorios" };
  }

  const idRol = ROLE_IDS[rol.toLowerCase()] || 1;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userId = await userRepo.create({
      document: documento,
      doc_type: tipoDocumento,
      names: nombres,
      last_names: apellidos,
      birth_date: fechaNacimiento,
      email: correo,
      password: hashedPassword,
      id_rol: idRol,
    });

    return { message: "Usuario creado exitosamente", userId };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw { status: 409, message: "El documento o correo ya existe" };
    }
    throw error;
  }
}

/**
 * Busca un usuario por documento.
 */
export async function searchByDocument(document) {
  const user = await userRepo.findByDocumentWithRole(document);

  if (!user) {
    throw { status: 404, message: "Usuario no encontrado" };
  }

  const rolesMapById = { 1: "aprendiz", 2: "psicologo", 3: "administrador" };
  const roleString = user.nombre_rol
    ? user.nombre_rol.toLowerCase()
    : rolesMapById[user.id_rol] || "aprendiz";

  return {
    id_user: user.id_user,
    document: user.document,
    tipoDocumento: user.doc_type || "",
    rol: roleString,
    nombres: user.names,
    apellidos: user.last_names,
    fechaNacimiento: user.birth_date
      ? new Date(user.birth_date).toISOString().split("T")[0]
      : "",
    correo: user.email,
  };
}

/**
 * Actualiza un usuario.
 */
export async function update(id, userData) {
  const { rol, documento, tipoDocumento, nombres, apellidos, fechaNacimiento, correo, password } =
    userData;

  const idRol = ROLE_IDS[rol.toLowerCase()] || 1;
  let updated;

  if (password && password.trim() !== "") {
    const hashedPassword = await bcrypt.hash(password, 10);
    updated = await userRepo.updateWithPassword(id, {
      document: documento,
      doc_type: tipoDocumento,
      names: nombres,
      last_names: apellidos,
      birth_date: fechaNacimiento,
      email: correo,
      password: hashedPassword,
      id_rol: idRol,
    });
  } else {
    updated = await userRepo.updateWithoutPassword(id, {
      document: documento,
      doc_type: tipoDocumento,
      names: nombres,
      last_names: apellidos,
      birth_date: fechaNacimiento,
      email: correo,
      id_rol: idRol,
    });
  }

  if (!updated) {
    throw { status: 404, message: "Usuario no encontrado" };
  }

  return { message: "Usuario actualizado correctamente" };
}

/**
 * Elimina un usuario.
 */
export async function remove(id) {
  try {
    const deleted = await userRepo.deleteById(id);

    if (!deleted) {
      throw { status: 404, message: "Usuario no encontrado" };
    }

    return { message: "Usuario eliminado correctamente" };
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      throw {
        status: 400,
        message: "No se puede eliminar: El usuario tiene registros asociados.",
      };
    }
    throw error;
  }
}

/**
 * Obtiene la lista de psicólogos.
 */
export async function getPsychologists() {
  return userRepo.findPsychologists();
}
