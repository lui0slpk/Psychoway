import { Router } from "express";
import * as ctrl from "../controllers/meetings.controller.js";
import * as usersCtrl from "../controllers/users.controller.js";

const router = Router();

router.post("/", ctrl.create);
router.get("/psychologist/:id", ctrl.getByProfessional);
router.get("/user/:id", ctrl.getByUser);
router.get("/professional-history/:id", ctrl.getProfessionalHistory);
router.patch("/:id/attendance", ctrl.updateAttendance);

export default router;
