import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import env from "../config/environment.js";
import * as userRepo from "../repositories/user.repository.js";
import { sendPasswordResetEmail } from "./email.service.js";
import { ROLES } from "../utils/constants.js";
import { validateAgeByDocType } from "./users.service.js";
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
 * Almacén temporal de tokens de recuperación.
 * En producción, usar base de datos o Redis.
 */
const resetTokens = new Map();

/**
 * Registra un nuevo usuario.
 */
export async function register(userData) {
  const { document, doc_type, names, last_names, birth_date, email, password, contact_number, landline_number, training_program, ficha_number } = userData;

  const normalizedEmail = normalizeEmail(email);
  const normalizedDocument = normalizeDocument(document);
  const normalizedNames = normalizeText(names);
  const normalizedLastnames = normalizeText(last_names);
  const normalizedContactNumber = normalizePhone(contact_number);
  const normalizedLandlineNumber = normalizePhone(landline_number);

  if (!DOC_TYPES.includes(doc_type)) {
    throw { status: 400, message: `Tipo de documento inválido: ${doc_type}` };
  }
  if (!isValidEmail(normalizedEmail)) {
    throw { status: 400, message: "El correo no es válido" };
  }
  if (!isValidDocument(normalizedDocument, doc_type)) {
    throw { status: 400, message: "El documento no es válido para el tipo indicado" };
  }

  // Validar coherencia edad ↔ tipo de documento
  validateAgeByDocType(doc_type, birth_date);

  // Verificar si ya existe
  const exists = await userRepo.existsByDocumentOrEmail(normalizedDocument, normalizedEmail);
  if (exists) {
    throw { status: 409, message: "El documento o correo ya se encuentra registrado" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await userRepo.create({
      document: normalizedDocument,
      doc_type,
      names: normalizedNames,
      last_names: normalizedLastnames,
      birth_date,
      email: normalizedEmail,
      password: hashedPassword,
      contact_number: normalizedContactNumber,
      landline_number: normalizedLandlineNumber,
      training_program,
      ficha_number,
      id_rol: 1, // Aprendiz por defecto
    });

    return { message: "Usuario registrado correctamente" };
  } catch (error) {
    if (error.code === "23505" || error.code === "ER_DUP_ENTRY") {
      throw { status: 409, message: "El documento o correo ya se encuentra registrado" };
    }
    throw error;
  }
}

/**
 * Inicia sesión y genera token JWT.
 */
export async function login(document, password) {
  const user = await userRepo.findByDocument(document);

  if (!user) {
    throw { status: 400, message: "Documento o contraseña incorrectos" };
  }

  const isMatch = await bcrypt.compare(password, user.password);

  console.log(`🔍 Intento de Login: Documento=${document}`);
  console.log(`   - Resultado comparación: ${isMatch}`);

  if (!isMatch) {
    console.log("❌ Contraseña incorrecta");
    throw { status: 400, message: "Documento o contraseña incorrectos" };
  }

  // Obtener nombre del rol
  const roleName = ROLES[user.id_rol];
  if (!roleName) {
    console.warn(
      `⚠️ Rol no reconocido para ID ${user.id_rol}. Asignando 'aprendiz' por defecto.`,
    );
  }
  const finalRole = roleName || "aprendiz";
  const finalUserId = user.id_user || user.id;

  console.log(`✅ Login exitoso: ID=${finalUserId}, Rol=${finalRole}`);

  // Generar token JWT
  const token = jwt.sign(
    { userId: finalUserId, role: finalRole, document: user.document },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );

  return {
    message: "Login exitoso",
    token,
    user: {
      id: finalUserId,
      id_user: finalUserId,
      document: user.document,
      names: user.names,
      last_names: user.last_names,
      id_rol: user.id_rol,
      rol: finalRole,
      profile_photo: user.profile_photo || null,
    },
  };
}

/**
 * Solicita recuperación de contraseña.
 */
export async function forgotPassword(email) {
  if (!email) {
    throw { status: 400, message: "El correo es requerido" };
  }

  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw { status: 404, message: "Correo no encontrado" };
  }

  // Generar token único
  const token = crypto.randomBytes(32).toString("hex");

  // Guardar token con expiración de 1 hora
  resetTokens.set(token, {
    userId: user.id_user,
    email: user.email,
    expiresAt: Date.now() + 3600000,
  });

  // Crear enlace de recuperación
  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendPasswordResetEmail(user.email, resetLink);
  console.log(`📧 Enlace de recuperación enviado a: ${user.email}`);

  return { message: "Correo de recuperación enviado exitosamente" };
}

/**
 * Restablece la contraseña con un token.
 */
export async function resetPassword(token, newPassword) {
  if (!token || !newPassword) {
    throw { status: 400, message: "Token y nueva contraseña son requeridos" };
  }

  const tokenData = resetTokens.get(token);

  if (!tokenData) {
    throw { status: 400, message: "Token inválido o expirado" };
  }

  if (Date.now() > tokenData.expiresAt) {
    resetTokens.delete(token);
    throw { status: 400, message: "El token ha expirado" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userRepo.updatePassword(tokenData.userId, hashedPassword);

  // Eliminar token usado
  resetTokens.delete(token);
  console.log(`✅ Contraseña actualizada para usuario ID: ${tokenData.userId}`);

  return { message: "Contraseña actualizada correctamente" };
}
