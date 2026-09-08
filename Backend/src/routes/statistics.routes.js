import { Router } from "express";
import * as ctrl from "../controllers/statistics.controller.js";
import { requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas accesibles por administrador y psicólogo
router.get("/alerts", requireRole("administrador", "psicologo"), ctrl.getAlerts);
router.get("/meetings", requireRole("administrador", "psicologo"), ctrl.getMeetings);

// Rutas exclusivas del administrador
router.get("/diary", requireRole("administrador"), ctrl.getDiary);
router.get("/psychologist-agenda/:id_professional", requireRole("administrador"), ctrl.getPsychologistAgenda);

export default router;
