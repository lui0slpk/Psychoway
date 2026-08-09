import bcrypt from "bcrypt";
import * as userRepo from "../repositories/user.repository.js";
import { ROLES, ROLE_IDS } from "../utils/constants.js";
import {
  DOC_TYPES,
  normalizeEmail,
  normalizeDocument,
  normalizeText,
  normalizePhone,
  isValidEmail,
  isValidDocument,
} from "../utils/validators.js";

/**
 * Valida que la fecha de nacimiento sea coherente con el tipo de documento.
 * - CC / CE: el usuario debe tener >= 18 años.
 * - TI: el usuario debe tener < 18 años.
 * - PA (pasaporte) y otros: sin restricción.
 * @param {string} docType  - Código del tipo de documento (CC, CE, TI, PA…)
 * @param {string} birthDate - Fecha en formato YYYY-MM-DD o ISO
 */
export function validateAgeByDocType(docType, birthDate) {
  if (!docType || !birthDate) return; // Si falta alguno, no bloqueamos

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const nacimiento = new Date(birthDate);

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  if ((docType === "CC" || docType === "CE") && edad < 18) {
    throw {
      status: 400,
      message: "Con Cédula de Ciudadanía o Extranjería el usuario debe tener al menos 18 años.",
    };
  }

  if (docType === "TI" && edad >= 18) {
    throw {
      status: 400,
      message: "Con Tarjeta de Identidad el usuario debe ser menor de 18 años.",
    };
  }
}

/**
 * Crea un nuevo usuario (desde panel de admin).
 */
