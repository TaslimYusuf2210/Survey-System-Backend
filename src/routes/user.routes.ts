import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { updateUsernameSchema, updateAvatarSchema } from "../validators/user.validator.js";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.get("/me", authenticate, userController.getProfile);
router.put("/me/username", authenticate, validate(updateUsernameSchema), userController.updateUsername);
router.put("/me/avatar", authenticate, validate(updateAvatarSchema), userController.updateAvatar);
router.delete("/me", authenticate, userController.deleteAccount);
router.get("/:id", authenticate, userController.getUserById);

export default router;
