import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as sectionService from "../services/section.service.js";

export const createSection = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const section = await sectionService.createSection(id, req.userId!, req.body);
  res.status(201).json({ success: true, message: "Section created successfully", data: section });
});

export const updateSection = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const section = await sectionService.updateSection(id, req.userId!, req.body);
  res.status(200).json({ success: true, message: "Section updated successfully", data: section });
});

export const deleteSection = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  await sectionService.deleteSection(id, req.userId!);
  res.status(200).json({ success: true, message: "Section deleted successfully" });
});

export const reorderSections = asyncHandler(async (req: Request, res: Response) => {
  await sectionService.reorderSections(req.userId!, req.body);
  res.status(200).json({ success: true, message: "Sections reordered successfully" });
});

export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const question = await sectionService.createQuestion(id, req.userId!, req.body);
  res.status(201).json({ success: true, message: "Question created successfully", data: question });
});

export const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const question = await sectionService.updateQuestion(id, req.userId!, req.body);
  res.status(200).json({ success: true, message: "Question updated successfully", data: question });
});

export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  await sectionService.deleteQuestion(id, req.userId!);
  res.status(200).json({ success: true, message: "Question deleted successfully" });
});

export const reorderQuestions = asyncHandler(async (req: Request, res: Response) => {
  await sectionService.reorderQuestions(req.userId!, req.body);
  res.status(200).json({ success: true, message: "Questions reordered successfully" });
});

export const createOption = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const option = await sectionService.createOption(id, req.userId!, req.body);
  res.status(201).json({ success: true, message: "Option created successfully", data: option });
});

export const updateOption = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const option = await sectionService.updateOption(id, req.userId!, req.body);
  res.status(200).json({ success: true, message: "Option updated successfully", data: option });
});

export const deleteOption = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  await sectionService.deleteOption(id, req.userId!);
  res.status(200).json({ success: true, message: "Option deleted successfully" });
});
