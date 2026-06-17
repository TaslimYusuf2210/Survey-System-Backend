import { Router } from "express";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import surveyRoutes from "./survey.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/surveys", surveyRoutes);

export { router };
