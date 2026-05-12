import dotenv from "dotenv";
dotenv.config();

const env = {
  // Servidor
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Base de Datos
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "psychoway",

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
