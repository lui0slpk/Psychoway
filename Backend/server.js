import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendPasswordResetEmail } from "./mailer.js";

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // tu usuario de MySQL
  password: "", // tu contraseña
  database: "psychoway", // el nombre de tu base de datos
});

db.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err);
    console.log(
      "Asegúrate de que XAMPP/MySQL esté corriendo y la base de datos 'psychoway' exista.",
    );
  } else {
    console.log("✅ Conectado a MySQL");
  }
});

// Ruta para registrar usuario
app.post("/register", async (req, res) => {
  const { document, doc_type, names, last_names, birth_date, email, password } =
    req.body;

  // Verificar si el usuario ya existe
  const checkSql = "SELECT * FROM users WHERE document = ? OR email = ?";
  db.query(checkSql, [document, email], async (err, results) => {
    if (err) {
      console.error("Error al validar usuario existente:", err);
      return res.status(500).json({ message: "Error al registrar usuario" });
    }

    if (results.length > 0) {
      return res
        .status(409)
        .json({ message: "El documento o correo ya se encuentra registrado" });
    }

    // Si no existe, procedemos a encriptar contraseña y guardar
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
        INSERT INTO users (document, doc_type, names, last_names, birth_date, email, password, id_rol, last_update)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

    db.query(
      sql,
      [
        document,
        doc_type || null,
        names,
        last_names,
        birth_date,
        email,
        hashedPassword,
        1,
      ],
      (insertErr, result) => {
        if (insertErr) {
          if (insertErr.code === "ER_DUP_ENTRY") {
            return res
              .status(409)
              .json({
                message: "El documento o correo ya se encuentra registrado",
              });
          }
          console.error("Error al registrar usuario:", insertErr);
          return res
            .status(500)
            .json({ message: "Error al registrar usuario" });
        }
        res.status(200).json({ message: "Usuario registrado correctamente" });
      },
    );
  });
});

// Mapeo de id_rol a nombre de rol
const ROLES = {
  1: "aprendiz",
  2: "psicologo",
  3: "administrador",
  1: "aprendiz",
  2: "psicologo",
  3: "administrador",
};

// Ruta para iniciar sesión
app.post("/login", (req, res) => {
  const { document, password } = req.body;

  // Buscar usuario por documento
  const sql = "SELECT * FROM users WHERE document = ?";
  db.query(sql, [document], async (err, results) => {
    if (err) {
      console.error("Error en consulta:", err);
      return res
        .status(500)
        .json({ message: "Error en el servidor: " + err.message, error: err });
    }

    // Si no existe
    if (results.length === 0) {
      return res
        .status(400)
        .json({ message: "Documento o contraseña incorrectos" });
    }

    const user = results[0];

    // Comparar contraseña con hash
    const isMatch = await bcrypt.compare(password, user.password);

    console.log(`🔍 Intento de Login: Documento=${document}`);
    console.log(`   - Contraseña enviada: ${password}`);
    console.log(`   - Hash en BD: ${user.password}`);
    console.log(`   - Resultado comparación: ${isMatch}`);

    if (!isMatch) {
      console.log("❌ Contraseña incorrecta");
      return res
        .status(400)
        .json({ message: "Documento o contraseña incorrectos" });
    }

    console.log(
      `Usuario encontrado: ${user.document}, ID Rol: ${user.id_rol} (Tipo: ${typeof user.id_rol})`,
    );

    // Obtener nombre del rol
    const roleName = ROLES[user.id_rol];
    if (!roleName) {
      console.warn(
        `⚠️ Rol no reconocido para ID ${user.id_rol}. Asignando 'aprendiz' por defecto.`,
      );
    }
    const finalRole = roleName || "aprendiz";

    // Asegurar que tenemos un ID
    const finalUserId = user.id_user || user.id;
    console.log(`✅ ID de usuario a enviar: ${finalUserId}`);

    // Todo OK → enviar información básica del usuario
    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: finalUserId,
        id_user: finalUserId,
        document: user.document,
        names: user.names,
        last_names: user.last_names,
        id_rol: user.id_rol,
        rol: finalRole,
      },
    });
  });
});

// ==================== DIARY ENDPOINTS ====================

// Mapeo de índices de emociones a nombres
const EMOTION_NAMES = {
  0: "Muy Feliz",
  1: "Feliz",
  2: "Neutral",
  3: "Triste",
  4: "Muy Triste",
};

const EMOTION_STATES = {
  0: "Positivo",
  1: "Positivo",
  2: "Neutral",
  3: "Negativo",
  4: "Negativo",
};

