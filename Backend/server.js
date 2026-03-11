import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const db = mysql.createConnection({
    host: "localhost",
    user: "root",       // tu usuario de MySQL
    password: "",       // tu contraseña
    database: "psychoway"  // el nombre de tu base de datos
});

db.connect((err) => {
    if (err) {
        console.error("Error conectando a la base de datos:", err);
        console.log("Asegúrate de que XAMPP/MySQL esté corriendo y la base de datos 'psychoway' exista.");
    } else {
        console.log("✅ Conectado a MySQL");
    }
});

// Ruta para registrar usuario
app.post("/register", async (req, res) => {
    const { document, names, last_names, birth_date, email, password } = req.body;

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
    INSERT INTO users (document, names, last_names, birth_date, email, password, id_rol, last_update)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

    db.query(
        sql,
        [document, names, last_names, birth_date, email, hashedPassword, 1],
        (err, result) => {
            if (err) {
                console.error("Error al registrar usuario:", err);
                return res.status(500).json({ message: "Error al registrar usuario" });
            }
            res.status(200).json({ message: "Usuario registrado correctamente" });
        }
    );
});

// Mapeo de id_rol a nombre de rol
const ROLES = {
    1: 'aprendiz',
    2: 'psicologo',
    3: 'administrador',
    '1': 'aprendiz',
    '2': 'psicologo',
    '3': 'administrador'
};

// Ruta para iniciar sesión
app.post("/login", (req, res) => {
    const { document, password } = req.body;

    // Buscar usuario por documento
    const sql = "SELECT * FROM users WHERE document = ?";
    db.query(sql, [document], async (err, results) => {
        if (err) {
            console.error("Error en consulta:", err);
            return res.status(500).json({ message: "Error en el servidor: " + err.message, error: err });
        }

        // Si no existe
        if (results.length === 0) {
            return res.status(400).json({ message: "Documento o contraseña incorrectos" });
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
            return res.status(400).json({ message: "Documento o contraseña incorrectos" });
        }

        console.log(`Usuario encontrado: ${user.document}, ID Rol: ${user.id_rol} (Tipo: ${typeof user.id_rol})`);

        // Obtener nombre del rol
        const roleName = ROLES[user.id_rol];
        if (!roleName) {
            console.warn(`⚠️ Rol no reconocido para ID ${user.id_rol}. Asignando 'aprendiz' por defecto.`);
        }
        const finalRole = roleName || 'aprendiz';

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
                rol: finalRole
            }
        });
    });
});

// ==================== DIARY ENDPOINTS ====================

// Mapeo de índices de emociones a nombres
const EMOTION_NAMES = {
    0: 'Muy Feliz',
    1: 'Feliz',
    2: 'Neutral',
    3: 'Triste',
    4: 'Muy Triste'
};

const EMOTION_STATES = {
    0: 'Positivo',
    1: 'Positivo',
    2: 'Neutral',
    3: 'Negativo',
    4: 'Negativo'
};

