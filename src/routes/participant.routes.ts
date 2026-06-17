import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { addParticipantsSchema, updateParticipantSchema } from "../validators/participant.validator.js";
import * as participantController from "../controllers/participant.controller.js";

const router = Router();

router.get("/", authenticate, participantController.listAllParticipants);
router.get("/:id", authenticate, participantController.getParticipantDetail);
router.put("/:id", authenticate, validate(updateParticipantSchema), participantController.updateParticipant);
router.delete("/:id", authenticate, participantController.deleteParticipant);
router.post("/:id/send-email", authenticate, participantController.sendEmail);
router.post("/bulk-import", authenticate, participantController.bulkImport);

export default router;
