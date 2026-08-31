import { API_URL } from "./config";
import { request } from "./client";

/**
 * Servicio de Psychobot — centraliza llamadas al backend sobre el cliente HTTP
 * compartido (Bearer automático + redirect 401). Sin parámetro authFetch.
 * Paridad: Backend/src/routes/psychobot.routes.js
 * (GET /psychobot/sessions/:userId, POST /psychobot/sessions,
 * DELETE /psychobot/sessions/:id, GET /psychobot/history/:sessionId,
 * POST /psychobot/chat, POST /psychobot/weekly-summary), montadas bajo
 * /api/psychobot detrás del middleware JWT de /api.
 */
const psychobotApi = {
  getSessions: (userId) =>
    request(`${API_URL}/psychobot/sessions/${userId}`),

  createSession: (userId, title) =>
    request(`${API_URL}/psychobot/sessions`, {
      method: "POST",
      body: JSON.stringify({ userId, title }),
    }),

  deleteSession: (id) =>
    request(`${API_URL}/psychobot/sessions/${id}`, { method: "DELETE" }),

  getHistory: (sessionId) =>
    request(`${API_URL}/psychobot/history/${sessionId}`),

  chat: (payload) =>
    request(`${API_URL}/psychobot/chat`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  weeklySummary: (userId) =>
    request(`${API_URL}/psychobot/weekly-summary`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),
};

export default psychobotApi;
