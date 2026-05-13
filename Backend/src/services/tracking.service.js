import * as trackingRepo from "../repositories/tracking.repository.js";

/**
 * Obtiene aprendices con emociones y sus estadísticas.
 */
export async function getApprenticesWithEmotions() {
  const [users, emotionResults] = await Promise.all([
    trackingRepo.getApprenticesWithEmotions(),
    trackingRepo.getAllEmotionData(),
  ]);

  return users.map((user) => {
    const userEmociones = emotionResults.filter(
      (e) => e.id_user === user.id,
    );

    const ultimaEmocionObj = userEmociones[userEmociones.length - 1];
    const ultima = ultimaEmocionObj ? ultimaEmocionObj.emot_estado : "N/D";
    let ultimaPlural = "N/D";
    if (ultima.includes("Positivo")) ultimaPlural = "Positivas";
    else if (ultima.includes("Negativo")) ultimaPlural = "Negativas";
    else if (ultima.includes("Neutral")) ultimaPlural = "Neutral";

    let positivas = 0;
    let negativas = 0;
    let neutrales = 0;
    userEmociones.forEach((e) => {
      if (e.emot_estado === "Positivo") positivas++;
      else if (e.emot_estado === "Negativo") negativas++;
      else neutrales++;
    });

    let promedio = "Neutral";
    if (positivas >= negativas && positivas >= neutrales)
      promedio = "Positivas";
    else if (negativas >= positivas && negativas >= neutrales)
      promedio = "Negativas";

    return {
      ...user,
      ultima: ultimaPlural,
      promedio,
      estadisticas: { positivas, negativas, neutrales },
    };
  });
}
