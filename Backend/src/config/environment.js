import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Busca .env en la raíz del monorepo (3 niveles arriba de Backend/src/config/)
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET no está definido en las variables de entorno.");
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_DB_URL) {
  throw new Error("FATAL: SUPABASE_URL y SUPABASE_DB_URL deben estar definidos en .env");
}
const env = {
  // Servidor
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Supabase / PostgreSQL
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_DB_URL: process.env.SUPABASE_DB_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "psychoway_secret_key_2024_s3cur3",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "8h",

  // Google Gemini AI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "API_KEY_AQUI",

  // Email
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 465,
  EMAIL_SECURE: process.env.EMAIL_SECURE === "true",
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",
  EMAIL_FROM: process.env.EMAIL_FROM || '"Psychoway" <psychowaysena@gmail.com>',

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};

export default env;
