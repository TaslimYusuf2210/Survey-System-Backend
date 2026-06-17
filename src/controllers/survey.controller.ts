import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as surveyService from "../services/survey.service.js";
import type { ListSurveysQuery } from "../validators/survey.validator.js";

export const listSurveys = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListSurveysQuery;
  const result = await surveyService.listSurveys(req.userId!, query);
  res.status(200).json(result);
});

export const createSurvey = asyncHandler(async (req: Request, res: Response) => {
  const survey = await surveyService.createSurvey(req.userId!, req.body);
  res.status(201).json({ success: true, message: "Survey created successfully", data: survey });
});

export const getSurveyDetail = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const survey = await surveyService.getSurveyDetail(id, req.userId!);
  res.status(200).json({ success: true, data: survey });
});

export const updateSurvey = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const survey = await surveyService.updateSurvey(id, req.userId!, req.body);
  res.status(200).json({ success: true, message: "Survey updated successfully", data: survey });
});

export const deleteSurvey = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  await surveyService.deleteSurvey(id, req.userId!);
  res.status(200).json({ success: true, message: "Survey deleted successfully" });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const survey = await surveyService.updateStatus(id, req.userId!, req.body);
  res.status(200).json({ success: true, message: "Survey status updated", data: survey });
});

export const duplicateSurvey = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const survey = await surveyService.duplicateSurvey(id, req.userId!);
  res.status(201).json({ success: true, message: "Survey duplicated successfully", data: survey });
});

export const publishSurvey = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const { survey: surveyData, sections } = req.body;
  const survey = await surveyService.publishSurvey(id, req.userId!, surveyData, sections);
  res.status(201).json({ success: true, message: "Survey published successfully", data: survey });
});
