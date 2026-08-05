import * as objectiveRepo from "../repositories/objective.repository.js";
import { analyzeContent } from "./safety.service.js";

/**
 * Crea un nuevo objetivo.
 */
export async function create(userId, nombre, descripcion, estado) {
  if (!userId || !nombre) {
    throw { status: 400, message: "userId y nombre son requeridos" };
  }

  const objectiveId = await objectiveRepo.create(userId, nombre, descripcion, estado);

  // Análisis de seguridad en segundo plano (fire-and-forget, no bloquea la respuesta)
  const textToAnalyze = [nombre, descripcion].filter(Boolean).join(" ");
  if (textToAnalyze) {
    analyzeContent(userId, textToAnalyze, "objetivo").catch(() => {});
  }

  return {
    message: "Objetivo creado correctamente",
    objectiveId,
  };
}

/**
 * Obtiene los objetivos de un usuario.
 */
export async function getByUser(userId) {
  return objectiveRepo.findByUserId(userId);
}

/**
 * Actualiza un objetivo.
 */
export async function update(id, nombre, descripcion, estado) {
  const updated = await objectiveRepo.update(id, nombre, descripcion, estado);

  if (!updated) {
    throw { status: 404, message: "Objetivo no encontrado" };
  }

  return { message: "Objetivo actualizado correctamente" };
}

/**
 * Elimina un objetivo.
 */
export async function remove(id) {
  const deleted = await objectiveRepo.deleteById(id);

  if (!deleted) {
    throw { status: 404, message: "Objetivo no encontrado" };
  }

  return { message: "Objetivo eliminado correctamente" };
}