// Crear entrada de diario
app.post("/api/diary/entry", async (req, res) => {
  const { userId, emotionIndex, description } = req.body;

  if (!userId || emotionIndex === undefined) {
    return res
      .status(400)
      .json({ message: "userId y emotionIndex son requeridos" });
  }

  try {
    // 1. Verificar/crear registro de diario para el usuario
    const checkDiarySql = "SELECT id_diary FROM diary WHERE id_user = ?";
    db.query(checkDiarySql, [userId], (err, diaryResults) => {
      if (err) {
        console.error(
          "Error verificando diario (User ID: " + userId + "):",
          err,
        );
        return res
          .status(500)
          .json({ message: "Error al verificar diario.", error: err.message });
      }

      let diaryId;

      const processDiaryEntry = (dId) => {
        // 2. Verificar/crear emoción
        const emotionName = EMOTION_NAMES[emotionIndex] || "Neutral";
        const emotionState = EMOTION_STATES[emotionIndex] || "Neutral";

        const checkEmotionSql =
          "SELECT id_emotions FROM emotions WHERE emot_name = ?";
        db.query(checkEmotionSql, [emotionName], (err, emotionResults) => {
          if (err) {
            console.error("Error verificando emoción:", err);
            return res
              .status(500)
              .json({
                message: "Error al verificar emoción",
                error: err.message,
              });
          }

          let emotionId;

          const createDiaryEntry = (eId, objectiveId = null) => {
            // 3. Crear entrada de diario
            const insertEntrySql = `
                            INSERT INTO diary_entries (id_diary, entry_date, description, id_emotions, id_objetives)
                            VALUES (?, NOW(), ?, ?, ?)
                        `;

            db.query(
              insertEntrySql,
              [dId, description || null, eId, objectiveId],
              (err, result) => {
                if (err) {
                  console.error("Error creando entrada de diario:", err);
                  return res
                    .status(500)
                    .json({
                      message: "Error al crear entrada de diario",
                      error: err.message,
                    });
                }

                res.status(200).json({
                  message: "Entrada de diario registrada correctamente",
                  entryId: result.insertId,
                });
              },
            );
          };

          // Buscar el último objetivo creado
          const getLatestObjective = (callback) => {
            const objectiveSql =
              "SELECT id_objetives FROM objetivos ORDER BY last_update DESC LIMIT 1";
            db.query(objectiveSql, (err, objResults) => {
              if (err) {
                callback(null); // Continuar sin objetivo
              } else if (objResults.length > 0) {
                callback(objResults[0].id_objetives);
              } else {
                callback(null);
              }
            });
          };

          if (emotionResults.length > 0) {
            emotionId = emotionResults[0].id_emotions;
            getLatestObjective((objectiveId) => {
              createDiaryEntry(emotionId, objectiveId);
            });
          } else {
            // Crear nueva emoción
            const insertEmotionSql =
              "INSERT INTO emotions (emot_name, emot_estado) VALUES (?, ?)";
            db.query(
              insertEmotionSql,
              [emotionName, emotionState],
              (err, result) => {
                if (err) {
                  return res
                    .status(500)
                    .json({
                      message: "Error al crear emoción",
                      error: err.message,
                    });
                }
                emotionId = result.insertId;
                getLatestObjective((objectiveId) => {
                  createDiaryEntry(emotionId, objectiveId);
                });
              },
            );
          }
        });
      };

      if (diaryResults.length > 0) {
        diaryId = diaryResults[0].id_diary;
        processDiaryEntry(diaryId);
      } else {
        // Crear nuevo diario para el usuario
        const insertDiarySql =
          "INSERT INTO diary (id_user, fecha) VALUES (?, CURDATE())";
        db.query(insertDiarySql, [userId], (err, result) => {
          if (err) {
            console.error("Error creando diario:", err);
            return res
              .status(500)
              .json({ message: "Error al crear diario", error: err.message });
          }
          diaryId = result.insertId;
          processDiaryEntry(diaryId);
        });
      }
    });
  } catch (error) {
    console.error("Error en /api/diary/entry:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Obtener entradas de diario de un usuario
app.get("/api/diary/entries/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
        SELECT 
            de.id_diary_entries,
            de.entry_date,
            de.description,
            e.emot_name,
            e.emot_estado,
            o.nombre_objetivo,
            o.estado as objetivo_estado
        FROM diary_entries de
        INNER JOIN diary d ON de.id_diary = d.id_diary
        LEFT JOIN emotions e ON de.id_emotions = e.id_emotions
        LEFT JOIN objetivos o ON de.id_objetives = o.id_objetives
        WHERE d.id_user = ?
        ORDER BY de.entry_date DESC
    `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error obteniendo entradas:", err);
      return res.status(500).json({ message: "Error al obtener entradas" });
    }
    res.status(200).json(results);
  });
});

// ==================== OBJECTIVES ENDPOINTS ====================

// Crear objetivo
app.post("/api/objectives", (req, res) => {
  const { userId, nombre, descripcion, estado } = req.body;

  if (!userId || !nombre) {
    return res.status(400).json({ message: "userId y nombre son requeridos" });
  }

  const sql = `
        INSERT INTO objetivos (id_user, nombre_objetivo, descripcion, estado, last_update)
        VALUES (?, ?, ?, ?, NOW())
    `;

  db.query(
    sql,
    [userId, nombre, descripcion || null, estado || "Pendiente"],
    (err, result) => {
      if (err) {
        console.error("Error creando objetivo:", err);
        return res.status(500).json({ message: "Error al crear objetivo" });
      }

      res.status(200).json({
        message: "Objetivo creado correctamente",
        objectiveId: result.insertId,
      });
    },
  );
});

// Obtener objetivos de un usuario
app.get("/api/objectives/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
        SELECT 
            id_objetives,
            nombre_objetivo,
            descripcion,
            estado,
            last_update
        FROM objetivos
        WHERE id_user = ?
        ORDER BY last_update DESC
    `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error obteniendo objetivos:", err);
      return res.status(500).json({ message: "Error al obtener objetivos" });
    }
    res.status(200).json(results);
  });
});

