import * as alertRepo from "../repositories/alert.repository.js";
import { generateWithRetry, ai } from "../config/gemini.js";
import env from "../config/environment.js";

function buildSafetyPrompt(text, source) {
  const sourceLabel = source === "diario" ? "diario de emociones" : "lista de objetivos";
  return `Eres un sistema de analisis de seguridad en salud mental.

Analiza el siguiente texto escrito por un usuario en su ${sourceLabel}.
Determina si contiene indicadores claros de riesgo: ideacion suicida, autolesiones, desesperanza extrema, frases como "quiero morir", "no quiero vivir", "quiero suicidarme", "quiero hacerme dano", "el mundo estaria mejor sin mi".

Texto: "${text}"

Responde UNICAMENTE con JSON valido sin texto adicional ni markdown:
Si hay riesgo: {"risky": true, "motivo": "descripcion breve"}
Si no hay riesgo: {"risky": false, "motivo": ""}`;
}

export async function analyzeContent(userId, text, source) {
  console.log(`[Safety] Analizando texto de ${source} para usuario ${userId}: "${text?.substring(0, 50)}"`);

  if (!text || text.trim().length < 10) {
    console.log("[Safety] Texto muy corto, omitiendo analisis");
    return;
  }
  if (!ai || env.GEMINI_API_KEY === "API_KEY_AQUI") {
    console.log("[Safety] Gemini AI no disponible");
    return;
  }

  try {
    const prompt = buildSafetyPrompt(text.trim(), source);
    console.log("[Safety] Llamando a Gemini...");
    const rawResponse = await generateWithRetry(prompt, 1);
    console.log("[Safety] Respuesta de Gemini:", rawResponse?.substring(0, 200));

    let parsed;
    try {
      const cleaned = rawResponse
        .replace(/```json\n?/gi, "")
        .replace(/```\n?/gi, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn("[Safety] No se pudo parsear JSON:", rawResponse?.substring(0, 100));
      return;
    }

    console.log("[Safety] Resultado:", JSON.stringify(parsed));

    if (parsed?.risky === true) {
      const sourceLabel = source === "diario" ? "Diario de Emociones" : "Objetivos";
      const motivo = `[${sourceLabel}] ${parsed.motivo || "Contenido de riesgo detectado"}`;
      await alertRepo.create(userId, motivo);
      console.log(`[Safety] ALERTA CREADA para usuario ${userId}: ${motivo}`);
    } else {
      console.log("[Safety] Sin riesgo detectado.");
    }
  } catch (err) {
    console.warn("[Safety] Error:", err?.message || err);
  }
}