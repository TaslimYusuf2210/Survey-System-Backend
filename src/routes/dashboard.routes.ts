import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as dashboardController from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/stats", authenticate, dashboardController.getStats);
router.get("/recent-surveys", authenticate, dashboardController.getRecentSurveys);

export default router;
