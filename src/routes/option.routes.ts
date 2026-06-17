import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { updateOptionSchema } from "../validators/survey.validator.js";
import * as sectionController from "../controllers/section.controller.js";

const router = Router();

router.put("/:id", authenticate, validate(updateOptionSchema), sectionController.updateOption);
router.delete("/:id", authenticate, sectionController.deleteOption);

export default router;
