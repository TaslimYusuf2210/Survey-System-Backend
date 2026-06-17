import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler.js";

const JWT_SECRET: string = process.env["JWT_SECRET"] ?? "fallback-secret-change-in-prod";

interface JwtPayload {
  userId: string;
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication required. Provide a valid Bearer token.", 401);
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new AppError("Authentication required. Provide a valid Bearer token.", 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch {
    throw new AppError("Invalid or expired token.", 401);
  }
};
