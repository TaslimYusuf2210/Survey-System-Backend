import { Router } from "express";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import surveyRoutes from "./survey.routes.js";
import sectionRoutes from "./section.routes.js";
import questionRoutes from "./question.routes.js";
import optionRoutes from "./option.routes.js";
import responseRoutes from "./response.routes.js";
import participantRoutes from "./participant.routes.js";
import userRoutes from "./user.routes.js";
import settingsRoutes from "./settings.routes.js";
import searchRoutes from "./search.routes.js";
import landingRoutes from "./landing.routes.js";
import docsRoutes from "./docs.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/surveys", surveyRoutes);
router.use("/sections", sectionRoutes);
router.use("/questions", questionRoutes);
router.use("/options", optionRoutes);
router.use("/responses", responseRoutes);
router.use("/participants", participantRoutes);
router.use("/users", userRoutes);
router.use("/settings", settingsRoutes);
router.use("/search", searchRoutes);
router.use("/landing", landingRoutes);
router.use("/docs", docsRoutes);

export { router };
