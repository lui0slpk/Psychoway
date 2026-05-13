import { Router } from "express";
import * as ctrl from "../controllers/emotions.controller.js";

const router = Router();

router.get("/", ctrl.getAll);

export default router;
