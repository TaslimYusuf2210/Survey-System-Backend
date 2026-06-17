import { z } from "zod";

export const recentSurveysQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const num = val ? parseInt(val, 10) : 5;
      return isNaN(num) || num < 1 ? 5 : Math.min(num, 50);
    }),
});

export type RecentSurveysQuery = z.infer<typeof recentSurveysQuerySchema>;
