-- ============================================================
-- PSYCHOWAY — SCHEMA CANÓNICO ÚNICO PARA SUPABASE (POSTGRESQL)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
--
-- Este script es IDEMPOTENTE: se puede ejecutar varias veces sobre
-- una base nueva o existente sin romperla.
--   • CREATE TABLE IF NOT EXISTS para las 12 tablas activas.
--   • Bloques DO $$ que verifican pg_constraint antes de agregar
--     UNIQUE y FKs con ON DELETE CASCADE (re-ejecutables).
--   • Datos semilla con ON CONFLICT DO NOTHING + setval de secuencias.
--   • RLS deshabilitado (el backend usa Service Role Key que omite RLS).
-- ============================================================

-- 1. Tabla de roles
CREATE TABLE IF NOT EXISTS rol (
  id_rol      SERIAL PRIMARY KEY,
  nombre_rol  VARCHAR(45) DEFAULT NULL
);

-- 2. Tabla de usuarios
--    email y document NO llevan UNIQUE inline: se agregan al final de
--    forma idempotente (no debe romper sobre una BD con datos duplicados).
CREATE TABLE IF NOT EXISTS users (
  id_user             SERIAL PRIMARY KEY,
  document            VARCHAR(15)  NOT NULL,
  doc_type            VARCHAR(45)  NOT NULL,
  names               VARCHAR(45)  NOT NULL,
  last_names          VARCHAR(45)  NOT NULL,
  birth_date          DATE,
  email               VARCHAR(100) NOT NULL,
  password            VARCHAR(255) NOT NULL,
  contact_number      VARCHAR(20) DEFAULT NULL,
  landline_number     VARCHAR(20) DEFAULT NULL,
  training_program    VARCHAR(255) DEFAULT NULL,
  ficha_number        VARCHAR(50) DEFAULT NULL,
  id_rol              INT          NOT NULL REFERENCES rol(id_rol),
  profile_photo       TEXT,
  reset_token         VARCHAR(255),
  reset_token_expires TIMESTAMP,
  last_update         TIMESTAMP DEFAULT NOW()
);

-- UNIQUE idempotente para users.email.
-- Si existen correos duplicados, avisa con RAISE NOTICE y omite la constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_email_key' AND conrelid = 'users'::regclass
  ) THEN
    IF EXISTS (SELECT 1 FROM users GROUP BY email HAVING COUNT(*) > 1) THEN
      RAISE NOTICE 'Se omitió users_email_key: existen correos duplicados en users.';
    ELSE
      ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;
  END IF;
END $$;

-- UNIQUE idempotente para users.document.
-- Si existen documentos duplicados, avisa con RAISE NOTICE y omite la constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_document_key' AND conrelid = 'users'::regclass
  ) THEN
    IF EXISTS (SELECT 1 FROM users GROUP BY document HAVING COUNT(*) > 1) THEN
      RAISE NOTICE 'Se omitió users_document_key: existen documentos duplicados en users.';
    ELSE
      ALTER TABLE users ADD CONSTRAINT users_document_key UNIQUE (document);
    END IF;
  END IF;
END $$;

-- 3. Tabla diary
CREATE TABLE IF NOT EXISTS diary (
  id_diary          SERIAL PRIMARY KEY,
  id_user           INT DEFAULT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  fecha             DATE DEFAULT NULL,
  last_update       TIMESTAMP DEFAULT NOW(),
  diary_visibility  VARCHAR(20) DEFAULT 'yo-psicologo'
);

-- 4. Tabla emotions
CREATE TABLE IF NOT EXISTS emotions (
  id_emotions  SERIAL PRIMARY KEY,
  emot_name    VARCHAR(45) DEFAULT NULL,
  emot_estado  VARCHAR(45) DEFAULT NULL,
  last_update  TIMESTAMP DEFAULT NOW()
);

