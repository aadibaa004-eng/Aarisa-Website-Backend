import mongoose from "mongoose";
import GalleryCategory from "@/models/GalleryCategory";
import GalleryImage from "@/models/GalleryImage";
import { deleteImage } from "@/lib/cloudinary";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Case-insensitive duplicate name check (slugs are handled by the model hook). */
export async function isDuplicateCategoryName(
  name: string,
  excludeId?: string
): Promise<boolean> {
  const filter: Record<string, unknown> = {
    name: { $regex: new RegExp(`^${escapeRegex(name.trim())}$`, "i") },
  };

  if (excludeId && mongoose.isValidObjectId(excludeId)) {
    filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
  }

  return !!(await GalleryCategory.exists(filter));
}

/** Returns image counts keyed by category id (as string). */
export async function getCategoryImageCounts(): Promise<Map<string, number>> {
  const counts = await GalleryImage.aggregate<{
    _id: mongoose.Types.ObjectId;
    count: number;
  }>([
    // Uncategorized images (categoryId: null) don't belong to any bucket
    { $match: { categoryId: { $ne: null } } },
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  ]);

  return new Map(
    counts
      .filter((c) => c._id !== null)
      .map((c) => [c._id.toString(), c.count])
  );
}

/**
 * Deletes a gallery category together with all of its images.
 * Cloudinary assets are removed on a best-effort basis so that a CDN
 * failure never blocks database cleanup.
 */
export async function deleteCategoryAndImages(
  categoryId: string
): Promise<{ deletedImages: number }> {
  const images = await GalleryImage.find({ categoryId }).select("publicId");

  await Promise.allSettled(
    images
      .filter((img) => img.publicId)
      .map((img) => deleteImage(img.publicId))
  );

  const { deletedCount } = await GalleryImage.deleteMany({ categoryId });
  await GalleryCategory.findByIdAndDelete(categoryId);

  return { deletedImages: deletedCount ?? 0 };
}

/** Deletes a single image document and its Cloudinary asset (best effort). */
export async function deleteGalleryImage(imageId: string): Promise<void> {
  const image = await GalleryImage.findById(imageId).select("publicId");

  if (!image) return;

  if (image.publicId) {
    try {
      await deleteImage(image.publicId);
    } catch {
      // Best effort — record is still removed below
    }
  }

  await GalleryImage.findByIdAndDelete(imageId);
}
