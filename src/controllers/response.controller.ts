import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as responseService from "../services/response.service.js";

export const listSurveyResponses = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query["page"]) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));
  const sortBy = (req.query["sort_by"] as string) || "completed_at";
  const order = (req.query["order"] as string) || "desc";
  const surveyId = req.params["id"] as string;

  const result = await responseService.listSurveyResponses(
    surveyId,
    req.userId!,
    page,
    limit,
    sortBy,
    order
  );
  res.status(200).json(result);
});

export const listAllResponses = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query["page"]) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query["limit"]) || 20));

  const result = await responseService.listAllResponses(req.userId!, page, limit);
  res.status(200).json(result);
});

export const getResponseDetail = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const result = await responseService.getResponseDetail(id, req.userId!);
  res.status(200).json({ success: true, data: result });
});

export const submitResponse = asyncHandler(async (req: Request, res: Response) => {
  const surveyId = req.params["id"] as string;
  const result = await responseService.submitResponse(surveyId, req.body);
  res.status(201).json({ success: true, message: "Response submitted successfully", data: result });
});

export const deleteResponse = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  await responseService.deleteResponse(id, req.userId!);
  res.status(200).json({ success: true, message: "Response deleted successfully" });
});

export const exportResponses = asyncHandler(async (req: Request, res: Response) => {
  const format = (req.query["format"] as string) || "json";
  const surveyId = req.params["id"] as string;
  const result = await responseService.exportResponses(surveyId, req.userId!, format);

  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  res.send(result.content);
});
