import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/repositories/user.repository.js');
vi.mock('../../src/services/email.service.js', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('bcrypt', () => ({
  __esModule: true,
  default: { hash: vi.fn().mockResolvedValue('hashed'), compare: vi.fn() },
  hash: vi.fn().mockResolvedValue('hashed'),
  compare: vi.fn(),
}));

import * as userRepo from '../../src/repositories/user.repository.js';
import { sendPasswordResetEmail } from '../../src/services/email.service.js';
import * as authService from '../../src/services/auth.service.js';

describe('auth.service - forgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('PASS-001 solicita recuperación con correo existente', async () => {
    userRepo.findByEmail.mockResolvedValue({ id_user: 3, email: 'ana@mail.com', names: 'Ana' });

    const result = await authService.forgotPassword('ana@mail.com');

    expect(result).toEqual({ message: 'Correo de recuperación enviado exitosamente' });
    expect(sendPasswordResetEmail).toHaveBeenCalled();
  });

  it('PASS-002 devuelve 404 con correo inexistente', async () => {
    userRepo.findByEmail.mockResolvedValue(null);

    await expect(authService.forgotPassword('nadie@mail.com')).rejects.toEqual({
      status: 404,
      message: 'Correo no encontrado',
    });
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('PASS-003 devuelve 400 sin correo', async () => {
    await expect(authService.forgotPassword()).rejects.toEqual({
      status: 400,
      message: 'El correo es requerido',
    });
    expect(userRepo.findByEmail).not.toHaveBeenCalled();
  });
});

describe('auth.service - resetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('PASS-004 resetea la contraseña con un token válido', async () => {
    // Arrange: crear un token real vía forgotPassword
    userRepo.findByEmail.mockResolvedValue({ id_user: 3, email: 'ana@mail.com', names: 'Ana' });
    userRepo.updatePassword.mockResolvedValue({ rowCount: 1 });
    await authService.forgotPassword('ana@mail.com');

    // Extraer el token del resetLink enviado
    const link = sendPasswordResetEmail.mock.calls[0][1];
    const token = new URL(link).searchParams.get('token');

    // Act
    const result = await authService.resetPassword(token, 'Nueva#Pass1');

    // Assert
    expect(result).toEqual({ message: 'Contraseña actualizada correctamente' });
    expect(userRepo.updatePassword).toHaveBeenCalledWith(3, 'hashed');
  });

  it('PASS-005 devuelve 400 con token inválido', async () => {
    await expect(authService.resetPassword('token-inexistente', 'Nueva#Pass1')).rejects.toEqual({
      status: 400,
      message: 'Token inválido o expirado',
    });
    expect(userRepo.updatePassword).not.toHaveBeenCalled();
  });

  it('PASS-006 devuelve 400 con token expirado', async () => {
    // Arrange: crear token real, luego simular que pasó más de 1 hora
    userRepo.findByEmail.mockResolvedValue({ id_user: 3, email: 'ana@mail.com', names: 'Ana' });
    await authService.forgotPassword('ana@mail.com');
    const link = sendPasswordResetEmail.mock.calls[0][1];
    const token = new URL(link).searchParams.get('token');

    // Simular el paso del tiempo (+2h)
    const realNow = Date.now;
    vi.spyOn(Date, 'now').mockImplementation(() => realNow() + 2 * 3600000);

    // Act
    await expect(authService.resetPassword(token, 'Nueva#Pass1')).rejects.toEqual({
      status: 400,
      message: 'El token ha expirado',
    });

    Date.now.mockRestore();
  });

  it('PASS-007 devuelve 400 sin token o password', async () => {
    await expect(authService.resetPassword(undefined, 'Nueva#Pass1')).rejects.toEqual({
      status: 400,
      message: 'Token y nueva contraseña son requeridos',
    });
    await expect(authService.resetPassword('token', undefined)).rejects.toEqual({
      status: 400,
      message: 'Token y nueva contraseña son requeridos',
    });
  });

  it('PASS-008 el enlace de recuperación incluye el token en la URL', async () => {
    userRepo.findByEmail.mockResolvedValue({ id_user: 3, email: 'ana@mail.com', names: 'Ana' });

    await authService.forgotPassword('ana@mail.com');

    const link = sendPasswordResetEmail.mock.calls[0][1];
    expect(link).toContain('/reset-password?token=');
    const token = new URL(link).searchParams.get('token');
    expect(token).toBeTruthy();
  });

  it('PASS-009 un token usado no puede reutilizarse', async () => {
    // Arrange: crear y usar un token
    userRepo.findByEmail.mockResolvedValue({ id_user: 3, email: 'ana@mail.com', names: 'Ana' });
    userRepo.updatePassword.mockResolvedValue({ rowCount: 1 });
    await authService.forgotPassword('ana@mail.com');
    const link = sendPasswordResetEmail.mock.calls[0][1];
    const token = new URL(link).searchParams.get('token');

    // Primer uso exitoso
    await authService.resetPassword(token, 'Nueva#Pass1');

    // Act: segundo uso
    await expect(authService.resetPassword(token, 'OtraPass1')).rejects.toEqual({
      status: 400,
      message: 'Token inválido o expirado',
    });
  });
});