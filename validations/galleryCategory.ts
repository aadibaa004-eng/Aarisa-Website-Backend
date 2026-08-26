import { z } from "zod";

const categoryName = z
  .string({ required_error: "Category name is required" })
  .min(2, "Category name must be at least 2 characters")
  .max(100, "Category name cannot exceed 100 characters")
  .trim();

const categoryDescription = z
  .string({ invalid_type_error: "Category description must be a string" })
  .max(500, "Category description cannot exceed 500 characters")
  .trim();

/**
 * Accepts both `isActive` (project convention) and `is_active`
 * so admin panel and API clients can use either.
 */
const activeFlag = z.boolean({
  invalid_type_error: "Status must be a boolean",
});

export const createCategorySchema = z.object({
  name: categoryName,
  description: categoryDescription.optional(),
  isActive: activeFlag.optional(),
  is_active: activeFlag.optional(),
});

export const updateCategorySchema = z.object({
  name: categoryName.optional(),
  description: categoryDescription.optional(),
  isActive: activeFlag.optional(),
  is_active: activeFlag.optional(),
});

export const updateStatusSchema = z.object({
  is_active: activeFlag,
});

const imageTitle = z
  .string({ invalid_type_error: "Image title must be a string" })
  .max(150, "Image title cannot exceed 150 characters")
  .trim();

const imageDescription = z
  .string({ invalid_type_error: "Image description must be a string" })
  .max(1000, "Image description cannot exceed 1000 characters")
  .trim();

export const imageMetadataSchema = z.object({
  title: imageTitle.optional(),
  description: imageDescription.optional(),
});

/** One metadata entry per uploaded file, aligned by array index. */
export const imageMetadataArraySchema = z.array(imageMetadataSchema);

export const updateImageSchema = z.object({
  title: imageTitle.optional(),
  description: imageDescription.optional(),
});

/** Resolves the effective status flag from either naming convention. */
export function resolveActiveFlag(data: {
  isActive?: boolean;
  is_active?: boolean;
}): boolean | undefined {
  return data.isActive ?? data.is_active;
}

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ImageMetadata = z.infer<typeof imageMetadataSchema>;
export type UpdateImageInput = z.infer<typeof updateImageSchema>;