export async function create(userData) {
  const { rol, documento, tipoDocumento, nombres, apellidos, fechaNacimiento, correo, password, numeroContacto, numeroFijo, programaFormacion, numeroFicha } =
    userData;

  if (!documento || !nombres || !apellidos || !correo || !password || !rol) {
    throw { status: 400, message: "Todos los campos son obligatorios" };
  }

  const normalizedEmail = normalizeEmail(correo);
  const normalizedDocument = normalizeDocument(documento);
  const normalizedNames = normalizeText(nombres);
  const normalizedLastnames = normalizeText(apellidos);
  const normalizedContactNumber = normalizePhone(numeroContacto);
  const normalizedLandlineNumber = normalizePhone(numeroFijo);

  if (!DOC_TYPES.includes(tipoDocumento)) {
    throw { status: 400, message: `Tipo de documento inválido: ${tipoDocumento}` };
  }
  if (!isValidEmail(normalizedEmail)) {
    throw { status: 400, message: "El correo no es válido" };
  }
  if (!isValidDocument(normalizedDocument, tipoDocumento)) {
    throw { status: 400, message: "El documento no es válido para el tipo indicado" };
  }

  // Validar coherencia edad ↔ tipo de documento
  validateAgeByDocType(tipoDocumento, fechaNacimiento);

  const idRol = ROLE_IDS[rol.toLowerCase()] || 1;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Verificar si ya existe
  const exists = await userRepo.existsByDocumentOrEmail(normalizedDocument, normalizedEmail);
  if (exists) {
    throw { status: 409, message: "El documento o correo ya existe" };
  }

  try {
    const userId = await userRepo.create({
      document: normalizedDocument,
      doc_type: tipoDocumento,
      names: normalizedNames,
      last_names: normalizedLastnames,
      birth_date: fechaNacimiento,
      email: normalizedEmail,
      password: hashedPassword,
      contact_number: normalizedContactNumber,
      landline_number: normalizedLandlineNumber,
      training_program: programaFormacion,
      ficha_number: numeroFicha,
      id_rol: idRol,
    });

    return { message: "Usuario creado exitosamente", userId };
  } catch (error) {
    if (error.code === "23505" || error.code === "ER_DUP_ENTRY") {
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
    contact_number: user.contact_number || "",
    landline_number: user.landline_number || "",
    training_program: user.training_program || "",
    ficha_number: user.ficha_number || "",
  };
}

/**
 * Actualiza un usuario.
 */
export async function update(id, userData) {
  const { rol, documento, tipoDocumento, nombres, apellidos, fechaNacimiento, correo, password, numeroContacto, numeroFijo, programaFormacion, numeroFicha } =
    userData;

  const idRol = ROLE_IDS[(rol || "").toLowerCase()];
  if (idRol === undefined) {
    throw { status: 400, message: "El rol especificado no es válido" };
  }

  const normalizedEmail = normalizeEmail(correo);
  const normalizedDocument = normalizeDocument(documento);
  const normalizedNames = normalizeText(nombres);
  const normalizedLastnames = normalizeText(apellidos);
  const normalizedContactNumber = normalizePhone(numeroContacto);
  const normalizedLandlineNumber = normalizePhone(numeroFijo);

  if (!DOC_TYPES.includes(tipoDocumento)) {
    throw { status: 400, message: `Tipo de documento inválido: ${tipoDocumento}` };
  }
  if (!isValidEmail(normalizedEmail)) {
    throw { status: 400, message: "El correo no es válido" };
  }
  if (!isValidDocument(normalizedDocument, tipoDocumento)) {
    throw { status: 400, message: "El documento no es válido para el tipo indicado" };
  }

  // Validar coherencia edad ↔ tipo de documento
  validateAgeByDocType(tipoDocumento, fechaNacimiento);

  // Verificar unicidad excluyendo al propio usuario
  const duplicate = await userRepo.existsByDocumentOrEmailExcluding(
    normalizedDocument,
    normalizedEmail,
    id,
  );
  if (duplicate) {
    throw { status: 409, message: "El documento o correo ya existe" };
  }

  let updated;

  if (password && password.trim() !== "") {
    const hashedPassword = await bcrypt.hash(password, 10);
    updated = await userRepo.updateWithPassword(id, {
      document: normalizedDocument,
      doc_type: tipoDocumento,
      names: normalizedNames,
      last_names: normalizedLastnames,
      birth_date: fechaNacimiento,
      email: normalizedEmail,
      password: hashedPassword,
      contact_number: normalizedContactNumber,
      landline_number: normalizedLandlineNumber,
      training_program: programaFormacion,
      ficha_number: numeroFicha,
      id_rol: idRol,
    });
  } else {
    updated = await userRepo.updateWithoutPassword(id, {
      document: normalizedDocument,
      doc_type: tipoDocumento,
      names: normalizedNames,
      last_names: normalizedLastnames,
      birth_date: fechaNacimiento,
      email: normalizedEmail,
      contact_number: normalizedContactNumber,
      landline_number: normalizedLandlineNumber,
      training_program: programaFormacion,
      ficha_number: numeroFicha,
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
    if (error.code === "23503" || error.code === "ER_ROW_IS_REFERENCED_2") {
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

/**
 * Actualiza el perfil del usuario autenticado (sin cambiar rol).
 */
export async function updateProfile(id, userData) {
  const { documento, tipoDocumento, nombres, apellidos, fechaNacimiento, correo, password, profilePhoto, numeroContacto, numeroFijo, programaFormacion, numeroFicha } = userData;

  // Obtener el usuario actual para mantener su rol
  const currentUser = await userRepo.findById(id);
  if (!currentUser) {
    throw { status: 404, message: "Usuario no encontrado" };
  }

  const updateData = {
    document: normalizeDocument(documento || currentUser.document),
    doc_type: tipoDocumento || currentUser.doc_type,
    names: normalizeText(nombres || currentUser.names),
    last_names: normalizeText(apellidos || currentUser.last_names),
    birth_date: fechaNacimiento || currentUser.birth_date,
    email: normalizeEmail(correo || currentUser.email),
    contact_number: normalizePhone(numeroContacto || currentUser.contact_number),
    landline_number: normalizePhone(numeroFijo || currentUser.landline_number),
    training_program: programaFormacion || currentUser.training_program,
    ficha_number: numeroFicha || currentUser.ficha_number,
    id_rol: currentUser.id_rol,
    profile_photo: profilePhoto !== undefined ? profilePhoto : currentUser.profile_photo,
  };

  if (!DOC_TYPES.includes(updateData.doc_type)) {
    throw { status: 400, message: `Tipo de documento inválido: ${updateData.doc_type}` };
  }
  if (!isValidEmail(updateData.email)) {
    throw { status: 400, message: "El correo no es válido" };
  }
  if (!isValidDocument(updateData.document, updateData.doc_type)) {
    throw { status: 400, message: "El documento no es válido para el tipo indicado" };
  }

  // Verificar unicidad excluyendo al propio usuario
  const duplicate = await userRepo.existsByDocumentOrEmailExcluding(
    updateData.document,
    updateData.email,
    id,
  );
  if (duplicate) {
    throw { status: 409, message: "El documento o correo ya se encuentra registrado" };
  }

  let updated;
  if (password && password.trim() !== "") {
    const hashedPassword = await bcrypt.hash(password, 10);
    updated = await userRepo.updateWithPassword(id, {
      ...updateData,
      password: hashedPassword,
    });
  } else {
    updated = await userRepo.updateWithoutPassword(id, updateData);
  }

  if (!updated) {
    throw { status: 404, message: "Usuario no encontrado" };
  }

  // Devolver los datos actualizados para sincronizar el frontend
  const updatedUser = await userRepo.findById(id);
  const rolesMapById = { 1: "aprendiz", 2: "psicologo", 3: "administrador" };

  return {
    message: "Perfil actualizado correctamente",
    user: {
      id: updatedUser.id_user,
      id_user: updatedUser.id_user,
      document: updatedUser.document,
      names: updatedUser.names,
      last_names: updatedUser.last_names,
      id_rol: updatedUser.id_rol,
      rol: rolesMapById[updatedUser.id_rol] || "aprendiz",
      profile_photo: updatedUser.profile_photo || null,
    }
  };
}

/**
 * Actualiza solo la foto de perfil.
 */
export async function updateProfilePhoto(id, profilePhoto) {
  const updated = await userRepo.updateProfilePhoto(id, profilePhoto);
  if (!updated) {
    throw { status: 404, message: "Usuario no encontrado" };
  }
  return { message: "Foto de perfil actualizada", profile_photo: profilePhoto };
}

/**
 * Obtiene la foto de perfil de un usuario.
 */
export async function getProfilePhoto(id) {
  const photo = await userRepo.getProfilePhoto(id);
  return { profile_photo: photo };
}

/**
 * Obtiene el perfil completo del usuario.
 */
export async function getFullProfile(id) {
  const user = await userRepo.findById(id);
  if (!user) {
    throw { status: 404, message: "Usuario no encontrado" };
  }

  const rolesMapById = { 1: "aprendiz", 2: "psicologo", 3: "administrador" };

  return {
    id_user: user.id_user,
    document: user.document,
    tipoDocumento: user.doc_type || "",
    nombres: user.names,
    apellidos: user.last_names,
    fechaNacimiento: user.birth_date
      ? new Date(user.birth_date).toISOString().split("T")[0]
      : "",
    correo: user.email,
    rol: rolesMapById[user.id_rol] || "aprendiz",
    profile_photo: user.profile_photo || null,
  };
}
