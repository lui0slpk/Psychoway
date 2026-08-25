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

function validCreateData(overrides = {}) {
  return {
    rol: 'aprendiz',
    documento: '12345678',
    tipoDocumento: 'CC',
    nombres: 'Ana',
    apellidos: 'Perez',
    fechaNacimiento: '1995-01-01',
    correo: 'ana@mail.com',
    password: 'secret123',
    ...overrides,
  };
}

describe('users.service - validateAgeByDocType', () => {
  it('CC/CE con edad < 18 lanza 400', () => {
    expect(() => usersService.validateAgeByDocType('CC', '2012-01-01')).toThrow(
      expect.objectContaining({ status: 400 }),
    );
    expect(() => usersService.validateAgeByDocType('CE', '2012-01-01')).toThrow(
      expect.objectContaining({ status: 400 }),
    );
  });

  it('TI con edad >= 18 lanza 400', () => {
    expect(() => usersService.validateAgeByDocType('TI', '1995-01-01')).toThrow(
      expect.objectContaining({ status: 400 }),
    );
  });

  it('no lanza para combinaciones válidas', () => {
    expect(() => usersService.validateAgeByDocType('CC', '1995-01-01')).not.toThrow();
    expect(() => usersService.validateAgeByDocType('TI', '2012-01-01')).not.toThrow();
    expect(() => usersService.validateAgeByDocType('PA', '1995-01-01')).not.toThrow();
  });
});

describe('users.service - create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userRepo.existsByDocumentOrEmail.mockResolvedValue(false);
    userRepo.create.mockResolvedValue(5);
  });

  it('USER-001 crea un aprendiz (id_rol 1)', async () => {
    // Arrange / Act
    const result = await usersService.create(validCreateData({ rol: 'aprendiz' }));

    // Assert
    expect(result).toEqual({ message: 'Usuario creado exitosamente', userId: 5 });
    expect(userRepo.create).toHaveBeenCalledWith(expect.objectContaining({ id_rol: 1 }));
  });

  it('USER-002 crea un psicólogo (id_rol 2)', async () => {
    const result = await usersService.create(validCreateData({ rol: 'psicologo' }));

    expect(result).toEqual({ message: 'Usuario creado exitosamente', userId: 5 });
    expect(userRepo.create).toHaveBeenCalledWith(expect.objectContaining({ id_rol: 2 }));
  });

  it('USER-003 crea un administrador (id_rol 3)', async () => {
    const result = await usersService.create(validCreateData({ rol: 'administrador' }));

    expect(result).toEqual({ message: 'Usuario creado exitosamente', userId: 5 });
    expect(userRepo.create).toHaveBeenCalledWith(expect.objectContaining({ id_rol: 3 }));
  });

  it('USER-004 rechaza si faltan campos obligatorios', async () => {
    await expect(usersService.create({})).rejects.toEqual({
      status: 400,
      message: 'Todos los campos son obligatorios',
    });
    expect(userRepo.create).not.toHaveBeenCalled();
  });

  it('USER-005 rechaza si documento/correo ya existe', async () => {
    userRepo.existsByDocumentOrEmail.mockResolvedValue(true);

    await expect(usersService.create(validCreateData())).rejects.toEqual({
      status: 409,
      message: 'El documento o correo ya existe',
    });
    expect(userRepo.create).not.toHaveBeenCalled();
  });

  it('USER-005b mapea error 23505 de la BD a 409', async () => {
    userRepo.create.mockRejectedValue({ code: '23505' });

    await expect(usersService.create(validCreateData())).rejects.toEqual({
      status: 409,
      message: 'El documento o correo ya existe',
    });
  });
});

