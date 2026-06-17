import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  updateSectionSchema,
  reorderSectionsSchema,
  createQuestionSchema,
  updateQuestionSchema,
  reorderQuestionsSchema,
  createOptionSchema,
  updateOptionSchema,
} from "../validators/survey.validator.js";
import * as sectionController from "../controllers/section.controller.js";

const router = Router();

// ─── Sections ───────────────────────────────────────────
router.put("/:id", authenticate, validate(updateSectionSchema), sectionController.updateSection);
router.delete("/:id", authenticate, sectionController.deleteSection);
router.put("/reorder", authenticate, validate(reorderSectionsSchema), sectionController.reorderSections);

// ─── Questions ──────────────────────────────────────────
router.post("/:id/questions", authenticate, validate(createQuestionSchema), sectionController.createQuestion);

export default router;
