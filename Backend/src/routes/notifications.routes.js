import { Router } from "express";
import * as ctrl from "../controllers/notifications.controller.js";

const router = Router();

router.get("/:userId", ctrl.getByUser);
router.put("/:id/read", ctrl.markAsRead);
router.post("/check-in", ctrl.checkIn);

export default router;
