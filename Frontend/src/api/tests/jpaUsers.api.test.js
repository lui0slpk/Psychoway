/**
 * Comportamiento del módulo JPA — contrato contra API_REFERENCE.md
 * (microservicio mysqlwithjpa, puerto 8080):
 *   GET /actuator/health (público, SIN Authorization, sin rate limit),
 *   GET /api/roles, GET /api/users (paginado 0-indexed + filtros),
 *   POST /api/users, PUT /api/users/{id}, DELETE /api/users/{id}.
 *
 * Puntos clave del contrato (design §Interfaces de jpa-user-management):
 * - jpaHealth viaja con { auth: false } → NUNCA lleva header Authorization.
 * - listJpaUsers recibe páginas 1-indexed (UI) y convierte a 0-indexed (API)
 *   en el ÚNICO punto de conversión del módulo; `size` siempre explícito.
 * - Los filtros vacíos/undefined/null no viajan en el query string.
 * - mapJpaError mapea la envolvente de error por status a { title, text,
 *   fieldErrors? } en español (400 details[], 409, 403, 404, 429, red/5xx).
 *
 * Vitest con globals: solo vi.*, nunca jest.* (convención del proyecto).
 */
import {
	jpaHealth,
	listJpaRoles,
	listJpaUsers,
	createJpaUser,
	updateJpaUser,
	deleteJpaUser,
	mapJpaError,
} from '../jpaUsers.api';
import { JPA_API_BASE, TOKEN_KEY } from '../config';
import { ApiError } from '../client';

beforeEach(() => {
	localStorage.clear();
	localStorage.setItem(TOKEN_KEY, 'tok-jpa');
	global.fetch = vi.fn();
});

afterEach(() => {
	vi.restoreAllMocks();
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

describe('jpaHealth (endpoint público /actuator/health)', () => {
	it('GET sin header Authorization (auth: false)', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ status: 'UP', components: {} }),
		);

		await jpaHealth();

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${JPA_API_BASE}/actuator/health`);
		expect(options.method).toBe('GET');
		// El health check es público: NO viaja Authorization.
		expect(options.headers.Authorization).toBeUndefined();
	});

	it('funciona sin token en localStorage (no exige sesión)', async () => {
		localStorage.clear(); // sin token
		global.fetch.mockResolvedValue(
			jsonResponse({ status: 'UP', components: {} }),
		);

		await jpaHealth();

		// Con auth: false el cliente compartido no lanza "No hay sesión activa".
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	it('resuelve el cuerpo del health parseado', async () => {
		const body = {
			status: 'UP',
			components: {
				db: { status: 'UP', details: { responseTimeMs: 45 } },
			},
		};
		global.fetch.mockResolvedValue(jsonResponse(body));

		const data = await jpaHealth();

		expect(data.status).toBe('UP');
		expect(data.components.db.details.responseTimeMs).toBe(45);
	});
});

describe('listJpaRoles (protegido, Bearer requerido)', () => {
	it('GET /api/roles con Authorization: Bearer <token>', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse([{ idRol: 1, nombreRol: 'Aprendiz' }]),
		);

		const data = await listJpaRoles();

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${JPA_API_BASE}/api/roles`);
		expect(options.method).toBe('GET');
		expect(options.headers.Authorization).toBe('Bearer tok-jpa');
		expect(data[0].nombreRol).toBe('Aprendiz');
	});
});

describe('listJpaUsers (paginado 0-indexed + filtros)', () => {
	it('la página 1 (UI) envía page=0&size=5 explícitos', async () => {
		global.fetch.mockResolvedValue(jsonResponse({ content: [] }));

		await listJpaUsers({ page: 1 });

		const [url] = global.fetch.mock.calls[0];
		expect(url).toBe(`${JPA_API_BASE}/api/users?page=0&size=5`);
	});

	it('sin argumentos usa los defaults page=0 y size=5', async () => {
		global.fetch.mockResolvedValue(jsonResponse({ content: [] }));

		await listJpaUsers();

		const [url] = global.fetch.mock.calls[0];
		expect(url).toBe(`${JPA_API_BASE}/api/users?page=0&size=5`);
	});

	it('convierte páginas 2+ de 1-indexed (UI) a 0-indexed (API)', async () => {
		global.fetch.mockResolvedValue(jsonResponse({ content: [] }));

		await listJpaUsers({ page: 2 });
		await listJpaUsers({ page: 3 });

		// Único punto de conversión: UI 2 → API 1, UI 3 → API 2.
		expect(
			new URL(global.fetch.mock.calls[0][0]).searchParams.get('page'),
		).toBe('1');
		expect(
			new URL(global.fetch.mock.calls[1][0]).searchParams.get('page'),
		).toBe('2');
	});

	it('descarta los filtros vacíos del query string', async () => {
		global.fetch.mockResolvedValue(jsonResponse({ content: [] }));

		await listJpaUsers({
			page: 1,
			document: '',
			email: undefined,
			names: '   ',
			lastNames: null,
			idRol: '',
		});

		const [url] = global.fetch.mock.calls[0];
		// Ningún filtro vacío viaja: solo page y size.
		expect(url).toBe(`${JPA_API_BASE}/api/users?page=0&size=5`);
	});

	it('solo los filtros poblados viajan como query params (Bearer presente)', async () => {
		global.fetch.mockResolvedValue(jsonResponse({ content: [] }));

		await listJpaUsers({ page: 1, email: 'juan@email.com', idRol: 1 });

		const [url, options] = global.fetch.mock.calls[0];
		const parsed = new URL(url);
		expect(parsed.pathname).toBe('/api/users');
		expect(parsed.searchParams.get('page')).toBe('0');
		expect(parsed.searchParams.get('size')).toBe('5');
		expect(parsed.searchParams.get('email')).toBe('juan@email.com');
		expect(parsed.searchParams.get('idRol')).toBe('1');
		// Llamada protegida: Bearer presente.
		expect(options.headers.Authorization).toBe('Bearer tok-jpa');
	});

	it('size sobrescribible manteniendo la conversión de página', async () => {
		global.fetch.mockResolvedValue(jsonResponse({ content: [] }));

		await listJpaUsers({ page: 2, size: 20 });

		const [url] = global.fetch.mock.calls[0];
		expect(url).toBe(`${JPA_API_BASE}/api/users?page=1&size=20`);
	});
});

