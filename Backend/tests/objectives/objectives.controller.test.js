import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../src/services/objectives.service.js');
import * as objectivesService from '../../src/services/objectives.service.js';
import * as objectivesController from '../../src/controllers/objectives.controller.js';

function createMockReqRes() {
  const req = { params: {}, body: {} };
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  const next = vi.fn();
  return { req, res, next };
}

describe('objectives.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('11. Controller create calls service', async () => {
    // Arrange
    const { req, res, next } = createMockReqRes();
    req.body = { userId: 1, nombre: 'Meditar', descripcion: 'Diaria', estado: 'En progreso' };
    const serviceResult = { message: 'Objetivo creado correctamente', objectiveId: 42 };
    objectivesService.create.mockResolvedValue(serviceResult);

    // Act
    await objectivesController.create(req, res, next);

    // Assert
    expect(objectivesService.create).toHaveBeenCalledWith(1, 'Meditar', 'Diaria', 'En progreso');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(serviceResult);
  });

  it('12. Controller getByUser returns objectives', async () => {
    // Arrange
    const { req, res, next } = createMockReqRes();
    req.params = { userId: '1' };
    const objectives = [{ id: 1, nombre: 'Meditar', estado: 'En progreso' }];
    objectivesService.getByUser.mockResolvedValue(objectives);

    // Act
    await objectivesController.getByUser(req, res, next);

    // Assert
    expect(objectivesService.getByUser).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(objectives);
  });

  it('13. Controller update calls service', async () => {
    // Arrange
    const { req, res, next } = createMockReqRes();
    req.params = { id: '5' };
    req.body = { nombre: 'Nuevo', descripcion: 'Nueva', estado: 'Cumplido' };
    const serviceResult = { message: 'Objetivo actualizado correctamente' };
    objectivesService.update.mockResolvedValue(serviceResult);

    // Act
    await objectivesController.update(req, res, next);

    // Assert
    expect(objectivesService.update).toHaveBeenCalledWith('5', 'Nuevo', 'Nueva', 'Cumplido');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(serviceResult);
  });

  it('14. Controller remove calls service', async () => {
    // Arrange
    const { req, res, next } = createMockReqRes();
    req.params = { id: '5' };
    const serviceResult = { message: 'Objetivo eliminado correctamente' };
    objectivesService.remove.mockResolvedValue(serviceResult);

    // Act
    await objectivesController.remove(req, res, next);

    // Assert
    expect(objectivesService.remove).toHaveBeenCalledWith('5');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(serviceResult);
  });
});