import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

const getSafeErrorMessage = (err: Error): { statusCode: number; message: string } => {
  // Handle known AppErrors
  if (err instanceof AppError) {
    return { statusCode: err.statusCode, message: err.message };
  }

  // Handle Prisma known request errors (e.g., unique constraint violations)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P1001":
        return {
          statusCode: 503,
          message: "Unable to connect to the Server. Please check your internet connection and try again.",
        };
      case "P1002":
        return {
          statusCode: 503,
          message: "Server timed out. Please check your internet connection and try again.",
        };
      case "P1003":
        return {
          statusCode: 503,
          message: "Server configuration error. Please contact support.",
        };
      case "P2002":
        return {
          statusCode: 409,
          message: "A record with this value already exists.",
        };
      case "P2025":
        return {
          statusCode: 404,
          message: "The requested record was not found.",
        };
      default:
        return {
          statusCode: 500,
          message: "A server error occurred. Please try again later.",
        };
    }
  }

  // Handle Prisma connection errors (no internet / server unreachable)
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return {
      statusCode: 503,
      message: "Unable to connect to the Server. Please check your internet connection and try again.",
    };
  }

  if (err instanceof Prisma.PrismaClientRustPanicError) {
    return {
      statusCode: 500,
      message: "An unexpected server error occurred. Please try again later.",
    };
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return {
      statusCode: 400,
      message: "Invalid data format provided.",
    };
  }

  // Fallback for unknown errors
  return {
    statusCode: 500,
    message: "Internal Server Error. Please try again later.",
  };
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const { statusCode, message } = getSafeErrorMessage(err);

  // Log the real error for debugging
  console.error(`[${new Date().toISOString()}] Error:`, err);

  res.status(statusCode).json({
    success: false,
    message,
  });
};
