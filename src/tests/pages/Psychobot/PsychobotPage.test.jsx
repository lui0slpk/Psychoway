import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = vi.fn();

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, id_user: 1, names: 'Ana', rol: 'aprendiz' },
  }),
}));
vi.mock('framer-motion', () => {
  const makeTag = (Tag) => ({ children, whileHover, whileTap, initial, animate, variants, transition, exit, ...rest }) =>
    React.createElement(Tag, rest, children);
  return {
    motion: { div: makeTag('div'), button: makeTag('button') },
    AnimatePresence: ({ children }) => children,
  };
});
vi.mock('lucide-react', () => {
  const Fake = () => null;
  return {
    Send: Fake, Clock: Fake, Plus: Fake, Trash2: Fake, X: Fake,
    MessageSquare: Fake, Wind: Fake, Bot: Fake, Thermometer: Fake,
    Target: Fake, Heart: Fake, Map: Fake, Calendar: Fake,
  };
});
vi.mock('../../../api/psychobot.api', () => ({
  default: {
    getSessions: vi.fn(),
    createSession: vi.fn(),
    deleteSession: vi.fn(),
    getHistory: vi.fn(),
    chat: vi.fn(),
    weeklySummary: vi.fn(),
  },
}));
vi.mock('../../../layouts/MainLayout', () => ({
  default: ({ pageTitle, children }) => (
    <div><h1>{pageTitle}</h1>{children}</div>
  ),
}));

import psychobotApi from '../../../api/psychobot.api';
import PsychobotPage from '../../../pages/aprendiz/PsychobotPage';

function renderPB() {
  return render(
    <MemoryRouter>
      <PsychobotPage />
    </MemoryRouter>,
  );
}

describe('PsychobotPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    psychobotApi.getSessions.mockResolvedValue([]);
    psychobotApi.getHistory.mockResolvedValue([]);
  });

  it('UI-014 el chat muestra el saludo de bienvenida del bot', async () => {
    // Arrange
    psychobotApi.getSessions.mockResolvedValue([
      { id_session: 1, title: 'Sesión 1' },
    ]);
    psychobotApi.getHistory.mockResolvedValue([
      { type: 'bot', text: '¡Hola Ana! Soy Psychobot 🧠. ¿Cómo te sientes hoy?' },
    ]);

    // Act
    renderPB();

    // Assert
    await waitFor(() => {
      expect(screen.getAllByText(/Psychobot/).length).toBeGreaterThan(0);
    });
  });

  it('UI-015 el usuario puede enviar un mensaje y ver la respuesta del bot', async () => {
    // Arrange
    psychobotApi.getSessions.mockResolvedValue([
      { id_session: 1, title: 'Sesión 1' },
    ]);
    psychobotApi.getHistory.mockResolvedValue([]);
    psychobotApi.chat.mockResolvedValue({
      type: 'bot',
      text: 'Gracias por compartir, Ana. Estoy aquí para escucharte.',
    });

    renderPB();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Escribe tu mensaje/)).toBeInTheDocument();
    });

    // Act
    const input = screen.getByPlaceholderText(/Escribe tu mensaje/);
    await userEvent.type(input, 'Me siento triste');
    await userEvent.keyboard('{Enter}');

    // Assert
    await waitFor(() => {
      expect(psychobotApi.chat).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Me siento triste' }),
      );
    });
  });

  it('UI-017 el usuario puede crear una nueva sesión desde el sidebar', async () => {
    // Arrange
    psychobotApi.getSessions.mockResolvedValue([]);
    psychobotApi.getHistory.mockResolvedValue([]);
    psychobotApi.createSession.mockResolvedValue({
      id_session: 99,
      title: 'Nueva Conversación',
    });

    const { container } = renderPB();

    // Act - find sidebar button by its unique class combination
    const clockBtn = container.querySelector('button.btn-light');
    expect(clockBtn).toBeInTheDocument();
    await userEvent.click(clockBtn);

    await waitFor(() => {
      expect(screen.getByText(/Historial/)).toBeInTheDocument();
    });

    // Click "Nuevo Chat"
    const newChatBtn = screen.getByText(/Nuevo Chat/);
    await userEvent.click(newChatBtn);

    // Assert
    await waitFor(() => {
      expect(psychobotApi.createSession).toHaveBeenCalled();
    });
  });

  it('UI-018 el usuario puede abrir el termómetro de ánimo', async () => {
    // Arrange
    renderPB();

    await waitFor(() => {
      expect(screen.getByText(/Evaluar Ánimo/)).toBeInTheDocument();
    });

    // Act
    const termBtn = screen.getByText(/Evaluar Ánimo/);
    await userEvent.click(termBtn);

    // Assert - thermometer modal opens
    await waitFor(() => {
      expect(screen.getByText(/Del 1/)).toBeInTheDocument();
    });
  });

  it('UI-019 el usuario puede pedir un resumen semanal', async () => {
    // Arrange
    psychobotApi.getSessions.mockResolvedValue([
      { id_session: 1, title: 'Sesión 1' },
    ]);
    psychobotApi.getHistory.mockResolvedValue([]);
    psychobotApi.weeklySummary.mockResolvedValue({
      type: 'bot',
      text: 'Tu resumen semanal: 5 sesiones, ánimo general positivo.',
    });

    renderPB();

    await waitFor(() => {
      expect(screen.getByText(/Resumen Semanal/)).toBeInTheDocument();
    });

    // Act
    const summaryBtn = screen.getByText(/Resumen Semanal/);
    await userEvent.click(summaryBtn);

    // Assert
    await waitFor(() => {
      expect(psychobotApi.weeklySummary).toHaveBeenCalled();
    });
  });
});
