import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createSurveySchema,
  updateSurveySchema,
  updateStatusSchema,
  createSectionSchema,
  publishSurveySchema,
  submitResponseSchema,
} from "../validators/survey.validator.js";
import * as surveyController from "../controllers/survey.controller.js";
import * as sectionController from "../controllers/section.controller.js";
import * as responseController from "../controllers/response.controller.js";
import * as participantController from "../controllers/participant.controller.js";
import * as dashboardController from "../controllers/dashboard.controller.js";

const router = Router();

// ─── Survey CRUD ─────────────────────────────────────────
router.get("/", authenticate, surveyController.listSurveys);
router.post("/", authenticate, validate(createSurveySchema), surveyController.createSurvey);
router.get("/:id", authenticate, surveyController.getSurveyDetail);
router.put("/:id", authenticate, validate(updateSurveySchema), surveyController.updateSurvey);
router.delete("/:id", authenticate, surveyController.deleteSurvey);
router.patch("/:id/status", authenticate, validate(updateStatusSchema), surveyController.updateStatus);
router.post("/:id/duplicate", authenticate, surveyController.duplicateSurvey);

// ─── Publish (Bulk Create) ──────────────────────────────
router.post("/:id/publish", authenticate, validate(publishSurveySchema), surveyController.publishSurvey);

// ─── Sections ───────────────────────────────────────────
router.post("/:id/sections", authenticate, validate(createSectionSchema), sectionController.createSection);

// ─── Responses ──────────────────────────────────────────
router.get("/:id/responses", authenticate, responseController.listSurveyResponses);
router.post("/:id/responses", validate(submitResponseSchema), responseController.submitResponse);
router.get("/:id/responses/export", authenticate, responseController.exportResponses);

// ─── Participants ───────────────────────────────────────
router.get("/:id/participants", authenticate, participantController.listSurveyParticipants);
router.post("/:id/participants", authenticate, participantController.addParticipants);

// ─── Analytics ──────────────────────────────────────────
router.get("/:id/analytics", authenticate, dashboardController.getSurveyAnalytics);

export default router;
