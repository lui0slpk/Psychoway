import * as diaryRepo from "../repositories/diary.repository.js";
import * as emotionRepo from "../repositories/emotion.repository.js";
import * as objectiveRepo from "../repositories/objective.repository.js";
import { EMOTION_NAMES, EMOTION_STATES } from "../utils/constants.js";

/**
 * Crea una entrada de diario.
 */
export async function createEntry(userId, emotionIndex, description) {
  if (!userId || emotionIndex === undefined) {
    throw { status: 400, message: "userId y emotionIndex son requeridos" };
  }

  // 1. Verificar/crear diario del usuario
  let diary = await diaryRepo.findByUserId(userId);
  let diaryId;

  if (diary) {
    diaryId = diary.id_diary;
  } else {
    diaryId = await diaryRepo.create(userId);
  }

  // 2. Verificar/crear emoción
  const emotionName = EMOTION_NAMES[emotionIndex] || "Neutral";
  const emotionState = EMOTION_STATES[emotionIndex] || "Neutral";

  let emotion = await emotionRepo.findByName(emotionName);
  let emotionId;

  if (emotion) {
    emotionId = emotion.id_emotions;
  } else {
    emotionId = await emotionRepo.create(emotionName, emotionState);
  }

  // 3. Buscar último objetivo
  const objectiveId = await objectiveRepo.findLatest();

  // 4. Crear entrada
  const entryId = await diaryRepo.createEntry(diaryId, description, emotionId, objectiveId);

  return {
    message: "Entrada de diario registrada correctamente",
    entryId,
  };
}

/**
 * Obtiene las entradas de diario de un usuario.
 */
export async function getEntries(userId) {
  return diaryRepo.getEntriesByUserId(userId);
}

/**
 * Obtiene la configuración de privacidad.
 */
export async function getPrivacy(userId) {
  const result = await diaryRepo.getVisibility(userId);
  return result || { diary_visibility: "yo-psicologo" };
}

/**
 * Actualiza la configuración de privacidad.
 */
export async function updatePrivacy(userId, visibilidad) {
  if (!visibilidad) {
    throw { status: 400, message: "Visibilidad es requerida" };
  }

  const diary = await diaryRepo.findByUserId(userId);

  if (diary) {
    await diaryRepo.updateVisibility(userId, visibilidad);
  } else {
    await diaryRepo.createWithVisibility(userId, visibilidad);
  }

  return { message: "Privacidad actualizada correctamente" };
}
