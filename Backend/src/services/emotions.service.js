import * as emotionRepo from "../repositories/emotion.repository.js";

/**
 * Obtiene todas las emociones.
 */
export async function getAll() {
  return emotionRepo.findAll();
}