// Actualizar objetivo
app.put("/api/objectives/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, estado } = req.body;

  const sql = `
        UPDATE objetivos 
        SET nombre_objetivo = ?, descripcion = ?, estado = ?, last_update = NOW()
        WHERE id_objetives = ?
    `;

  db.query(sql, [nombre, descripcion, estado, id], (err, result) => {
    if (err) {
      console.error("Error actualizando objetivo:", err);
      return res.status(500).json({ message: "Error al actualizar objetivo" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Objetivo no encontrado" });
    }

    res.status(200).json({ message: "Objetivo actualizado correctamente" });
  });
});

// Eliminar objetivo
app.delete("/api/objectives/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM objetivos WHERE id_objetives = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error eliminando objetivo:", err);
      return res.status(500).json({ message: "Error al eliminar objetivo" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Objetivo no encontrado" });
    }

    res.status(200).json({ message: "Objetivo eliminado correctamente" });
  });
});

// ==================== EMOTIONS ENDPOINTS ====================

app.get("/api/emotions", (req, res) => {
  const sql = "SELECT id_emotions, emot_name, emot_estado FROM emotions";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error obteniendo emociones:", err);
      return res.status(500).json({ message: "Error al obtener emociones" });
    }
    res.status(200).json(results);
  });
});

// ==================== USER MANAGEMENT ENDPOINTS ====================

app.post("/api/users/create", async (req, res) => {
  const {
    rol,
    documento,
    tipoDocumento,
    nombres,
    apellidos,
    fechaNacimiento,
    correo,
    password,
  } = req.body;
  if (!documento || !nombres || !apellidos || !correo || !password || !rol) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }
  try {
    const roleMap = { aprendiz: 1, psicologo: 2, administrador: 3 };
    const idRol = roleMap[rol.toLowerCase()] || 1;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (document, doc_type, names, last_names, birth_date, email, password, id_rol, last_update) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    db.query(
      sql,
      [
        documento,
        tipoDocumento,
        nombres,
        apellidos,
        fechaNacimiento,
        correo,
        hashedPassword,
        idRol,
      ],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY")
            return res
              .status(409)
              .json({ message: "El documento o correo ya existe" });
          return res
            .status(500)
            .json({ message: "Error al crear usuario en base de datos" });
        }
        res
          .status(201)
          .json({
            message: "Usuario creado exitosamente",
            userId: result.insertId,
          });
      },
    );
  } catch (error) {
    console.error("Error servidor al crear usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.get("/api/users/search/:document", (req, res) => {
  const { document } = req.params;
  const sql = `
        SELECT u.*, r.nombre_rol 
        FROM users u 
        LEFT JOIN rol r ON u.id_rol = r.id_rol 
        WHERE u.document = ?
    `;

  db.query(sql, [document], (err, results) => {
    if (err) {
      console.error("Error buscando usuario:", err);
      return res.status(500).json({ message: "Error al buscar usuario" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const user = results[0];
    const rolesMapById = { 1: "aprendiz", 2: "psicologo", 3: "administrador" };
    let roleString = user.nombre_rol
      ? user.nombre_rol.toLowerCase()
      : rolesMapById[user.id_rol] || "aprendiz";

    res.status(200).json({
      id_user: user.id_user,
      document: user.document,
      tipoDocumento: user.doc_type || "",
      rol: roleString,
      nombres: user.names,
      apellidos: user.last_names,
      fechaNacimiento: user.birth_date
        ? new Date(user.birth_date).toISOString().split("T")[0]
        : "",
      correo: user.email,
    });
  });
});

app.put("/api/users/update/:id", async (req, res) => {
  const { id } = req.params;
  const {
    rol,
    documento,
    tipoDocumento,
    nombres,
    apellidos,
    fechaNacimiento,
    correo,
    password,
  } = req.body;
  try {
    const roleMap = { aprendiz: 1, psicologo: 2, administrador: 3 };
    const idRol = roleMap[rol.toLowerCase()] || 1;
    let sql = "";
    let params = [];
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      sql = `UPDATE users SET document = ?, doc_type = ?, names = ?, last_names = ?, birth_date = ?, email = ?, password = ?, id_rol = ?, last_update = NOW() WHERE id_user = ?`;
      params = [
        documento,
        tipoDocumento || null,
        nombres,
        apellidos,
        fechaNacimiento,
        correo,
        hashedPassword,
        idRol,
        id,
      ];
    } else {
      sql = `UPDATE users SET document = ?, doc_type = ?, names = ?, last_names = ?, birth_date = ?, email = ?, id_rol = ?, last_update = NOW() WHERE id_user = ?`;
      params = [
        documento,
        tipoDocumento || null,
        nombres,
        apellidos,
        fechaNacimiento,
        correo,
        idRol,
        id,
      ];
    }
    db.query(sql, params, (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error al actualizar usuario" });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Usuario no encontrado" });
      res.status(200).json({ message: "Usuario actualizado correctamente" });
    });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.delete("/api/users/delete/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM users WHERE id_user = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      if (err.code === "ER_ROW_IS_REFERENCED_2")
        return res
          .status(400)
          .json({
            message:
              "No se puede eliminar: El usuario tiene registros asociados.",
          });
      return res.status(500).json({ message: "Error al eliminar usuario" });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.status(200).json({ message: "Usuario eliminado correctamente" });
  });
});

