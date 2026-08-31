/**
 * Strict TDD — Slice 1 (PR 1): behavior contract for src/api/client.js.
 * Tests written FIRST (RED); the implementation in client.js + config.js
 * makes them green. Parity reference: authFetch (src/context/AuthContext.jsx).
 */
import { request, ApiError } from '../client';
import { TOKEN_KEY, API_BASE, API_URL, PUBLIC_URL } from '../config';

// Key used by AuthContext to persist the cached user object.
const SESSION_USER_KEY = 'psychoway_user';

// jsdom 16 (CRA 5) defines window.location and window.location.href as
// non-configurable own accessors, so Object.defineProperty stubbing throws
// "Cannot redefine property". Instead we observe the redirect through jsdom's
// native fragment navigation: a redirect to "/" clears any hash from the
// current URL (pathname "/", hash ""), while a non-redirect leaves it intact.
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

describe('config exports', () => {
	it('exports TOKEN_KEY, API_BASE, API_URL and PUBLIC_URL with the documented values', () => {
		expect(TOKEN_KEY).toBe('psychoway_token');
		expect(API_BASE).toBe(
			process.env.REACT_APP_API_URL || 'http://localhost:5000',
		);
		expect(API_URL).toBe(`${API_BASE}/api`);
		expect(PUBLIC_URL).toBe(API_BASE);
	});
});

describe('ApiError', () => {
	it('carries status, message and data', () => {
		const err = new ApiError(409, 'Usuario ya registrado', {
			field: 'email',
		});

		expect(err).toBeInstanceOf(Error);
		expect(err.status).toBe(409);
		expect(err.message).toBe('Usuario ya registrado');
		expect(err.data).toEqual({ field: 'email' });
	});
});

describe('request() — auth header', () => {
	it('injects Authorization Bearer from localStorage when auth defaults to true', async () => {
		localStorage.setItem(TOKEN_KEY, 'tok-123');
		global.fetch.mockResolvedValue(jsonResponse({ ok: true }));

		await request('http://x.test/api/users/search/1');

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe('http://x.test/api/users/search/1');
		expect(options.method).toBe('GET');
		expect(options.headers.Authorization).toBe('Bearer tok-123');
	});

	it('omits the Authorization header when auth is false (public login)', async () => {
		global.fetch.mockResolvedValue(jsonResponse({ token: 't' }, 200));

		await request('http://x.test/login', {
			method: 'POST',
			auth: false,
			body: '{}',
		});

		const [, options] = global.fetch.mock.calls[0];
		expect(options.headers.Authorization).toBeUndefined();
	});
});

describe('request() — Content-Type', () => {
	it('adds Content-Type application/json when body is present and not FormData', async () => {
		localStorage.setItem(TOKEN_KEY, 'tok-123');
		global.fetch.mockResolvedValue(jsonResponse({ ok: true }));

		await request('http://x.test/api/diary/entry', {
			method: 'POST',
			body: JSON.stringify({ emotionIndex: 3 }),
		});

		const [, options] = global.fetch.mock.calls[0];
		expect(options.headers['Content-Type']).toBe('application/json');
	});

	it('does NOT add Content-Type when body is FormData', async () => {
		localStorage.setItem(TOKEN_KEY, 'tok-123');
		global.fetch.mockResolvedValue(jsonResponse({ ok: true }));
		const form = new FormData();
		form.append('name', 'aprendiz');

		await request('http://x.test/api/users/create', {
			method: 'POST',
			body: form,
		});

		const [, options] = global.fetch.mock.calls[0];
		expect(options.body).toBe(form);
		expect(options.headers['Content-Type']).toBeUndefined();
	});

	it('does NOT add Content-Type when there is no body', async () => {
		localStorage.setItem(TOKEN_KEY, 'tok-123');
		global.fetch.mockResolvedValue(jsonResponse({ ok: true }));

		await request('http://x.test/api/emotions');

		const [, options] = global.fetch.mock.calls[0];
		expect(options.headers['Content-Type']).toBeUndefined();
	});
});

