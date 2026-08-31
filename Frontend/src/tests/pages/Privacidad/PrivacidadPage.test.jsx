import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, id_user: 1, names: 'Ana', rol: 'aprendiz' },
  }),
}));
vi.mock('framer-motion', () => {
  const makeTag = (Tag) => ({ children, whileHover, whileTap, initial, animate, variants, transition, ...rest }) =>
    React.createElement(Tag, rest, children);
  return { motion: { div: makeTag('div'), button: makeTag('button') } };
});
vi.mock('lucide-react', () => {
  const Fake = () => null;
  return { User: Fake, Shield: Fake, Eye: Fake, Save: Fake };
});
vi.mock('../../../api/users.api', () => ({
  default: {
    getPrivacy: vi.fn(),
    updatePrivacy: vi.fn(),
  },
}));
vi.mock('../../../utils/alerts', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));
vi.mock('../../../layouts/MainLayout', () => ({
  default: ({ pageTitle, children }) => (
    <div><h1>{pageTitle}</h1>{children}</div>
  ),
}));

import usersApi from '../../../api/users.api';
import PrivacidadPage from '../../../pages/aprendiz/PrivacidadPage';
import { showSuccess } from '../../../utils/alerts';

function renderPP() {
  return render(
    <MemoryRouter>
      <PrivacidadPage />
    </MemoryRouter>,
  );
}

describe('PrivacidadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersApi.getPrivacy.mockResolvedValue({ diary_visibility: 'yo-psicologo' });
  });

  it('PRIV-003 la página carga la configuración de privacidad actual', async () => {
    renderPP();

    await waitFor(() => {
      expect(usersApi.getPrivacy).toHaveBeenCalledWith(1);
      expect(screen.getByText(/Yo y psicólogo\/a/)).toBeInTheDocument();
    });
  });

  it('PRIV-004 el usuario puede cambiar y guardar la visibilidad del diario', async () => {
    // Arrange
    usersApi.updatePrivacy.mockResolvedValue({ message: 'Privacidad actualizada' });
    renderPP();

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText(/Yo y psicólogo\/a/)).toBeInTheDocument();
    });

    // Act - change select
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'solo-yo');

    // Wait for text to change confirming state updated
    await waitFor(() => {
      expect(screen.getByText(/Solo tú podrás ver tu diario/)).toBeInTheDocument();
    });

    // Click submit button
    const submitBtn = screen.getByRole('button', { name: /Guardar/i });
    await userEvent.click(submitBtn);

    // Assert
    await waitFor(() => {
      expect(usersApi.updatePrivacy).toHaveBeenCalled();
      expect(showSuccess).toHaveBeenCalled();
    });
  });
});
