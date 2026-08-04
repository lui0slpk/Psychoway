import { Router } from "express";
import * as ctrl from "../controllers/users.controller.js";
import * as diaryCtrl from "../controllers/diary.controller.js";
import { requireAdmin, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create", requireAdmin, ctrl.create);
router.get("/search/:document", requireRole("administrador", "psicologo"), ctrl.search);
router.put("/update/:id", requireAdmin, ctrl.update);
router.delete("/delete/:id", requireAdmin, ctrl.remove);
router.get("/privacy/:userId", diaryCtrl.getPrivacy);
router.put("/privacy/:userId", diaryCtrl.updatePrivacy);

// Rutas de perfil (auto-gestión del usuario)
router.get("/profile/:id", ctrl.getProfile);
router.put("/profile/:id", ctrl.updateProfile);
router.put("/profile/:id/photo", ctrl.updateProfilePhoto);
router.get("/profile/:id/photo", ctrl.getProfilePhoto);

export default router;
