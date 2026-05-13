import { query } from "../config/database.js";

/**
 * Obtiene aprendices con emociones registradas (visibles para psicólogos).
 */
export async function getApprenticesWithEmotions() {
  return query(
    `SELECT 
       u.id_user as id, 
       CONCAT(u.names, ' ', u.last_names) as nombre, 
       u.document as documento
     FROM users u
     JOIN diary d ON u.id_user = d.id_user
     WHERE u.id_rol = 1 
       AND d.diary_visibility = 'yo-psicologo'
       AND EXISTS (
         SELECT 1 FROM diary_entries de 
         WHERE d.id_diary = de.id_diary
       )`,
  );
}

/**
 * Obtiene todas las emociones de diario con usuario e información de estado.
 */
export async function getAllEmotionData() {
  return query(
    `SELECT 
       d.id_user, e.emot_estado, de.entry_date
     FROM diary_entries de
     JOIN diary d ON de.id_diary = d.id_diary
     JOIN emotions e ON de.id_emotions = e.id_emotions
     ORDER BY de.entry_date ASC`,
  );
}
