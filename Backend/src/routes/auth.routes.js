import { Router } from "express";
import * as ctrl from "../controllers/auth.controller.js";

const router = Router();

// Rutas públicas (sin /api prefix — no requieren JWT)
router.post("/register", ctrl.register);
router.post("/login", ctrl.login);

// Ruta protegida (con /api prefix — requiere JWT via middleware en index)
// Se monta en /api/auth/verify
router.get("/auth/verify", ctrl.verify);

// Rutas de password (bajo /api pero marcadas como públicas en el middleware)
router.post("/password/forgot", ctrl.forgotPassword);
router.post("/password/reset", ctrl.resetPassword);

export default router;
