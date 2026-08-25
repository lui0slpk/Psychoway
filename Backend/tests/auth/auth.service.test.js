import { vi, describe, it, expect, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

vi.mock("../../src/repositories/user.repository.js");
vi.mock("../../src/services/email.service.js", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("bcrypt", () => ({
  __esModule: true,
  default: {
    hash: vi.fn().mockResolvedValue("hashed"),
    compare: vi.fn(),
  },
  hash: vi.fn().mockResolvedValue("hashed"),
  compare: vi.fn(),
}));

import * as userRepo from "../../src/repositories/user.repository.js";
import * as authService from "../../src/services/auth.service.js";
import env from "../../src/config/environment.js";
import bcrypt from "bcrypt";

/**
 * Devuelve un cuerpo de registro válido por defecto. Se pueden sobreescribir
 * campos parcialmente pasando `overrides`.
 */
function validRegisterBody(overrides = {}) {
  return {
    document: "12345678",
    doc_type: "CC",
    names: "Juan",
    last_names: "Perez",
    birth_date: "1995-01-01",
    email: "usuario@example.com",
    password: "Password1!",
    contact_number: "3001234567",
    landline_number: "",
    training_program: "ADSO",
    ficha_number: "2555000",
    ...overrides,
  };
}

describe("Auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userRepo.existsByDocumentOrEmail.mockResolvedValue(false);
    userRepo.create.mockResolvedValue(1);
    bcrypt.compare.mockResolvedValue(true);
  });

  describe("register", () => {
    // AUTH-001: Registro válido con CC y edad >= 18.
    it("AUTH-001 registra un usuario con CC y edad >= 18", async () => {
      const body = validRegisterBody({
        document: "12345678",
        doc_type: "CC",
        birth_date: "1995-01-01",
        email: "  Usuario@Example.com  ",
      });

      const result = await authService.register(body);

      expect(result).toEqual({ message: "Usuario registrado correctamente" });
      expect(userRepo.existsByDocumentOrEmail).toHaveBeenCalledWith(
        "12345678",
        "usuario@example.com",
      );
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          document: "12345678",
          email: "usuario@example.com",
          id_rol: 1,
        }),
      );
    });

    // AUTH-002: Registro válido con TI y edad < 18.
    it("AUTH-002 registra un usuario con TI y edad < 18", async () => {
      const body = validRegisterBody({
        document: "12345678",
        doc_type: "TI",
        birth_date: "2012-01-01",
      });

      const result = await authService.register(body);

      expect(result).toEqual({ message: "Usuario registrado correctamente" });
      expect(userRepo.create).toHaveBeenCalled();
    });

    // AUTH-003: Rechaza cuando el documento ya existe.
    it("AUTH-003 rechaza cuando el documento ya está registrado (409)", async () => {
      userRepo.existsByDocumentOrEmail.mockResolvedValue(true);
      const body = validRegisterBody();

      await expect(authService.register(body)).rejects.toMatchObject({
        status: 409,
        message: "El documento o correo ya se encuentra registrado",
      });
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    // AUTH-004: Rechaza cuando el correo ya existe (documento distinto).
    it("AUTH-004 rechaza cuando el correo ya está registrado (409)", async () => {
      userRepo.existsByDocumentOrEmail.mockResolvedValue(true);
      const body = validRegisterBody({ document: "87654321" });

      await expect(authService.register(body)).rejects.toMatchObject({
        status: 409,
        message: "El documento o correo ya se encuentra registrado",
      });
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    // AUTH-005: CC con edad < 18 → 400.
    it("AUTH-005 rechaza CC con edad menor a 18 (400)", async () => {
      const body = validRegisterBody({
        doc_type: "CC",
        birth_date: "2012-01-01",
      });

      await expect(authService.register(body)).rejects.toMatchObject({
        status: 400,
        message:
          "Con Cédula de Ciudadanía o Extranjería el usuario debe tener al menos 18 años.",
      });
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    // AUTH-006: CE con edad < 18 → 400.
    it("AUTH-006 rechaza CE con edad menor a 18 (400)", async () => {
      const body = validRegisterBody({
        doc_type: "CE",
        birth_date: "2012-01-01",
      });

      await expect(authService.register(body)).rejects.toMatchObject({
        status: 400,
        message:
          "Con Cédula de Ciudadanía o Extranjería el usuario debe tener al menos 18 años.",
      });
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    // AUTH-007: TI con edad >= 18 → 400.
    it("AUTH-007 rechaza TI con edad mayor o igual a 18 (400)", async () => {
      const body = validRegisterBody({
        doc_type: "TI",
        birth_date: "1995-01-01",
      });

      await expect(authService.register(body)).rejects.toMatchObject({
        status: 400,
        message: "Con Tarjeta de Identidad el usuario debe ser menor de 18 años.",
      });
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    // AUTH-008: Cuerpo vacío → 400 (falla en validación de doc_type).
    it("AUTH-008 rechaza un cuerpo vacío con 400", async () => {
      await expect(authService.register({})).rejects.toMatchObject({
        status: 400,
        message: "Tipo de documento inválido: undefined",
      });
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    // AUTH-009: Contraseña débil no valida longitud → registra.
    it("AUTH-009 registra un usuario aunque la contraseña sea débil", async () => {
      const body = validRegisterBody({ password: "1234" });

      const result = await authService.register(body);

      expect(result).toEqual({ message: "Usuario registrado correctamente" });
      expect(userRepo.create).toHaveBeenCalled();
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: "hashed" }),
      );
    });

    // AUTH-027: Correo inválido → 400.
    it("AUTH-027 rechaza un correo inválido (400)", async () => {
      const body = validRegisterBody({ email: "correo-invalido" });

      await expect(authService.register(body)).rejects.toMatchObject({
        status: 400,
        message: "El correo no es válido",
      });
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    // AUTH-028: Documento no válido para el tipo → 400.
    it("AUTH-028 rechaza un documento inválido para el tipo indicado (400)", async () => {
      const body = validRegisterBody({ doc_type: "TI", document: "123" });

      await expect(authService.register(body)).rejects.toMatchObject({
        status: 400,
        message: "El documento no es válido para el tipo indicado",
      });
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    // AUTH-029: Tipo de documento desconocido → 400.
    it("AUTH-029 rechaza un tipo de documento desconocido (400)", async () => {
      const body = validRegisterBody({ doc_type: "XYZ" });

      await expect(authService.register(body)).rejects.toMatchObject({
        status: 400,
        message: "Tipo de documento inválido: XYZ",
      });
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    // AUTH-030: El correo se normaliza a minúsculas antes de crear.
    it("AUTH-030 normaliza el correo a minúsculas y sin espacios", async () => {
      const body = validRegisterBody({
        email: "  USUARIO@Example.COM  ",
      });

      await authService.register(body);

      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: "usuario@example.com" }),
      );
    });
  });

  describe("login", () => {
    const user = {
      id_user: 7,
      document: "12345678",
      names: "Juan",
      last_names: "Perez",
      id_rol: 1,
      password: "hashed-secret",
      profile_photo: null,
    };

    // AUTH-011: Login exitoso devuelve mensaje, token y usuario.
    it("AUTH-011 inicia sesión y devuelve mensaje, token y usuario", async () => {
      userRepo.findByDocument.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.login("12345678", "Password1!");

      expect(result.message).toBe("Login exitoso");
      expect(typeof result.token).toBe("string");
      expect(result.user.id).toBe(7);
      expect(userRepo.findByDocument).toHaveBeenCalledWith("12345678");
    });

    // AUTH-012: El token JWT contiene los claims esperados.
    it("AUTH-012 el token JWT contiene userId, role y document", async () => {
      userRepo.findByDocument.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.login("12345678", "Password1!");

      const decoded = jwt.verify(result.token, env.JWT_SECRET);
      expect(decoded.userId).toBe(7);
      expect(decoded.role).toBe("aprendiz");
      expect(decoded.document).toBe("12345678");
    });

    // AUTH-013: El objeto de usuario devuelto contiene los campos esperados.
    it("AUTH-013 el usuario devuelto contiene todos los campos esperados", async () => {
      userRepo.findByDocument.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.login("12345678", "Password1!");

      expect(result.user).toEqual({
        id: 7,
        id_user: 7,
        document: "12345678",
        names: "Juan",
        last_names: "Perez",
        id_rol: 1,
        rol: "aprendiz",
        profile_photo: null,
      });
    });

    // AUTH-014: Documento inexistente → 400.
    it("AUTH-014 rechaza login con documento inexistente (400)", async () => {
      userRepo.findByDocument.mockResolvedValue(null);

      await expect(authService.login("99999999", "Password1!")).rejects.toMatchObject({
        status: 400,
        message: "Documento o contraseña incorrectos",
      });
    });

    // AUTH-015: Contraseña incorrecta → 400.
    it("AUTH-015 rechaza login con contraseña incorrecta (400)", async () => {
      userRepo.findByDocument.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.login("12345678", "mal-password")).rejects.toMatchObject({
        status: 400,
        message: "Documento o contraseña incorrectos",
      });
    });

    // AUTH-016/017: Argumentos faltantes → 400.
    it("AUTH-016/017 rechaza login con argumentos faltantes (400)", async () => {
      userRepo.findByDocument.mockResolvedValue(null);

      await expect(authService.login(null, undefined)).rejects.toMatchObject({
        status: 400,
        message: "Documento o contraseña incorrectos",
      });
      await expect(authService.login()).rejects.toMatchObject({
        status: 400,
        message: "Documento o contraseña incorrectos",
      });
    });
  });

  describe("forgotPassword", () => {
    // AUTH-017b: Correo nulo → 400.
    it("rechaza forgotPassword con correo nulo (400)", async () => {
      await expect(authService.forgotPassword(null)).rejects.toMatchObject({
        status: 400,
        message: "El correo es requerido",
      });
      await expect(authService.forgotPassword(undefined)).rejects.toMatchObject({
        status: 400,
        message: "El correo es requerido",
      });
      expect(userRepo.findByEmail).not.toHaveBeenCalled();
    });

    // AUTH-018: Correo no encontrado → 404.
    it("rechaza forgotPassword cuando el correo no existe (404)", async () => {
      userRepo.findByEmail.mockResolvedValue(null);

      await expect(authService.forgotPassword("no-existe@example.com")).rejects.toMatchObject({
        status: 404,
        message: "Correo no encontrado",
      });
      expect(userRepo.findByEmail).toHaveBeenCalledWith("no-existe@example.com");
    });
  });
});