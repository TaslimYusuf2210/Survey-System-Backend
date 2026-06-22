import { prisma } from "../config/prisma.js";
import type { UpdateAppearanceAccentInput } from "../validators/settings.validator.js";
import { AppError } from "../middleware/errorHandler.js";

export const getSettings = async (userId: string) => {
  let settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userId },
    });
  }

  return {
    appearance: settings.appearance,
    accent_color: settings.accentColor,
    theme_picture: settings.themePicture,
  };
};

export const updateAppearanceAccent = async (userId: string, input: UpdateAppearanceAccentInput) => {
  const existing = await prisma.userSettings.findUnique({ where: { userId } });

  if (
    existing &&
    existing.appearance === input.appearance &&
    existing.accentColor === input.accent_color
  ) {
    throw new AppError("Appearance and accent color are the same as the current settings", 400);
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId },
    update: {
      appearance: input.appearance,
      accentColor: input.accent_color,
    },
    create: {
      userId,
      appearance: input.appearance,
      accentColor: input.accent_color,
    },
  });

  return {
    appearance: settings.appearance,
    accent_color: settings.accentColor,
    theme_picture: settings.themePicture,
  };
};

export const updateThemePicture = async (userId: string, themePicture: string) => {
  const existing = await prisma.userSettings.findUnique({ where: { userId } });

  if (existing && existing.themePicture === themePicture) {
    throw new AppError("Theme picture is the same as the current setting", 400);
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId },
    update: { themePicture },
    create: {
      userId,
      themePicture,
    },
  });

  return {
    appearance: settings.appearance,
    accent_color: settings.accentColor,
    theme_picture: settings.themePicture,
  };
};
