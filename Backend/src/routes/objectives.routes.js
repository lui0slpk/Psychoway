import { Router } from "express";
import * as ctrl from "../controllers/objectives.controller.js";

const router = Router();

router.post("/", ctrl.create);
router.get("/:userId", ctrl.getByUser);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;
