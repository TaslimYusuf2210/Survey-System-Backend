import { z } from "zod";

export const updateSettingsSchema = z.object({
  appearance: z.enum(["light", "dark"]).optional(),
  accent_color: z.string().optional(),
  theme_picture: z.string().optional(),
});

export const updateAppearanceSchema = z.object({
  appearance: z.enum(["light", "dark"]),
});

export const updateAccentSchema = z.object({
  accent_color: z.string().min(1),
});

export const updateThemePictureSchema = z.object({
  theme_picture: z.string().min(1),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
