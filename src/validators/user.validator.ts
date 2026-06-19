import { z } from "zod";

export const updateUsernameSchema = z.object({
  userName: z.string().min(3, "Username must be at least 3 characters"),
});

export const updateAvatarSchema = z.object({
  avatarUrl: z.string().min(1, "Avatar URL is required"),
});

export type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>;
export type UpdateAvatarInput = z.infer<typeof updateAvatarSchema>;
