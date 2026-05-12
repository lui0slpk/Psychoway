import { Router } from "express";
import * as ctrl from "../controllers/users.controller.js";
import * as diaryCtrl from "../controllers/diary.controller.js";

const router = Router();

router.post("/create", ctrl.create);
router.get("/search/:document", ctrl.search);
router.put("/update/:id", ctrl.update);
router.delete("/delete/:id", ctrl.remove);
router.get("/privacy/:userId", diaryCtrl.getPrivacy);
router.put("/privacy/:userId", diaryCtrl.updatePrivacy);

export default router;
