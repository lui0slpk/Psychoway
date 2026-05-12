import { GoogleGenAI } from "@google/genai";
import env from "./environment.js";

/**
 * Instancia de Google Gemini AI.
 * Será null si la API key no está configurada.
 */
let ai = null;

try {
  if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== "API_KEY_AQUI") {
    ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    console.log("✅ Gemini AI inicializado");
  } else {
    console.warn("⚠️ Gemini API Key no configurada. El chatbot no funcionará.");
  }
} catch (error) {
  console.error("❌ Error al inicializar Gemini AI:", error.message);
}

/**
 * Genera contenido con Gemini, con reintentos automáticos para errores 429/503.
 * @param {string} prompt - El prompt a enviar a Gemini
 * @param {number} maxRetries - Número máximo de reintentos
 * @returns {Promise<string>} Texto de respuesta
 */
export async function generateWithRetry(prompt, maxRetries = 2) {
  if (!ai) {
    return "Configuración de IA pendiente. Por favor, configura la API Key de Gemini.";
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
      });
      return response.text || "Lo siento, no pude entender tu solicitud.";
    } catch (retryErr) {
      const status = retryErr.status || 0;
      const msg = retryErr.message || "";
      const is503 =
        status === 503 || msg.includes("503") || msg.includes("UNAVAILABLE");
      const is429 =
        status === 429 ||
        msg.includes("429") ||
        msg.includes("RESOURCE_EXHAUSTED");

      if ((is503 || is429) && attempt < maxRetries) {
        const delay = is429 ? 10000 : 3000;
        console.log(
          `⚠️ Gemini ${is429 ? "429" : "503"} - Reintento ${attempt}/${maxRetries} en ${delay / 1000}s...`,
        );
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw retryErr;
      }
    }
  }
}

export { ai };
export default { ai, generateWithRetry };
