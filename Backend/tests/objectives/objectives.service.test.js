import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../src/repositories/objective.repository.js');
import * as objectiveRepo from '../../src/repositories/objective.repository.js';
import * as objectivesService from '../../src/services/objectives.service.js';

describe('objectives.service - create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('OBJ-001: Create objective with complete data', async () => {
    // Arrange
    const userId = 1;
    const nombre = 'Meditar 10 minutos';
    const descripcion = 'Practicar meditación diaria';
    const estado = 'En progreso';
    objectiveRepo.create.mockResolvedValue(42);

    // Act
    const result = await objectivesService.create(userId, nombre, descripcion, estado);

    // Assert
    expect(objectiveRepo.create).toHaveBeenCalledWith(userId, nombre, descripcion, estado);
    expect(result).toEqual({ message: 'Objetivo creado correctamente', objectiveId: 42 });
  });

  it('OBJ-002: Create objective without nombre -> 400', async () => {
    // Arrange
    const userId = 1;
    const nombre = undefined;

    // Act
    const act = () => objectivesService.create(userId, nombre);

    // Assert
    await expect(act()).rejects.toEqual({ status: 400, message: 'userId y nombre son requeridos' });
    expect(objectiveRepo.create).not.toHaveBeenCalled();
  });

  it('OBJ-003: Create objective without userId -> 400', async () => {
    // Arrange
    const userId = undefined;
    const nombre = 'Meditar 10 minutos';

    // Act
    const act = () => objectivesService.create(userId, nombre);

    // Assert
    await expect(act()).rejects.toEqual({ status: 400, message: 'userId y nombre son requeridos' });
    expect(objectiveRepo.create).not.toHaveBeenCalled();
  });
});

describe('objectives.service - getByUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('OBJ-004: Get objectives of user with records', async () => {
    // Arrange
    const userId = 1;
    const expected = [
      { id: 1, nombre: 'Meditar', estado: 'En progreso' },
      { id: 2, nombre: 'Correr', estado: 'Cumplido' },
    ];
    objectiveRepo.findByUserId.mockResolvedValue(expected);

    // Act
    const result = await objectivesService.getByUser(userId);

    // Assert
    expect(objectiveRepo.findByUserId).toHaveBeenCalledWith(userId);
    expect(result).toEqual(expected);
  });

  it('OBJ-005: Get objectives of user without records -> []', async () => {
    // Arrange
    const userId = 99;
    objectiveRepo.findByUserId.mockResolvedValue([]);

    // Act
    const result = await objectivesService.getByUser(userId);

    // Assert
    expect(objectiveRepo.findByUserId).toHaveBeenCalledWith(userId);
    expect(result).toEqual([]);
  });
});

describe('objectives.service - update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('OBJ-006: Update objective name, description, state', async () => {
    // Arrange
    const id = 1;
    const nombre = 'Nuevo nombre';
    const descripcion = 'Nueva descripcion';
    const estado = 'En progreso';
    objectiveRepo.update.mockResolvedValue({ id, nombre, descripcion, estado });

    // Act
    const result = await objectivesService.update(id, nombre, descripcion, estado);

    // Assert
    expect(objectiveRepo.update).toHaveBeenCalledWith(id, nombre, descripcion, estado);
    expect(result).toEqual({ message: 'Objetivo actualizado correctamente' });
  });

  it('OBJ-007: Change state to "Cumplido"', async () => {
    // Arrange
    const id = 1;
    const nombre = 'Meditar';
    const descripcion = 'Diaria';
    const estado = 'Cumplido';
    objectiveRepo.update.mockResolvedValue({ id, nombre, descripcion, estado });

    // Act
    const result = await objectivesService.update(id, nombre, descripcion, estado);

    // Assert
    expect(objectiveRepo.update).toHaveBeenCalledWith(id, nombre, descripcion, estado);
    expect(result).toEqual({ message: 'Objetivo actualizado correctamente' });
  });

  it('OBJ-008: Update non-existent objective -> 404', async () => {
    // Arrange
    const id = 999;
    objectiveRepo.update.mockResolvedValue(null);

    // Act
    const act = () => objectivesService.update(id, 'nombre', 'descripcion', 'estado');

    // Assert
    await expect(act()).rejects.toEqual({ status: 404, message: 'Objetivo no encontrado' });
  });
});

describe('objectives.service - remove', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('OBJ-009: Delete existing objective', async () => {
    // Arrange
    const id = 1;
    objectiveRepo.deleteById.mockResolvedValue({ id });

    // Act
    const result = await objectivesService.remove(id);

    // Assert
    expect(objectiveRepo.deleteById).toHaveBeenCalledWith(id);
    expect(result).toEqual({ message: 'Objetivo eliminado correctamente' });
  });

  it('OBJ-010: Delete non-existent objective -> 404', async () => {
    // Arrange
    const id = 999;
    objectiveRepo.deleteById.mockResolvedValue(null);

    // Act
    const act = () => objectivesService.remove(id);

    // Assert
    await expect(act()).rejects.toEqual({ status: 404, message: 'Objetivo no encontrado' });
  });
});