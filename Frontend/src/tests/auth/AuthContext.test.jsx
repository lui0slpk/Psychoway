import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext';

vi.mock('../../api/auth.api', () => ({
  default: {
    verifySession: vi.fn(),
  },
}));

import authApi from '../../api/auth.api';

const TOKEN_KEY = 'psychoway_token';
const USER_KEY = 'psychoway_user';

function TestConsumer() {
  const { user, isAuthenticated, hasRole, login, logout, updateUser } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.names : 'null'}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="has-role-aprendiz">{String(hasRole('aprendiz'))}</span>
      <span data-testid="has-role-multi">{String(hasRole(['admin', 'psicologo']))}</span>
      <button onClick={() => login({ names: 'Ana', rol: 'aprendiz' }, 'tok-1')}>login</button>
      <button onClick={logout}>logout</button>
      <button onClick={() => updateUser({ names: 'Ana María' })}>update</button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    authApi.verifySession.mockReset();
  });

  it('UI-001 restaura el usuario desde localStorage al iniciar', async () => {
    // Arrange
    localStorage.setItem(TOKEN_KEY, 'tok-1');
    localStorage.setItem(USER_KEY, JSON.stringify({ names: 'Ana', rol: 'aprendiz' }));
    authApi.verifySession.mockResolvedValue({ valid: true, userId: 3, role: 'aprendiz' });

    // Act
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('auth').textContent).toBe('true'));

    // Assert
    expect(screen.getByTestId('user').textContent).toBe('Ana');
    expect(authApi.verifySession).toHaveBeenCalled();
  });

  it('UI-002 limpia la sesión si el token expiró', async () => {
    // Arrange
    localStorage.setItem(TOKEN_KEY, 'tok-expirado');
    localStorage.setItem(USER_KEY, JSON.stringify({ names: 'Ana', rol: 'aprendiz' }));
    authApi.verifySession.mockRejectedValue({ status: 401, message: 'Token expirado' });

    // Act
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('auth').textContent).toBe('false'));

    // Assert
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it('UI-003 hasRole funciona para strings y arrays', async () => {
    // Arrange
    localStorage.setItem(TOKEN_KEY, 'tok-1');
    localStorage.setItem(USER_KEY, JSON.stringify({ names: 'Ana', rol: 'aprendiz' }));
    authApi.verifySession.mockResolvedValue({ valid: true, userId: 3, role: 'aprendiz' });

    // Act
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('auth').textContent).toBe('true'));

    // Assert
    expect(screen.getByTestId('has-role-aprendiz').textContent).toBe('true');
    expect(screen.getByTestId('has-role-multi').textContent).toBe('false');
  });

  it('login guarda el usuario y el token en localStorage', async () => {
    // Arrange - sin sesión guardada (no hay token), AuthProvider termina en loading false
    renderAuth();
    // Esperar a que termine la verificación inicial (no hay token → no verifica)
    await waitFor(() => expect(screen.getByTestId('auth').textContent).toBe('false'));

    // Act
    await userEvent.click(screen.getByText('login'));

    // Assert
    expect(screen.getByTestId('auth').textContent).toBe('true');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('tok-1');
    expect(localStorage.getItem(USER_KEY)).toContain('Ana');
  });

  it('logout limpia el token y el usuario de localStorage', async () => {
    // Arrange
    localStorage.setItem(TOKEN_KEY, 'tok-1');
    localStorage.setItem(USER_KEY, JSON.stringify({ names: 'Ana', rol: 'aprendiz' }));
    authApi.verifySession.mockResolvedValue({ valid: true });
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('auth').textContent).toBe('true'));

    // Act
    await userEvent.click(screen.getByText('logout'));

    // Assert
    expect(screen.getByTestId('auth').textContent).toBe('false');
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });
});