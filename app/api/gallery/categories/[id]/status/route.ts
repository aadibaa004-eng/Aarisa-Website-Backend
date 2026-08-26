import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import GalleryCategory from "@/models/GalleryCategory";
import { updateStatusSchema, resolveActiveFlag } from "@/validations/galleryCategory";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} from "@/utils/response";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/gallery/categories/:id/status — Protected
// Payload: { "is_active": true | false }
export async function PATCH(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid gallery category ID", 400);
    }

    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors.map((e) => e.message));
    }

    const isActive = resolveActiveFlag(parsed.data);

    const category = await GalleryCategory.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return notFoundResponse("Gallery category not found");
    }

    return successResponse(
      category,
      `Gallery category ${category.isActive ? "enabled" : "disabled"} successfully`
    );
  } catch {
    return errorResponse("Failed to update gallery category status");
  }
}
