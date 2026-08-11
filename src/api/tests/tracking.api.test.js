/**
 * Strict TDD — Slice 7 (PR 7): behavior contract for src/api/tracking.api.js.
 * Tests written FIRST (RED) against the old authFetch-based signature
 * (trackingApi.getApprenticesWithEmotions(authFetch)); the module rewrite on
 * client.request makes them green.
 * Parity reference: Backend/src/routes/psychologist.routes.js
 * (GET /api/psychologist/apprentices-with-emotions,
 * GET /api/psychologist/alerts, PUT /api/psychologist/alerts/:id/read)
 * mounted at routes/index.js L55 (`router.use("/api/psychologist",
 * psychologistRoutes)`) behind the /api JWT middleware → client defaults
 * (Bearer + 401 redirect), exactly the authFetch behavior they replace.
 * Controllers: tracking.controller.getApprenticesWithEmotions → 200 JSON array;
 * alerts.controller.getAll → 200 JSON array; alerts.controller.markAsRead →
 * 200 JSON { message: "Alert marked as read" } (alerts.service.js L18).
 */
import trackingApi from '../tracking.api';
import { API_URL, TOKEN_KEY } from '../config';
import { ApiError } from '../client';

beforeEach(() => {
	window.location.hash = 'init';
	localStorage.clear();
	localStorage.setItem(TOKEN_KEY, 'tok-slice7');
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

describe('trackingApi.getApprenticesWithEmotions', () => {
	it('GETs `${API_URL}/psychologist/apprentices-with-emotions` with the Bearer token and resolves the apprentices with stats', async () => {
		const apprentices = [
			{
				id: 1,
				nombre: 'Ana Gómez',
				documento: '1001',
				promedio: 'Positivas',
				ultima: 'Feliz',
				estadisticas: { positivas: 10, negativas: 2, neutrales: 3 },
			},
			{
				id: 2,
				nombre: 'Luis Pérez',
				documento: '1002',
				promedio: 'Negativas',
				ultima: 'Triste',
				estadisticas: { positivas: 4, negativas: 8, neutrales: 1 },
			},
		];
		global.fetch.mockResolvedValue(jsonResponse(apprentices));

		const data = await trackingApi.getApprenticesWithEmotions();

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/psychologist/apprentices-with-emotions`);
		expect(options.method).toBe('GET');
		expect(options.headers.Authorization).toBe('Bearer tok-slice7');
		expect(data).toHaveLength(2);
		expect(data[0].nombre).toBe('Ana Gómez');
		expect(data[0].estadisticas.positivas).toBe(10);
		expect(data[1].promedio).toBe('Negativas');
	});

	it('resolves a single-apprentice payload so the page can auto-select data[0]', async () => {
		// Setup precondition: backend returns one row (page does
		// `if (data.length > 0) setSelectedUser(data[0])`).
		global.fetch.mockResolvedValue(
			jsonResponse([
				{
					id: 9,
					nombre: 'Sola Estudiante',
					documento: '1009',
					promedio: 'Neutral',
					ultima: 'Neutral',
					estadisticas: { positivas: 2, negativas: 2, neutrales: 2 },
				},
			]),
		);

		const data = await trackingApi.getApprenticesWithEmotions();

		expect(data).toHaveLength(1);
		expect(data[0].id).toBe(9);
		expect(data[0].nombre).toBe('Sola Estudiante');
		expect(data[0].estadisticas.neutrales).toBe(2);
	});
});

describe('trackingApi.getAlerts', () => {
	it('GETs `${API_URL}/psychologist/alerts` with the Bearer token and resolves the alerts', async () => {
		const alerts = [
			{
				id_alert: 3,
				aprendiz_nombre: 'Ana Gómez',
				document: '1001',
				motivo: 'Tres días con emociones negativas',
				leido: 0,
				timestamp: '2026-08-01T10:00:00.000Z',
			},
			{
				id_alert: 4,
				aprendiz_nombre: 'Luis Pérez',
				document: '1002',
				motivo: 'Racha de tristeza',
				leido: 1,
				timestamp: '2026-08-01T11:00:00.000Z',
			},
		];
		global.fetch.mockResolvedValue(jsonResponse(alerts));

		const data = await trackingApi.getAlerts();

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/psychologist/alerts`);
		expect(options.method).toBe('GET');
		expect(options.headers.Authorization).toBe('Bearer tok-slice7');
		expect(data).toHaveLength(2);
		expect(data[0].id_alert).toBe(3);
		expect(data[0].motivo).toBe('Tres días con emociones negativas');
		expect(data[1].leido).toBe(1);
	});

	it('resolves an empty array when the AI has detected no risk alerts', async () => {
		// Setup precondition: backend returns no rows (page guards
		// `unreadAlerts.length > 0` before rendering the alert card).
		global.fetch.mockResolvedValue(jsonResponse([]));

		const data = await trackingApi.getAlerts();

		expect(data).toEqual([]);
	});
});

describe('trackingApi.markAlertAsRead', () => {
	it('PUTs `${API_URL}/psychologist/alerts/:id/read` with the Bearer token and no body', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Alert marked as read' }),
		);

		await trackingApi.markAlertAsRead(3);

		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toBe(`${API_URL}/psychologist/alerts/3/read`);
		expect(options.method).toBe('PUT');
		expect(options.headers.Authorization).toBe('Bearer tok-slice7');
		expect(options.body).toBeUndefined();
		expect(options.headers['Content-Type']).toBeUndefined();
	});

	it('resolves the parsed 200 payload (backend service returns { message })', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Alert marked as read' }),
		);

		const data = await trackingApi.markAlertAsRead(3);

		expect(data.message).toBe('Alert marked as read');
	});

	it('rejects ApiError(404) with the backend message for an unknown alert', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse({ message: 'Alert not found' }, 404),
		);

		const error = await trackingApi.markAlertAsRead(999).catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(404);
		expect(error.message).toBe('Alert not found');
	});
});

describe('trackingApi protected 401 handling (client defaults preserved)', () => {
	it('clears the session and redirects on 401 for a protected tracking endpoint', async () => {
		global.fetch.mockResolvedValue(
			jsonResponse(
				{ message: 'Sesión expirada. Inicie sesión nuevamente.' },
				401,
			),
		);

		const error = await trackingApi.getAlerts().catch((e) => e);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(401);
		expect(error.message).toBe('Sesión expirada');
		expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
		// Redirect to "/" observable via jsdom fragment navigation (hash cleared).
		expect(window.location.pathname).toBe('/');
		expect(window.location.hash).toBe('');
	});
});
