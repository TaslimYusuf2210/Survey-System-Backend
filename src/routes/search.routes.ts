import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as searchController from "../controllers/search.controller.js";

const router = Router();

router.get("/", authenticate, searchController.globalSearch);

export default router;