// ==================== PASSWORD RECOVERY ENDPOINTS ====================

// Almacén temporal de tokens (en producción usar base de datos)
const resetTokens = new Map();

// Solicitar recuperación de contraseña
app.post("/api/password/forgot", (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ message: "El correo es requerido" });
  }

  // Verificar si el correo existe en la base de datos
  const sql = "SELECT id_user, email, names FROM users WHERE email = ?";
  db.query(sql, [correo], async (err, results) => {
    if (err) {
      console.error("Error buscando correo:", err);
      return res.status(500).json({ message: "Error del servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Correo no encontrado" });
    }

    const user = results[0];

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex");

    // Guardar token con expiración de 1 hora
    resetTokens.set(token, {
      userId: user.id_user,
      email: user.email,
      expiresAt: Date.now() + 3600000, // 1 hora
    });

    // Crear enlace de recuperación
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(user.email, resetLink);
      console.log(`📧 Enlace de recuperación enviado a: ${user.email}`);
      res
        .status(200)
        .json({ message: "Correo de recuperación enviado exitosamente" });
    } catch (emailError) {
      console.error("Error enviando correo:", emailError);
      res
        .status(500)
        .json({ message: "Error al enviar el correo de recuperación" });
    }
  });
});

// Restablecer contraseña con token
app.post("/api/password/reset", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token y nueva contraseña son requeridos" });
  }

  const tokenData = resetTokens.get(token);

  if (!tokenData) {
    return res.status(400).json({ message: "Token inválido o expirado" });
  }

  if (Date.now() > tokenData.expiresAt) {
    resetTokens.delete(token);
    return res.status(400).json({ message: "El token ha expirado" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const sql =
      "UPDATE users SET password = ?, last_update = NOW() WHERE id_user = ?";

    db.query(sql, [hashedPassword, tokenData.userId], (err, result) => {
      if (err) {
        console.error("Error actualizando contraseña:", err);
        return res
          .status(500)
          .json({ message: "Error al actualizar la contraseña" });
      }

      // Eliminar token usado
      resetTokens.delete(token);
      console.log(
        `✅ Contraseña actualizada para usuario ID: ${tokenData.userId}`,
      );
      res.status(200).json({ message: "Contraseña actualizada correctamente" });
    });
  } catch (error) {
    console.error("Error en reset:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Auto-migración: eliminar columna document_type si existe (se usa doc_type)
const cleanupDocumentType = () => {
  const checkSql = "SHOW COLUMNS FROM users LIKE 'document_type'";
  db.query(checkSql, (err, results) => {
    if (err) return;
    if (results.length > 0) {
      console.log("⚠️ Eliminando columna document_type duplicada...");
      db.query("ALTER TABLE users DROP COLUMN document_type", (err2) => {
        if (err2)
          console.error("❌ Error eliminando document_type:", err2.message);
        else
          console.log("✅ Columna document_type eliminada. Se usa doc_type.");
      });
    }
  });
};
cleanupDocumentType();

// ==================== AGENDA/MEETINGS ENDPOINTS ====================

const checkMeetingsTable = () => {
  // 1. Verificar colmnas
  const checkColumnsSql = "SHOW COLUMNS FROM meetings_agenda LIKE 'id_user'";
  db.query(checkColumnsSql, (err, results) => {
    if (err) return;
    if (results.length === 0) {
      console.log(
        "⚠️ Columna id_user no encontrada en meetings_agenda. Intentando agregar columnas necesarias...",
      );
      const alterSql = `
                ALTER TABLE meetings_agenda
                ADD COLUMN id_user INT NULL,
                ADD COLUMN id_professional INT NULL,
                ADD CONSTRAINT fk_meeting_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
                ADD CONSTRAINT fk_meeting_prof FOREIGN KEY (id_professional) REFERENCES users(id_user) ON DELETE CASCADE
            `;
      db.query(alterSql, (err, res) => {
        if (err)
          console.error(
            "❌ Error actualizando tabla meetings_agenda:",
            err.message,
          );
        else
          console.log(
            "✅ Tabla meetings_agenda actualizada correctamente con nuevas columnas.",
          );
      });
    }
  });

  // 2. Asegurar AUTO_INCREMENT (Fix para error de agendamiento)
  const fixAutoSql =
    "ALTER TABLE meetings_agenda MODIFY id_meetings_agenda INT(11) NOT NULL AUTO_INCREMENT";
  db.query(fixAutoSql, (err) => {
    if (err) {
      // Si ya es auto_increment o hay otro error leve, solo lo logueamos
      console.log("Info Check AutoIncrement:", err.message);
    } else {
      console.log("✅ AUTO_INCREMENT asegurado en meetings_agenda");
    }
  });
};
checkMeetingsTable();

// Auto-migración: agregar id_user a la tabla objetivos si no existe
const checkObjetivosTable = () => {
  const checkSql = "SHOW COLUMNS FROM objetivos LIKE 'id_user'";
  db.query(checkSql, (err, results) => {
    if (err) {
      console.log("Info: no se pudo verificar tabla objetivos:", err.message);
      return;
    }
    if (results.length === 0) {
      console.log(
        "⚠️ Columna id_user no encontrada en objetivos. Agregando...",
      );
      const alterSql = `
                ALTER TABLE objetivos
                ADD COLUMN id_user INT NULL,
                ADD CONSTRAINT fk_objetivo_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
            `;
      db.query(alterSql, (err2) => {
        if (err2)
          console.error("❌ Error actualizando tabla objetivos:", err2.message);
        else
          console.log("✅ Columna id_user agregada a objetivos correctamente.");
      });
    } else {
      console.log("✅ Tabla objetivos ya tiene columna id_user.");
    }
  });
};
checkObjetivosTable();

// Obtener lista de psicólogos
app.get("/api/psychologists", (req, res) => {
  const sql = "SELECT id_user, names, last_names FROM users WHERE id_rol = 2";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error obteniendo psicólogos:", err);
      return res.status(500).json({ message: "Error al obtener psicólogos" });
    }
    res.status(200).json(results);
  });
});

// Obtener agenda ocupada de un psicólogo
app.get("/api/meetings/psychologist/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT day, hour FROM meetings_agenda WHERE id_professional = ?";
  db.query(sql, [id], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error al obtener agenda" });
    res.status(200).json(results);
  });
});

