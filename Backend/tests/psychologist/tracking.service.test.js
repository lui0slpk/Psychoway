import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../src/repositories/tracking.repository.js');

import * as trackingRepo from '../../src/repositories/tracking.repository.js';
import * as trackingService from '../../src/services/tracking.service.js';

describe('tracking.service - getApprenticesWithEmotions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('PSI-005 obtiene aprendices con sus estadísticas emocionales', async () => {
    trackingRepo.getApprenticesWithEmotions.mockResolvedValue([
      { id: 1, nombre: 'Ana', documento: '123' },
    ]);
    trackingRepo.getAllEmotionData.mockResolvedValue([
      { id_user: 1, emot_estado: 'Positivo' },
      { id_user: 1, emot_estado: 'Positivo' },
      { id_user: 1, emot_estado: 'Negativo' },
    ]);

    const result = await trackingService.getApprenticesWithEmotions();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: 1,
        nombre: 'Ana',
        ultima: 'Negativas',
        promedio: 'Positivas',
        estadisticas: { positivas: 2, negativas: 1, neutrales: 0 },
      }),
    );
  });

  it('PSI-006 calcula el promedio con mayor cantidad de positivas', async () => {
    trackingRepo.getApprenticesWithEmotions.mockResolvedValue([{ id: 1 }]);
    trackingRepo.getAllEmotionData.mockResolvedValue([
      { id_user: 1, emot_estado: 'Positivo' },
      { id_user: 1, emot_estado: 'Positivo' },
      { id_user: 1, emot_estado: 'Positivo' },
      { id_user: 1, emot_estado: 'Negativo' },
    ]);

    const result = await trackingService.getApprenticesWithEmotions();

    expect(result[0].promedio).toBe('Positivas');
  });

  it('PSI-007 empate positivo-negativo resuelve a Positivas', async () => {
    trackingRepo.getApprenticesWithEmotions.mockResolvedValue([{ id: 1 }]);
    trackingRepo.getAllEmotionData.mockResolvedValue([
      { id_user: 1, emot_estado: 'Positivo' },
      { id_user: 1, emot_estado: 'Positivo' },
      { id_user: 1, emot_estado: 'Negativo' },
      { id_user: 1, emot_estado: 'Negativo' },
    ]);

    const result = await trackingService.getApprenticesWithEmotions();

    expect(result[0].promedio).toBe('Positivas');
  });

  it('PSI-008 aprendiz sin emociones retorna N/D y promedio Neutral (comportamiento actual)', async () => {
    trackingRepo.getApprenticesWithEmotions.mockResolvedValue([
      { id: 5, nombre: 'Luis' },
    ]);
    trackingRepo.getAllEmotionData.mockResolvedValue([]);

    const result = await trackingService.getApprenticesWithEmotions();

    expect(result[0].ultima).toBe('N/D');
    expect(result[0].estadisticas).toEqual({ positivas: 0, negativas: 0, neutrales: 0 });
  });
});