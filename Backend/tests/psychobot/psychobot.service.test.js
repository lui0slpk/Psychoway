import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/repositories/psychobot.repository.js');
vi.mock('../../src/repositories/diary.repository.js');
vi.mock('../../src/repositories/emotion.repository.js');
vi.mock('../../src/repositories/alert.repository.js');
vi.mock('../../src/repositories/user.repository.js');
vi.mock('../../src/config/environment.js', () => ({
  default: { GEMINI_API_KEY: 'API_KEY_AQUI', FRONTEND_URL: 'http://localhost:3000' },
}));

vi.mock('../../src/config/gemini.js', () => ({
  ai: {},
  generateWithRetry: vi.fn(),
}));

import * as psychobotRepo from '../../src/repositories/psychobot.repository.js';
import * as diaryRepo from '../../src/repositories/diary.repository.js';
import * as emotionRepo from '../../src/repositories/emotion.repository.js';
import * as alertRepo from '../../src/repositories/alert.repository.js';
import * as userRepo from '../../src/repositories/user.repository.js';
import { generateWithRetry } from '../../src/config/gemini.js';
import env from '../../src/config/environment.js';
import * as psychobotService from '../../src/services/psychobot.service.js';

function setRealKey() {
  env.GEMINI_API_KEY = 'test-real-key';
}
function setPlaceholderKey() {
  env.GEMINI_API_KEY = 'API_KEY_AQUI';
}

describe('psychobot.service - sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('BOT-001 obtiene las sesiones de un usuario', async () => {
    const sessions = [{ id_session: 1, title: 'Hola' }];
    psychobotRepo.getSessionsByUserId.mockResolvedValue(sessions);

    const result = await psychobotService.getSessions(1);

    expect(result).toEqual(sessions);
    expect(psychobotRepo.getSessionsByUserId).toHaveBeenCalledWith(1);
  });

  it('BOT-002 usuario sin sesiones retorna []', async () => {
    psychobotRepo.getSessionsByUserId.mockResolvedValue([]);

    const result = await psychobotService.getSessions(1);

    expect(result).toEqual([]);
  });

  it('BOT-003 crea una nueva sesión', async () => {
    psychobotRepo.createSession.mockResolvedValue(5);

    const result = await psychobotService.createSession(1, 'Mi sesión');

    expect(result).toEqual({ id_session: 5, title: 'Mi sesión' });
  });

  it('BOT-004 elimina una sesión existente', async () => {
    psychobotRepo.deleteSession.mockResolvedValue(true);

    const result = await psychobotService.deleteSession(1);

    expect(result).toEqual({ message: 'Sesión eliminada' });
    expect(psychobotRepo.deleteSession).toHaveBeenCalledWith(1);
  });

  it('BOT-005 eliminar una sesión inexistente no rompe (comportamiento actual)', async () => {
    psychobotRepo.deleteSession.mockResolvedValue(false);

    const result = await psychobotService.deleteSession(999);

    expect(result).toEqual({ message: 'Sesión eliminada' });
  });
});

describe('psychobot.service - chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setRealKey();
    psychobotRepo.getLatestSession.mockResolvedValue(null);
    psychobotRepo.createSession.mockResolvedValue(7);
    userRepo.getNameById.mockResolvedValue('Ana');
    psychobotRepo.getMemory.mockResolvedValue([]);
    diaryRepo.getRecentEntries.mockResolvedValue([]);
  });

  afterEach(() => {
    setPlaceholderKey();
  });

  it('BOT-011 rechaza mensaje sin userId (400)', async () => {
    await expect(psychobotService.chat(undefined, 'hola')).rejects.toEqual({
      status: 400,
      message: 'userId y message son requeridos',
    });
  });

  it('BOT-012 rechaza mensaje vacío (400)', async () => {
    await expect(psychobotService.chat(1, undefined)).rejects.toEqual({
      status: 400,
      message: 'userId y message son requeridos',
    });
  });

  it('BOT-010 sin API key configurada retorna "Configuración de IA pendiente."', async () => {
    setPlaceholderKey();

    const result = await psychobotService.chat(1, 'hola');

    expect(result.type).toBe('bot');
    expect(result.text).toBe('Configuración de IA pendiente.');
  });

  it('BOT-007 chat crea sesión automáticamente si no existe ninguna', async () => {
    generateWithRetry.mockResolvedValue('Hola Ana!');

    const result = await psychobotService.chat(1, 'hola');

    expect(psychobotRepo.createSession).toHaveBeenCalled();
    expect(result.id_session).toBe(7);
  });

  it('BOT-008 chat retoma la sesión más reciente si existe', async () => {
    psychobotRepo.getLatestSession.mockResolvedValue(3);
    generateWithRetry.mockResolvedValue('Hola!');

    const result = await psychobotService.chat(1, 'hola');

    expect(psychobotRepo.createSession).not.toHaveBeenCalled();
    expect(result.id_session).toBe(3);
  });

  it('BOT-009 bot responde con texto generado por Gemini cuando la API está configurada', async () => {
    generateWithRetry.mockResolvedValue('Respuesta de IA');

    const result = await psychobotService.chat(1, 'hola');

    expect(result.type).toBe('bot');
    expect(result.text).toBe('Respuesta de IA');
  });

  it('BOT-013 error 429 de Gemini retorna mensaje de límite alcanzado', async () => {
    generateWithRetry.mockRejectedValue({ status: 429, message: 'RESOURCE_EXHAUSTED' });

    const result = await psychobotService.chat(1, 'hola');

    expect(result.text).toContain('límite de consultas');
  });

  it('BOT-014 error 503 de Gemini retorna mensaje de reintento', async () => {
    generateWithRetry.mockRejectedValue({ status: 503, message: '503 Service Unavailable' });

    const result = await psychobotService.chat(1, 'hola');

    expect(result.text).toContain('mucho tráfico');
  });

  it('BOT-025 error genérico de Gemini retorna mensaje amigable', async () => {
    generateWithRetry.mockRejectedValue({ status: 500, message: 'Internal' });

    const result = await psychobotService.chat(1, 'hola');

    expect(result.text).toContain('dificultades técnicas');
  });
});

