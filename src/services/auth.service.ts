import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import type { CreateAccountInput, LoginInput } from "../validators/auth.validator.js";

const JWT_SECRET: string = process.env["JWT_SECRET"] ?? "fallback-secret-change-in-prod";

export const createAccount = async (input: CreateAccountInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      userName: input.userName,
      password: hashedPassword,
    },
  });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      userName: user.userName,
    },
  };
};

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      userName: user.userName,
    },
  };
};
