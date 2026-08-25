import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../src/services/diary.service.js');
vi.mock('../../src/middlewares/auth.middleware.js', () => ({
  assertOwnProfile: vi.fn(),
}));

import * as diaryService from '../../src/services/diary.service.js';
import * as diaryCtrl from '../../src/controllers/diary.controller.js';
import { assertOwnProfile } from '../../src/middlewares/auth.middleware.js';

const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
const next = vi.fn();

describe('diary.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createEntry responde 200 con el resultado', async () => {
    diaryService.createEntry.mockResolvedValue({ message: 'Entrada de diario registrada correctamente', entryId: 42 });
    const req = { body: { userId: 1, emotionIndex: 0, description: 'x' } };

    await diaryCtrl.createEntry(req, res, next);

    expect(diaryService.createEntry).toHaveBeenCalledWith(1, 0, 'x');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getEntries responde 200 con las entradas', async () => {
    diaryService.getEntries.mockResolvedValue([{ id: 1 }]);
    const req = { params: { userId: '1' } };

    await diaryCtrl.getEntries(req, res, next);

    expect(diaryService.getEntries).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getPrivacy llama assertOwnProfile y responde 200', async () => {
    diaryService.getPrivacy.mockResolvedValue({ diary_visibility: 'yo-psicologo' });
    const req = { userId: '3', userRole: 'aprendiz', params: { userId: '3' } };

    await diaryCtrl.getPrivacy(req, res, next);

    expect(assertOwnProfile).toHaveBeenCalledWith(req, '3');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updatePrivacy llama assertOwnProfile y responde 200', async () => {
    diaryService.updatePrivacy.mockResolvedValue({ message: 'Privacidad actualizada correctamente' });
    const req = { userId: '3', userRole: 'aprendiz', params: { userId: '3' }, body: { visibilidad: 'solo-yo' } };

    await diaryCtrl.updatePrivacy(req, res, next);

    expect(assertOwnProfile).toHaveBeenCalledWith(req, '3');
    expect(diaryService.updatePrivacy).toHaveBeenCalledWith('3', 'solo-yo');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('pasa errores al middleware next', async () => {
    diaryService.createEntry.mockRejectedValue({ status: 400, message: 'error' });

    await diaryCtrl.createEntry({ body: {} }, res, next);

    expect(next).toHaveBeenCalledWith({ status: 400, message: 'error' });
  });
});