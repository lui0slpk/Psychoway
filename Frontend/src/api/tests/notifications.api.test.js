/**
 * Strict TDD — Slice 8 (PR 8): behavior contract for src/api/notifications.api.js.
 * Tests written FIRST (RED) against the old authFetch-based signature
 * (notificationsApi.getByUser(authFetch, userId)); the module rewrite on
 * client.request makes them green.
 * Parity reference: Backend/src/routes/notifications.routes.js
 * (GET /:userId, PUT /:id/read, POST /check-in)
 * mounted at routes/index.js L58 (`router.use("/api/notifications",
 * notificationsRoutes)`) behind the /api JWT middleware (L27) → client
 * defaults (Bearer + 401 redirect), exactly the authFetch behavior they
 * replace.
 * Controllers: notifications.controller.getByUser → 200 JSON array;
 * markAsRead → 200 JSON { message: "Notification marked as read" };
 * checkIn → 200 JSON { message: "Check-in evaluado" } (service throws
 * { status: 400, message: "userId required" } when userId is missing).
 */
import notificationsApi from '../notifications.api';
import { API_URL, TOKEN_KEY } from '../config';
import { ApiError } from '../client';

beforeEach(() => {
	window.location.hash = 'init';
	localStorage.clear();
	localStorage.setItem(TOKEN_KEY, 'tok-slice8');
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

describe('notificationsApi.getByUser', () => {
	it('GETs `${API_URL}/notifications/:userId` with the Bearer token and resolves the notifications', async () => {
		const notifications = [
			{
				id_notification: 5,
				user_id: 7,
				type: 'check-in',
				message: 'Psychobot: ¿Cómo vas? Hace días que no hablamos.',
				link: '/psychobot',
				is_read: 0,
				created_at: '2026-08-02T08:00:00.000Z',
			},
			{
				id_notification: 6,
				user_id: 7,
				type: 'check-in',
				message: 'Nueva cita agendada para el jueves.',
				link: '/agenda',
				is_read: 1,
				created_at: '2026-08-02T09:00:00.000Z',
			},
		];
		global.fetch.mockResolvedValue(jsonResponse(notifications));

		const data = await notificationsApi.getByUser(7);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/notifications/7`);
		expect(options.method).toBe('GET');
		expect(options.headers.Authorization).toBe('Bearer tok-slice8');
		expect(data).toHaveLength(2);
		expect(data[0].id_notification).toBe(5);
		expect(data[0].message).toContain('¿Cómo vas?');
		expect(data[1].is_read).toBe(1);
	});

	it('resolves a single-notification payload so the bell badge can show an unread count', async () => {
		// Setup precondition: backend returns one row (Navbar computes
		// `unreadCount = notifications.filter(n => !n.is_read).length`).
		global.fetch.mockResolvedValue(
			jsonResponse([
				{
					id_notification: 9,
					user_id: 11,
					type: 'check-in',
					message: 'Hace 5 días no entras. Cuéntame cómo te sientes.',
					link: '/psychobot',
					is_read: 0,
					created_at: '2026-08-01T15:00:00.000Z',
				},
			]),
		);

		const data = await notificationsApi.getByUser(11);

		expect(data).toHaveLength(1);
		expect(data[0].id_notification).toBe(9);
		expect(data[0].link).toBe('/psychobot');
		expect(data[0].is_read).toBe(0);
	});

	it('resolves an empty array when the user has no notifications', async () => {
		// Setup precondition: backend returns no rows (Navbar renders
		// "No tienes notificaciones nuevas." when `notifications.length === 0`).
		global.fetch.mockResolvedValue(jsonResponse([]));

		const data = await notificationsApi.getByUser(7);

		expect(data).toEqual([]);
	});
});

describe('notificationsApi.markAsRead', () => {
	it('PUTs `${API_URL}/notifications/:id/read` with the Bearer token and no body', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Notification marked as read' }),
		);

		await notificationsApi.markAsRead(5);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/notifications/5/read`);
		expect(options.method).toBe('PUT');
		expect(options.headers.Authorization).toBe('Bearer tok-slice8');
		expect(options.body).toBeUndefined();
		expect(options.headers['Content-Type']).toBeUndefined();
	});

	it('resolves the parsed 200 payload (backend service returns { message })', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Notification marked as read' }),
		);

		const data = await notificationsApi.markAsRead(5);

		expect(data.message).toBe('Notification marked as read');
	});

	it('rejects ApiError(404) with the backend message for an unknown notification', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Notification not found' }, 404),
		);

		const error = await notificationsApi.markAsRead(999).catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(404);
		expect(error.message).toBe('Notification not found');
	});
});

describe('notificationsApi.checkIn', () => {
	it('POSTs `${API_URL}/notifications/check-in` with a JSON { userId } body and Bearer token', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Check-in evaluado' }),
		);

		await notificationsApi.checkIn(7);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/notifications/check-in`);
		expect(options.method).toBe('POST');
		expect(options.headers.Authorization).toBe('Bearer tok-slice8');
		expect(options.headers['Content-Type']).toBe('application/json');
		expect(JSON.parse(options.body)).toEqual({ userId: 7 });
	});

	it('resolves the parsed 200 payload (backend service returns { message })', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Check-in evaluado' }),
		);

		const data = await notificationsApi.checkIn(7);

		expect(data.message).toBe('Check-in evaluado');
	});

	it('rejects ApiError(400) with the backend message when userId is missing', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'userId required' }, 400),
		);

		const error = await notificationsApi.checkIn(undefined).catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(400);
		expect(error.message).toBe('userId required');
	});
});

describe('notificationsApi protected 401 handling (client defaults preserved)', () => {
	it('clears the session and redirects on 401 for a protected notifications endpoint', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse(
				{ message: 'Sesión expirada. Inicie sesión nuevamente.' },
				401,
			),
		);

		const error = await notificationsApi.getByUser(7).catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(401);
		expect(error.message).toBe('Sesión expirada');
		expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
		// Redirect to "/" observable via jsdom fragment navigation (hash cleared).
		expect(window.location.pathname).toBe('/');
		expect(window.location.hash).toBe('');
	});
});
