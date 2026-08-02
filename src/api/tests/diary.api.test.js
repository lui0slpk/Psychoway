/**
 * Strict TDD — Slice 3 (PR 3): behavior contract for src/api/diary.api.js.
 * Tests written FIRST (RED) against the old authFetch-based signature; the
 * module rewrite in diary.api.js makes them green.
 * Parity reference: Backend/src/routes/diary.routes.js (POST /diary/entry,
 * GET /diary/entries/:userId) + the inline authFetch calls previously living
 * in DiarioPage.jsx / SeguimientoPage.jsx.
 */
import diaryApi from '../diary.api';
import { API_URL, TOKEN_KEY } from '../config';
import { ApiError } from '../client';

// Key used by AuthContext to persist the cached user object.
const SESSION_USER_KEY = 'psychoway_user';

beforeEach(() => {
	window.location.hash = 'init';
	localStorage.clear();
	localStorage.setItem(TOKEN_KEY, 'tok-slice3');
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

describe('diaryApi.createEntry', () => {
	it('POSTs {userId, emotionIndex, description} to `${API_URL}/diary/entry` with the Bearer token', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Entrada registrada', id: 9 }),
		);

		await diaryApi.createEntry(42, 2, 'Me sentí muy bien hoy');

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/diary/entry`);
		expect(options.method).toBe('POST');
		expect(options.headers.Authorization).toBe('Bearer tok-slice3');
		expect(options.headers['Content-Type']).toBe('application/json');
		expect(options.body).toBe(
			JSON.stringify({
				userId: 42,
				emotionIndex: 2,
				description: 'Me sentí muy bien hoy',
			}),
		);
	});

	it('resolves the parsed success payload', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Entrada registrada', id: 9 }),
		);

		const data = await diaryApi.createEntry(42, 2, 'Me sentí muy bien hoy');

		expect(data).toEqual({ message: 'Entrada registrada', id: 9 });
	});
});

describe('diaryApi.getEntries', () => {
	it('GETs `${API_URL}/diary/entries/:userId` with the Bearer token', async () => {
		global.fetch.mockResolvedValue(jsonResponse([]));

		await diaryApi.getEntries(42);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/diary/entries/42`);
		expect(options.method).toBe('GET');
		expect(options.headers.Authorization).toBe('Bearer tok-slice3');
		expect(options.body).toBeUndefined();
	});

	it('resolves the parsed entries array (non-empty, real data)', async () => {
		const entries = [
			{
				id_diary_entries: 1,
				emot_name: 'Feliz',
				description: 'Día soleado',
			},
			{
				id_diary_entries: 2,
				emot_name: 'Triste',
				description: 'Extrañé a mi familia',
			},
		];
		global.fetch.mockResolvedValue(jsonResponse(entries));

		const data = await diaryApi.getEntries(42);

		expect(data).toHaveLength(2);
		expect(data[0]).toEqual({
			id_diary_entries: 1,
			emot_name: 'Feliz',
			description: 'Día soleado',
		});
		expect(data[1].emot_name).toBe('Triste');
	});
});

describe('diaryApi protected endpoints — 401 parity', () => {
	it('surfaces the backend error message via ApiError on a 400', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Faltan datos obligatorios' }, 400),
		);

		const error = await diaryApi.createEntry(42, 2, '').catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(400);
		expect(error.message).toBe('Faltan datos obligatorios');
		// 400 is not 401: the "#init" anchor is untouched.
		expect(window.location.hash).toBe('#init');
	});

	it('keeps the DEFAULT 401 redirect (authFetch parity) for an expired session', async () => {
		localStorage.setItem(SESSION_USER_KEY, JSON.stringify({ id: 42 }));
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Token expirado' }, 401),
		);

		const error = await diaryApi.getEntries(42).catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(401);
		// Redirect to "/" landed: jsdom cleared the "#init" anchor, path is "/".
		expect(window.location.pathname).toBe('/');
		expect(window.location.hash).toBe('');
	});
});
