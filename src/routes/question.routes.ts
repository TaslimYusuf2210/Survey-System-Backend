import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  updateQuestionSchema,
  reorderQuestionsSchema,
  createOptionSchema,
  updateOptionSchema,
} from "../validators/survey.validator.js";
import * as sectionController from "../controllers/section.controller.js";

const router = Router();

router.put("/:id", authenticate, validate(updateQuestionSchema), sectionController.updateQuestion);
router.delete("/:id", authenticate, sectionController.deleteQuestion);
router.put("/reorder", authenticate, validate(reorderQuestionsSchema), sectionController.reorderQuestions);

// ─── Options ────────────────────────────────────────────
router.post("/:id/options", authenticate, validate(createOptionSchema), sectionController.createOption);

export default router;
