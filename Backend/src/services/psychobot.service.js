import * as psychobotRepo from "../repositories/psychobot.repository.js";
import * as diaryRepo from "../repositories/diary.repository.js";
import * as emotionRepo from "../repositories/emotion.repository.js";
import * as alertRepo from "../repositories/alert.repository.js";
import * as userRepo from "../repositories/user.repository.js";
import { generateWithRetry, ai } from "../config/gemini.js";
import env from "../config/environment.js";
import { EMOTION_NAME_TO_STATE } from "../utils/constants.js";

/**
 * Obtiene sesiones de un usuario.
 */
export async function getSessions(userId) {
  return psychobotRepo.getSessionsByUserId(userId);
}

/**
 * Crea una nueva sesión.
 */
export async function createSession(userId, title) {
  const sessionId = await psychobotRepo.createSession(userId, title);
  return { id_session: sessionId, title: title || "Nueva Conversación" };
}

/**
 * Elimina una sesión.
 */
export async function deleteSession(sessionId) {
  await psychobotRepo.deleteSession(sessionId);
  return { message: "Sesión eliminada" };
}

/**
 * Obtiene historial de una sesión.
 */
export async function getHistory(sessionId) {
  return psychobotRepo.getHistoryBySessionId(sessionId);
}

/**
 * Asegura que existe una sesión activa. Retorna el sessionId.
 */
async function ensureSession(userId, idSession, message) {
  if (idSession) return idSession;

  const latest = await psychobotRepo.getLatestSession(userId);
  if (latest) return latest;

  return psychobotRepo.createSession(
    userId,
    (message || "").substring(0, 30) + "...",
  );
}

/**
 * Procesa tags especiales en la respuesta del bot.
 */
