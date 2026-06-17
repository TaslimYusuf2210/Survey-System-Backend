import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as dashboardController from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/:id/analytics", authenticate, dashboardController.getSurveyAnalytics);

export default router;
