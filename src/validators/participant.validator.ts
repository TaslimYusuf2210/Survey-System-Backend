import { z } from "zod";

export const addParticipantsSchema = z.object({
  participants: z
    .array(
      z.object({
        email: z.string().email().optional(),
        name: z.string().optional(),
      })
    )
    .min(1, "At least one participant is required"),
});

export const updateParticipantSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const listParticipantsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      const num = val ? parseInt(val, 10) : 1;
      return isNaN(num) || num < 1 ? 1 : num;
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const num = val ? parseInt(val, 10) : 20;
      return isNaN(num) || num < 1 ? 20 : Math.min(num, 100);
    }),
  search: z.string().optional(),
});

export type AddParticipantsInput = z.infer<typeof addParticipantsSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
