import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../src/services/meetings.service.js");

import * as meetingsService from "../../src/services/meetings.service.js";
import * as meetingsController from "../../src/controllers/meetings.controller.js";

function makeRes() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe("Meetings controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    // MEET-010 (controller create): llama al servicio y responde 200.
    it("MEET-010 llama al servicio create y responde 200 con el resultado", async () => {
      const result = { message: "Cita agendada exitosamente", id: 42 };
      meetingsService.create.mockResolvedValue(result);

      const req = { body: { userId: 1, professionalId: 7, day: "2027-01-01", hour: "10:00", description: "Consulta" } };
      const res = makeRes();
      const next = vi.fn();

      await meetingsController.create(req, res, next);

      expect(meetingsService.create).toHaveBeenCalledWith(1, 7, "2027-01-01", "10:00", "Consulta");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
      expect(next).not.toHaveBeenCalled();
    });

    it("deriva un error al middleware next si el servicio falla", async () => {
      const error = { status: 409, message: "Ese horario ya está ocupado para este profesional." };
      meetingsService.create.mockRejectedValue(error);

      const req = { body: { userId: 1, professionalId: 7, day: "2027-01-01", hour: "10:00" } };
      const res = makeRes();
      const next = vi.fn();

      await meetingsController.create(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getByProfessional", () => {
    // MEET-011 (controller getByProfessional): devuelve los horarios ocupados.
    it("MEET-011 devuelve los horarios ocupados del profesional y responde 200", async () => {
      const slots = [{ day: "2027-01-01", hour: "10:00" }];
      meetingsService.getByProfessional.mockResolvedValue(slots);

      const req = { params: { id: 7 } };
      const res = makeRes();
      const next = vi.fn();

      await meetingsController.getByProfessional(req, res, next);

      expect(meetingsService.getByProfessional).toHaveBeenCalledWith(7);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(slots);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("getByUser", () => {
    // MEET-012 (controller getByUser): devuelve el historial del usuario.
    it("MEET-012 devuelve el historial de citas del usuario y responde 200", async () => {
      const history = [{ id_meetings_agenda: 1, day: "2027-01-01", hour: "10:00" }];
      meetingsService.getByUser.mockResolvedValue(history);

      const req = { params: { id: 1 } };
      const res = makeRes();
      const next = vi.fn();

      await meetingsController.getByUser(req, res, next);

      expect(meetingsService.getByUser).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(history);
      expect(next).not.toHaveBeenCalled();
    });
  });
});