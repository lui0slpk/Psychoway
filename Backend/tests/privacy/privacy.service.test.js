import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../src/repositories/diary.repository.js");

import * as diaryRepo from "../../src/repositories/diary.repository.js";
import * as diaryService from "../../src/services/diary.service.js";

describe("Privacy service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPrivacy", () => {
    // PRIV-001: Obtiene la configuración de privacidad de un usuario con diario.
    it("PRIV-001 obtiene la visibilidad del usuario con diario", async () => {
      // Arrange
      const visibilityRow = { diary_visibility: "solo-yo" };
      diaryRepo.getVisibility.mockResolvedValue(visibilityRow);

      // Act
      const result = await diaryService.getPrivacy(7);

      // Assert
      expect(result).toEqual(visibilityRow);
      expect(diaryRepo.getVisibility).toHaveBeenCalledWith(7);
    });

    // PRIV-002: Usuario sin diario devuelve la visibilidad por defecto "yo-psicologo".
    it("PRIV-002 devuelve la visibilidad por defecto si el usuario no tiene diario", async () => {
      // Arrange
      diaryRepo.getVisibility.mockResolvedValue(null);

      // Act
      const result = await diaryService.getPrivacy(7);

      // Assert
      expect(result).toEqual({ diary_visibility: "yo-psicologo" });
      expect(diaryRepo.getVisibility).toHaveBeenCalledWith(7);
    });
  });

  describe("updatePrivacy", () => {
    // PRIV-003: Actualiza la privacidad a "solo-yo" cuando el diario existe.
    it("PRIV-003 actualiza la visibilidad a solo-yo si el diario existe", async () => {
      // Arrange
      diaryRepo.findByUserId.mockResolvedValue({ id_diary: 1 });

      // Act
      const result = await diaryService.updatePrivacy(7, "solo-yo");

      // Assert
      expect(result).toEqual({ message: "Privacidad actualizada correctamente" });
      expect(diaryRepo.findByUserId).toHaveBeenCalledWith(7);
      expect(diaryRepo.updateVisibility).toHaveBeenCalledWith(7, "solo-yo");
      expect(diaryRepo.createWithVisibility).not.toHaveBeenCalled();
    });

    // PRIV-004: Actualiza la privacidad a "yo-psicologo" cuando el diario existe.
    it("PRIV-004 actualiza la visibilidad a yo-psicologo si el diario existe", async () => {
      // Arrange
      diaryRepo.findByUserId.mockResolvedValue({ id_diary: 1 });

      // Act
      const result = await diaryService.updatePrivacy(7, "yo-psicologo");

      // Assert
      expect(result).toEqual({ message: "Privacidad actualizada correctamente" });
      expect(diaryRepo.findByUserId).toHaveBeenCalledWith(7);
      expect(diaryRepo.updateVisibility).toHaveBeenCalledWith(7, "yo-psicologo");
      expect(diaryRepo.createWithVisibility).not.toHaveBeenCalled();
    });

    // PRIV-005: Crea el diario si no existe y establece la visibilidad.
    it("PRIV-005 crea el diario si no existe y establece la visibilidad", async () => {
      // Arrange
      diaryRepo.findByUserId.mockResolvedValue(null);

      // Act
      const result = await diaryService.updatePrivacy(7, "solo-yo");

      // Assert
      expect(result).toEqual({ message: "Privacidad actualizada correctamente" });
      expect(diaryRepo.findByUserId).toHaveBeenCalledWith(7);
      expect(diaryRepo.createWithVisibility).toHaveBeenCalledWith(7, "solo-yo");
      expect(diaryRepo.updateVisibility).not.toHaveBeenCalled();
    });

    // PRIV-006: Sin visibilidad lanza un error 400.
    it("PRIV-006 lanza un error 400 si la visibilidad es requerida y no se envía", async () => {
      // Arrange

      // Act & Assert
      await expect(diaryService.updatePrivacy(7, null)).rejects.toMatchObject({
        status: 400,
        message: "Visibilidad es requerida",
      });
      await expect(diaryService.updatePrivacy(7, undefined)).rejects.toMatchObject({
        status: 400,
        message: "Visibilidad es requerida",
      });
      expect(diaryRepo.findByUserId).not.toHaveBeenCalled();
      expect(diaryRepo.updateVisibility).not.toHaveBeenCalled();
      expect(diaryRepo.createWithVisibility).not.toHaveBeenCalled();
    });
  });
});