describe('psychobot.service - tags especiales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setRealKey();
    psychobotRepo.getLatestSession.mockResolvedValue(7);
    userRepo.getNameById.mockResolvedValue('Ana');
    psychobotRepo.getMemory.mockResolvedValue([]);
    diaryRepo.getRecentEntries.mockResolvedValue([]);
  });

  afterEach(() => {
    setPlaceholderKey();
  });

  it('BOT-015 tag [LEARN] guarda memoria y se elimina de la respuesta visible', async () => {
    generateWithRetry.mockResolvedValue('Te recuerdo que [LEARN: "le gusta leer"] qué tal eso');

    const result = await psychobotService.chat(1, 'dato');

    expect(psychobotRepo.saveMemory).toHaveBeenCalledWith(1, 'le gusta leer');
    expect(result.text).not.toContain('[LEARN');
  });

  it('BOT-016 tag [DIARY] crea entrada de diario y se elimina de la respuesta', async () => {
    generateWithRetry.mockResolvedValue('Anotado [DIARY: {"emotion_name":"Feliz","description":"test"}] todo bien');
    emotionRepo.findByName.mockResolvedValue({ id_emotions: 5 });
    diaryRepo.findByUserId.mockResolvedValue({ id_diary: 10 });
    diaryRepo.createEntry.mockResolvedValue(1);

    const result = await psychobotService.chat(1, 'emoji');

    expect(diaryRepo.createEntry).toHaveBeenCalledWith(10, 'test', 5);
    expect(result.text).not.toContain('[DIARY');
  });

  it('BOT-017 tag [ALERT] crea alerta de riesgo y se elimina de la respuesta', async () => {
    generateWithRetry.mockResolvedValue('[ALERT: {"motivo":"riesgo suicida"}] Ayuda');

    const result = await psychobotService.chat(1, 'emergencia');

    expect(alertRepo.create).toHaveBeenCalledWith(1, 'riesgo suicida');
    expect(result.text).not.toContain('[ALERT');
  });
});

describe('psychobot.service - weeklySummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userRepo.getNameById.mockResolvedValue('Ana');
    psychobotRepo.saveMessage.mockResolvedValue(undefined);
  });

  afterEach(() => {
    setPlaceholderKey();
  });

  it('BOT-022 resumen semanal sin entradas retorna mensaje', async () => {
    diaryRepo.getWeeklyEntries.mockResolvedValue([]);
    psychobotRepo.getLatestSession.mockResolvedValue(7);

    const result = await psychobotService.weeklySummary(1);

    expect(result.text).toContain('Aún no tienes suficientes registros');
  });

  it('BOT-023 resumen semanal sin API key conectada', async () => {
    setPlaceholderKey();
    diaryRepo.getWeeklyEntries.mockResolvedValue([{ entry_date: new Date(), emot_name: 'Feliz' }]);
    psychobotRepo.getLatestSession.mockResolvedValue(7);

    const result = await psychobotService.weeklySummary(1);

    expect(result.text).toContain('la IA no está conectada');
  });

  it('BOT-024 resumen semanal crea sesión "Resumen Semanal" si no existe', async () => {
    setRealKey();
    diaryRepo.getWeeklyEntries.mockResolvedValue([{ entry_date: new Date(), emot_name: 'Feliz' }]);
    psychobotRepo.getLatestSession.mockResolvedValue(null);
    psychobotRepo.createSession.mockResolvedValue(9);
    generateWithRetry.mockResolvedValue('Tu resumen semanal');

    const result = await psychobotService.weeklySummary(1);

    expect(psychobotRepo.createSession).toHaveBeenCalledWith(1, 'Resumen Semanal');
    expect(result.id_session).toBe(9);
  });

  it('BOT-021 genera resumen semanal con entradas y API configurada', async () => {
    setRealKey();
    diaryRepo.getWeeklyEntries.mockResolvedValue([{ entry_date: new Date(), emot_name: 'Feliz', description: 'bien' }]);
    psychobotRepo.getLatestSession.mockResolvedValue(7);
    generateWithRetry.mockResolvedValue('Tu resumen semanal');

    const result = await psychobotService.weeklySummary(1);

    expect(result.type).toBe('bot');
    expect(result.text).toBe('Tu resumen semanal');
    expect(psychobotRepo.saveMessage).toHaveBeenCalled();
  });
});