// Crear entrada de diario
app.post("/api/diary/entry", async (req, res) => {
    const { userId, emotionIndex, description } = req.body;

    if (!userId || emotionIndex === undefined) {
        return res.status(400).json({ message: "userId y emotionIndex son requeridos" });
    }

    try {
        // 1. Verificar/crear registro de diario para el usuario
        const checkDiarySql = "SELECT id_diary FROM diary WHERE id_user = ?";
        db.query(checkDiarySql, [userId], (err, diaryResults) => {
            if (err) {
                console.error("Error verificando diario (User ID: " + userId + "):", err);
                return res.status(500).json({ message: "Error al verificar diario.", error: err.message });
            }

            let diaryId;

            const processDiaryEntry = (dId) => {
                // 2. Verificar/crear emoción
                const emotionName = EMOTION_NAMES[emotionIndex] || 'Neutral';
                const emotionState = EMOTION_STATES[emotionIndex] || 'Neutral';

                const checkEmotionSql = "SELECT id_emotions FROM emotions WHERE emot_name = ?";
                db.query(checkEmotionSql, [emotionName], (err, emotionResults) => {
                    if (err) {
                        console.error("Error verificando emoción:", err);
                        return res.status(500).json({ message: "Error al verificar emoción", error: err.message });
                    }

                    let emotionId;

                    const createDiaryEntry = (eId, objectiveId = null) => {
                        // 3. Crear entrada de diario
                        const insertEntrySql = `
                            INSERT INTO diary_entries (id_diary, entry_date, description, id_emotions, id_objetives)
                            VALUES (?, NOW(), ?, ?, ?)
                        `;

                        db.query(insertEntrySql, [dId, description || null, eId, objectiveId], (err, result) => {
                            if (err) {
                                console.error("Error creando entrada de diario:", err);
                                return res.status(500).json({ message: "Error al crear entrada de diario", error: err.message });
                            }

                            res.status(200).json({
                                message: "Entrada de diario registrada correctamente",
                                entryId: result.insertId
                            });
                        });
                    };

                    // Buscar el último objetivo creado
                    const getLatestObjective = (callback) => {
                        const objectiveSql = "SELECT id_objetives FROM objetivos ORDER BY last_update DESC LIMIT 1";
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
                        const insertEmotionSql = "INSERT INTO emotions (emot_name, emot_estado) VALUES (?, ?)";
                        db.query(insertEmotionSql, [emotionName, emotionState], (err, result) => {
                            if (err) {
                                return res.status(500).json({ message: "Error al crear emoción", error: err.message });
                            }
                            emotionId = result.insertId;
                            getLatestObjective((objectiveId) => {
                                createDiaryEntry(emotionId, objectiveId);
                            });
                        });
                    }
                });
            };

            if (diaryResults.length > 0) {
                diaryId = diaryResults[0].id_diary;
                processDiaryEntry(diaryId);
            } else {
                // Crear nuevo diario para el usuario
                const insertDiarySql = "INSERT INTO diary (id_user, fecha) VALUES (?, CURDATE())";
                db.query(insertDiarySql, [userId], (err, result) => {
                    if (err) {
                        console.error("Error creando diario:", err);
                        return res.status(500).json({ message: "Error al crear diario", error: err.message });
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

    db.query(sql, [userId, nombre, descripcion || null, estado || 'Pendiente'], (err, result) => {
        if (err) {
            console.error("Error creando objetivo:", err);
            return res.status(500).json({ message: "Error al crear objetivo" });
        }

        res.status(200).json({
            message: "Objetivo creado correctamente",
            objectiveId: result.insertId
        });
    });
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
    const { rol, documento, nombres, apellidos, fechaNacimiento, correo, password } = req.body;
    if (!documento || !nombres || !apellidos || !correo || !password || !rol) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
    try {
        const roleMap = { 'aprendiz': 1, 'psicologo': 2, 'administrador': 3 };
        const idRol = roleMap[rol.toLowerCase()] || 1;
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `INSERT INTO users (document, names, last_names, birth_date, email, password, id_rol, last_update) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;

        db.query(sql, [documento, nombres, apellidos, fechaNacimiento, correo, hashedPassword, idRol], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: "El documento o correo ya existe" });
                return res.status(500).json({ message: "Error al crear usuario en base de datos" });
            }
            res.status(201).json({ message: "Usuario creado exitosamente", userId: result.insertId });
        });
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
        const rolesMapById = { 1: 'aprendiz', 2: 'psicologo', 3: 'administrador' };
        let roleString = user.nombre_rol ? user.nombre_rol.toLowerCase() : (rolesMapById[user.id_rol] || 'aprendiz');

        res.status(200).json({
            id_user: user.id_user,
            document: user.document,
            rol: roleString,
            nombres: user.names,
            apellidos: user.last_names,
            fechaNacimiento: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
            correo: user.email
        });
    });
});

app.post("/api/users/check-email", (req, res) => {
    const { correo } = req.body;
    
    if (!correo) {
        return res.status(400).json({ message: "El correo es requerido" });
    }

    const sql = "SELECT email FROM users WHERE email = ?";
    db.query(sql, [correo], (err, results) => {
        if (err) {
            console.error("Error verificando correo:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        if (results.length > 0) {
            // El correo existe
            return res.status(200).json({ message: "Correo encontrado", exists: true });
        } else {
            // El correo no existe
            return res.status(404).json({ message: "El correo ingresado no se encuentra registrado.", exists: false });
        }
    });
});


app.put("/api/users/update/:id", async (req, res) => {
    const { id } = req.params;
    const { rol, documento, nombres, apellidos, fechaNacimiento, correo, password } = req.body;
    try {
        const roleMap = { 'aprendiz': 1, 'psicologo': 2, 'administrador': 3 };
        const idRol = roleMap[rol.toLowerCase()] || 1;
        let sql = '';
        let params = [];
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            sql = `UPDATE users SET document = ?, names = ?, last_names = ?, birth_date = ?, email = ?, password = ?, id_rol = ?, last_update = NOW() WHERE id_user = ?`;
            params = [documento, nombres, apellidos, fechaNacimiento, correo, hashedPassword, idRol, id];
        } else {
            sql = `UPDATE users SET document = ?, names = ?, last_names = ?, birth_date = ?, email = ?, id_rol = ?, last_update = NOW() WHERE id_user = ?`;
            params = [documento, nombres, apellidos, fechaNacimiento, correo, idRol, id];
        }
        db.query(sql, params, (err, result) => {
            if (err) return res.status(500).json({ message: "Error al actualizar usuario" });
            if (result.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });
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
            if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(400).json({ message: "No se puede eliminar: El usuario tiene registros asociados." });
            return res.status(500).json({ message: "Error al eliminar usuario" });
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: "Usuario no encontrado" });
        res.status(200).json({ message: "Usuario eliminado correctamente" });
    });
});


// ==================== AGENDA/MEETINGS ENDPOINTS ====================

const checkMeetingsTable = () => {
    // 1. Verificar colmnas
    const checkColumnsSql = "SHOW COLUMNS FROM meetings_agenda LIKE 'id_user'";
    db.query(checkColumnsSql, (err, results) => {
        if (err) return;
        if (results.length === 0) {
            console.log("⚠️ Columna id_user no encontrada en meetings_agenda. Intentando agregar columnas necesarias...");
            const alterSql = `
                ALTER TABLE meetings_agenda
                ADD COLUMN id_user INT NULL,
                ADD COLUMN id_professional INT NULL,
                ADD CONSTRAINT fk_meeting_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
                ADD CONSTRAINT fk_meeting_prof FOREIGN KEY (id_professional) REFERENCES users(id_user) ON DELETE CASCADE
            `;
            db.query(alterSql, (err, res) => {
                if (err) console.error("❌ Error actualizando tabla meetings_agenda:", err.message);
                else console.log("✅ Tabla meetings_agenda actualizada correctamente con nuevas columnas.");
            });
        }
    });

    // 2. Asegurar AUTO_INCREMENT (Fix para error de agendamiento)
    const fixAutoSql = "ALTER TABLE meetings_agenda MODIFY id_meetings_agenda INT(11) NOT NULL AUTO_INCREMENT";
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
            console.log("⚠️ Columna id_user no encontrada en objetivos. Agregando...");
            const alterSql = `
                ALTER TABLE objetivos
                ADD COLUMN id_user INT NULL,
                ADD CONSTRAINT fk_objetivo_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
            `;
            db.query(alterSql, (err2) => {
                if (err2) console.error("❌ Error actualizando tabla objetivos:", err2.message);
                else console.log("✅ Columna id_user agregada a objetivos correctamente.");
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
        if (err) return res.status(500).json({ message: "Error al obtener agenda" });
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
    const checkSql = "SELECT * FROM meetings_agenda WHERE id_professional = ? AND day = ? AND hour = ?";
    db.query(checkSql, [professionalId, day, hour], (err, results) => {
        if (err) {
            console.error("Error verificando disponibilidad:", err);
            return res.status(500).json({ message: "Error del servidor al verificar disponibilidad", error: err.message });
        }
        if (results.length > 0) return res.status(409).json({ message: "Ese horario ya está ocupado para este profesional." });

        const insertSql = `
            INSERT INTO meetings_agenda (id_user, id_professional, day, hour, descripcion, last_update)
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        db.query(insertSql, [userId, professionalId, day, hour, description || ''], (err, result) => {
            if (err) {
                console.error("❌ Error al agendar cita (INSERT):", err);
                return res.status(500).json({
                    message: "Error al agendar cita",
                    error: err.message,
                    sqlMessage: err.sqlMessage
                });
            }
            res.status(200).json({ message: "Cita agendada exitosamente", id: result.insertId });
        });
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
        if (err) return res.status(500).json({ message: "Error al obtener historial" });
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


const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));