describe('users.service - searchByDocument', () => {
  const user = {
    id_user: 3,
    document: '12345678',
    doc_type: 'CC',
    names: 'Ana',
    last_names: 'Perez',
    birth_date: new Date('1995-01-01'),
    email: 'ana@mail.com',
    id_rol: 1,
    nombre_rol: 'aprendiz',
  };

  it('USER-006 busca un usuario existente por documento', async () => {
    userRepo.findByDocumentWithRole.mockResolvedValue(user);

    const result = await usersService.searchByDocument('12345678');

    expect(result).toEqual(
      expect.objectContaining({
        id_user: 3,
        document: '12345678',
        tipoDocumento: 'CC',
        rol: 'aprendiz',
        nombres: 'Ana',
        apellidos: 'Perez',
        correo: 'ana@mail.com',
      }),
    );
    expect(userRepo.findByDocumentWithRole).toHaveBeenCalledWith('12345678');
  });

  it('USER-007 devuelve 404 para documento inexistente', async () => {
    userRepo.findByDocumentWithRole.mockResolvedValue(null);

    await expect(usersService.searchByDocument('99999')).rejects.toEqual({
      status: 404,
      message: 'Usuario no encontrado',
    });
  });
});

describe('users.service - update', () => {
  const updateData = {
    rol: 'aprendiz',
    documento: '12345678',
    tipoDocumento: 'CC',
    nombres: 'Ana',
    apellidos: 'Perez',
    fechaNacimiento: '1995-01-01',
    correo: 'ana@mail.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    userRepo.existsByDocumentOrEmailExcluding.mockResolvedValue(false);
    userRepo.updateWithoutPassword.mockResolvedValue({ rowCount: 1 });
    userRepo.updateWithPassword.mockResolvedValue({ rowCount: 1 });
  });

  it('USER-008 actualiza los datos de un usuario', async () => {
    const result = await usersService.update(3, updateData);

    expect(result).toEqual({ message: 'Usuario actualizado correctamente' });
    expect(userRepo.updateWithoutPassword).toHaveBeenCalled();
  });

  it('USER-009 actualiza con cambio de contraseña', async () => {
    await usersService.update(3, { ...updateData, password: 'nueva123' });

    expect(userRepo.updateWithPassword).toHaveBeenCalled();
    expect(userRepo.updateWithoutPassword).not.toHaveBeenCalled();
  });

  it('USER-010 actualiza sin cambiar contraseña', async () => {
    await usersService.update(3, updateData);

    expect(userRepo.updateWithoutPassword).toHaveBeenCalled();
    expect(userRepo.updateWithPassword).not.toHaveBeenCalled();
  });

  it('USER-011 devuelve 404 para usuario inexistente', async () => {
    userRepo.updateWithoutPassword.mockResolvedValue(null);

    await expect(usersService.update(999, updateData)).rejects.toEqual({
      status: 404,
      message: 'Usuario no encontrado',
    });
  });

  it('USER-012 rechaza si el documento está duplicado en otro usuario', async () => {
    userRepo.existsByDocumentOrEmailExcluding.mockResolvedValue(true);

    await expect(usersService.update(3, updateData)).rejects.toEqual({
      status: 409,
      message: 'El documento o correo ya existe',
    });
  });
});

describe('users.service - remove', () => {
  it('USER-013 elimina un usuario sin dependencias', async () => {
    userRepo.deleteById.mockResolvedValue({ rowCount: 1 });

    const result = await usersService.remove(3);

    expect(result).toEqual({ message: 'Usuario eliminado correctamente' });
    expect(userRepo.deleteById).toHaveBeenCalledWith(3);
  });

  it('USER-014 rechaza eliminar usuario con dependencias (FK 23503)', async () => {
    userRepo.deleteById.mockRejectedValue({ code: '23503' });

    await expect(usersService.remove(3)).rejects.toEqual({
      status: 400,
      message: 'No se puede eliminar: El usuario tiene registros asociados.',
    });
  });

  it('USER-015 devuelve 404 para usuario inexistente', async () => {
    userRepo.deleteById.mockResolvedValue(null);

    await expect(usersService.remove(999)).rejects.toEqual({
      status: 404,
      message: 'Usuario no encontrado',
    });
  });
});

describe('users.service - getPsychologists', () => {
  it('USER-016 lista los psicólogos', async () => {
    const psychologists = [{ id_user: 1, names: 'Juan', last_names: 'Perez' }];
    userRepo.findPsychologists.mockResolvedValue(psychologists);

    const result = await usersService.getPsychologists();

    expect(result).toEqual(psychologists);
  });

  it('USER-017 devuelve [] si no hay psicólogos', async () => {
    userRepo.findPsychologists.mockResolvedValue([]);

    const result = await usersService.getPsychologists();

    expect(result).toEqual([]);
  });
});