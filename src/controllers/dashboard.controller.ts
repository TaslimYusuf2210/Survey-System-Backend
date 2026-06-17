import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as dashboardService from "../services/dashboard.service.js";
import { AppError } from "../middleware/errorHandler.js";

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await dashboardService.getStats(req.userId!);

  res.status(200).json(stats);
});

export const getRecentSurveys = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query["limit"]
    ? Math.max(1, Math.min(50, Number(req.query["limit"])))
    : 5;

  const surveys = await dashboardService.getRecentSurveys(req.userId!, limit);

  res.status(200).json({ data: surveys });
});

export const getSurveyAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const surveyId = req.params["id"] as string | undefined;

  if (!surveyId) {
    throw new AppError("Survey ID is required", 400);
  }

  const analytics = await dashboardService.getSurveyAnalytics(surveyId, req.userId!);

  if (!analytics) {
    throw new AppError("Survey not found", 404);
  }

  res.status(200).json(analytics);
});
