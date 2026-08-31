/**
 * Strict TDD — Slice 6 (PR 6): behavior contract for src/api/psychobot.api.js.
 * Tests written FIRST (RED) against the old authFetch-based signature
 * (psychobotApi.getSessions(authFetch, userId)); the module rewrite on
 * client.request makes them green.
 * Parity reference: Backend/src/routes/psychobot.routes.js
 * (GET /api/psychobot/sessions/:userId, POST /api/psychobot/sessions,
 * DELETE /api/psychobot/sessions/:id, GET /api/psychobot/history/:sessionId,
 * POST /api/psychobot/chat, POST /api/psychobot/weekly-summary) + the inline
 * authFetch calls previously living in PsychobotPage.jsx (L294/302/317/326/337/359).
 * All endpoints are behind the /api JWT middleware (routes/index.js L27/L52) →
 * client defaults (Bearer + 401 redirect).
 */
import psychobotApi from '../psychobot.api';
import { API_URL, TOKEN_KEY } from '../config';
import { ApiError } from '../client';

beforeEach(() => {
	window.location.hash = 'init';
	localStorage.clear();
	localStorage.setItem(TOKEN_KEY, 'tok-slice6');
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

describe('psychobotApi.getSessions', () => {
	it('GETs `${API_URL}/psychobot/sessions/:userId` with the Bearer token and resolves the sessions', async () => {
		const sessions = [
			{ id_session: 1, title: 'Nueva Conversación' },
			{ id_session: 2, title: 'Ayer' },
		];
		global.fetch.mockResolvedValue(jsonResponse(sessions));

		const data = await psychobotApi.getSessions(7);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/psychobot/sessions/7`);
		expect(options.method).toBe('GET');
		expect(options.headers.Authorization).toBe('Bearer tok-slice6');
		expect(data).toHaveLength(2);
		expect(data[0].id_session).toBe(1);
		expect(data[0].title).toBe('Nueva Conversación');
	});

	it('resolves an empty array when the user has no sessions yet', async () => {
		// Setup precondition: backend returns no rows for this user (page guards
		// `data.length > 0` before auto-selecting the first session).
		global.fetch.mockResolvedValue(jsonResponse([]));

		const data = await psychobotApi.getSessions(99);

		expect(data).toEqual([]);
	});
});

describe('psychobotApi.createSession', () => {
	it('POSTs `{userId, title}` JSON to `${API_URL}/psychobot/sessions` with the Bearer token', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ id_session: 10, title: 'Nueva Conversación' }, 201),
		);

		await psychobotApi.createSession(7, 'Nueva Conversación');

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/psychobot/sessions`);
		expect(options.method).toBe('POST');
		expect(options.headers.Authorization).toBe('Bearer tok-slice6');
		expect(options.headers['Content-Type']).toBe('application/json');
		expect(options.body).toBe(
			JSON.stringify({ userId: 7, title: 'Nueva Conversación' }),
		);
	});

	it('resolves the parsed 201 payload so the page can select the new session', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ id_session: 10, title: 'Nueva Conversación' }, 201),
		);

		const data = await psychobotApi.createSession(7, 'Nueva Conversación');

		expect(data.id_session).toBe(10);
		expect(data.title).toBe('Nueva Conversación');
	});
});

describe('psychobotApi.deleteSession', () => {
	it('DELETEs `${API_URL}/psychobot/sessions/:id` with the Bearer token and no body', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Conversación eliminada' }),
		);

		await psychobotApi.deleteSession(10);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/psychobot/sessions/10`);
		expect(options.method).toBe('DELETE');
		expect(options.headers.Authorization).toBe('Bearer tok-slice6');
		expect(options.body).toBeUndefined();
		expect(options.headers['Content-Type']).toBeUndefined();
	});

	it('rejects ApiError(404) with the backend message for an unknown session', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Conversación no encontrada' }, 404),
		);

		const error = await psychobotApi.deleteSession(999).catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(404);
		expect(error.message).toBe('Conversación no encontrada');
	});
});

describe('psychobotApi.getHistory', () => {
	it('GETs `${API_URL}/psychobot/history/:sessionId` with the Bearer token and resolves the history', async () => {
		const history = [
			{ type: 'user', text: 'Hola' },
			{ type: 'bot', text: '¡Hola! ¿Cómo te sientes hoy?' },
		];
		global.fetch.mockResolvedValue(jsonResponse(history));

		const data = await psychobotApi.getHistory(10);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/psychobot/history/10`);
		expect(options.method).toBe('GET');
		expect(options.headers.Authorization).toBe('Bearer tok-slice6');
		expect(data).toHaveLength(2);
		expect(data[1].type).toBe('bot');
		expect(data[1].text).toBe('¡Hola! ¿Cómo te sientes hoy?');
	});

	it('resolves an empty array when the session has no messages yet', async () => {
		// Setup precondition: backend returns no rows for this session (page maps
		// the empty case to the greeting bubble).
		global.fetch.mockResolvedValue(jsonResponse([]));

		const data = await psychobotApi.getHistory(10);

		expect(data).toEqual([]);
	});
});

describe('psychobotApi.chat', () => {
	it('POSTs the full chat payload to `${API_URL}/psychobot/chat` with the Bearer token', async () => {
		const payload = {
			userId: 7,
			message: 'Me siento ansioso',
			id_session: 10,
			personality: 'empatetico',
			chatHistory: [{ type: 'user', text: 'Me siento ansioso' }],
		};
		global.fetch.mockResolvedValue(
			jsonResponse({ text: 'Entiendo cómo te sientes.', id_session: 10 }),
		);

		await psychobotApi.chat(payload);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/psychobot/chat`);
		expect(options.method).toBe('POST');
		expect(options.headers.Authorization).toBe('Bearer tok-slice6');
		expect(options.headers['Content-Type']).toBe('application/json');
		expect(JSON.parse(options.body)).toEqual(payload);
	});

	it('resolves a bot reply and a new id_session when the backend creates one', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({
				text: 'He guardado esta conversación.',
				id_session: 42,
			}),
		);

		const data = await psychobotApi.chat({ userId: 7, message: 'Hola' });

		expect(data.text).toBe('He guardado esta conversación.');
		expect(data.id_session).toBe(42);
	});
});

describe('psychobotApi.weeklySummary', () => {
	it('POSTs `{userId}` JSON to `${API_URL}/psychobot/weekly-summary` with the Bearer token', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({
				text: 'Resumen semanal: has tenido una buena semana.',
			}),
		);

		await psychobotApi.weeklySummary(7);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/psychobot/weekly-summary`);
		expect(options.method).toBe('POST');
		expect(options.headers.Authorization).toBe('Bearer tok-slice6');
		expect(options.headers['Content-Type']).toBe('application/json');
		expect(options.body).toBe(JSON.stringify({ userId: 7 }));
	});

	it('resolves the parsed summary payload', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({
				text: 'Resumen semanal: has tenido una buena semana.',
			}),
		);

		const data = await psychobotApi.weeklySummary(7);

		expect(data.text).toBe('Resumen semanal: has tenido una buena semana.');
	});
});

describe('psychobotApi protected 401 handling (client defaults preserved)', () => {
	it('clears the session and redirects on 401 for a protected psychobot endpoint', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse(
				{ message: 'Sesión expirada. Inicie sesión nuevamente.' },
				401,
			),
		);

		const error = await psychobotApi.getSessions(7).catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(401);
		expect(error.message).toBe('Sesión expirada');
		expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
		// Redirect to "/" observable via jsdom fragment navigation (hash cleared).
		expect(window.location.pathname).toBe('/');
		expect(window.location.hash).toBe('');
	});
});
