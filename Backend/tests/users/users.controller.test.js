import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../src/services/users.service.js');
vi.mock('../../src/middlewares/auth.middleware.js', () => ({
  assertOwnProfile: vi.fn(),
  requireRole: vi.fn(() => (req, res, next) => next()),
  requireAdmin: vi.fn((req, res, next) => next()),
}));

import * as usersService from '../../src/services/users.service.js';
import * as usersCtrl from '../../src/controllers/users.controller.js';
import { assertOwnProfile } from '../../src/middlewares/auth.middleware.js';

const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
const next = vi.fn();

describe('users.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('create responde 201 con el resultado del service', async () => {
    usersService.create.mockResolvedValue({ message: 'Usuario creado exitosamente', userId: 5 });

    await usersCtrl.create({ body: {} }, res, next);

    expect(usersService.create).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuario creado exitosamente', userId: 5 });
  });

  it('search responde 200 con el usuario', async () => {
    usersService.searchByDocument.mockResolvedValue({ id_user: 3 });

    await usersCtrl.search({ params: { document: '12345678' } }, res, next);

    expect(usersService.searchByDocument).toHaveBeenCalledWith('12345678');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('update responde 200 con el resultado', async () => {
    usersService.update.mockResolvedValue({ message: 'Usuario actualizado correctamente' });

    await usersCtrl.update({ params: { id: 3 }, body: {} }, res, next);

    expect(usersService.update).toHaveBeenCalledWith(3, {});
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('remove responde 200 con el resultado', async () => {
    usersService.remove.mockResolvedValue({ message: 'Usuario eliminado correctamente' });

    await usersCtrl.remove({ params: { id: 3 } }, res, next);

    expect(usersService.remove).toHaveBeenCalledWith(3);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getPsychologists responde 200 con la lista', async () => {
    usersService.getPsychologists.mockResolvedValue([{ id_user: 1 }]);

    await usersCtrl.getPsychologists({}, res, next);

    expect(usersService.getPsychologists).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateProfile llama assertOwnProfile y responde 200', async () => {
    usersService.updateProfile.mockResolvedValue({ message: 'Perfil actualizado correctamente', user: {} });
    const req = { userId: '3', userRole: 'aprendiz', params: { id: '3' }, body: { nombres: 'Ana' } };

    await usersCtrl.updateProfile(req, res, next);

    expect(assertOwnProfile).toHaveBeenCalledWith(req, '3');
    expect(usersService.updateProfile).toHaveBeenCalledWith('3', { nombres: 'Ana' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateProfilePhoto llama assertOwnProfile y responde 200', async () => {
    usersService.updateProfilePhoto.mockResolvedValue({ message: 'Foto de perfil actualizada' });
    const req = { userId: '3', userRole: 'aprendiz', params: { id: '3' }, body: { profilePhoto: 'data:image...' } };

    await usersCtrl.updateProfilePhoto(req, res, next);

    expect(assertOwnProfile).toHaveBeenCalledWith(req, '3');
    expect(usersService.updateProfilePhoto).toHaveBeenCalledWith('3', 'data:image...');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getProfilePhoto llama assertOwnProfile y responde 200', async () => {
    usersService.getProfilePhoto.mockResolvedValue({ profile_photo: 'x' });
    const req = { userId: '3', userRole: 'aprendiz', params: { id: '3' } };

    await usersCtrl.getProfilePhoto(req, res, next);

    expect(assertOwnProfile).toHaveBeenCalledWith(req, '3');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getProfile llama assertOwnProfile y responde 200', async () => {
    usersService.getFullProfile.mockResolvedValue({ id_user: 3 });
    const req = { userId: '3', userRole: 'aprendiz', params: { id: '3' } };

    await usersCtrl.getProfile(req, res, next);

    expect(assertOwnProfile).toHaveBeenCalledWith(req, '3');
    expect(usersService.getFullProfile).toHaveBeenCalledWith('3');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('pasa errores al middleware next', async () => {
    usersService.create.mockRejectedValue({ status: 400, message: 'error' });

    await usersCtrl.create({ body: {} }, res, next);

    expect(next).toHaveBeenCalledWith({ status: 400, message: 'error' });
    expect(res.json).not.toHaveBeenCalled();
  });
});