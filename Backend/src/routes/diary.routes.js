import { Router } from "express";
import * as ctrl from "../controllers/diary.controller.js";

const router = Router();

router.post("/entry", ctrl.createEntry);
router.get("/entries/:userId", ctrl.getEntries);

export default router;
