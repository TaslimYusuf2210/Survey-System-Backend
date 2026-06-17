import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import {
  createAccountSchema,
  loginSchema,
} from "../validators/auth.validator.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", validate(createAccountSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/user", authenticate, authController.getMe);
router.post("/logout", authenticate, authController.logout);

export default router;
