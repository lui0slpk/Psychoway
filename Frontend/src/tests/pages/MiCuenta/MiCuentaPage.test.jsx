import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, id_user: 1, names: 'Ana', last_names: 'García', document: '12345678' },
    logout: vi.fn(),
    updateUser: vi.fn(),
  }),
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});
vi.mock('framer-motion', () => {
  const makeTag = (Tag) => ({ children, whileHover, whileTap, initial, animate, variants, transition, ...rest }) =>
    React.createElement(Tag, rest, children);
  return { motion: { div: makeTag('div'), button: makeTag('button') } };
});
vi.mock('lucide-react', () => {
  const Fake = () => null;
  return {
    User: Fake, FileText: Fake, Lock: Fake, Eye: Fake, EyeOff: Fake,
    Save: Fake, Trash2: Fake, Shield: Fake, Camera: Fake, Upload: Fake, X: Fake,
  };
});
vi.mock('../../../api/users.api', () => ({
  default: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    updateProfilePhoto: vi.fn(),
    deleteAccount: vi.fn(),
  },
}));
vi.mock('../../../utils/alerts', () => ({
  showError: vi.fn(),
  showSuccess: vi.fn(),
  showConfirm: vi.fn(),
  showPrompt: vi.fn(),
}));
vi.mock('../../../layouts/MainLayout', () => ({
  default: ({ pageTitle, children }) => (
    <div><h1>{pageTitle}</h1>{children}</div>
  ),
}));

import usersApi from '../../../api/users.api';
import MiCuentaPage from '../../../pages/aprendiz/MiCuentaPage';

function renderMC() {
  return render(
    <MemoryRouter>
      <MiCuentaPage />
    </MemoryRouter>,
  );
}

describe('MiCuentaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersApi.getProfile.mockResolvedValue({
      document: '12345678',
      tipoDocumento: 'CC',
      nombres: 'Ana',
      apellidos: 'García',
      fechaNacimiento: '1995-05-15',
      correo: 'ana@test.com',
      contact_number: '3001234567',
      landline_number: '',
      training_program: 'Técnico',
      ficha_number: '12345',
      profile_photo: null,
    });
  });

  it('PROF-008 el usuario ve su perfil cargado desde la API', async () => {
    // Arrange & Act
    renderMC();

    // Assert
    await waitFor(() => {
      expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
      expect(screen.getByDisplayValue('García')).toBeInTheDocument();
      expect(screen.getByDisplayValue('ana@test.com')).toBeInTheDocument();
    });
  });

  it('PROF-009 el usuario puede guardar cambios en su perfil', async () => {
    // Arrange
    usersApi.updateProfile.mockResolvedValue({ message: 'Perfil actualizado' });
    renderMC();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
    });

    // Act - change name
    const nameInput = screen.getByDisplayValue('Ana');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'María');

    // Submit
    const saveBtn = screen.getByRole('button', { name: /Guardar/i });
    await userEvent.click(saveBtn);

    // Assert
    await waitFor(() => {
      expect(usersApi.updateProfile).toHaveBeenCalled();
    });
  });

  it('PROF-010 error al cargar perfil muestra fallback', async () => {
    // Arrange
    usersApi.getProfile.mockRejectedValue(new Error('Network error'));
    renderMC();

    // Assert - should still render with fallback data from context
    await waitFor(() => {
      expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
      expect(screen.getByDisplayValue('García')).toBeInTheDocument();
    });
  });
});
