import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

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
    Heart: Fake, Target: Fake, Calendar: Fake, Clock: Fake,
    Smile: Fake, Meh: Fake, Frown: Fake, TrendingUp: Fake,
  };
});
vi.mock('recharts', () => {
  const Fake = ({ children }) => children || null;
  return {
    PieChart: Fake,
    Pie: Fake,
    Cell: Fake,
    ResponsiveContainer: Fake,
    Tooltip: Fake,
    BarChart: Fake,
    Bar: Fake,
    XAxis: Fake,
    YAxis: Fake,
    CartesianGrid: Fake,
    Legend: Fake,
  };
});
vi.mock('../../../api/diary.api', () => ({
  default: { getEntries: vi.fn() },
}));
vi.mock('../../../api/objectives.api', () => ({
  default: { getByUser: vi.fn() },
}));
vi.mock('../../../layouts/MainLayout', () => ({
  default: ({ pageTitle, children }) => (
    <div>
      <h1>{pageTitle}</h1>
      {children}
    </div>
  ),
}));

import diaryApi from '../../../api/diary.api';
import objectivesApi from '../../../api/objectives.api';
import SeguimientoPage from '../../../pages/aprendiz/SeguimientoPage';

function renderSeguimiento() {
  return render(
    <MemoryRouter>
      <SeguimientoPage />
    </MemoryRouter>,
  );
}

function makeEntry(id, emot_name, emot_estado) {
  return {
    id_diary_entries: id,
    entry_date: '2026-01-01T10:00:00',
    emot_name,
    emot_estado,
    description: 'desc',
  };
}

describe('SeguimientoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('UI-027 sin registros muestra mensaje vacío', async () => {
    // Arrange
    diaryApi.getEntries.mockResolvedValue([]);
    objectivesApi.getByUser.mockResolvedValue([]);

    // Act
    renderSeguimiento();

    // Assert
    await waitFor(() => {
      expect(screen.getByText('No hay registros aún.')).toBeInTheDocument();
    });
  });

  it('UI-026 la tabla de emociones se pagina de a 5 filas', async () => {
    // Arrange - 12 entradas para forzar paginación
    const entries = [];
    for (let i = 1; i <= 12; i++) {
      entries.push(makeEntry(i, i % 2 === 0 ? 'Feliz' : 'Triste', i % 2 === 0 ? 'Positivo' : 'Negativo'));
    }
    diaryApi.getEntries.mockResolvedValue(entries);
    objectivesApi.getByUser.mockResolvedValue([]);

    // Act
    renderSeguimiento();

    // Assert - solo 5 filas en la primera página
    await waitFor(() => {
      const filas = screen.getAllByText(/Feliz|Triste/);
      expect(filas.length).toBe(5);
    });
    // Hay paginación (botón de página 2)
    expect(screen.getByText('›')).toBeInTheDocument();
  });

  it('muestra los objetivos paginados correctamente', async () => {
    // Arrange - sin entradas pero con objetivos
    diaryApi.getEntries.mockResolvedValue([]);
    const objetivos = [];
    for (let i = 1; i <= 6; i++) {
      objetivos.push({
        id_objetives: i,
        nombre_objetivo: `Objetivo ${i}`,
        descripcion: 'x',
        estado: i % 2 === 0 ? 'Cumplido' : 'No Cumplido',
        last_update: '2026-01-01',
      });
    }
    objectivesApi.getByUser.mockResolvedValue(objetivos);

    // Act
    renderSeguimiento();

    // Assert - 5 objetivos en la primera página
    await waitFor(() => {
      expect(screen.getByText('Objetivo 1')).toBeInTheDocument();
      expect(screen.getByText('Objetivo 5')).toBeInTheDocument();
      expect(screen.queryByText('Objetivo 6')).not.toBeInTheDocument();
    });
  });

  it('cambia de página al hacer click en la siguiente', async () => {
    // Arrange - 12 entradas
    const entries = [];
    for (let i = 1; i <= 12; i++) {
      entries.push(makeEntry(i, 'Feliz', 'Positivo'));
    }
    diaryApi.getEntries.mockResolvedValue(entries);
    objectivesApi.getByUser.mockResolvedValue([]);
    renderSeguimiento();

    // Esperar primera página
    await waitFor(() => {
      expect(screen.getAllByText('Feliz').length).toBe(5);
    });

    // Act - click en la página 2
    const nextButton = screen.getByText('›');
    userEvent.click(nextButton);

    // Assert - se muestran los siguientes 5
    await waitFor(() => {
      expect(screen.getAllByText('Feliz').length).toBe(5);
    });
  });
});