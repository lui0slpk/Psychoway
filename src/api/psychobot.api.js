import { API_URL } from "./config";

/**
 * Servicio de Psychobot — centraliza llamadas al backend.
 */
const psychobotApi = {
  getSessions: (authFetch, userId) =>
    authFetch(`${API_URL}/psychobot/sessions/${userId}`),

  createSession: (authFetch, userId, title) =>
    authFetch(`${API_URL}/psychobot/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title }),
    }),

  deleteSession: (authFetch, id) =>
    authFetch(`${API_URL}/psychobot/sessions/${id}`, { method: "DELETE" }),

  getHistory: (authFetch, sessionId) =>
    authFetch(`${API_URL}/psychobot/history/${sessionId}`),

  chat: (authFetch, payload) =>
    authFetch(`${API_URL}/psychobot/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  weeklySummary: (authFetch, userId) =>
    authFetch(`${API_URL}/psychobot/weekly-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }),
};

export default psychobotApi;
