import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../src/repositories/meeting.repository.js");
vi.mock("../../src/repositories/notification.repository.js");

import * as meetingRepo from "../../src/repositories/meeting.repository.js";
import * as notificationRepo from "../../src/repositories/notification.repository.js";
import * as meetingsService from "../../src/services/meetings.service.js";

/**
 * Devuelve una fecha futura (ISO, sin hora) y una hora válida, para que los
 * tests de "fecha futura" no dependan del momento en que se ejecutan.
 */
function futureDayAndHour() {
  const future = new Date();
  future.setFullYear(future.getFullYear() + 1);
  future.setMonth(0);
  future.setDate(1);
  const day = future.toISOString().slice(0, 10);
  const hour = "10:00";
  return { day, hour };
}

describe("Meetings service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    // MEET-001: Agenda una cita en un horario disponible.
    it("MEET-001 agenda una cita en un horario disponible", async () => {
      const { day, hour } = futureDayAndHour();
      meetingRepo.isSlotTaken.mockResolvedValue(false);
      meetingRepo.create.mockResolvedValue(42);

      const result = await meetingsService.create(1, 7, day, hour, "Consulta");

      expect(result).toEqual({ message: "Cita agendada exitosamente", id: 42 });
      expect(meetingRepo.isSlotTaken).toHaveBeenCalledWith(7, day, hour);
      expect(meetingRepo.create).toHaveBeenCalledWith(1, 7, day, hour, "Consulta");
    });

    // MEET-002: Rechaza una cita en una fecha pasada.
    it("MEET-002 rechaza una cita en una fecha pasada con 400", async () => {
      const pastDay = "2000-01-01";
      const hour = "10:00";

      await expect(meetingsService.create(1, 7, pastDay, hour, "Consulta")).rejects.toMatchObject({
        status: 400,
        message: "No puedes agendar una cita en una fecha u hora que ya pasó.",
      });
      expect(meetingRepo.isSlotTaken).not.toHaveBeenCalled();
      expect(meetingRepo.create).not.toHaveBeenCalled();
    });

    // MEET-003: Rechaza una cita en un horario ocupado.
    it("MEET-003 rechaza una cita en un horario ocupado con 409", async () => {
      const { day, hour } = futureDayAndHour();
      meetingRepo.isSlotTaken.mockResolvedValue(true);

      await expect(meetingsService.create(1, 7, day, hour, "Consulta")).rejects.toMatchObject({
        status: 409,
        message: "Ese horario ya está ocupado para este profesional.",
      });
      expect(meetingRepo.create).not.toHaveBeenCalled();
      expect(notificationRepo.create).not.toHaveBeenCalled();
    });

    // MEET-004: Rechaza una cita sin los campos requeridos.
    it("MEET-004 rechaza una cita sin los campos requeridos con 400", async () => {
      const { day, hour } = futureDayAndHour();

      await expect(meetingsService.create(null, 7, day, hour)).rejects.toMatchObject({
        status: 400,
        message: "Todos los campos son requeridos",
      });
      await expect(meetingsService.create(1, null, day, hour)).rejects.toMatchObject({
        status: 400,
        message: "Todos los campos son requeridos",
      });
      await expect(meetingsService.create(1, 7, null, hour)).rejects.toMatchObject({
        status: 400,
        message: "Todos los campos son requeridos",
      });
      await expect(meetingsService.create(1, 7, day, null)).rejects.toMatchObject({
        status: 400,
        message: "Todos los campos son requeridos",
      });

      expect(meetingRepo.isSlotTaken).not.toHaveBeenCalled();
      expect(meetingRepo.create).not.toHaveBeenCalled();
    });

    // MEET-005: Agenda una cita hoy en una hora futura.
    it("MEET-005 agenda una cita hoy con una hora futura", async () => {
      const now = new Date();
      const day = now.toISOString().slice(0, 10);
      const hour = "23:59";

      meetingRepo.isSlotTaken.mockResolvedValue(false);
      meetingRepo.create.mockResolvedValue(99);

      const result = await meetingsService.create(1, 7, day, hour, "Consulta");

      expect(result).toEqual({ message: "Cita agendada exitosamente", id: 99 });
      expect(meetingRepo.create).toHaveBeenCalled();
    });

    // NOTIF-008: Crear una cita crea una notificación de tipo "cita".
    it("NOTIF-008 crear una cita crea una notificación de tipo cita", async () => {
      const { day, hour } = futureDayAndHour();
      meetingRepo.isSlotTaken.mockResolvedValue(false);
      meetingRepo.create.mockResolvedValue(42);

      await meetingsService.create(1, 7, day, hour, "Consulta");

      expect(notificationRepo.create).toHaveBeenCalledWith(
        1,
        "cita",
        `Nueva cita agendada el ${day} a las ${hour}`,
        "/agenda",
      );
    });
  });

  describe("getByProfessional", () => {
    // MEET-006: Obtiene los horarios ocupados de un psicólogo.
    it("MEET-006 devuelve los horarios ocupados de un psicólogo", async () => {
      const slots = [{ day: "2026-01-01", hour: "10:00" }];
      meetingRepo.findByProfessionalId.mockResolvedValue(slots);

      const result = await meetingsService.getByProfessional(7);

      expect(result).toEqual(slots);
      expect(meetingRepo.findByProfessionalId).toHaveBeenCalledWith(7);
    });

    // MEET-007: Psicólogo sin citas devuelve [].
    it("MEET-007 devuelve [] si el psicólogo no tiene citas", async () => {
      meetingRepo.findByProfessionalId.mockResolvedValue([]);

      const result = await meetingsService.getByProfessional(7);

      expect(result).toEqual([]);
    });
  });

  describe("getByUser", () => {
    // MEET-008: Obtiene el historial de citas del aprendiz.
    it("MEET-008 devuelve el historial de citas del aprendiz", async () => {
      const history = [{ id_meetings_agenda: 1, day: "2026-01-01", hour: "10:00" }];
      meetingRepo.findByUserId.mockResolvedValue(history);

      const result = await meetingsService.getByUser(1);

      expect(result).toEqual(history);
      expect(meetingRepo.findByUserId).toHaveBeenCalledWith(1);
    });

    // MEET-009: Usuario sin citas devuelve [].
    it("MEET-009 devuelve [] si el usuario no tiene citas", async () => {
      meetingRepo.findByUserId.mockResolvedValue([]);

      const result = await meetingsService.getByUser(1);

      expect(result).toEqual([]);
    });
  });

  describe("updateAttendance", () => {
    // Test updateAttendance con un valor de asistencia válido.
    it("actualiza la asistencia con un valor válido", async () => {
      meetingRepo.updateAttendance.mockResolvedValue({ rowCount: 1 });

      const result = await meetingsService.updateAttendance(5, "asistio");

      expect(result).toEqual({ rowCount: 1 });
      expect(meetingRepo.updateAttendance).toHaveBeenCalledWith(5, "asistio");
    });

    // Test updateAttendance con un valor de asistencia inválido.
    it("rechaza un valor de asistencia inválido con 400", async () => {
      await expect(meetingsService.updateAttendance(5, "presente")).rejects.toMatchObject({
        status: 400,
        message: "Valor de asistencia inválido.",
      });
      await expect(meetingsService.updateAttendance(5, null)).rejects.toMatchObject({
        status: 400,
        message: "El ID de la cita y la asistencia son requeridos.",
      });
      expect(meetingRepo.updateAttendance).not.toHaveBeenCalled();
    });
  });
});