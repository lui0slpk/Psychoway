import * as meetingRepo from "../repositories/meeting.repository.js";
import * as notificationRepo from "../repositories/notification.repository.js";

/**
 * Crea una nueva cita.
 */
export async function create(userId, professionalId, day, hour, description) {
  if (!userId || !professionalId || !day || !hour) {
    throw { status: 400, message: "Todos los campos son requeridos" };
  }

  // Verificar disponibilidad
  const taken = await meetingRepo.isSlotTaken(professionalId, day, hour);
  if (taken) {
    throw {
      status: 409,
      message: "Ese horario ya está ocupado para este profesional.",
    };
  }

  const meetingId = await meetingRepo.create(userId, professionalId, day, hour, description);

  // Crear notificación de cita agendada
  try {
    await notificationRepo.create(
      userId,
      "cita",
      `Nueva cita agendada el ${day} a las ${hour}`,
      "/agenda",
    );
  } catch (err) {
    // No fallar si la notificación falla
    console.error("⚠️ Error creando notificación de cita:", err.message);
  }

  return { message: "Cita agendada exitosamente", id: meetingId };
}

/**
 * Obtiene la agenda ocupada de un psicólogo.
 */
export async function getByProfessional(professionalId) {
  return meetingRepo.findByProfessionalId(professionalId);
}

/**
 * Obtiene el historial de citas de un usuario.
 */
export async function getByUser(userId) {
  return meetingRepo.findByUserId(userId);
}

/**
 * Obtiene el historial de citas de un profesional.
 */
export async function getProfessionalHistory(professionalId) {
  return meetingRepo.findByProfessionalHistory(professionalId);
}