-- 5. Tabla objetivos
CREATE TABLE IF NOT EXISTS objetivos (
  id_objetives      SERIAL PRIMARY KEY,
  nombre_objetivo   VARCHAR(45)  DEFAULT NULL,
  descripcion       VARCHAR(255) DEFAULT NULL,
  estado            VARCHAR(45)  DEFAULT NULL,
  last_update       TIMESTAMP    DEFAULT NOW(),
  id_user           INT          DEFAULT NULL REFERENCES users(id_user) ON DELETE CASCADE
);

-- 6. Tabla diary_entries
CREATE TABLE IF NOT EXISTS diary_entries (
  id_diary_entries SERIAL PRIMARY KEY,
  id_diary         INT DEFAULT NULL REFERENCES diary(id_diary) ON DELETE CASCADE,
  entry_date       TIMESTAMP DEFAULT NULL,
  description      VARCHAR(255) DEFAULT NULL,
  id_emotions      INT DEFAULT NULL REFERENCES emotions(id_emotions) ON DELETE SET NULL,
  id_objetives     INT DEFAULT NULL REFERENCES objetivos(id_objetives),
  last_update      TIMESTAMP DEFAULT NOW()
);

-- Asegurar ON DELETE CASCADE en diary.id_user (re-ejecutable).
-- Si la constraint ya existe (aunque sea sin CASCADE, como en BDs viejas),
-- la elimina y la recrea con CASCADE.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'diary_id_user_fkey' AND conrelid = 'diary'::regclass
  ) THEN
    ALTER TABLE diary DROP CONSTRAINT diary_id_user_fkey;
  END IF;
  ALTER TABLE diary
    ADD CONSTRAINT diary_id_user_fkey
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE;
END $$;

-- Asegurar ON DELETE CASCADE en diary_entries.id_diary (re-ejecutable).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'diary_entries_id_diary_fkey' AND conrelid = 'diary_entries'::regclass
  ) THEN
    ALTER TABLE diary_entries DROP CONSTRAINT diary_entries_id_diary_fkey;
  END IF;
  ALTER TABLE diary_entries
    ADD CONSTRAINT diary_entries_id_diary_fkey
    FOREIGN KEY (id_diary) REFERENCES diary(id_diary) ON DELETE CASCADE;
END $$;

-- 7. Tabla meetings_agenda
CREATE TABLE IF NOT EXISTS meetings_agenda (
  id_meetings_agenda SERIAL PRIMARY KEY,
  day                VARCHAR(45)  DEFAULT NULL,
  hour               TIME         DEFAULT NULL,
  descripcion        VARCHAR(255) DEFAULT NULL,
  last_update        TIMESTAMP    DEFAULT NOW(),
  id_user            INT          DEFAULT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  id_professional    INT          DEFAULT NULL REFERENCES users(id_user) ON DELETE CASCADE
);

-- 8. Tabla psychobot_sessions
CREATE TABLE IF NOT EXISTS psychobot_sessions (
  id_session SERIAL PRIMARY KEY,
  id_user    INT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  title      VARCHAR(255) DEFAULT 'Nueva Conversación',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Tabla psychobot_chats
CREATE TABLE IF NOT EXISTS psychobot_chats (
  id_chat    SERIAL PRIMARY KEY,
  id_user    INT  NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  id_session INT  DEFAULT NULL REFERENCES psychobot_sessions(id_session) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'bot')),
  message    TEXT NOT NULL,
  timestamp  TIMESTAMP DEFAULT NOW()
);

