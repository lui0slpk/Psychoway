import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../../layouts/MainLayout', () => ({
  default: ({ pageTitle, children }) => (
    <div><h1>{pageTitle}</h1>{children}</div>
  ),
}));
vi.mock('framer-motion', () => {
  const makeTag = (Tag) => ({ children, whileHover, whileTap, initial, animate, variants, transition, ...rest }) =>
    React.createElement(Tag, rest, children);
  return { motion: { div: makeTag('div'), button: makeTag('button') } };
});
vi.mock('lucide-react', () => {
  const Fake = () => null;
  return { UserPlus: Fake, Edit3: Fake, Eye: Fake, EyeOff: Fake };
});
vi.mock('../../../api/users.api', () => ({
  default: { create: vi.fn() },
}));
vi.mock('../../../utils/alerts', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showWarning: vi.fn(),
}));

import usersApi from '../../../api/users.api';
import GestionPage from '../../../pages/administrador/GestionPage';
import { showSuccess, showError, showWarning } from '../../../utils/alerts';

function renderGP() {
  return render(
    <MemoryRouter>
      <GestionPage />
    </MemoryRouter>,
  );
}

describe('GestionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ADM-001 el formulario de crear usuario se renderiza con campos visibles', () => {
    renderGP();
    expect(screen.getByPlaceholderText('123456789')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Kevin Andrés/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Chaverra/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/psychoway66/)).toBeInTheDocument();
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('ADM-002 documentos inválidos muestran warning al enviar', async () => {
    const { container } = renderGP();

    // Type short document
    await userEvent.type(screen.getByPlaceholderText('123456789'), '12345');

    // Submit form via fireEvent (bypasses HTML5 required validation)
    const form = container.querySelector('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(showWarning).toHaveBeenCalled();
    });
  });

  it('ADM-003 crear usuario exitoso muestra alerta de éxito', async () => {
    usersApi.create.mockResolvedValue({ message: 'Usuario creado' });
    const { container } = renderGP();

    // Select rol
    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], 'aprendiz');

    // Fill documento
    await userEvent.type(screen.getByPlaceholderText('123456789'), '12345678');

    // Select tipoDocumento
    const updatedSelects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(updatedSelects[1], 'CC');

    // Fill names
    await userEvent.type(screen.getByPlaceholderText(/Kevin Andrés/), 'Juan');
    await userEvent.type(screen.getByPlaceholderText(/Chaverra/), 'Pérez');

    // Fill birth date via id
    fireEvent.change(container.querySelector('#fechaNacimiento'), { target: { value: '1990-01-01' } });

    // Fill email
    await userEvent.type(screen.getByPlaceholderText(/psychoway66/), 'juan@test.com');

    // Fill phone
    await userEvent.type(screen.getByPlaceholderText('3001234567'), '3001234567');

    // Fill password
    await userEvent.type(screen.getByPlaceholderText('********'), 'Abcd1234!');

    // Submit via fireEvent
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(usersApi.create).toHaveBeenCalled();
      expect(showSuccess).toHaveBeenCalled();
    });
  });

  it('ADM-004 error de creación muestra alerta de error', async () => {
    usersApi.create.mockRejectedValue({ status: 400, data: { message: 'Correo ya existe' } });
    const { container } = renderGP();

    const selects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(selects[0], 'aprendiz');
    await userEvent.type(screen.getByPlaceholderText('123456789'), '12345678');

    const updatedSelects = screen.getAllByRole('combobox');
    await userEvent.selectOptions(updatedSelects[1], 'CC');

    await userEvent.type(screen.getByPlaceholderText(/Kevin Andrés/), 'Juan');
    await userEvent.type(screen.getByPlaceholderText(/Chaverra/), 'Pérez');
    fireEvent.change(container.querySelector('#fechaNacimiento'), { target: { value: '1990-01-01' } });
    await userEvent.type(screen.getByPlaceholderText(/psychoway66/), 'juan@test.com');
    await userEvent.type(screen.getByPlaceholderText('3001234567'), '3001234567');
    await userEvent.type(screen.getByPlaceholderText('********'), 'Abcd1234!');

    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(showError).toHaveBeenCalled();
    });
  });
});
