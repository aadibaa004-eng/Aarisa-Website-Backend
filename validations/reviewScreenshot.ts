import { z } from "zod";

export const createReviewScreenshotSchema = z.object({
  caption: z
    .string()
    .max(300, "Caption cannot exceed 300 characters")
    .trim()
    .optional()
    .default(""),
});

export const updateReviewScreenshotSchema = z.object({
  caption: z
    .string()
    .max(300, "Caption cannot exceed 300 characters")
    .trim()
    .optional(),
  approved: z.boolean().optional(),
});

export type CreateReviewScreenshotInput = z.infer<
  typeof createReviewScreenshotSchema
>;
export type UpdateReviewScreenshotInput = z.infer<
  typeof updateReviewScreenshotSchema
>;
