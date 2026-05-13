import { Router } from "express";
import * as ctrl from "../controllers/psychobot.controller.js";

const router = Router();

router.get("/sessions/:userId", ctrl.getSessions);
router.post("/sessions", ctrl.createSession);
router.delete("/sessions/:id", ctrl.deleteSession);
router.get("/history/:sessionId", ctrl.getHistory);
router.post("/chat", ctrl.chat);
router.post("/weekly-summary", ctrl.weeklySummary);

export default router;
