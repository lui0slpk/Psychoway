import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../src/services/notifications.service.js");

import * as notificationsService from "../../src/services/notifications.service.js";
import * as notificationsController from "../../src/controllers/notifications.controller.js";

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe("Notifications controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getByUser", () => {
    // Controller getByUser: devuelve las notificaciones del usuario.
    it("devuelve las notificaciones del usuario y responde 200", async () => {
      // Arrange
      const notifications = [
        { id_notification: 1, id_user: 7, type: "check-in", is_read: false },
      ];
      notificationsService.getByUser.mockResolvedValue(notifications);

      const req = { params: { userId: 7 } };
      const res = makeRes();
      const next = vi.fn();

      // Act
      await notificationsController.getByUser(req, res, next);

      // Assert
      expect(notificationsService.getByUser).toHaveBeenCalledWith(7);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(notifications);
      expect(next).not.toHaveBeenCalled();
    });

    it("deriva el error al middleware next si el servicio falla", async () => {
      // Arrange
      const error = { status: 500, message: "Error interno" };
      notificationsService.getByUser.mockRejectedValue(error);

      const req = { params: { userId: 7 } };
      const res = makeRes();
      const next = vi.fn();

      // Act
      await notificationsController.getByUser(req, res, next);

      // Assert
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("markAsRead", () => {
    // Controller markAsRead: llama al servicio para marcar como leída.
    it("llama al servicio markAsRead y responde 200 con el resultado", async () => {
      // Arrange
      const result = { message: "Notification marked as read" };
      notificationsService.markAsRead.mockResolvedValue(result);

      const req = { params: { id: 3 } };
      const res = makeRes();
      const next = vi.fn();

      // Act
      await notificationsController.markAsRead(req, res, next);

      // Assert
      expect(notificationsService.markAsRead).toHaveBeenCalledWith(3);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("checkIn", () => {
    // Controller checkIn: llama al servicio evaluateCheckIn.
    it("llama al servicio evaluateCheckIn y responde 200 con el resultado", async () => {
      // Arrange
      const result = { message: "Check-in evaluado" };
      notificationsService.evaluateCheckIn.mockResolvedValue(result);

      const req = { body: { userId: 7 } };
      const res = makeRes();
      const next = vi.fn();

      // Act
      await notificationsController.checkIn(req, res, next);

      // Assert
      expect(notificationsService.evaluateCheckIn).toHaveBeenCalledWith(7);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
      expect(next).not.toHaveBeenCalled();
    });

    it("deriva el error al middleware next si el servicio falla", async () => {
      // Arrange
      const error = { status: 400, message: "userId required" };
      notificationsService.evaluateCheckIn.mockRejectedValue(error);

      const req = { body: {} };
      const res = makeRes();
      const next = vi.fn();

      // Act
      await notificationsController.checkIn(req, res, next);

      // Assert
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});