describe('request() — 401 handling', () => {
	it('on 401 clears the session, redirects to / and rejects ApiError(401)', async () => {
		localStorage.setItem(TOKEN_KEY, 'tok-123');
		localStorage.setItem(
			SESSION_USER_KEY,
			JSON.stringify({ id: 1, rol: 'aprendiz' }),
		);
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'expired' }, 401),
		);

		const error = await request('http://x.test/api/diary/entries/1').catch(
			(e) => e,
		);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(401);
		expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
		expect(localStorage.getItem(SESSION_USER_KEY)).toBeNull();
		// Redirect to "/" landed: jsdom cleared the "#init" anchor, path is "/".
		expect(window.location.pathname).toBe('/');
		expect(window.location.hash).toBe('');
	});

	it('does NOT redirect and surfaces the backend message when skipAuthRedirect is true', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Credenciales inválidas' }, 401),
		);

		const error = await request('http://x.test/login', {
			method: 'POST',
			auth: false,
			skipAuthRedirect: true,
			body: JSON.stringify({ document: '1', password: 'wrong' }),
		}).catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(401);
		expect(error.message).toBe('Credenciales inválidas');
		// No redirect: the "#init" anchor is untouched.
		expect(window.location.hash).toBe('#init');
	});

	it("rejects ApiError(401, 'No hay sesión activa') without redirect or fetch when auth is true and no token exists", async () => {
		const error = await request('http://x.test/api/emotions').catch(
			(e) => e,
		);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(401);
		expect(error.message).toBe('No hay sesión activa');
		// No redirect: the "#init" anchor is untouched.
		expect(window.location.hash).toBe('#init');
		expect(global.fetch).not.toHaveBeenCalled();
	});
});

describe('request() — network failure', () => {
	it("rejects ApiError(0, 'Error de conexión') when fetch itself fails", async () => {
		localStorage.setItem(TOKEN_KEY, 'tok-123');
		global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

		const error = await request('http://x.test/api/emotions').catch(
			(e) => e,
		);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(0);
		expect(error.message).toBe('Error de conexión');
	});
});

describe('request() — error bodies', () => {
	it("rejects ApiError(500, 'Error de comunicación con el servidor.') on HTML error body without a parse crash", async () => {
		localStorage.setItem(TOKEN_KEY, 'tok-123');
		global.fetch.mockResolvedValue(
			jsonResponse(
				'<html><body><h1>Server Error</h1></body></html>',
				500,
			),
		);

		const error = await request('http://x.test/api/diary/entries/1').catch(
			(e) => e,
		);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(500);
		expect(error.message).toBe('Error de comunicación con el servidor.');
	});

	it('surfaces the backend message and raw data via ApiError', async () => {
		localStorage.setItem(TOKEN_KEY, 'tok-123');
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Correo no registrado', code: 4041 }, 404),
		);

		const error = await request('http://x.test/api/password/forgot', {
			method: 'POST',
			body: '{}',
		}).catch((e) => e);

		expect(error.status).toBe(404);
		expect(error.message).toBe('Correo no registrado');
		expect(error.data).toEqual({
			message: 'Correo no registrado',
			code: 4041,
		});
	});
});

describe('request() — response parsing', () => {
	it('returns parsed JSON for the auto responseType', async () => {
		localStorage.setItem(TOKEN_KEY, 'tok-123');
		global.fetch.mockResolvedValue(jsonResponse({ entries: [{ id: 1 }] }));

		const data = await request('http://x.test/api/diary/entries/1');

		expect(data).toEqual({ entries: [{ id: 1 }] });
	});

	it('returns raw text when the body is not JSON (login text-then-JSON quirk)', async () => {
		global.fetch.mockResolvedValue(jsonResponse('plain text payload', 200));

		const data = await request('http://x.test/login', {
			method: 'POST',
			auth: false,
			body: 'raw',
		});

		expect(data).toBe('plain text payload');
	});

	it('returns a Blob when responseType is blob', async () => {
		localStorage.setItem(TOKEN_KEY, 'tok-123');
		global.fetch.mockResolvedValue(jsonResponse('fake-photo-bytes', 200));

		const blob = await request('http://x.test/api/users/profile/1/photo', {
			responseType: 'blob',
		});

		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBe('fake-photo-bytes'.length);
	});
});