-- 10. Tabla psychobot_memory
CREATE TABLE IF NOT EXISTS psychobot_memory (
  id_memory  SERIAL PRIMARY KEY,
  id_user    INT  NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  fact       TEXT NOT NULL,
  importance INT  DEFAULT 1,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 11. Tabla psychologist_alerts
CREATE TABLE IF NOT EXISTS psychologist_alerts (
  id_alert  SERIAL PRIMARY KEY,
  id_user   INT  NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  motivo    TEXT NOT NULL,
  leido     BOOLEAN   DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- 12. Tabla notifications
CREATE TABLE IF NOT EXISTS notifications (
  id_notification SERIAL PRIMARY KEY,
  id_user         INT         NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  type            VARCHAR(50) DEFAULT 'info',
  message         TEXT        NOT NULL,
  link            VARCHAR(255) DEFAULT NULL,
  is_read         BOOLEAN     DEFAULT FALSE,
  created_at      TIMESTAMP   DEFAULT NOW()
);

-- ============================================================
-- DATOS SEMILLA
-- ============================================================

-- Roles
INSERT INTO rol (id_rol, nombre_rol) VALUES
(1, 'Aprendiz'),
(2, 'Psicologo'),
(3, 'Administrador')
ON CONFLICT (id_rol) DO NOTHING;

-- Sincronizar secuencia de rol
SELECT setval('rol_id_rol_seq', (SELECT MAX(id_rol) FROM rol));

-- Emociones
INSERT INTO emotions (id_emotions, emot_name, emot_estado) VALUES
(1, 'Muy Feliz', 'Positivo'),
(2, 'Muy Triste', 'Negativo'),
(3, 'Neutral', 'Neutral'),
(4, 'Feliz', 'Positivo'),
(6, 'Triste', 'Negativo')
ON CONFLICT (id_emotions) DO NOTHING;

SELECT setval('emotions_id_emotions_seq', (SELECT MAX(id_emotions) FROM emotions));

-- Usuarios de prueba (password: "12345678" hasheada con bcrypt)
INSERT INTO users (id_user, document, doc_type, names, last_names, birth_date, email, password, id_rol) VALUES
(1, '323456789', 'CC', 'Admin',     'Administrador', '2025-12-11', 'Admin@Admin.com',             '$2b$10$Urmo4wA2FCkteiJA449sc.AIjMXRwn4PHtcRTDS7BliJrwgBvhGEG', 3),
(2, '223456789', 'CC', 'Psicólogo', 'Psicólogo',     '2025-12-11', 'psicologo@psicologo.com',     '$2b$10$Urmo4wA2FCkteiJA449sc.AIjMXRwn4PHtcRTDS7BliJrwgBvhGEG', 2),
(3, '123456789', 'CC', 'Aprendiz',  'Aprendiz',      '2025-12-11', 'Aprendiz@Aprendiz.com',       '$2b$10$Urmo4wA2FCkteiJA449sc.AIjMXRwn4PHtcRTDS7BliJrwgBvhGEG', 1),
(4, '987654321', 'CC', 'Luis',      'Zapata',        '2026-04-11', 'itslucky535@gmail.com',       '$2b$10$UOVlkFlObzfRIHwuWubh7eKnlw.f.a56vxTCcn4WEqgQBd9HG8gPy', 1)
ON CONFLICT (id_user) DO NOTHING;

SELECT setval('users_id_user_seq', (SELECT MAX(id_user) FROM users));

-- ============================================================
-- Row Level Security (RLS) - DESHABILITADO
-- El backend usa Service Role Key que omite RLS.
-- ============================================================
ALTER TABLE rol                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE users               DISABLE ROW LEVEL SECURITY;
ALTER TABLE diary               DISABLE ROW LEVEL SECURITY;
ALTER TABLE emotions            DISABLE ROW LEVEL SECURITY;
ALTER TABLE objetivos           DISABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries       DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings_agenda     DISABLE ROW LEVEL SECURITY;
ALTER TABLE psychobot_sessions  DISABLE ROW LEVEL SECURITY;
ALTER TABLE psychobot_chats     DISABLE ROW LEVEL SECURITY;
ALTER TABLE psychobot_memory    DISABLE ROW LEVEL SECURITY;
ALTER TABLE psychologist_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       DISABLE ROW LEVEL SECURITY;
