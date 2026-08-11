/**
 * Strict TDD — Slice 5 (PR 5): behavior contract for src/api/meetings.api.js.
 * Tests written FIRST (RED) against the old authFetch-based signature
 * (meetingsApi.create(authFetch, payload)); the module rewrite on
 * client.request makes them green.
 * Parity reference: Backend/src/routes/meetings.routes.js
 * (POST /api/meetings, GET /api/meetings/psychologist/:id,
 * GET /api/meetings/user/:id, GET /api/meetings/professional-history/:id) +
 * the inline authFetch calls previously living in AgendaPage.jsx and
 * PsiAgendaPage.jsx. All endpoints are behind the /api JWT middleware →
 * client defaults (Bearer + 401 redirect).
 */
import meetingsApi from '../meetings.api';
import { API_URL, TOKEN_KEY } from '../config';
import { ApiError } from '../client';

beforeEach(() => {
	window.location.hash = 'init';
	localStorage.clear();
	localStorage.setItem(TOKEN_KEY, 'tok-slice5');
	global.fetch = jest.fn();
});

afterEach(() => {
	jest.restoreAllMocks();
});

function jsonResponse(body, status = 200) {
	return {
		status,
		ok: status >= 200 && status < 300,
		async text() {
			return typeof body === 'string' ? body : JSON.stringify(body);
		},
		async blob() {
			return new Blob([
				typeof body === 'string' ? body : JSON.stringify(body),
			]);
		},
	};
}

describe('meetingsApi.create', () => {
	it('POSTs the payload JSON to `${API_URL}/meetings` with the Bearer token', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Cita agendada exitosamente', id: 99 }),
		);

		const payload = {
			userId: 1,
			professionalId: 3,
			day: '2026-08-10',
			hour: '10:00',
			description: 'Primera consulta',
		};
		await meetingsApi.create(payload);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/meetings`);
		expect(options.method).toBe('POST');
		expect(options.headers.Authorization).toBe('Bearer tok-slice5');
		expect(options.headers['Content-Type']).toBe('application/json');
		expect(options.body).toBe(JSON.stringify(payload));
	});

	it('resolves the parsed success payload', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Cita agendada exitosamente', id: 99 }),
		);

		const data = await meetingsApi.create({
			userId: 1,
			professionalId: 3,
			day: '2026-08-10',
			hour: '10:00',
			description: 'Primera consulta',
		});

		expect(data.id).toBe(99);
		expect(data.message).toBe('Cita agendada exitosamente');
	});

	it('rejects ApiError(400) with the backend message when the slot is taken', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'El horario ya está ocupado' }, 400),
		);

		const error = await meetingsApi
			.create({ professionalId: 3, hour: '10:00' })
			.catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(400);
		expect(error.message).toBe('El horario ya está ocupado');
	});
});

describe('meetingsApi.getByProfessional', () => {
	it('GETs `${API_URL}/meetings/psychologist/:id` with the Bearer token and resolves the slots', async () => {
		const slots = [
			{ id_meetings_agenda: 1, day: '2026-08-10', hour: '10:00:00' },
			{ id_meetings_agenda: 2, day: '2026-08-11', hour: '14:00:00' },
		];
		global.fetch.mockResolvedValue(jsonResponse(slots));

		const data = await meetingsApi.getByProfessional(3);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/meetings/psychologist/3`);
		expect(options.method).toBe('GET');
		expect(options.headers.Authorization).toBe('Bearer tok-slice5');
		expect(data).toHaveLength(2);
		expect(data[0].hour).toBe('10:00:00');
	});

	it('rejects ApiError(404) with the backend message for an unknown professional', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Profesional no encontrado' }, 404),
		);

		const error = await meetingsApi.getByProfessional(999).catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(404);
		expect(error.message).toBe('Profesional no encontrado');
	});
});

describe('meetingsApi.getByUser', () => {
	it("GETs `${API_URL}/meetings/user/:userId` with the Bearer token and resolves the user's bookings", async () => {
		const bookings = [
			{
				id_meetings_agenda: 5,
				day: '2026-08-12',
				hour: '09:00:00',
				descripcion: 'Sesión',
				prof_names: 'Ana',
				prof_last_names: 'García',
			},
		];
		global.fetch.mockResolvedValue(jsonResponse(bookings));

		const data = await meetingsApi.getByUser(1);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/meetings/user/1`);
		expect(options.method).toBe('GET');
		expect(options.headers.Authorization).toBe('Bearer tok-slice5');
		expect(data).toHaveLength(1);
		expect(data[0].prof_names).toBe('Ana');
		expect(data[0].id_meetings_agenda).toBe(5);
	});
});

describe('meetingsApi.getProfessionalHistory', () => {
	it('GETs `${API_URL}/meetings/professional-history/:id` with the Bearer token and resolves the history', async () => {
		const history = [
			{
				id_meetings_agenda: 8,
				day: '2026-08-13',
				hour: '11:00:00',
				descripcion: 'Seguimiento',
				apprentice_names: 'Luis',
				apprentice_last_names: 'Pérez',
				apprentice_document: '1234567890',
			},
		];
		global.fetch.mockResolvedValue(jsonResponse(history));

		const data = await meetingsApi.getProfessionalHistory(3);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/meetings/professional-history/3`);
		expect(options.method).toBe('GET');
		expect(options.headers.Authorization).toBe('Bearer tok-slice5');
		expect(data).toHaveLength(1);
		expect(data[0].apprentice_document).toBe('1234567890');
	});

	it('resolves an empty array when the professional has no meetings yet', async () => {
		// Setup precondition: backend returns no rows for this professional.
		global.fetch.mockResolvedValue(jsonResponse([]));

		const data = await meetingsApi.getProfessionalHistory(42);

		expect(data).toEqual([]);
	});
});

describe('meetingsApi protected 401 handling (client defaults preserved)', () => {
	it('clears the session and redirects on 401 for a protected meetings endpoint', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse(
				{ message: 'Sesión expirada. Inicie sesión nuevamente.' },
				401,
			),
		);

		const error = await meetingsApi.getByUser(1).catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(401);
		expect(error.message).toBe('Sesión expirada');
		expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
		// Redirect to "/" observable via jsdom fragment navigation (hash cleared).
		expect(window.location.pathname).toBe('/');
		expect(window.location.hash).toBe('');
	});
});
