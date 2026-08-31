/**
 * Strict TDD — Slice 9 (PR 9): behavior contract for src/api/emotions.api.js.
 * Tests written FIRST (RED — module does not exist yet; GET /api/emotions has
 * no caller, route parity only per design/spec).
 * Parity reference: Backend/src/routes/index.js L40
 * `router.use("/api/emotions", emotionsRoutes)` (behind the /api JWT middleware
 * → client defaults: Bearer + 401 redirect) + Backend/src/routes/emotions.routes.js
 * `router.get("/", ctrl.getAll)` → emotions.controller.getAll →
 * emotionsService.getAll() → 200 JSON array of { id_emotions, emot_name, emot_estado }.
 */
import emotionsApi from '../emotions.api';
import { API_URL, TOKEN_KEY } from '../config';
import { ApiError } from '../client';

beforeEach(() => {
	window.location.hash = 'init';
	localStorage.clear();
	localStorage.setItem(TOKEN_KEY, 'tok-slice9');
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

describe('emotionsApi.getAll', () => {
	it('GETs `${API_URL}/emotions` with the Bearer token', async () => {
		global.fetch.mockResolvedValue(jsonResponse([]));

		await emotionsApi.getAll();

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/emotions`);
		expect(options.method).toBe('GET');
		expect(options.headers.Authorization).toBe('Bearer tok-slice9');
	});

	it('resolves the parsed emotion list with real values (dataset 1)', async () => {
		const emotions = [
			{ id_emotions: 1, emot_name: 'Feliz', emot_estado: 'activo' },
			{ id_emotions: 2, emot_name: 'Triste', emot_estado: 'activo' },
			{ id_emotions: 3, emot_name: 'Ansioso', emot_estado: 'activo' },
		];
		global.fetch.mockResolvedValue(jsonResponse(emotions));

		const data = await emotionsApi.getAll();

		expect(data).toHaveLength(3);
		expect(data[0].id_emotions).toBe(1);
		expect(data[0].emot_name).toBe('Feliz');
		expect(data[2].emot_estado).toBe('activo');
	});

	it('resolves a different dataset with an empty list (triangulation)', async () => {
		global.fetch.mockResolvedValue(jsonResponse([]));

		const data = await emotionsApi.getAll();

		expect(data).toEqual([]);
	});

	it('rejects ApiError(500) with the backend message on server error', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Error interno del servidor' }, 500),
		);

		const error = await emotionsApi.getAll().catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(500);
		expect(error.message).toBe('Error interno del servidor');
	});

	it('clears the session and redirects on 401 (protected endpoint)', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse(
				{ message: 'Sesión expirada. Inicie sesión nuevamente.' },
				401,
			),
		);

		const error = await emotionsApi.getAll().catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(401);
		expect(error.message).toBe('Sesión expirada');
		expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
		expect(window.location.pathname).toBe('/');
		expect(window.location.hash).toBe('');
	});

	it("rejects ApiError(0, 'Error de conexión') on network failure", async () => {
		global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

		const error = await emotionsApi.getAll().catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(0);
		expect(error.message).toBe('Error de conexión');
	});
});
