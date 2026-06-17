import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.get("/me", authenticate, userController.getProfile);
router.put("/me", authenticate, userController.updateProfile);
router.delete("/me", authenticate, userController.deleteAccount);
router.get("/:id", authenticate, userController.getUserById);

export default router;
