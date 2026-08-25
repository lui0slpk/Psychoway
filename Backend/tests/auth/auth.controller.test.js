import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../src/services/auth.service.js");

import * as authService from "../../src/services/auth.service.js";
import * as authCtrl from "../../src/controllers/auth.controller.js";

const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
const next = vi.fn();

function mockRequest(body = {}, extra = {}) {
  return { body, ...extra };
}

describe("Auth controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authService.register.mockReset();
    authService.login.mockReset();
    authService.forgotPassword.mockReset();
    authService.resetPassword.mockReset();
  });

  describe("register", () => {
    // AUTH-018: register responde 200 con el resultado.
    it("AUTH-018 register responde 200 con el mensaje de éxito", async () => {
      const req = mockRequest({
        document: "12345678",
        doc_type: "CC",
        names: "Juan",
        last_names: "Perez",
        birth_date: "1995-01-01",
        email: "usuario@example.com",
        password: "Password1!",
      });
      authService.register.mockResolvedValue({
        message: "Usuario registrado correctamente",
      });

      await authCtrl.register(req, res, next);

      expect(authService.register).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuario registrado correctamente",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    const token = "fake-token";
    const user = {
      id: 7,
      id_user: 7,
      document: "12345678",
      names: "Juan",
      last_names: "Perez",
      id_rol: 1,
      rol: "aprendiz",
      profile_photo: null,
    };

    // AUTH-019: login responde 200 con el resultado.
    it("AUTH-019 login responde 200 con token y usuario", async () => {
      const req = mockRequest({ document: "12345678", password: "Password1!" });
      authService.login.mockResolvedValue({
        message: "Login exitoso",
        token,
        user,
      });

      await authCtrl.login(req, res, next);

      expect(authService.login).toHaveBeenCalledWith("12345678", "Password1!");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Login exitoso",
        token,
        user,
      });
      expect(next).not.toHaveBeenCalled();
    });

    // AUTH-021: login captura errores y llama a next.
    it("AUTH-021 login captura errores y delega en next", async () => {
      const req = mockRequest({ document: "99999999", password: "x" });
      authService.login.mockRejectedValue({
        status: 400,
        message: "Documento o contraseña incorrectos",
      });

      await authCtrl.login(req, res, next);

      expect(next).toHaveBeenCalledWith({
        status: 400,
        message: "Documento o contraseña incorrectos",
      });
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("verify", () => {
    // AUTH-020: verify responde 200 con validación y datos del usuario.
    it("AUTH-020 verify responde 200 con valid true y datos del usuario", async () => {
      const req = mockRequest({}, { userId: 3, userRole: "psicologo" });

      authCtrl.verify(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        valid: true,
        userId: 3,
        role: "psicologo",
      });
    });
  });

  describe("forgotPassword", () => {
    // forgotPassword responde 200 con el resultado.
    it("forgotPassword responde 200 con el mensaje de recuperación", async () => {
      const req = mockRequest({ correo: "usuario@example.com" });
      authService.forgotPassword.mockResolvedValue({
        message: "Correo de recuperación enviado exitosamente",
      });

      await authCtrl.forgotPassword(req, res, next);

      expect(authService.forgotPassword).toHaveBeenCalledWith("usuario@example.com");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Correo de recuperación enviado exitosamente",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    // resetPassword responde 200 con el resultado.
    it("resetPassword responde 200 con el mensaje de actualización", async () => {
      const req = mockRequest({
        token: "reset-token",
        newPassword: "NuevoPassword1!",
      });
      authService.resetPassword.mockResolvedValue({
        message: "Contraseña actualizada correctamente",
      });

      await authCtrl.resetPassword(req, res, next);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        "reset-token",
        "NuevoPassword1!",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contraseña actualizada correctamente",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});