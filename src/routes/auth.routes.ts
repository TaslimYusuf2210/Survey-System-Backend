import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import {
  createAccountSchema,
  loginSchema,
  updatePasswordSchema,
} from "../validators/auth.validator.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", validate(createAccountSchema), authController.register);
router.post("/register", validate(createAccountSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/google", authController.login); // Placeholder - real Google OAuth to be implemented
router.post("/refresh", authenticate, authController.getMe); // Placeholder - real refresh logic to be implemented
router.get("/me", authenticate, authController.getMe);
router.get("/user", authenticate, authController.getMe);
router.post("/logout", authenticate, authController.logout);
router.put("/password", authenticate, validate(updatePasswordSchema), authController.updatePassword);

export default router;
