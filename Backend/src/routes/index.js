import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import * as authCtrl from "../controllers/auth.controller.js";
import * as usersCtrl from "../controllers/users.controller.js";

import diaryRoutes from "./diary.routes.js";
import objectivesRoutes from "./objectives.routes.js";
import emotionsRoutes from "./emotions.routes.js";
import usersRoutes from "./users.routes.js";
import meetingsRoutes from "./meetings.routes.js";
import psychobotRoutes from "./psychobot.routes.js";
import psychologistRoutes from "./psychologist.routes.js";
import notificationsRoutes from "./notifications.routes.js";
import statisticsRoutes from "./statistics.routes.js";

const router = Router();

// ==================== RUTAS PÚBLICAS (sin JWT) ====================
router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);

// Password recovery — públicas, definidas ANTES del middleware JWT
router.post("/api/password/forgot", authCtrl.forgotPassword);
router.post("/api/password/reset", authCtrl.resetPassword);

// ==================== MIDDLEWARE JWT para /api/* ====================
router.use("/api", authMiddleware);

// ==================== RUTAS PROTEGIDAS (con JWT) ====================
// Auth
router.get("/api/auth/verify", authCtrl.verify);

// Diary
router.use("/api/diary", diaryRoutes);

// Objectives
router.use("/api/objectives", objectivesRoutes);

// Emotions
router.use("/api/emotions", emotionsRoutes);

// Users (admin CRUD + privacy)
router.use("/api/users", usersRoutes);

// Psychologists list
router.get("/api/psychologists", usersCtrl.getPsychologists);

// Meetings
router.use("/api/meetings", meetingsRoutes);

// Psychobot
router.use("/api/psychobot", psychobotRoutes);

// Psychologist (alerts + tracking)
router.use("/api/psychologist", psychologistRoutes);

// Notifications
router.use("/api/notifications", notificationsRoutes);

// Estadísticas y dashboard
router.use("/api/statistics", statisticsRoutes);

export default router;
