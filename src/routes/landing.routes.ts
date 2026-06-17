import { Router } from "express";
import * as landingController from "../controllers/landing.controller.js";

const router = Router();

router.get("/stats", landingController.getStats);
router.get("/faq", landingController.getFaq);
router.get("/news", landingController.getNews);
router.post("/contact", landingController.submitContact);

export default router;
