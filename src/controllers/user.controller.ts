import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as userService from "../services/user.service.js";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await userService.getProfile(req.userId!);
  res.status(200).json({ success: true, data: profile });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await userService.updateProfile(req.userId!, req.body);
  res.status(200).json({ success: true, message: "Profile updated successfully", data: profile });
});

export const updateUsername = asyncHandler(async (req: Request, res: Response) => {
  const profile = await userService.updateUsername(req.userId!, req.body.userName);
  res.status(200).json({ success: true, message: "Username updated successfully", data: profile });
});

export const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  const profile = await userService.updateAvatar(req.userId!, req.body.avatarUrl);
  res.status(200).json({ success: true, message: "Avatar updated successfully", data: profile });
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteAccount(req.userId!);
  res.status(200).json({ success: true, message: "Account deleted successfully" });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const user = await userService.getUserById(id);
  res.status(200).json({ success: true, data: user });
});
