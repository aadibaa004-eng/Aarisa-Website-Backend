import ReviewScreenshot from "@/models/ReviewScreenshot";
import { deleteImage } from "@/lib/cloudinary";

/**
 * Deletes all review screenshots for a given review.
 * Cloudinary assets are removed on a best-effort basis so that a CDN
 * failure never blocks database cleanup.
 */
export async function deleteReviewScreenshots(
  reviewId: string
): Promise<{ deletedScreenshots: number }> {
  const screenshots = await ReviewScreenshot.find({ reviewId }).select(
    "publicId"
  );

  await Promise.allSettled(
    screenshots
      .filter((s) => s.publicId)
      .map((s) => deleteImage(s.publicId))
  );

  const { deletedCount } = await ReviewScreenshot.deleteMany({ reviewId });

  return { deletedScreenshots: deletedCount ?? 0 };
}
