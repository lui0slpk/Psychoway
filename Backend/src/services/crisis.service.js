import { generateWithRetry, ai } from "../config/gemini.js";
import * as alertRepo from "../repositories/alert.repository.js";
import * as userRepo from "../repositories/user.repository.js";
import env from "../config/environment.js";

/**
 * Analiza el texto con Gemini para detectar contenido de crisis.
 * Si detecta riesgo, crea una alerta para el psicólogo con los datos del aprendiz.
 *
 * Este proceso es SILENCIOSO: el aprendiz nunca sabe que ocurrió.
 * Si Gemini falla, se loguea el error pero no interrumpe el flujo principal.
 *
 * @param {number} userId - ID del aprendiz
 * @param {string} texto - Texto escrito por el aprendiz (diario o objetivo)
 * @param {string} fuente - Origen del texto: "diario" | "objetivo"
 */
export async function analyzeAndAlert(userId, texto, fuente = "diario") {
  // Si no hay texto o IA no está configurada, salir silenciosamente
  if (!texto || !texto.trim()) return;
  if (!ai || env.GEMINI_API_KEY === "API_KEY_AQUI") return;

  try {
    const prompt = `Eres un sistema de detección de crisis psicológica para una plataforma de salud mental universitaria.
Analiza el siguiente texto escrito por un aprendiz y determina si contiene contenido de riesgo como:
- Ideación suicida o deseos de muerte
- Autolesión o daño físico a sí mismo
- Desesperanza extrema o frases de rendición
- Amenazas hacia otros
- Crisis emocional severa con riesgo inmediato

Texto a analizar: "${texto.trim()}"

Responde ÚNICAMENTE con una de estas dos opciones exactas:
- Si el texto es seguro o simplemente expresa tristeza normal: responde exactamente la palabra SEGURO
- Si detectas riesgo real: responde exactamente en este formato: ALERTA: <describe el riesgo brevemente en español, máximo 150 caracteres>

No añadas saludos, explicaciones ni ningún texto extra. Solo una de las dos respuestas.`;

    const respuesta = await generateWithRetry(prompt, 1);

    if (!respuesta || !respuesta.trim().toUpperCase().startsWith("ALERTA:")) {
      // Es seguro o no hubo respuesta clara → no hacer nada
      return;
    }

    // Extraer el motivo detallado
    const motivoGemini = respuesta.trim().substring("ALERTA:".length).trim();

    // Obtener información completa del aprendiz del registro
    const u = await userRepo.findById(userId);

    const infoAprendiz = u
      ? [
          `Nombre: ${u.names} ${u.last_names}`,
          `Documento: ${u.doc_type || ""} ${u.document}`,
          `Fecha de nacimiento: ${u.birth_date ? new Date(u.birth_date).toLocaleDateString("es-CO") : "N/A"}`,
          `Email: ${u.email || "N/A"}`,
          `Celular: ${u.contact_number || "N/A"}`,
          `Teléfono fijo: ${u.landline_number || "N/A"}`,
          `Programa de formación: ${u.training_program || "N/A"}`,
          `Número de ficha: ${u.ficha_number || "N/A"}`,
        ].join(" | ")
      : `ID de usuario: ${userId}`;

    const motivo = `[${fuente.toUpperCase()}] ${motivoGemini} — ${infoAprendiz}`;

    // Crear la alerta para el psicólogo (silenciosamente)
    await alertRepo.create(userId, motivo);
    console.log(`\u{1F6A8} Alerta de crisis creada para aprendiz ${userId} (fuente: ${fuente})`);
  } catch (error) {
    // Error silencioso: nunca interrumpir el flujo del usuario
    console.error(`\u26A0\uFE0F Crisis service error (fuente: ${fuente}):`, error.message || error);
  }
}
