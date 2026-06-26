import { z } from "zod";

export const updateAppearanceAccentSchema = z.object({
  appearance: z.enum(["light", "dark", "default"]),
  accent_color: z.string().min(1),
});

export const updateThemePictureSchema = z.object({
  theme_picture: z.string().min(1),
});

export type UpdateAppearanceAccentInput = z.infer<typeof updateAppearanceAccentSchema>;
