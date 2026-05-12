import express from "express";
import cors from "cors";
import env from "./src/config/environment.js";
import { testConnection } from "./src/config/database.js";
import { runMigrations } from "./src/config/migrations.js";
import routes from "./src/routes/index.js";
import { errorHandler } from "./src/middlewares/error.middleware.js";

const app = express();

// ==================== GLOBAL MIDDLEWARE ====================
app.use(cors());
app.use(express.json());

// ==================== ROUTES ====================
app.use(routes);

// ==================== ERROR HANDLER (debe ser el último middleware) ====================
app.use(errorHandler);

// ==================== START SERVER ====================
async function start() {
  const dbOk = await testConnection();

  if (dbOk) {
    await runMigrations();
  }

  app.listen(env.PORT, () =>
    console.log(`🚀 Servidor corriendo en http://localhost:${env.PORT}`),
  );
}

start();
