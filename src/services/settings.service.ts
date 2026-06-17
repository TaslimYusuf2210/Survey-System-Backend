import { prisma } from "../config/prisma.js";
import type { UpdateSettingsInput } from "../validators/settings.validator.js";

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

export const updateSettings = async (userId: string, input: UpdateSettingsInput) => {
  // Upsert to handle first-time creation
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    update: {
      ...(input.appearance !== undefined && { appearance: input.appearance }),
      ...(input.accent_color !== undefined && { accentColor: input.accent_color }),
      ...(input.theme_picture !== undefined && { themePicture: input.theme_picture }),
    },
    create: {
      userId,
      appearance: input.appearance ?? "light",
      accentColor: input.accent_color ?? "blue",
      themePicture: input.theme_picture ?? null,
    },
  });

  return {
    appearance: settings.appearance,
    accent_color: settings.accentColor,
    theme_picture: settings.themePicture,
  };
};

export const updateAppearance = async (userId: string, appearance: string) => {
  return updateSettings(userId, { appearance: appearance as "light" | "dark" });
};

export const updateAccentColor = async (userId: string, accentColor: string) => {
  return updateSettings(userId, { accent_color: accentColor });
};

export const updateThemePicture = async (userId: string, themePicture: string) => {
  return updateSettings(userId, { theme_picture: themePicture });
};
