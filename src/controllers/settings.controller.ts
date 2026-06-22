import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as settingsService from "../services/settings.service.js";

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingsService.getSettings(req.userId!);
  res.status(200).json({ success: true, data: settings });
});

export const updateAppearanceAccent = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingsService.updateAppearanceAccent(req.userId!, req.body);
  res.status(200).json({ success: true, message: "Appearance and accent color updated", data: settings });
});

export const updateThemePicture = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingsService.updateThemePicture(req.userId!, req.body.theme_picture);
  res.status(200).json({ success: true, message: "Theme picture updated", data: settings });
});
