import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as participantService from "../services/participant.service.js";

export const listSurveyParticipants = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query["page"]) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
  const search = req.query["search"] as string | undefined;
  const surveyId = req.params["id"] as string;

  const result = await participantService.listSurveyParticipants(
    surveyId,
    req.userId!,
    page,
    limit,
    search
  );
  res.status(200).json(result);
});

export const addParticipants = asyncHandler(async (req: Request, res: Response) => {
  const surveyId = req.params["id"] as string;
  const result = await participantService.addParticipants(surveyId, req.userId!, req.body);
  res.status(201).json({ success: true, message: "Participants added successfully", data: result });
});

export const getParticipantDetail = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const result = await participantService.getParticipantDetail(id, req.userId!);
  res.status(200).json({ success: true, data: result });
});

export const updateParticipant = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const result = await participantService.updateParticipant(id, req.userId!, req.body);
  res.status(200).json({ success: true, message: "Participant updated successfully", data: result });
});

export const deleteParticipant = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  await participantService.deleteParticipant(id, req.userId!);
  res.status(200).json({ success: true, message: "Participant deleted successfully" });
});

export const listAllParticipants = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query["page"]) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
  const search = req.query["search"] as string | undefined;

  const result = await participantService.listAllParticipants(req.userId!, page, limit, search);
  res.status(200).json(result);
});

export const sendEmail = asyncHandler(async (req: Request, res: Response) => {
  // Placeholder for email sending functionality
  res.status(200).json({ success: true, message: "Email functionality not yet implemented" });
});

export const bulkImport = asyncHandler(async (req: Request, res: Response) => {
  // Accept CSV as text in the request body
  const csvText = req.body["csv"] || req.body["data"] || "";
  if (!csvText) {
    res.status(400).json({ success: false, message: "CSV data is required" });
    return;
  }

  const result = await participantService.bulkImportParticipants(req.userId!, csvText);
  res.status(200).json({ success: true, message: "Bulk import completed", data: result });
});
