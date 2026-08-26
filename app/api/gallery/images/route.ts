import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import GalleryImage, { IGalleryImage } from "@/models/GalleryImage";
import { uploadImage } from "@/lib/cloudinary";
import {
  imageMetadataArraySchema,
  type ImageMetadata,
} from "@/validations/galleryCategory";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/utils/response";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES_PER_REQUEST = 20;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// GET /api/gallery/images — Public
// Lists all images that are NOT assigned to any category.
export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();

    // MongoDB matches both explicit null and missing fields with a null query.
    const images = await GalleryImage.find({ categoryId: null }).sort({
      createdAt: -1,
    });

    return successResponse(images, "Uncategorized gallery images retrieved successfully");
  } catch (error) {
    console.error("Uncategorized gallery images list error:", error);
    return errorResponse("Failed to retrieve uncategorized gallery images");
  }
}

// POST /api/gallery/images — Protected
// Uploads one or more images WITHOUT a category. Accepts the same
// multipart/form-data contract as the per-category upload endpoint:
// "images" (multiple) or "image" (single), plus optional "metadata"
// JSON array or shared "title"/"description" fields.
export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    await connectDB();

    const formData = await request.formData();
    const files = [
      ...formData.getAll("images"),
      ...(formData.getAll("image").length ? formData.getAll("image") : []),
    ].filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return errorResponse(
        "No image files provided. Use field name 'images' for multiple uploads or 'image' for a single upload.",
        400
      );
    }

    let metadata: ImageMetadata[] = [];

    const rawMetadata = formData.get("metadata");
    if (typeof rawMetadata === "string" && rawMetadata.trim() !== "") {
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(rawMetadata);
      } catch {
        return validationErrorResponse([
          "Field 'metadata' must be a valid JSON array.",
        ]);
      }

      const parsed = imageMetadataArraySchema.safeParse(parsedJson);
      if (!parsed.success) {
        return validationErrorResponse(parsed.error.errors.map((e) => e.message));
      }
      metadata = parsed.data;
    } else {
      const title = formData.get("title");
      const description = formData.get("description");
      const sharedTitle = typeof title === "string" ? title.trim() : "";
      const sharedDescription =
        typeof description === "string" ? description.trim() : "";

      if (sharedTitle !== "" || sharedDescription !== "") {
        const parsed = imageMetadataArraySchema.safeParse(
          files.map(() => ({
            ...(sharedTitle !== "" && { title: sharedTitle }),
            ...(sharedDescription !== "" && { description: sharedDescription }),
          }))
        );
        if (!parsed.success) {
          return validationErrorResponse(parsed.error.errors.map((e) => e.message));
        }
        metadata = parsed.data;
      }
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return validationErrorResponse([
        `Cannot upload more than ${MAX_FILES_PER_REQUEST} images per request.`,
      ]);
    }

    const errors: string[] = [];

    for (const [index, file] of files.entries()) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errors.push(`File ${index + 1} (${file.name}): unsupported type. Allowed: JPEG, PNG, WEBP, GIF.`);
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(`File ${index + 1} (${file.name}): size cannot exceed 5 MB.`);
      }
    }

    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    const folder = "arisa-nutrition/gallery/uncategorized";
    const uploaded: IGalleryImage[] = [];

    for (const [index, file] of files.entries()) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

      const { url, publicId } = await uploadImage(base64, folder);

      uploaded.push(
        await GalleryImage.create({
          categoryId: null,
          imageUrl: url,
          publicId,
          title: metadata[index]?.title ?? "",
          description: metadata[index]?.description ?? "",
        })
      );
    }

    return successResponse(uploaded, `${uploaded.length} image(s) uploaded successfully`, 201);
  } catch (error) {
    console.error("Uncategorized gallery image upload error:", error);
    return errorResponse("Failed to upload gallery images");
  }
}
