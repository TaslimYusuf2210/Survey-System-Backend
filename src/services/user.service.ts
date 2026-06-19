import { prisma } from "../config/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      userName: true,
      avatarUrl: true,
      createdAt: true,
      settings: true,
    },
  });
  if (!user) throw new AppError("User not found", 404);

  return {
    id: user.id,
    email: user.email,
    user_name: user.userName,
    avatar_url: user.avatarUrl,
    created_at: user.createdAt.toISOString(),
    settings: user.settings
      ? {
          appearance: user.settings.appearance,
          accent_color: user.settings.accentColor,
          theme_picture: user.settings.themePicture,
        }
      : null,
  };
};

export const updateProfile = async (
  userId: string,
  input: { user_name?: string; avatar_url?: string }
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.user_name !== undefined && { userName: input.user_name }),
      ...(input.avatar_url !== undefined && { avatarUrl: input.avatar_url }),
    },
    select: {
      id: true,
      email: true,
      userName: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  return {
    id: user.id,
    email: user.email,
    user_name: user.userName,
    avatar_url: user.avatarUrl,
    created_at: user.createdAt.toISOString(),
  };
};

export const updateUsername = async (userId: string, userName: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { userName },
    select: { id: true, userName: true, email: true, avatarUrl: true, createdAt: true },
  });

  return {
    id: user.id,
    email: user.email,
    user_name: user.userName,
    avatar_url: user.avatarUrl,
    created_at: user.createdAt.toISOString(),
  };
};

export const updateAvatar = async (userId: string, avatarUrl: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: { id: true, userName: true, email: true, avatarUrl: true, createdAt: true },
  });

  return {
    id: user.id,
    email: user.email,
    user_name: user.userName,
    avatar_url: user.avatarUrl,
    created_at: user.createdAt.toISOString(),
  };
};

export const deleteAccount = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  await prisma.user.delete({ where: { id: userId } });
};

export const getUserById = async (targetUserId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      email: true,
      userName: true,
      avatarUrl: true,
      createdAt: true,
    },
  });
  if (!user) throw new AppError("User not found", 404);

  return {
    id: user.id,
    email: user.email,
    user_name: user.userName,
    avatar_url: user.avatarUrl,
    created_at: user.createdAt.toISOString(),
  };
};
