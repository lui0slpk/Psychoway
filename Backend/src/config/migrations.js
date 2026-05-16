import { execute } from "./database.js";

/**
 * Auto-migraciones: crea tablas que no existen y ajusta columnas faltantes.
 * Se ejecutan al iniciar el servidor, solo si la BD está conectada.
 */
export async function runMigrations() {
  console.log("🔄 Ejecutando migraciones...");

  try {
    // 1. Limpiar columna document_type duplicada si existe
    const docTypeCol = await execute(
      "SHOW COLUMNS FROM users LIKE 'document_type'",
    ).catch(() => []);
    if (Array.isArray(docTypeCol) && docTypeCol.length > 0) {
      console.log("⚠️ Eliminando columna document_type duplicada...");
      await execute("ALTER TABLE users DROP COLUMN document_type").catch(() => {});
      console.log("✅ Columna document_type eliminada. Se usa doc_type.");
    }

    // 2. Verificar columnas de meetings_agenda
    const meetingCol = await execute(
      "SHOW COLUMNS FROM meetings_agenda LIKE 'id_user'",
    ).catch(() => []);
    if (Array.isArray(meetingCol) && meetingCol.length === 0) {
      console.log("⚠️ Agregando columnas a meetings_agenda...");
      await execute(`
        ALTER TABLE meetings_agenda
        ADD COLUMN id_user INT NULL,
        ADD COLUMN id_professional INT NULL,
        ADD CONSTRAINT fk_meeting_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
        ADD CONSTRAINT fk_meeting_prof FOREIGN KEY (id_professional) REFERENCES users(id_user) ON DELETE CASCADE
      `).catch((err) => console.log("Info meetings_agenda:", err.message));
    }

    // 3. Asegurar AUTO_INCREMENT en meetings_agenda
    await execute(
      "ALTER TABLE meetings_agenda MODIFY id_meetings_agenda INT(11) NOT NULL AUTO_INCREMENT",
    ).catch((err) => console.log("Info AUTO_INCREMENT:", err.message));

    // 4. Agregar diary_visibility a diary si no existe
    const diaryVisCol = await execute(
      "SHOW COLUMNS FROM diary LIKE 'diary_visibility'",
    ).catch(() => []);
    if (Array.isArray(diaryVisCol) && diaryVisCol.length === 0) {
      console.log("⚠️ Agregando diary_visibility a diary...");
      await execute(
        "ALTER TABLE diary ADD COLUMN diary_visibility VARCHAR(20) DEFAULT 'yo-psicologo'",
      ).catch((err) => console.error("❌", err.message));
      console.log("✅ diary_visibility agregada.");
    }

    // 5. Agregar id_user a objetivos si no existe
    const objCol = await execute(
      "SHOW COLUMNS FROM objetivos LIKE 'id_user'",
    ).catch(() => []);
    if (Array.isArray(objCol) && objCol.length === 0) {
      console.log("⚠️ Agregando id_user a objetivos...");
      await execute(`
        ALTER TABLE objetivos
        ADD COLUMN id_user INT NULL,
        ADD CONSTRAINT fk_objetivo_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
      `).catch((err) => console.error("❌", err.message));
      console.log("✅ id_user agregada a objetivos.");
    }

    // 6. Crear tabla psychobot_sessions
    await execute(`
      CREATE TABLE IF NOT EXISTS psychobot_sessions (
        id_session INT AUTO_INCREMENT PRIMARY KEY,
        id_user INT NOT NULL,
        title VARCHAR(255) DEFAULT 'Nueva Conversación',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
      )
    `);
    console.log("✅ Tabla psychobot_sessions lista.");

    // 7. Crear tabla psychobot_chats
    await execute(`
      CREATE TABLE IF NOT EXISTS psychobot_chats (
        id_chat INT AUTO_INCREMENT PRIMARY KEY,
        id_user INT NOT NULL,
        id_session INT NULL,
        role ENUM('user', 'bot') NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
        FOREIGN KEY (id_session) REFERENCES psychobot_sessions(id_session) ON DELETE CASCADE
      )
    `);
    console.log("✅ Tabla psychobot_chats lista.");

    // 7b. Migración: asegurar que id_session existe en psychobot_chats
    const chatSessionCol = await execute(
      "SHOW COLUMNS FROM psychobot_chats LIKE 'id_session'",
    ).catch(() => []);
    if (Array.isArray(chatSessionCol) && chatSessionCol.length === 0) {
      console.log("⚠️ Agregando id_session a psychobot_chats...");
      await execute("ALTER TABLE psychobot_chats ADD COLUMN id_session INT NULL").catch(() => {});
      await execute(
        "ALTER TABLE psychobot_chats ADD CONSTRAINT fk_chat_session FOREIGN KEY (id_session) REFERENCES psychobot_sessions(id_session) ON DELETE CASCADE",
      ).catch(() => {});
    }

    // 8. Crear tabla psychobot_memory
    await execute(`
      CREATE TABLE IF NOT EXISTS psychobot_memory (
        id_memory INT AUTO_INCREMENT PRIMARY KEY,
        id_user INT NOT NULL,
        fact TEXT NOT NULL,
        importance INT DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
      )
    `);
    console.log("✅ Tabla psychobot_memory lista.");

    // 9. Crear tabla psychologist_alerts
    await execute(`
      CREATE TABLE IF NOT EXISTS psychologist_alerts (
        id_alert INT AUTO_INCREMENT PRIMARY KEY,
        id_user INT NOT NULL,
        motivo TEXT NOT NULL,
        leido BOOLEAN DEFAULT FALSE,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
      )
    `);
    console.log("✅ Tabla psychologist_alerts lista.");

    // 10. Crear tabla notifications
    await execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id_notification INT AUTO_INCREMENT PRIMARY KEY,
        id_user INT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        message TEXT NOT NULL,
        link VARCHAR(255) DEFAULT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
      )
    `);
    console.log("✅ Tabla notifications lista.");

    // 11. Agregar profile_photo a users si no existe
    const profilePhotoCol = await execute(
      "SHOW COLUMNS FROM users LIKE 'profile_photo'",
    ).catch(() => []);
    if (Array.isArray(profilePhotoCol) && profilePhotoCol.length === 0) {
      console.log("⚠️ Agregando profile_photo a users...");
      await execute(
        "ALTER TABLE users ADD COLUMN profile_photo LONGTEXT DEFAULT NULL",
      ).catch((err) => console.error("❌", err.message));
      console.log("✅ profile_photo agregada a users.");
    }

    console.log("✅ Migraciones completadas.");
  } catch (error) {
    console.error("❌ Error en migraciones:", error.message);
  }
}
