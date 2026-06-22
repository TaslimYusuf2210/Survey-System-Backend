import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  updateAppearanceAccentSchema,
  updateThemePictureSchema,
} from "../validators/settings.validator.js";
import * as settingsController from "../controllers/settings.controller.js";

const router = Router();

router.get("/", authenticate, settingsController.getSettings);
router.put("/appearance-accent", authenticate, validate(updateAppearanceAccentSchema), settingsController.updateAppearanceAccent);
router.put("/theme-picture", authenticate, validate(updateThemePictureSchema), settingsController.updateThemePicture);

export default router;
