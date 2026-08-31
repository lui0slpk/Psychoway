/**
 * Strict TDD — Slice 2 (PR 2): behavior contract for src/api/auth.api.js.
 * Tests written FIRST (RED); the module in auth.api.js makes them green.
 * Parity reference: Backend/src/routes/auth.routes.js + the inline fetch
 * calls previously living in Inicio.jsx / Registro.jsx / RecuperarPassword.jsx
 * / ResetPassword.jsx.
 */
import authApi from '../auth.api';
import { API_BASE, API_URL, TOKEN_KEY } from '../config';
import { ApiError } from '../client';

// Key used by AuthContext to persist the cached user object.
const SESSION_USER_KEY = 'psychoway_user';

// jsdom 16 (CRA 5) blocks location stubbing; observe redirects via native
// fragment navigation (same technique as client.test.js, slice 1).
beforeEach(() => {
	window.location.hash = 'init';
	localStorage.clear();
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

describe('authApi.login', () => {
	it('POSTs {document, password} to `${API_BASE}/login` (no /api) without Authorization', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ token: 't', user: { id: 1 } }),
		);

		await authApi.login('123456', 'secreto');

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_BASE}/login`);
		expect(options.method).toBe('POST');
		expect(options.headers['Content-Type']).toBe('application/json');
		expect(options.headers.Authorization).toBeUndefined();
		expect(options.body).toBe(
			JSON.stringify({ document: '123456', password: 'secreto' }),
		);
	});

	it('rejects ApiError(401) with the backend message and does NOT redirect on bad credentials', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse(
				{ message: 'Documento o contraseña incorrectos' },
				401,
			),
		);

		const error = await authApi.login('123456', 'wrong').catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(401);
		expect(error.message).toBe('Documento o contraseña incorrectos');
		// skipAuthRedirect: the "#init" anchor is untouched.
		expect(window.location.hash).toBe('#init');
	});

	it('resolves the parsed {token, user} payload on success', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({
				message: 'Login exitoso',
				token: 'abc',
				user: { id: 7, rol: 'aprendiz' },
			}),
		);

		const data = await authApi.login('123456', 'secreto');

		expect(data.token).toBe('abc');
		expect(data.user).toEqual({ id: 7, rol: 'aprendiz' });
	});
});

describe('authApi.register', () => {
	it('POSTs userData to `${API_BASE}/register` (no /api prefix)', async () => {
		const userData = { document: '123', email: 'a@b.co', password: 'x' };
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Usuario registrado correctamente' }),
		);

		await authApi.register(userData);

		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_BASE}/register`);
		expect(options.method).toBe('POST');
		expect(options.headers['Content-Type']).toBe('application/json');
		expect(options.headers.Authorization).toBeUndefined();
		expect(options.body).toBe(JSON.stringify(userData));
	});

	it('rejects ApiError(409) on duplicate document/email so pages can branch on err.status', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse(
				{ message: 'El documento o correo ya se encuentra registrado' },
				409,
			),
		);

		const error = await authApi
			.register({ document: '123' })
			.catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(409);
		expect(error.message).toBe(
			'El documento o correo ya se encuentra registrado',
		);
		// No redirect: the "#init" anchor is untouched.
		expect(window.location.hash).toBe('#init');
	});
});

describe('authApi.forgotPassword', () => {
	it('POSTs {correo} to `${API_URL}/password/forgot` without Authorization', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({
				message: 'Correo de recuperación enviado exitosamente',
			}),
		);

		await authApi.forgotPassword('user@mail.com');

		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/password/forgot`);
		expect(options.method).toBe('POST');
		expect(options.headers['Content-Type']).toBe('application/json');
		expect(options.headers.Authorization).toBeUndefined();
		expect(options.body).toBe(JSON.stringify({ correo: 'user@mail.com' }));
	});

	it('surfaces the backend 404 message for an unknown email', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Correo no encontrado' }, 404),
		);

		const error = await authApi
			.forgotPassword('nadie@mail.com')
			.catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(404);
		expect(error.message).toBe('Correo no encontrado');
		expect(window.location.hash).toBe('#init');
	});
});

describe('authApi.resetPassword', () => {
	it('POSTs {token, newPassword} to `${API_URL}/password/reset` without Authorization', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Contraseña actualizada correctamente' }),
		);

		await authApi.resetPassword('tok-1', 'Nueva#Pass1');

		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/password/reset`);
		expect(options.method).toBe('POST');
		expect(options.headers['Content-Type']).toBe('application/json');
		expect(options.headers.Authorization).toBeUndefined();
		expect(options.body).toBe(
			JSON.stringify({ token: 'tok-1', newPassword: 'Nueva#Pass1' }),
		);
	});

	it('surfaces the backend 400 message for an invalid token', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Token inválido o expirado' }, 400),
		);

		const error = await authApi
			.resetPassword('bad', 'Nueva#Pass1')
			.catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(400);
		expect(error.message).toBe('Token inválido o expirado');
		expect(window.location.hash).toBe('#init');
	});
});

describe('authApi.verifySession', () => {
	it('GETs `${API_URL}/auth/verify` with the Bearer token (protected)', async () => {
		localStorage.setItem(TOKEN_KEY, 'tok-abc');
		global.fetch.mockResolvedValue(
			jsonResponse({ valid: true, userId: 3, role: 'psicologo' }),
		);

		const data = await authApi.verifySession();

		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/auth/verify`);
		expect(options.method).toBe('GET');
		expect(options.headers.Authorization).toBe('Bearer tok-abc');
		expect(options.body).toBeUndefined();
		expect(data).toEqual({ valid: true, userId: 3, role: 'psicologo' });
	});

	it('keeps the DEFAULT 401 redirect (no skipAuthRedirect) for an expired session', async () => {
		localStorage.setItem(TOKEN_KEY, 'tok-abc');
		localStorage.setItem(SESSION_USER_KEY, JSON.stringify({ id: 3 }));
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Token expirado' }, 401),
		);

		const error = await authApi.verifySession().catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(401);
		// Redirect to "/" landed: jsdom cleared the "#init" anchor, path is "/".
		expect(window.location.pathname).toBe('/');
		expect(window.location.hash).toBe('');
	});
});
