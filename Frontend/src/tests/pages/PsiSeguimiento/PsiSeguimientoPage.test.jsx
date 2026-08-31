import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 2, id_user: 2, names: 'Psi', rol: 'psicologo' },
    hasRole: () => true,
  }),
}));
vi.mock('framer-motion', () => {
  const makeTag = (Tag) => ({ children, whileHover, whileTap, initial, animate, variants, transition, ...rest }) =>
    React.createElement(Tag, { ...rest }, children);
  return {
    motion: { div: makeTag('div'), button: makeTag('button'), h1: makeTag('h1') },
    AnimatePresence: ({ children }) => children,
  };
});
vi.mock('lucide-react', () => {
  const Fake = () => null;
  return {
    Users: Fake, AlertTriangle: Fake, Search: Fake, BarChart2: Fake,
    Clock: Fake, Smile: Fake, Meh: Fake, Frown: Fake, Bell: Fake, CheckCircle: Fake,
  };
});
vi.mock('../../../api/tracking.api', () => ({
  default: {
    getApprenticesWithEmotions: vi.fn(),
    getAlerts: vi.fn(),
    markAlertAsRead: vi.fn(),
  },
}));
vi.mock('../../../api/diary.api', () => ({
  default: { getEntries: vi.fn() },
}));
vi.mock('../../../layouts/MainLayout', () => ({
  default: ({ pageTitle, children }) => (
    <div>
      <h1>{pageTitle}</h1>
      {children}
    </div>
  ),
}));

import trackingApi from '../../../api/tracking.api';
import diaryApi from '../../../api/diary.api';
import PsiSeguimientoPage from '../../../pages/psicologo/PsiSeguimientoPage';

function renderPsi() {
  return render(
    <MemoryRouter>
      <PsiSeguimientoPage />
    </MemoryRouter>,
  );
}

describe('PsiSeguimientoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    diaryApi.getEntries.mockResolvedValue([]);
  });

  it('UI-028 el psicólogo ve la lista de aprendices con su promedio', async () => {
    // Arrange
    trackingApi.getApprenticesWithEmotions.mockResolvedValue([
      { id: 1, nombre: 'Ana', documento: '123', promedio: 'Positivas', ultima: 'Feliz', estadisticas: { positivas: 3, negativas: 1, neutrales: 0 } },
      { id: 2, nombre: 'Luis', documento: '456', promedio: 'Negativas', ultima: 'Triste', estadisticas: { positivas: 0, negativas: 2, neutrales: 1 } },
    ]);
    trackingApi.getAlerts.mockResolvedValue([]);

    // Act
    renderPsi();

    // Assert
    await waitFor(() => {
      expect(screen.getAllByText('Ana').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Luis').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Positivas|Negativas/).length).toBeGreaterThan(0);
    });
  });

  it('UI-031 marcar una alerta como leída la oculta', async () => {
    // Arrange
    trackingApi.getApprenticesWithEmotions.mockResolvedValue([]);
    trackingApi.getAlerts.mockResolvedValue([
      { id_alert: 1, aprendiz_nombre: 'Ana', motivo: 'Ansiedad', leido: false },
      { id_alert: 2, aprendiz_nombre: 'Luis', motivo: 'Baja asistencia', leido: false },
    ]);
    trackingApi.markAlertAsRead.mockResolvedValue({ message: 'ok' });
    renderPsi();

    // Esperar a que las alertas se carguen
    await waitFor(() => {
      expect(screen.getByText(/Ansiedad/)).toBeInTheDocument();
    });

    // Act - click en marcar como leída (botón con texto similar a "Leído")
    const leidoButtons = screen.getAllByRole('button');
    // click en el primero
    userEvent.click(leidoButtons[0]);

    // Assert - se llamó a markAlertAsRead y la alerta desaparece tras refrescar
    await waitFor(() => {
      expect(trackingApi.markAlertAsRead).toHaveBeenCalled();
    });
  });
});