/**
 * Mapeo de id_rol a nombre de rol.
 */
export const ROLES = {
  1: "aprendiz",
  2: "psicologo",
  3: "administrador",
};

/**
 * Mapeo inverso: nombre de rol a id_rol.
 */
export const ROLE_IDS = {
  aprendiz: 1,
  psicologo: 2,
  administrador: 3,
};

/**
 * Mapeo de índices de emociones a nombres.
 */
export const EMOTION_NAMES = {
  0: "Muy Feliz",
  1: "Feliz",
  2: "Neutral",
  3: "Triste",
  4: "Muy Triste",
};

/**
 * Mapeo de índices de emociones a estados.
 */
export const EMOTION_STATES = {
  0: "Positivo",
  1: "Positivo",
  2: "Neutral",
  3: "Negativo",
  4: "Negativo",
};

/**
 * Mapeo de nombres de emociones a estados (para Psychobot).
 */
export const EMOTION_NAME_TO_STATE = {
  "Muy Feliz": "Positivo",
  Feliz: "Positivo",
  Neutral: "Neutral",
  Triste: "Negativo",
  "Muy Triste": "Negativo",
};

/**
 * Rutas por defecto según el rol del usuario.
 */
export const DEFAULT_ROUTES = {
  aprendiz: "/diario",
  psicologo: "/psi-seguimiento",
  administrador: "/gestion",
};