describe('createJpaUser / updateJpaUser / deleteJpaUser (protegidos)', () => {
	it('createJpaUser POSTea el payload exacto con Bearer y JSON', async () => {
		global.fetch.mockResolvedValue(jsonResponse({ idUser: 7 }, 201));

		const payload = {
			document: '1234567890',
			docType: 'CC',
			names: 'Juan Carlos',
			lastNames: 'Pérez Gómez',
			birthDate: '2000-01-15',
			email: 'juan@email.com',
			password: 'secret123',
			idRol: 1,
		};
		const data = await createJpaUser(payload);

		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${JPA_API_BASE}/api/users`);
		expect(options.method).toBe('POST');
		expect(options.headers.Authorization).toBe('Bearer tok-jpa');
		expect(options.headers['Content-Type']).toBe('application/json');
		expect(options.body).toBe(JSON.stringify(payload));
		expect(data.idUser).toBe(7);
	});

	it('updateJpaUser hace PUT con SOLO el diff a /api/users/:id', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ idUser: 5, names: 'Juan Carlos' }),
		);

		await updateJpaUser(5, { names: 'Juan Carlos' });

		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${JPA_API_BASE}/api/users/5`);
		expect(options.method).toBe('PUT');
		expect(options.headers.Authorization).toBe('Bearer tok-jpa');
		expect(options.headers['Content-Type']).toBe('application/json');
		// UpdateGroup: el cuerpo lleva únicamente los campos cambiados.
		expect(options.body).toBe(JSON.stringify({ names: 'Juan Carlos' }));
	});

	it('deleteJpaUser hace DELETE a /api/users/:id sin body', async () => {
		global.fetch.mockResolvedValue(jsonResponse('', 204));

		await deleteJpaUser(7);

		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${JPA_API_BASE}/api/users/7`);
		expect(options.method).toBe('DELETE');
		expect(options.headers.Authorization).toBe('Bearer tok-jpa');
		expect(options.body).toBeUndefined();
	});
});

describe('mapJpaError (envolvente de error → español por status)', () => {
	it('400 con details[] mapea fieldErrors por campo y mensajes en el texto', () => {
		const error = new ApiError(400, 'Validation failed', {
			message: 'Validation failed',
			details: [
				{ field: 'email', message: 'Email inválido' },
				{ field: 'document', message: 'El documento ya existe' },
			],
		});

		const result = mapJpaError(error);

		expect(result.title).toBe('Datos inválidos');
		expect(result.fieldErrors).toEqual({
			email: 'Email inválido',
			document: 'El documento ya existe',
		});
		expect(result.text).toContain('Email inválido');
		expect(result.text).toContain('El documento ya existe');
	});

	it('400 sin details[] cae al mensaje disponible sin fieldErrors', () => {
		const error = new ApiError(400, 'Bad Request', {
			message: 'Solicitud inválida',
		});

		const result = mapJpaError(error);

		expect(result.title).toBe('Datos inválidos');
		expect(result.text).toBe('Solicitud inválida');
		expect(result.fieldErrors).toBeUndefined();
	});

	it('409 muestra Conflicto con el mensaje del servidor', () => {
		const error = new ApiError(409, 'El documento ya existe', {
			message: 'El documento ya existe',
		});

		const result = mapJpaError(error);

		expect(result.title).toBe('Conflicto');
		expect(result.text).toBe('El documento ya existe');
	});

	it('403 indica permisos insuficientes', () => {
		const result = mapJpaError(new ApiError(403, 'Forbidden'));

		expect(result.title).toBe('Permisos insuficientes');
		expect(result.text).toBe('No tienes permisos suficientes para esta acción.');
	});

	it('404 indica recurso inexistente', () => {
		const result = mapJpaError(new ApiError(404, 'Not Found'));

		expect(result.title).toBe('Recurso no encontrado');
		expect(result.text).toBe('El recurso solicitado ya no existe.');
	});

	it('429 expone retryAfterSeconds (sin auto-reintento en el módulo)', () => {
		const error = new ApiError(429, 'Rate limit exceeded', {
			retryAfterSeconds: 45,
		});

		const result = mapJpaError(error);

		expect(result.title).toBe('Límite de solicitudes');
		expect(result.text).toBe(
			'Demasiadas solicitudes. Intenta de nuevo en 45 segundos.',
		);
	});

	it('429 sin retryAfterSeconds cae a mensaje genérico', () => {
		const result = mapJpaError(new ApiError(429, 'Rate limit exceeded', {}));

		expect(result.title).toBe('Límite de solicitudes');
		expect(result.text).toBe(
			'Demasiadas solicitudes. Por favor intenta de nuevo más tarde.',
		);
	});

	it('fallo de red (status 0) y 5xx indican servicio no disponible', () => {
		const network = mapJpaError(new ApiError(0, 'Error de conexión'));
		const server = mapJpaError(new ApiError(500, 'Internal Server Error'));

		expect(network.title).toBe('Servicio no disponible');
		expect(network.text).toBe('El servicio no está disponible en este momento.');
		expect(server.title).toBe('Servicio no disponible');
		expect(server.text).toBe('El servicio no está disponible en este momento.');
	});
});
