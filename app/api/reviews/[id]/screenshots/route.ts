import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import ReviewScreenshot, {
  IReviewScreenshot,
} from "@/models/ReviewScreenshot";
import { uploadImage } from "@/lib/cloudinary";
import { createReviewScreenshotSchema } from "@/validations/reviewScreenshot";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} from "@/utils/response";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES_PER_REQUEST = 10;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

type Params = { params: Promise<{ id: string }> };

// GET /api/reviews/:id/screenshots — Public
// Returns approved screenshots for a review (all if authenticated).
export async function GET(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid review ID", 400);
    }

    const review = await Review.findById(id).select("_id");
    if (!review) {
      return notFoundResponse("Review not found");
    }

    const isAuthenticated = !!_request.cookies.get("auth_token")?.value;
    const query = isAuthenticated ? { reviewId: id } : { reviewId: id, approved: true };

    const screenshots = await ReviewScreenshot.find(query).sort({
      createdAt: -1,
    });

    return successResponse(
      screenshots,
      "Review screenshots retrieved successfully"
    );
  } catch {
    return errorResponse("Failed to retrieve review screenshots");
  }
}

// POST /api/reviews/:id/screenshots — Protected
// Uploads one or more screenshot images for a review via multipart/form-data.
// Fields: "images" (multiple) or "image" (single), optional "caption" string.
export async function POST(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid review ID", 400);
    }

    const review = await Review.findById(id).select("_id");
    if (!review) {
      return notFoundResponse("Review not found");
    }

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

    if (files.length > MAX_FILES_PER_REQUEST) {
      return validationErrorResponse([
        `Cannot upload more than ${MAX_FILES_PER_REQUEST} screenshots per request.`,
      ]);
    }

    const errors: string[] = [];
    for (const [index, file] of files.entries()) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errors.push(
          `File ${index + 1} (${file.name}): unsupported type. Allowed: JPEG, PNG, WEBP, GIF.`
        );
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(
          `File ${index + 1} (${file.name}): size cannot exceed 5 MB.`
        );
      }
    }
    if (errors.length > 0) {
      return validationErrorResponse(errors);
    }

    const rawCaption = formData.get("caption");
    const caption =
      typeof rawCaption === "string" ? rawCaption.trim() : "";
    const parsedCaption = createReviewScreenshotSchema.safeParse({ caption });
    if (!parsedCaption.success) {
      return validationErrorResponse(
        parsedCaption.error.errors.map((e) => e.message)
      );
    }

    const folder = `arisa-nutrition/reviews/${id}`;
    const uploaded: IReviewScreenshot[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

      const { url, publicId } = await uploadImage(base64, folder);

      uploaded.push(
        await ReviewScreenshot.create({
          reviewId: id,
          imageUrl: url,
          publicId,
          caption: parsedCaption.data.caption,
        })
      );
    }

    return successResponse(
      uploaded,
      `${uploaded.length} screenshot(s) uploaded successfully`,
      201
    );
  } catch {
    return errorResponse("Failed to upload review screenshots");
  }
}
