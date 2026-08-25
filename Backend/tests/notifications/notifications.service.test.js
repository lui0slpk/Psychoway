import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../src/repositories/notification.repository.js");
vi.mock("../../src/repositories/psychobot.repository.js");

import * as notificationRepo from "../../src/repositories/notification.repository.js";
import * as psychobotRepo from "../../src/repositories/psychobot.repository.js";
import * as notificationsService from "../../src/services/notifications.service.js";

describe("Notifications service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getByUser", () => {
    // NOTIF-001: Obtiene las notificaciones de un usuario.
    it("NOTIF-001 obtiene las notificaciones de un usuario", async () => {
      // Arrange
      const notifications = [
        { id_notification: 1, id_user: 7, type: "check-in", is_read: false },
        { id_notification: 2, id_user: 7, type: "cita", is_read: true },
      ];
      notificationRepo.findByUserId.mockResolvedValue(notifications);

      // Act
      const result = await notificationsService.getByUser(7);

      // Assert
      expect(result).toEqual(notifications);
      expect(notificationRepo.findByUserId).toHaveBeenCalledWith(7);
    });

    // NOTIF-002: Usuario sin notificaciones devuelve [].
    it("NOTIF-002 devuelve [] si el usuario no tiene notificaciones", async () => {
      // Arrange
      notificationRepo.findByUserId.mockResolvedValue([]);

      // Act
      const result = await notificationsService.getByUser(7);

      // Assert
      expect(result).toEqual([]);
      expect(notificationRepo.findByUserId).toHaveBeenCalledWith(7);
    });
  });

  describe("markAsRead", () => {
    // NOTIF-003: Marca una notificación como leída.
    it("NOTIF-003 marca una notificación como leída", async () => {
      // Arrange
      notificationRepo.markAsRead.mockResolvedValue(true);

      // Act
      const result = await notificationsService.markAsRead(3);

      // Assert
      expect(result).toEqual({ message: "Notification marked as read" });
      expect(notificationRepo.markAsRead).toHaveBeenCalledWith(3);
    });
  });

  describe("evaluateCheckIn", () => {
    // NOTIF-004: Crea una notificación de check-in si hace más de 3 días sin hablar.
    it("NOTIF-004 crea una notificación de check-in si hace más de 3 días sin hablar", async () => {
      // Arrange
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      psychobotRepo.getLastSessionDate.mockResolvedValue(oldDate.toISOString());
      notificationRepo.hasUnreadCheckIn.mockResolvedValue(false);

      // Act
      const result = await notificationsService.evaluateCheckIn(7);

      // Assert
      expect(result).toEqual({ message: "Check-in evaluado" });
      expect(psychobotRepo.getLastSessionDate).toHaveBeenCalledWith(7);
      expect(notificationRepo.hasUnreadCheckIn).toHaveBeenCalledWith(7);
      expect(notificationRepo.create).toHaveBeenCalledWith(
        7,
        "check-in",
        "Psychobot: ¿Cómo vas? Hace días que no hablamos. Ven a contarme cómo te sientes.",
        "/psychobot",
      );
    });

    // NOTIF-005: No crea duplicados si ya existe una notificación de check-in sin leer.
    it("NOTIF-005 no crea duplicados si ya existe un check-in sin leer", async () => {
      // Arrange
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      psychobotRepo.getLastSessionDate.mockResolvedValue(oldDate.toISOString());
      notificationRepo.hasUnreadCheckIn.mockResolvedValue(true);

      // Act
      const result = await notificationsService.evaluateCheckIn(7);

      // Assert
      expect(result).toEqual({ message: "Check-in evaluado" });
      expect(notificationRepo.hasUnreadCheckIn).toHaveBeenCalledWith(7);
      expect(notificationRepo.create).not.toHaveBeenCalled();
    });

    // NOTIF-006: No crea una notificación si no hubo actividad previa.
    it("NOTIF-006 no crea una notificación si no hubo actividad previa", async () => {
      // Arrange
      psychobotRepo.getLastSessionDate.mockResolvedValue(null);

      // Act
      const result = await notificationsService.evaluateCheckIn(7);

      // Assert
      expect(result).toEqual({ message: "Check-in evaluado" });
      expect(psychobotRepo.getLastSessionDate).toHaveBeenCalledWith(7);
      expect(notificationRepo.hasUnreadCheckIn).not.toHaveBeenCalled();
      expect(notificationRepo.create).not.toHaveBeenCalled();
    });

    // NOTIF-007: Sin userId lanza un error 400.
    it("NOTIF-007 lanza un error 400 si no se proporciona userId", async () => {
      // Arrange

      // Act & Assert
      await expect(notificationsService.evaluateCheckIn(null)).rejects.toMatchObject({
        status: 400,
        message: "userId required",
      });
      expect(psychobotRepo.getLastSessionDate).not.toHaveBeenCalled();
      expect(notificationRepo.create).not.toHaveBeenCalled();
    });

    // NOTIF-008: Cubierto en meetings tests (crear cita crea notificación de tipo "cita").
  });
});