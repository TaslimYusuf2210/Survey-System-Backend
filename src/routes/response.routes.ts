import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as responseController from "../controllers/response.controller.js";

const router = Router();

router.get("/", authenticate, responseController.listAllResponses);
router.get("/:id", authenticate, responseController.getResponseDetail);
router.delete("/:id", authenticate, responseController.deleteResponse);

export default router;
