import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mockear el import de la imagen (asset estático de CRA)
vi.mock('../../../assets/img/img_sena.png', () => ({ default: 'mock-logo.png' }));
vi.mock('../../../api/auth.api', () => ({
  default: { login: vi.fn() },
}));
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

import authApi from '../../../api/auth.api';
import Inicio from '../../../pages/Inicio';

function renderInicio() {
  return render(
    <MemoryRouter>
      <Inicio />
    </MemoryRouter>,
  );
}

describe('Inicio (Login)', () => {
  beforeEach(() => {
    authApi.login.mockReset();
  });

  it('UI-008 el toggle de mostrar/ocultar contraseña alterna el tipo del input', async () => {
    // Arrange
    renderInicio();
    const passwordInput = screen.getByLabelText('Contraseña');
    expect(passwordInput.type).toBe('password');

    // Act - click en el ícono eye (nextSibling del input dentro del input-group)
    await userEvent.click(passwordInput.parentElement.lastChild);

    // Assert
    expect(screen.getByLabelText('Contraseña').type).toBe('text');
  });

  it('UI-006 login con credenciales incorrectas muestra error', async () => {
    // Arrange
    authApi.login.mockRejectedValue({ status: 401, message: 'Documento o contraseña incorrectos' });
    renderInicio();

    // Act
    await userEvent.type(screen.getByLabelText('Documento de identidad'), '12345678');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'malpassword');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Documento o contraseña incorrectos')).toBeInTheDocument();
    });
  });

  it('UI-007 login exitoso muestra bienvenida', async () => {
    // Arrange
    authApi.login.mockResolvedValue({
      token: 'tok-1',
      user: { names: 'Ana', rol: 'aprendiz' },
    });
    renderInicio();

    // Act
    await userEvent.type(screen.getByLabelText('Documento de identidad'), '12345678');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Assert - bienvenida visible
    await waitFor(() => {
      expect(screen.getByText(/¡Bienvenido\/a, Ana!/)).toBeInTheDocument();
    });
  });

  it('muestra mensaje de error de conexión si el servidor no responde', async () => {
    // Arrange
    authApi.login.mockRejectedValue({ status: 0, message: 'Network error' });
    renderInicio();

    // Act
    await userEvent.type(screen.getByLabelText('Documento de identidad'), '12345678');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('No se pudo conectar con el servidor.')).toBeInTheDocument();
    });
  });
});