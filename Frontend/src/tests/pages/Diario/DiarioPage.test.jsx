import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mocks de dependencias
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 7, id_user: 7, names: 'Ana', rol: 'aprendiz' } }),
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
    Heart: Fake,
    BookOpen: Fake,
    Target: Fake,
    PlusCircle: Fake,
    RefreshCw: Fake,
    Trash2: Fake,
    Edit3: Fake,
    X: Fake,
    CheckCircle: Fake,
  };
});
vi.mock('../../../utils/alerts', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showWarning: vi.fn(),
  showConfirm: vi.fn().mockResolvedValue({ isConfirmed: true }),
}));
vi.mock('../../../api/diary.api', () => ({
  default: { createEntry: vi.fn() },
}));
vi.mock('../../../api/objectives.api', () => ({
  default: { getByUser: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));
vi.mock('../../../layouts/MainLayout', () => ({
  default: ({ pageTitle, children }) => (
    <div>
      <h1>{pageTitle}</h1>
      {children}
    </div>
  ),
}));

import { showWarning, showSuccess } from '../../../utils/alerts';
import diaryApi from '../../../api/diary.api';
import objectivesApi from '../../../api/objectives.api';
import DiarioPage from '../../../pages/aprendiz/DiarioPage';

function renderDiario() {
  return render(
    <MemoryRouter>
      <DiarioPage />
    </MemoryRouter>,
  );
}

describe('DiarioPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    objectivesApi.getByUser.mockResolvedValue([]);
    window.scrollTo = vi.fn();
  });

  it('UI-011 registra sin emoción seleccionada muestra advertencia', async () => {
    // Arrange
    renderDiario();

    // Act - click en Registrar sin seleccionar emoción
    await userEvent.click(screen.getByRole('button', { name: /registrar/i }));

    // Assert
    expect(showWarning).toHaveBeenCalledWith('Aviso', 'Por favor selecciona una emoción');
    expect(diaryApi.createEntry).not.toHaveBeenCalled();
  });

  it('UI-012 registra una entrada exitosa muestra confirmación', async () => {
    // Arrange
    diaryApi.createEntry.mockResolvedValue({ message: 'ok', entryId: 42 });
    renderDiario();

    // Act - seleccionar emoción (😄) y registrar
    await userEvent.click(screen.getByText('😄'));
    await userEvent.click(screen.getByRole('button', { name: /registrar/i }));

    // Assert
    await waitFor(() => {
      expect(diaryApi.createEntry).toHaveBeenCalledWith(7, 0, '');
      expect(showSuccess).toHaveBeenCalled();
    });
  });

  it('UI-013 crear objetivo sin nombre muestra advertencia', async () => {
    // Arrange
    renderDiario();

    // Act - click en Crear Objetivo sin nombre
    await userEvent.click(screen.getByRole('button', { name: /crear objetivo/i }));

    // Assert
    expect(showWarning).toHaveBeenCalledWith('Aviso', 'Por favor ingresa un nombre para el objetivo');
    expect(objectivesApi.create).not.toHaveBeenCalled();
  });

  it('crea un objetivo correctamente', async () => {
    // Arrange
    objectivesApi.create.mockResolvedValue({ objectiveId: 1 });
    renderDiario();

    // Act
    await userEvent.type(screen.getByPlaceholderText('Nombre del objetivo'), 'Meditar diario');
    await userEvent.click(screen.getByRole('button', { name: /crear objetivo/i }));

    // Assert
    await waitFor(() => {
      expect(objectivesApi.create).toHaveBeenCalledWith(7, 'Meditar diario', '', 'No Cumplido');
      expect(showSuccess).toHaveBeenCalled();
    });
  });
});