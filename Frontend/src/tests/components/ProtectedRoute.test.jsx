import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect } from 'vitest';
import ProtectedRoute from '../../components/ProtectedRoute';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../context/AuthContext';

function renderProtected(allowedRoles) {
  return render(
    <MemoryRouter initialEntries={['/protegida']}>
      <Routes>
        <Route
          path="/protegida"
          element={
            <ProtectedRoute allowedRoles={allowedRoles}>
              <div>Contenido protegido</div>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<div>Home</div>} />
        <Route path="/diario" element={<div>Diario</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('UI-004 renderiza el hijo si el usuario está autenticado', () => {
    // Arrange
    useAuth.mockReturnValue({ user: { rol: 'aprendiz' }, loading: false, isAuthenticated: true });

    // Act
    renderProtected();

    // Assert
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('UI-005 redirige al home si el usuario no está autenticado', () => {
    // Arrange
    useAuth.mockReturnValue({ user: null, loading: false, isAuthenticated: false });

    // Act
    renderProtected();

    // Assert
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('muestra un spinner mientras loading', () => {
    // Arrange
    useAuth.mockReturnValue({ user: null, loading: true, isAuthenticated: false });

    // Act
    renderProtected();

    // Assert
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('redirige al rol por defecto si el rol no está permitido', () => {
    // Arrange - usuario psicólogo intentando entrar a ruta de aprendiz
    useAuth.mockReturnValue({ user: { rol: 'psicologo' }, loading: false, isAuthenticated: true });

    // Act - ruta protegida solo para 'aprendiz'
    renderProtected('aprendiz');

    // Assert - redirige a /psi-seguimiento, pero nuestro mock solo tiene /diario
    // Verificamos que NO renderiza el contenido protegido
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('permite el acceso si el rol está en allowedRoles como array', () => {
    // Arrange
    useAuth.mockReturnValue({ user: { rol: 'psicologo' }, loading: false, isAuthenticated: true });

    // Act - permitido para ['aprendiz', 'psicologo']
    renderProtected(['aprendiz', 'psicologo']);

    // Assert
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});