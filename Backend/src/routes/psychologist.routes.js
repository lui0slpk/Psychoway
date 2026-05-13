import { Router } from "express";
import * as ctrl from "../controllers/alerts.controller.js";
import * as trackingCtrl from "../controllers/tracking.controller.js";

const router = Router();

router.get("/alerts", ctrl.getAll);
router.put("/alerts/:id/read", ctrl.markAsRead);
router.get("/apprentices-with-emotions", trackingCtrl.getApprenticesWithEmotions);

export default router;
