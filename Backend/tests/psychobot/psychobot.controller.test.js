import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../src/services/psychobot.service.js');

import * as psychobotService from '../../src/services/psychobot.service.js';
import * as psychobotCtrl from '../../src/controllers/psychobot.controller.js';

const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
const next = vi.fn();

describe('psychobot.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSessions responde 200 con las sesiones', async () => {
    psychobotService.getSessions.mockResolvedValue([{ id_session: 1 }]);

    await psychobotCtrl.getSessions({ params: { userId: '1' } }, res, next);

    expect(psychobotService.getSessions).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('createSession responde 201 con la sesión creada', async () => {
    psychobotService.createSession.mockResolvedValue({ id_session: 5, title: 'X' });

    await psychobotCtrl.createSession({ body: { userId: 1, title: 'X' } }, res, next);

    expect(psychobotService.createSession).toHaveBeenCalledWith(1, 'X');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('deleteSession responde 200', async () => {
    psychobotService.deleteSession.mockResolvedValue({ message: 'Sesión eliminada' });

    await psychobotCtrl.deleteSession({ params: { id: '1' } }, res, next);

    expect(psychobotService.deleteSession).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('chat responde 200 con la respuesta del bot', async () => {
    psychobotService.chat.mockResolvedValue({ type: 'bot', text: 'hola', id_session: 7 });

    await psychobotCtrl.chat({ body: { userId: 1, message: 'hola' } }, res, next);

    expect(psychobotService.chat).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('weeklySummary responde 200 con el resumen', async () => {
    psychobotService.weeklySummary.mockResolvedValue({ type: 'bot', text: 'resumen' });

    await psychobotCtrl.weeklySummary({ body: { userId: 1 } }, res, next);

    expect(psychobotService.weeklySummary).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('pasa errores al middleware next', async () => {
    psychobotService.chat.mockRejectedValue({ status: 400, message: 'error' });

    await psychobotCtrl.chat({ body: {} }, res, next);

    expect(next).toHaveBeenCalledWith({ status: 400, message: 'error' });
  });
});