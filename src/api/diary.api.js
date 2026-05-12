import { API_URL } from "./config";

/**
 * Servicio de Diario — centraliza llamadas al backend.
 */
const diaryApi = {
  createEntry: (authFetch, userId, emotionIndex, description) =>
    authFetch(`${API_URL}/diary/entry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, emotionIndex, description }),
    }),

  getEntries: (authFetch, userId) =>
    authFetch(`${API_URL}/diary/entries/${userId}`),
};

export default diaryApi;
