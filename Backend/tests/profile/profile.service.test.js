import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../src/repositories/user.repository.js');
vi.mock('bcrypt', () => ({
  __esModule: true,
  default: { hash: vi.fn().mockResolvedValue('hashed'), compare: vi.fn() },
  hash: vi.fn().mockResolvedValue('hashed'),
  compare: vi.fn(),
}));

import * as userRepo from '../../src/repositories/user.repository.js';
import * as usersService from '../../src/services/users.service.js';

const currentUser = {
  id_user: 3,
  document: '12345678',
  doc_type: 'CC',
  names: 'Ana',
  last_names: 'Perez',
  birth_date: '1995-01-01',
  email: 'ana@mail.com',
  contact_number: '3001234567',
  landline_number: '',
  training_program: 'ADSO',
  ficha_number: '2555000',
  id_rol: 1,
  profile_photo: null,
  password: 'hashed-old',
};

describe('users.service - getFullProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('PROF-001 devuelve el perfil completo de un usuario existente', async () => {
    userRepo.findById.mockResolvedValue(currentUser);

    const result = await usersService.getFullProfile(3);

    expect(result).toEqual(
      expect.objectContaining({
        id_user: 3,
        document: '12345678',
        tipoDocumento: 'CC',
        nombres: 'Ana',
        apellidos: 'Perez',
        correo: 'ana@mail.com',
        rol: 'aprendiz',
      }),
    );
    expect(userRepo.findById).toHaveBeenCalledWith(3);
  });

  it('PROF-002 devuelve 404 para usuario inexistente', async () => {
    userRepo.findById.mockResolvedValue(null);

    await expect(usersService.getFullProfile(999)).rejects.toEqual({
      status: 404,
      message: 'Usuario no encontrado',
    });
  });
});

describe('users.service - updateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userRepo.findById.mockResolvedValue(currentUser);
    userRepo.existsByDocumentOrEmailExcluding.mockResolvedValue(false);
    userRepo.updateWithoutPassword.mockResolvedValue({ rowCount: 1 });
    userRepo.updateWithPassword.mockResolvedValue({ rowCount: 1 });
    userRepo.findById.mockResolvedValue(currentUser); // fetch-back after update
  });

  it('PROF-003 actualiza el perfil sin cambiar contraseña', async () => {
    const result = await usersService.updateProfile(3, { nombres: 'Ana María' });

    expect(userRepo.updateWithoutPassword).toHaveBeenCalled();
    expect(userRepo.updateWithPassword).not.toHaveBeenCalled();
    expect(result.message).toBe('Perfil actualizado correctamente');
    expect(result.user).toEqual(
      expect.objectContaining({ id: 3, id_user: 3, rol: 'aprendiz' }),
    );
  });

  it('PROF-004 actualiza el perfil con nueva contraseña (se hashea)', async () => {
    await usersService.updateProfile(3, { password: 'NuevaPass1' });

    expect(userRepo.updateWithPassword).toHaveBeenCalled();
    expect(userRepo.updateWithoutPassword).not.toHaveBeenCalled();
    expect(userRepo.updateWithPassword).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ password: 'hashed' }),
    );
  });

  it('PROF-005 actualiza la foto de perfil (base64)', async () => {
    const result = await usersService.updateProfile(3, {
      profilePhoto: 'data:image/png;base64,AAA',
    });

    // Sin password se usa updateWithoutPassword, incluyendo profile_photo en updateData
    expect(userRepo.updateWithoutPassword).toHaveBeenCalled();
    expect(userRepo.updateWithoutPassword).toHaveBeenCalledWith(
      3,
      expect.objectContaining({ profile_photo: 'data:image/png;base64,AAA' }),
    );
    expect(result.message).toBe('Perfil actualizado correctamente');
  });

  it('devuelve 404 si el usuario no existe', async () => {
    userRepo.findById.mockResolvedValue(null);

    await expect(usersService.updateProfile(999, { nombres: 'X' })).rejects.toEqual({
      status: 404,
      message: 'Usuario no encontrado',
    });
  });
});

describe('users.service - updateProfilePhoto / getProfilePhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('PROF-006 obtiene la foto de perfil de un usuario con foto', async () => {
    userRepo.getProfilePhoto.mockResolvedValue('data:image/png;base64,AAA');

    const result = await usersService.getProfilePhoto(3);

    expect(result).toEqual({ profile_photo: 'data:image/png;base64,AAA' });
  });

  it('PROF-007 devuelve 404 al actualizar foto de usuario inexistente', async () => {
    userRepo.updateProfilePhoto.mockResolvedValue(null);

    await expect(usersService.updateProfilePhoto(999, 'data:image/png;base64,AAA')).rejects.toEqual({
      status: 404,
      message: 'Usuario no encontrado',
    });
  });

  it('actualiza la foto de perfil con éxito', async () => {
    userRepo.updateProfilePhoto.mockResolvedValue({ rowCount: 1 });

    const result = await usersService.updateProfilePhoto(3, 'data:image/png;base64,BBB');

    expect(result).toEqual({ message: 'Foto de perfil actualizada', profile_photo: 'data:image/png;base64,BBB' });
  });
});