// Crear una cita (Meeting)
app.post("/api/meetings", (req, res) => {
  const { userId, professionalId, day, hour, description } = req.body;
  if (!userId || !professionalId || !day || !hour) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  // Verificar disponibilidad
  const checkSql =
    "SELECT * FROM meetings_agenda WHERE id_professional = ? AND day = ? AND hour = ?";
  db.query(checkSql, [professionalId, day, hour], (err, results) => {
    if (err) {
      console.error("Error verificando disponibilidad:", err);
      return res
        .status(500)
        .json({
          message: "Error del servidor al verificar disponibilidad",
          error: err.message,
        });
    }
    if (results.length > 0)
      return res
        .status(409)
        .json({
          message: "Ese horario ya está ocupado para este profesional.",
        });

    const insertSql = `
            INSERT INTO meetings_agenda (id_user, id_professional, day, hour, descripcion, last_update)
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
    db.query(
      insertSql,
      [userId, professionalId, day, hour, description || ""],
      (err, result) => {
        if (err) {
          console.error("❌ Error al agendar cita (INSERT):", err);
          return res.status(500).json({
            message: "Error al agendar cita",
            error: err.message,
            sqlMessage: err.sqlMessage,
          });
        }
        res
          .status(200)
          .json({ message: "Cita agendada exitosamente", id: result.insertId });
      },
    );
  });
});

// Obtener historial de citas de un usuario (aprendiz)
app.get("/api/meetings/user/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
        SELECT 
            m.id_meetings_agenda,
            m.day,
            m.hour,
            m.descripcion,
            u.names as prof_names,
            u.last_names as prof_last_names
        FROM meetings_agenda m
        LEFT JOIN users u ON m.id_professional = u.id_user
        WHERE m.id_user = ?
        ORDER BY m.day DESC, m.hour ASC
    `;
  db.query(sql, [id], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error al obtener historial" });
    res.status(200).json(results);
  });
});

// Obtener historial de citas para el psicólogo (donde él es el profesional)
app.get("/api/meetings/professional-history/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
        SELECT 
            m.id_meetings_agenda,
            m.day,
            m.hour,
            m.descripcion,
            u.names as apprentice_names,
            u.last_names as apprentice_last_names,
            u.document as apprentice_document
        FROM meetings_agenda m
        LEFT JOIN users u ON m.id_user = u.id_user
        WHERE m.id_professional = ?
        ORDER BY m.day DESC, m.hour ASC
    `;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error obteniendo historial del profesional:", err);
      return res.status(500).json({ message: "Error al obtener historial" });
    }
    res.status(200).json(results);
  });
});

// Obtener aprendices que tienen emociones registradas
app.get("/api/psychologist/apprentices-with-emotions", (req, res) => {
  const sql = `
        SELECT 
            u.id_user as id, 
            CONCAT(u.names, ' ', u.last_names) as nombre, 
            u.document as documento
        FROM users u
        WHERE u.id_rol = 1 AND EXISTS (
            SELECT 1 FROM diary d 
            JOIN diary_entries de ON d.id_diary = de.id_diary 
            WHERE d.id_user = u.id_user
        )
    `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error obteniendo aprendices con emociones:", err);
      return res.status(500).json({ message: "Error al obtener aprendices" });
    }

    const sqlEmotions = `
            SELECT 
                d.id_user,
                e.emot_estado,
                de.entry_date
            FROM diary_entries de
            JOIN diary d ON de.id_diary = d.id_diary
            JOIN emotions e ON de.id_emotions = e.id_emotions
            ORDER BY de.entry_date ASC
        `;
    db.query(sqlEmotions, (err2, emotionResults) => {
      if (err2)
        return res
          .status(500)
          .json({ message: "Error al obtener emociones" });

      const usersData = results.map((user) => {
        const userEmociones = emotionResults.filter(
          (e) => e.id_user === user.id
        );

        const ultimaEmocionObj = userEmociones[userEmociones.length - 1];
        const ultima = ultimaEmocionObj
          ? ultimaEmocionObj.emot_estado
          : "N/D";
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

      res.status(200).json(usersData);
    });
  });
});

// ==================== PSYCHOBOT AI ENDPOINTS ====================

// Instanciar IA. Se requiere que el usuario cambie 'API_KEY_AQUI' por su key de Google Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAX5S6gHr3IiBnLfnM-UQYhWW3DMrroXG0"; 
let ai;
try {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
} catch (error) {
    console.error("Error al inicializar la IA de Gemini:", error.message);
}

// Auto-crear tabla de sesiones del bot
const checkPsychobotSessionsTable = () => {
    const createSessionsSql = `
        CREATE TABLE IF NOT EXISTS psychobot_sessions (
            id_session INT AUTO_INCREMENT PRIMARY KEY,
            id_user INT NOT NULL,
            title VARCHAR(255) DEFAULT 'Nueva Conversación',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
        )
    `;
    db.query(createSessionsSql, (err) => {
        if (err) console.error("❌ Error creando tabla psychobot_sessions:", err.message);
        else console.log("✅ Tabla psychobot_sessions lista.");
    });
};
checkPsychobotSessionsTable();

// Auto-crear tabla de historial del bot (Actualizada con id_session)
const checkPsychobotTable = () => {
    const createTableSql = `
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
    `;
    db.query(createTableSql, (err) => {
        if (err) {
            console.error("❌ Error creando tabla psychobot_chats:", err.message);
        } else {
            console.log("✅ Tabla psychobot_chats lista.");
            // Migración: Asegurar que id_session existe si la tabla ya existía
            db.query("SHOW COLUMNS FROM psychobot_chats LIKE 'id_session'", (errCol, results) => {
                if (!errCol && results.length === 0) {
                    console.log("⚠️ Agregando columna id_session a psychobot_chats...");
                    db.query("ALTER TABLE psychobot_chats ADD COLUMN id_session INT NULL", (errAlt) => {
                        if (!errAlt) {
                            db.query("ALTER TABLE psychobot_chats ADD CONSTRAINT fk_chat_session FOREIGN KEY (id_session) REFERENCES psychobot_sessions(id_session) ON DELETE CASCADE");
                        }
                    });
                }
            });
        }
    });
};
checkPsychobotTable();

// Auto-crear tabla de memoria a largo plazo
const checkPsychobotMemoryTable = () => {
    const createMemorySql = `
        CREATE TABLE IF NOT EXISTS psychobot_memory (
            id_memory INT AUTO_INCREMENT PRIMARY KEY,
            id_user INT NOT NULL,
            fact TEXT NOT NULL,
            importance INT DEFAULT 1,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
        )
    `;
    db.query(createMemorySql, (err) => {
        if (err) console.error("❌ Error creando tabla psychobot_memory:", err.message);
        else console.log("✅ Tabla psychobot_memory lista.");
    });
};
checkPsychobotMemoryTable();

// Auto-crear tabla de alertas para psicólogos
const checkPsychologistAlertsTable = () => {
    const createAlertsSql = `
        CREATE TABLE IF NOT EXISTS psychologist_alerts (
            id_alert INT AUTO_INCREMENT PRIMARY KEY,
            id_user INT NOT NULL,
            motivo TEXT NOT NULL,
            leido BOOLEAN DEFAULT FALSE,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
        )
    `;
    db.query(createAlertsSql, (err) => {
        if (err) console.error("❌ Error creando tabla psychologist_alerts:", err.message);
        else console.log("✅ Tabla psychologist_alerts lista.");
    });
};
checkPsychologistAlertsTable();

// 1. Obtener lista de sesiones para un usuario
app.get("/api/psychobot/sessions/:userId", (req, res) => {
    const { userId } = req.params;
    const sql = "SELECT id_session, title, created_at FROM psychobot_sessions WHERE id_user = ? ORDER BY created_at DESC";
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Error al obtener sesiones" });
        res.status(200).json(results);
    });
});

// 2. Crear una nueva sesión
app.post("/api/psychobot/sessions", (req, res) => {
    const { userId, title } = req.body;
    const sql = "INSERT INTO psychobot_sessions (id_user, title) VALUES (?, ?)";
    db.query(sql, [userId, title || 'Nueva Conversación'], (err, result) => {
        if (err) return res.status(500).json({ message: "Error al crear sesión" });
        res.status(201).json({ id_session: result.insertId, title: title || 'Nueva Conversación' });
    });
});

// 3. Borrar una sesión
app.delete("/api/psychobot/sessions/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM psychobot_sessions WHERE id_session = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: "Error al borrar sesión" });
        res.status(200).json({ message: "Sesión eliminada" });
    });
});

// 4. Obtener historial de una sesión específica
app.get("/api/psychobot/history/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const sql = "SELECT role, message as text FROM psychobot_chats WHERE id_session = ? ORDER BY timestamp ASC";
    db.query(sql, [sessionId], (err, results) => {
        if (err) return res.status(500).json({ message: "Error al obtener historial" });
        res.status(200).json(results.map(row => ({ type: row.role, text: row.text })));
    });
});

// 5. Enviar mensaje e interactuar con IA
app.post("/api/psychobot/chat", async (req, res) => {
    const { userId, message, id_session } = req.body;
    if (!userId || !message) {
        return res.status(400).json({ message: "userId y message son requeridos" });
    }

    // ── Asegurar que existe una sesión activa ──────────────────────────────
    const ensureSession = (cb) => {
        if (id_session) return cb(id_session);
        db.query(
            "SELECT id_session FROM psychobot_sessions WHERE id_user = ? ORDER BY created_at DESC LIMIT 1",
            [userId],
            (err, results) => {
                if (!err && results.length > 0) {
                    cb(results[0].id_session);
                } else {
                    db.query(
                        "INSERT INTO psychobot_sessions (id_user, title) VALUES (?, ?)",
                        [userId, message.substring(0, 30) + '...'],
                        (errI, resI) => { if (!errI) cb(resI.insertId); }
                    );
                }
            }
        );
    };

    ensureSession(async (activeSessionId) => {
        // Guardar mensaje del usuario
        db.query(
            "INSERT INTO psychobot_chats (id_user, id_session, role, message) VALUES (?, ?, 'user', ?)",
            [userId, activeSessionId, message],
            (err) => { if (err) console.error("Error guardando mensaje de usuario:", err); }
        );

        try {
            // ── Guardia: API Key no configurada ───────────────────────────
            if (!ai || GEMINI_API_KEY === "API_KEY_AQUI") {
                const fallback = "Configuración de IA pendiente.";
                db.query("INSERT INTO psychobot_chats (id_user, id_session, role, message) VALUES (?, ?, 'bot', ?)", [userId, activeSessionId, fallback]);
                return res.status(200).json({ type: 'bot', text: fallback });
            }

            // ── Helper para promisificar db.query ─────────────────────────
            const dbQuery = (sql, params) => new Promise((resolve) => {
                db.query(sql, params, (err, rows) => resolve(err ? [] : rows));
            });

            // ── Obtener contexto en paralelo (más rápido) ─────────────────
            const diarySql = `
                SELECT de.description, e.emot_name, de.entry_date
                FROM diary_entries de
                JOIN diary d ON de.id_diary = d.id_diary
                JOIN emotions e ON de.id_emotions = e.id_emotions
                WHERE d.id_user = ?
                ORDER BY de.entry_date DESC LIMIT 5
            `;
            const [userRows, memoryRows, diaryRows, historyRows] = await Promise.all([
                dbQuery("SELECT names FROM users WHERE id_user = ?", [userId]),
                dbQuery("SELECT fact FROM psychobot_memory WHERE id_user = ?", [userId]),
                dbQuery(diarySql, [userId]),
                dbQuery("SELECT role, message FROM psychobot_chats WHERE id_session = ? ORDER BY timestamp ASC LIMIT 8", [activeSessionId])
            ]);

            // ── Construir contexto para la IA ─────────────────────────────
            const userName = userRows.length > 0 ? userRows[0].names : "Usuario";

            const memoryStr = memoryRows.length > 0
                ? "\nRECUERDOS DEL USUARIO:\n" + memoryRows.map(m => `- ${m.fact}`).join("\n") + "\n"
                : "";

            const diaryStr = diaryRows.length > 0
                ? "\nDIARIO RECIENTE:\n" + diaryRows.map(d => {
                    const date = new Date(d.entry_date).toLocaleDateString();
                    return `- ${date}: ${d.emot_name}${d.description ? ' - ' + d.description : ''}`;
                }).join("\n") + "\n"
                : "";

            let contextStr = `Eres Psychobot, amigo empático y psicólogo virtual de Psychoway.
Nombre del usuario: ${userName}. Habla en español neutro. Usa emojis moderadamente 😊.
Integra lo que sabes de forma natural. Si el usuario ha estado mal, apóyalo con empatía.
${memoryStr}${diaryStr}
REGISTRO EMOCIONAL: Si el usuario expresa una emoción clara, regístrala automáticamente:
[DIARY: {"description": "<descripción real en palabras>", "emotion_name": "<Muy Feliz|Feliz|Neutral|Triste|Muy Triste>"}]
APRENDIZAJE: Para nuevos datos personales usa: [LEARN: "<dato>"]
EMERGENCIA: Solo en casos críticos usa: [ALERT: {"motivo": "..."}]

Chat reciente:
`;
            historyRows.forEach(row => {
                contextStr += `${row.role === 'user' ? 'Usuario' : 'Psychobot'}: ${row.message}\n`;
            });
            contextStr += `Usuario: ${message}\nPsychobot:`;

            // ── Llamada a Gemini con reintentos automáticos ───────────────
            const generateWithRetry = async (prompt, maxRetries = 2) => {
                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        return await ai.models.generateContent({
                            model: 'gemini-flash-latest',
                            contents: prompt,
                        });
                    } catch (retryErr) {
                        const status = retryErr.status || 0;
                        const msg = retryErr.message || '';
                        const is503 = status === 503 || msg.includes('503') || msg.includes('UNAVAILABLE');
                        const is429 = status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED');
                        if ((is503 || is429) && attempt < maxRetries) {
                            const delay = is429 ? 10000 : 3000;
                            console.log(`⚠️ Gemini ${is429 ? '429' : '503'} - Reintento ${attempt}/${maxRetries} en ${delay / 1000}s...`);
                            await new Promise(r => setTimeout(r, delay));
                        } else {
                            throw retryErr;
                        }
                    }
                }
            };

            let response;
            try {
                response = await generateWithRetry(contextStr);
            } catch (aiError) {
                console.error("Error en API de Gemini:", aiError.status || aiError.message);
                const is503 = aiError.status === 503 || (aiError.message && aiError.message.includes("503"));
                const aiErrMsg = is503
                    ? "El servicio de IA está recibiendo mucho tráfico ahora mismo. ¡Inténtalo de nuevo en un momento! 😊"
                    : "Estoy teniendo dificultades técnicas 😔. Por favor, intenta de nuevo en unos minutos.";
                db.query("INSERT INTO psychobot_chats (id_user, id_session, role, message) VALUES (?, ?, 'bot', ?)", [userId, activeSessionId, aiErrMsg]);
                return res.status(200).json({ type: 'bot', text: aiErrMsg, id_session: activeSessionId });
            }

            let botReply = response.text || "Lo siento, no pude entender tu solicitud.";

            // ── Procesar [LEARN: "..."] ───────────────────────────────────
            const learnMatch = botReply.match(/\[LEARN:\s*\"(.*?)\"\s*\]/);
            if (learnMatch) {
                db.query("INSERT INTO psychobot_memory (id_user, fact) VALUES (?, ?)", [userId, learnMatch[1]]);
                botReply = botReply.replace(/\[LEARN:\s*\".*?\"\s*\]/g, '').trim();
            }

            // ── Procesar [DIARY: {...}] ───────────────────────────────────
            const diaryMatch = botReply.match(/\[DIARY:\s*(\{.*?\})\s*\]/);
            if (diaryMatch) {
                try {
                    const diaryData = JSON.parse(diaryMatch[1]);
                    const emotionName = diaryData.emotion_name || 'Neutral';
                    console.log(`📔 Diario: Emoción='${emotionName}', Desc='${diaryData.description}'`);

                    db.query("SELECT id_emotions FROM emotions WHERE emot_name = ?", [emotionName], (errE, rE) => {
                        const insertEntry = (id_emotions) => {
                            db.query("SELECT id_diary FROM diary WHERE id_user = ?", [userId], (errD, rD) => {
                                if (errD) return;
                                const addEntry = (id_diary) => {
                                    db.query(
                                        "INSERT INTO diary_entries (id_diary, description, id_emotions, entry_date) VALUES (?, ?, ?, NOW())",
                                        [id_diary, diaryData.description, id_emotions],
                                        (errIns) => {
                                            if (errIns) console.error('❌ Error insertando en diario:', errIns);
                                            else console.log(`✅ Diario guardado (id_emotions=${id_emotions})`);
                                        }
                                    );
                                };
                                if (rD && rD.length > 0) {
                                    addEntry(rD[0].id_diary);
                                } else {
                                    db.query("INSERT INTO diary (id_user, fecha) VALUES (?, NOW())", [userId], (errI, rI) => {
                                        if (!errI) addEntry(rI.insertId);
                                    });
                                }
                            });
                        };

                        if (!errE && rE && rE.length > 0) {
                            insertEntry(rE[0].id_emotions);
                        } else {
                            const estadoMap = { 'Muy Feliz': 'Positivo', 'Feliz': 'Positivo', 'Neutral': 'Neutral', 'Triste': 'Negativo', 'Muy Triste': 'Negativo' };
                            db.query(
                                "INSERT INTO emotions (emot_name, emot_estado) VALUES (?, ?)",
                                [emotionName, estadoMap[emotionName] || 'Neutral'],
                                (errNew, rNew) => { if (!errNew) insertEntry(rNew.insertId); }
                            );
                        }
                    });
                } catch (e) {
                    console.error('❌ Error procesando DIARY tag:', e);
                }
                botReply = botReply.replace(/\[DIARY:\s*\{.*?\}\s*\]/g, '').trim();
            }

            // ── Procesar [ALERT: {...}] ───────────────────────────────────
            const alertMatch = botReply.match(/\[ALERT:\s*(\{.*?\})\s*\]/);
            if (alertMatch) {
                try {
                    const alertData = JSON.parse(alertMatch[1]);
                    db.query("INSERT INTO psychologist_alerts (id_user, motivo) VALUES (?, ?)", [userId, alertData.motivo]);
                } catch (e) {}
                botReply = botReply.replace(/\[ALERT:\s*\{.*?\}\s*\]/g, '').trim();
            }

            // ── Guardar respuesta del bot y responder ─────────────────────
            db.query("INSERT INTO psychobot_chats (id_user, id_session, role, message) VALUES (?, ?, 'bot', ?)", [userId, activeSessionId, botReply]);
            res.status(200).json({ type: 'bot', text: botReply, id_session: activeSessionId });

        } catch (error) {
            console.error("Error inesperado en Psychobot:", error);
            res.status(500).json({ type: 'bot', text: "Ocurrió un error inesperado. Por favor, recarga la página." });
        }
    });
});

// ==================== PSYCHOLOGIST ALERTS ENDPOINTS ====================

app.get("/api/psychologist/alerts", (req, res) => {
    const sql = `
        SELECT a.id_alert, a.id_user, a.motivo, a.leido, a.timestamp, 
               CONCAT(u.names, ' ', u.last_names) as aprendiz_nombre, 
               u.document
        FROM psychologist_alerts a
        JOIN users u ON a.id_user = u.id_user
        ORDER BY a.leido ASC, a.timestamp DESC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching alerts:", err);
            return res.status(500).json({ message: "Error fetching alerts" });
        }
        res.status(200).json(results);
    });
});

app.put("/api/psychologist/alerts/:id/read", (req, res) => {
    const { id } = req.params;
    db.query("UPDATE psychologist_alerts SET leido = TRUE WHERE id_alert = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: "Error updating alert" });
        res.status(200).json({ message: "Alert marked as read" });
    });
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);