async function processBotTags(botReply, userId) {
  let cleanReply = botReply;

  // Procesar [LEARN: "..."]
  const learnMatch = cleanReply.match(/\[LEARN:\s*\"(.*?)\"\s*\]/);
  if (learnMatch) {
    try {
      await psychobotRepo.saveMemory(userId, learnMatch[1]);
    } catch (e) {
      console.error("Error guardando memoria:", e.message);
    }
    cleanReply = cleanReply.replace(/\[LEARN:\s*\".*?\"\s*\]/g, "").trim();
  }

  // Procesar [DIARY: {...}]
  const diaryMatch = cleanReply.match(/\[DIARY:\s*(\{.*?\})\s*\]/);
  if (diaryMatch) {
    try {
      const diaryData = JSON.parse(diaryMatch[1]);
      const emotionName = diaryData.emotion_name || "Neutral";

      let emotion = await emotionRepo.findByName(emotionName);
      let emotionId;

      if (emotion) {
        emotionId = emotion.id_emotions;
      } else {
        const estado = EMOTION_NAME_TO_STATE[emotionName] || "Neutral";
        emotionId = await emotionRepo.create(emotionName, estado);
      }

      let diary = await diaryRepo.findByUserId(userId);
      let diaryId;
      if (diary) {
        diaryId = diary.id_diary;
      } else {
        diaryId = await diaryRepo.create(userId);
      }

      await diaryRepo.createEntry(diaryId, diaryData.description, emotionId);
      console.log(`✅ Diario guardado (id_emotions=${emotionId})`);
    } catch (e) {
      console.error("❌ Error procesando DIARY tag:", e);
    }
    cleanReply = cleanReply.replace(/\[DIARY:\s*\{.*?\}\s*\]/g, "").trim();
  }

  // Procesar [ALERT: {...}]
  const alertMatch = cleanReply.match(/\[ALERT:\s*(\{.*?\})\s*\]/);
  if (alertMatch) {
    try {
      const alertData = JSON.parse(alertMatch[1]);
      await alertRepo.create(userId, alertData.motivo);
    } catch (e) {
      // Silencioso
    }
    cleanReply = cleanReply.replace(/\[ALERT:\s*\{.*?\}\s*\]/g, "").trim();
  }

  return cleanReply;
}

/**
 * Construye el prompt de contexto para Gemini.
 */
function buildContextPrompt(userName, memoryRows, diaryRows, personality, clientHistory, message) {
  let personalityPrompt =
    "Eres un amigo empático, escuchas activamente y das respuestas suaves y comprensivas.";
  if (personality === "entrenador") {
    personalityPrompt =
      "Eres un Coach o Entrenador mental. Eres directo, muy motivador, y te enfocas en dar pasos de acción concretos y empujar al usuario a mejorar.";
  } else if (personality === "filosofico") {
    personalityPrompt =
      "Eres un guía filosófico. Tus respuestas son profundas, reflexivas, usan metáforas sabias y ayudan al usuario a ver la perspectiva general de la vida.";
  }

  const memoryStr =
    memoryRows.length > 0
      ? "\nRECUERDOS DEL USUARIO:\n" +
        memoryRows.map((m) => `- ${m.fact}`).join("\n") +
        "\n"
      : "";

  const diaryStr =
    diaryRows.length > 0
      ? "\nDIARIO RECIENTE:\n" +
        diaryRows
          .map((d) => {
            const date = new Date(d.entry_date).toLocaleDateString();
            return `- ${date}: ${d.emot_name}${d.description ? " - " + d.description : ""}`;
          })
          .join("\n") +
        "\n"
      : "";

  let contextStr = `Eres Psychobot, el asistente virtual de Psychoway.
Nombre del usuario: ${userName}. Habla en español neutro. Usa emojis moderadamente 😊.
TU PERSONALIDAD ACTUAL: ${personalityPrompt}

Integra lo que sabes del usuario de forma natural:
${memoryStr}${diaryStr}
IMPORTANTE: NUNCA registres emociones ni entradas de diario automáticamente. El usuario tiene un botón dedicado para eso.
Si el usuario comparte cómo se siente, simplemente escúchalo y apóyalo con empatía. NO uses etiquetas [DIARY:...].

APRENDIZAJE: Si el usuario te dice un dato personal relevante (nombre de mascota, hobby, etc.) y te da permiso, usa: [LEARN: "<dato>"]

EMERGENCIA: Solo en casos de riesgo crítico usa: [ALERT: {"motivo": "..."}]

MAPA CORPORAL: Si el usuario envía un mensaje reportando una emoción corporal (ej: "Siento Confusión en la zona: cabeza, con una intensidad de 5/10."), responde con profunda empatía anatómica, validando por qué esa emoción se siente en esa parte del cuerpo, y pregúntale gentilmente sobre los matices de esa sensación para ayudarle a explorarla, tal como lo haría un terapeuta compasivo.

WIDGETS: Puedes mostrar herramientas interactivas al usuario con estas etiquetas al final de tu mensaje:
- Si tiene ansiedad o necesita calmarse: [WIDGET:GROUNDING]
- Si quieres medir su nivel de estrés/ánimo numéricamente: [WIDGET:THERMOMETER]
- Si pide un reto, motivación rápida o quiere activarse: [WIDGET:CHALLENGE]

Chat reciente:
`;

  const recentHistory = (clientHistory || []).slice(-8);
  recentHistory.forEach((msg) => {
    contextStr += `${msg.type === "user" ? "Usuario" : "Psychobot"}: ${msg.text}\n`;
  });
  contextStr += `Usuario: ${message}\nPsychobot:`;

  return contextStr;
}

/**
 * Envía mensaje e interactúa con la IA.
 */
export async function chat(userId, message, idSession, personality, chatHistory) {
  if (!userId || !message) {
    throw { status: 400, message: "userId y message son requeridos" };
  }

  const activeSessionId = await ensureSession(userId, idSession, message);

  // Guardia: API Key no configurada
  if (!ai || env.GEMINI_API_KEY === "API_KEY_AQUI") {
    return { type: "bot", text: "Configuración de IA pendiente.", id_session: activeSessionId };
  }

  // Obtener contexto en paralelo
  const [userName, memoryRows, diaryRows] = await Promise.all([
    userRepo.getNameById(userId),
    psychobotRepo.getMemory(userId),
    diaryRepo.getRecentEntries(userId, 5),
  ]);

  const contextStr = buildContextPrompt(
    userName, memoryRows, diaryRows,
    personality || "empatetico", chatHistory, message,
  );

  // Llamar a Gemini
  let botReply;
  try {
    botReply = await generateWithRetry(contextStr);
  } catch (aiError) {
    console.error("Error en API de Gemini:", aiError.status || aiError.message);
    const is503 = aiError.status === 503 || (aiError.message && aiError.message.includes("503"));
    const is429 =
      aiError.status === 429 ||
      (aiError.message && (aiError.message.includes("429") || aiError.message.includes("RESOURCE_EXHAUSTED")));

    let aiErrMsg =
      "Estoy teniendo dificultades técnicas 😔. Por favor, intenta de nuevo en unos minutos.";
    if (is503) {
      aiErrMsg =
        "El servicio de IA está recibiendo mucho tráfico ahora mismo. ¡Inténtalo de nuevo en un momento! 😊";
    } else if (is429) {
      aiErrMsg =
        "He alcanzado mi límite de consultas gratuitas por hoy. Por favor, intenta de nuevo en unos minutos. ¡Gracias por tu paciencia! [SNOOPY:SAD]";
    }

    return { type: "bot", text: aiErrMsg, id_session: activeSessionId };
  }

  // Procesar tags especiales
  botReply = await processBotTags(botReply, userId);

  return { type: "bot", text: botReply, id_session: activeSessionId };
}

/**
 * Genera resumen semanal.
 */
export async function weeklySummary(userId) {
  let activeSessionId = null;

  const [userName, diaryRows, latestSession] = await Promise.all([
    userRepo.getNameById(userId),
    diaryRepo.getWeeklyEntries(userId),
    psychobotRepo.getLatestSession(userId),
  ]);

  activeSessionId = latestSession;

  if (!activeSessionId) {
    activeSessionId = await psychobotRepo.createSession(userId, "Resumen Semanal");
  }

  if (!diaryRows || diaryRows.length === 0) {
    const msg =
      "Aún no tienes suficientes registros en tu diario esta semana para hacer un resumen. ¡Anímate a escribir!";
    await psychobotRepo.saveMessage(userId, activeSessionId, "bot", msg);
    return { type: "bot", text: msg, id_session: activeSessionId };
  }

  if (!ai || env.GEMINI_API_KEY === "API_KEY_AQUI") {
    const botReply =
      "Tienes entradas registradas esta semana, pero la IA no está conectada para generar el resumen.";
    await psychobotRepo.saveMessage(userId, activeSessionId, "bot", botReply);
    return { type: "bot", text: botReply, id_session: activeSessionId };
  }

  const diaryStr = diaryRows
    .map(
      (d) =>
        `- ${new Date(d.entry_date).toLocaleDateString()}: ${d.emot_name} - ${d.description || ""}`,
    )
    .join("\\n");

  const prompt = `Eres Psychobot. El usuario ${userName} ha solicitado su resumen semanal. 
Aquí están sus entradas de los últimos 7 días:
${diaryStr}
Tu tarea: Redacta un resumen cálido, empático y motivador. Identifica la emoción predominante, resalta si ha mencionado alguna zona corporal en sus descripciones (ej. dolor de pecho, dolor de cabeza) y felicítalo por llevar su registro de bienestar. No uses etiquetas de widgets ni corchetes, EXCEPTO lo siguiente: Si el bienestar general de la persona es positivo o ha mejorado, añade EXACTAMENTE al final de tu respuesta el texto "[SNOOPY:HAPPY]". Si la persona la ha estado pasando mal o se siente triste/negativo en general, añade EXACTAMENTE al final de tu respuesta el texto "[SNOOPY:SAD]". Responde directo, como un amigo.`;

  try {
    const botReply = await generateWithRetry(prompt);
    await psychobotRepo.saveMessage(userId, activeSessionId, "bot", botReply);
    return { type: "bot", text: botReply, id_session: activeSessionId };
  } catch (e) {
    console.error("❌ Error en Weekly Summary:", e);
    const is429 =
      e.status === 429 ||
      (e.message && (e.message.includes("429") || e.message.includes("RESOURCE_EXHAUSTED")));

    const botReply = is429
      ? "Me encantaría darte tu resumen semanal, pero he excedido mi cuota gratuita de la API en este momento. Por favor, intenta de nuevo en unos minutos. [SNOOPY:SAD]"
      : "Hubo un error al generar tu resumen. Por favor, intenta de nuevo más tarde.";

    if (activeSessionId) {
      await psychobotRepo.saveMessage(userId, activeSessionId, "bot", botReply);
    }
    return { type: "bot", text: botReply, id_session: activeSessionId };
  }
}
