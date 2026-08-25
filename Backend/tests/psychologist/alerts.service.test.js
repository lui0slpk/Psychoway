import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../src/repositories/alert.repository.js");

import * as alertRepo from "../../src/repositories/alert.repository.js";
import * as alertsService from "../../src/services/alerts.service.js";

describe("alerts.service - getAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("PSI-001: obtiene todas las alertas de riesgo", async () => {
    // Arrange
    const alerts = [
      { id_alert: 1, motivo: "Ansiedad elevada", leido: false },
      { id_alert: 2, motivo: "Baja asistencia", leido: true },
    ];
    alertRepo.findAll.mockResolvedValue(alerts);

    // Act
    const result = await alertsService.getAll();

    // Assert
    expect(alertRepo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(alerts);
  });

  it("PSI-002: devuelve [] cuando no hay alertas", async () => {
    // Arrange
    alertRepo.findAll.mockResolvedValue([]);

    // Act
    const result = await alertsService.getAll();

    // Assert
    expect(alertRepo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });
});

describe("alerts.service - markAsRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("PSI-003: marca una alerta como leída", async () => {
    // Arrange
    alertRepo.markAsRead.mockResolvedValue(true);

    // Act
    const result = await alertsService.markAsRead(1);

    // Assert
    expect(alertRepo.markAsRead).toHaveBeenCalledWith(1);
    expect(result).toEqual({ message: "Alert marked as read" });
  });

  it("PSI-004: marca una alerta inexistente -> 404 Alerta no encontrada", async () => {
    // Arrange
    alertRepo.markAsRead.mockResolvedValue(false);

    // Act
    const act = () => alertsService.markAsRead(999);

    // Assert
    await expect(act()).rejects.toEqual({
      status: 404,
      message: "Alerta no encontrada",
    });
    expect(alertRepo.markAsRead).toHaveBeenCalledWith(999);
  });
});