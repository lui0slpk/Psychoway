import * as notificationRepo from "../repositories/notification.repository.js";
import * as psychobotRepo from "../repositories/psychobot.repository.js";

/**
 * Obtiene las notificaciones de un usuario.
 */
export async function getByUser(userId) {
  return notificationRepo.findByUserId(userId);
}

/**
 * Marca una notificación como leída.
 */
export async function markAsRead(notificationId) {
  await notificationRepo.markAsRead(notificationId);
  return { message: "Notification marked as read" };
}

/**
 * Evalúa si el usuario necesita un check-in.
 */
export async function evaluateCheckIn(userId) {
  if (!userId) {
    throw { status: 400, message: "userId required" };
  }

  const lastSessionDate = await psychobotRepo.getLastSessionDate(userId);

  if (lastSessionDate) {
    const lastSession = new Date(lastSessionDate);
    const now = new Date();
    const diffDays = (now - lastSession) / (1000 * 60 * 60 * 24);

    if (diffDays > 3) {
      const hasExisting = await notificationRepo.hasUnreadCheckIn(userId);
      if (!hasExisting) {
        await notificationRepo.create(
          userId,
          "check-in",
          "Psychobot: ¿Cómo vas? Hace días que no hablamos. Ven a contarme cómo te sientes.",
          "/psychobot",
        );
      }
    }
  }

  return { message: "Check-in evaluado" };
}
