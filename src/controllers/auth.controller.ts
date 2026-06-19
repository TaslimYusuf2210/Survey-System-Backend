import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as authService from "../services/auth.service.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.createAccount(req.body);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getUser(req.userId!);

  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await authService.updatePassword(req.userId!, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});
