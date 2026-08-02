/**
 * Strict TDD — Slice 3 (PR 3): behavior contract for src/api/objectives.api.js.
 * Tests written FIRST (RED) against the old authFetch-based signature; the
 * module rewrite in objectives.api.js makes them green.
 * Parity reference: Backend/src/routes/objectives.routes.js (POST /objectives,
 * GET /objectives/:userId, PUT /objectives/:id, DELETE /objectives/:id) + the
 * inline authFetch calls previously living in DiarioPage.jsx / SeguimientoPage.jsx.
 */
import objectivesApi from '../objectives.api';
import { API_URL, TOKEN_KEY } from '../config';
import { ApiError } from '../client';

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

describe('objectivesApi.create', () => {
	it('POSTs {userId, nombre, descripcion, estado} to `${API_URL}/objectives` with the Bearer token', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Objetivo creado', id_objetives: 5 }),
		);

		await objectivesApi.create(
			42,
			'Hacer ejercicio',
			'3 veces por semana',
			'No Cumplido',
		);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/objectives`);
		expect(options.method).toBe('POST');
		expect(options.headers.Authorization).toBe('Bearer tok-slice3');
		expect(options.headers['Content-Type']).toBe('application/json');
		expect(options.body).toBe(
			JSON.stringify({
				userId: 42,
				nombre: 'Hacer ejercicio',
				descripcion: '3 veces por semana',
				estado: 'No Cumplido',
			}),
		);
	});

	it('resolves the parsed success payload', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Objetivo creado', id_objetives: 5 }),
		);

		const data = await objectivesApi.create(
			42,
			'Hacer ejercicio',
			'',
			'No Cumplido',
		);

		expect(data.id_objetives).toBe(5);
		expect(data.message).toBe('Objetivo creado');
	});
});

describe('objectivesApi.getByUser', () => {
	it('GETs `${API_URL}/objectives/:userId` with the Bearer token and resolves the array', async () => {
		const objetivos = [
			{ id_objetives: 1, nombre_objetivo: 'Leer', estado: 'Cumplido' },
			{
				id_objetives: 2,
				nombre_objetivo: 'Meditar',
				estado: 'No Cumplido',
			},
			{ id_objetives: 3, nombre_objetivo: 'Correr', estado: 'Pendiente' },
		];
		global.fetch.mockResolvedValue(jsonResponse(objetivos));

		const data = await objectivesApi.getByUser(42);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/objectives/42`);
		expect(options.method).toBe('GET');
		expect(options.headers.Authorization).toBe('Bearer tok-slice3');
		expect(data).toHaveLength(3);
		expect(data[1].nombre_objetivo).toBe('Meditar');
	});
});

describe('objectivesApi.update', () => {
	it('PUTs {nombre, descripcion, estado} to `${API_URL}/objectives/:id`', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Objetivo actualizado' }),
		);

		await objectivesApi.update(
			5,
			'Hacer ejercicio',
			'5 veces por semana',
			'Cumplido',
		);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/objectives/5`);
		expect(options.method).toBe('PUT');
		expect(options.headers.Authorization).toBe('Bearer tok-slice3');
		expect(options.headers['Content-Type']).toBe('application/json');
		expect(options.body).toBe(
			JSON.stringify({
				nombre: 'Hacer ejercicio',
				descripcion: '5 veces por semana',
				estado: 'Cumplido',
			}),
		);
	});
});

describe('objectivesApi.remove', () => {
	it('DELETEs `${API_URL}/objectives/:id` without a body', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Objetivo eliminado' }),
		);

		await objectivesApi.remove(5);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/objectives/5`);
		expect(options.method).toBe('DELETE');
		expect(options.headers.Authorization).toBe('Bearer tok-slice3');
		expect(options.body).toBeUndefined();
	});

	it('resolves the parsed success payload', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Objetivo eliminado' }),
		);

		const data = await objectivesApi.remove(5);

		expect(data.message).toBe('Objetivo eliminado');
	});
});

describe('objectivesApi error path', () => {
	it('rejects ApiError with the backend message on a 404', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Objetivo no encontrado' }, 404),
		);

		const error = await objectivesApi
			.update(999, 'X', '', 'No Cumplido')
			.catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(404);
		expect(error.message).toBe('Objetivo no encontrado');
		// 404 is not 401: no redirect.
		expect(window.location.hash).toBe('#init');
	});
});
