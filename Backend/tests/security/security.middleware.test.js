import { vi, describe, it, expect, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

vi.mock('../../src/config/environment.js', () => ({
  default: { JWT_SECRET: 'test-secret', JWT_EXPIRES_IN: '8h' },
}));

import {
  authMiddleware,
  requireRole,
  requireAdmin,
  assertOwnProfile,
} from '../../src/middlewares/auth.middleware.js';

const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

function validToken(overrides = {}) {
  return jwt.sign(
    { userId: 7, role: 'aprendiz', document: '12345678', ...overrides },
    'test-secret',
    { expiresIn: '8h' },
  );
}

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SEC-001 rechaza sin token con 401', () => {
    const req = { path: '/api/diary/entries/1', headers: {} };

    authMiddleware(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token no proporcionado. Inicie sesión.',
    });
  });

  it('SEC-002 rechaza un token malformado con 401', () => {
    const req = { path: '/api/diary/entries/1', headers: { authorization: 'Bearer invalidtoken' } };

    authMiddleware(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token inválido. Inicie sesión nuevamente.',
    });
  });

  it('SEC-004 deja pasar las rutas públicas sin token', () => {
    const next = vi.fn();
    const req = { path: '/api/password/forgot', headers: {} };

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('SEC-004b deja pasar /api/password/reset sin token', () => {
    const next = vi.fn();
    const req = { path: '/api/password/reset', headers: {} };

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('SEC-004c rechaza un header Authorization que no es Bearer', () => {
    const req = { path: '/api/diary/entries/1', headers: { authorization: 'Basic abc' } };

    authMiddleware(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('asigna req.userId y req.userRole de un token válido y llama next', () => {
    const next = vi.fn();
    const req = { path: '/api/diary/entries/1', headers: { authorization: `Bearer ${validToken()}` } };

    authMiddleware(req, res, next);

    expect(req.userId).toBe(7);
    expect(req.userRole).toBe('aprendiz');
    expect(next).toHaveBeenCalled();
  });

  it('SEC-021 responde 401 para un token expirado', () => {
    const expired = jwt.sign({ userId: 7, role: 'aprendiz' }, 'test-secret', { expiresIn: '-1h' });
    const req = { path: '/api/diary/entries/1', headers: { authorization: `Bearer ${expired}` } };

    authMiddleware(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Sesión expirada. Inicie sesión nuevamente.',
    });
  });
});

describe('requireRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('USERS-018 bloquea al aprendiz con 403', () => {
    const req = { userRole: 'aprendiz' };

    requireRole('administrador')(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No tienes permisos para realizar esta acción.',
    });
  });

  it('permite al psicólogo en requireRole("administrador", "psicologo")', () => {
    const next = vi.fn();
    const req = { userRole: 'psicologo' };

    requireRole('administrador', 'psicologo')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('requireAdmin bloquea a no-administradores (USER-019/020)', () => {
    const req = { userRole: 'psicologo' };

    requireAdmin(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('assertOwnProfile', () => {
  it('PROF-011 lanza 403 si el aprendiz consulta otro perfil', () => {
    expect(() => assertOwnProfile({ userId: '1', userRole: 'aprendiz' }, '2')).toThrow(
      expect.objectContaining({
        status: 403,
        message: 'No tienes permisos para acceder a este perfil.',
      }),
    );
  });

  it('no lanza si es el dueño del perfil', () => {
    expect(() => assertOwnProfile({ userId: '3', userRole: 'aprendiz' }, '3')).not.toThrow();
  });

  it('no lanza si es administrador aunque no sea el dueño', () => {
    expect(() => assertOwnProfile({ userId: '1', userRole: 'administrador' }, '2')).not.toThrow();
  });
});