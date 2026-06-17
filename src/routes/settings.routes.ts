import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  updateSettingsSchema,
  updateAppearanceSchema,
  updateAccentSchema,
  updateThemePictureSchema,
} from "../validators/settings.validator.js";
import * as settingsController from "../controllers/settings.controller.js";

const router = Router();

router.get("/", authenticate, settingsController.getSettings);
router.put("/", authenticate, validate(updateSettingsSchema), settingsController.updateSettings);
router.put("/appearance", authenticate, validate(updateAppearanceSchema), settingsController.updateAppearance);
router.put("/accent", authenticate, validate(updateAccentSchema), settingsController.updateAccent);
router.put("/theme-picture", authenticate, validate(updateThemePictureSchema), settingsController.updateThemePicture);

export default router;
