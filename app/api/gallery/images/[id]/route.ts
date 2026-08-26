import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import GalleryImage from "@/models/GalleryImage";
import { deleteGalleryImage } from "@/lib/gallery";
import { updateImageSchema } from "@/validations/galleryCategory";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} from "@/utils/response";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/gallery/images/:id — Protected
// Updates image title and/or description (metadata only).
export async function PATCH(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid gallery image ID", 400);
    }

    const body = await request.json();
    const parsed = updateImageSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors.map((e) => e.message));
    }

    const updates: Record<string, string> = {};
    if (parsed.data.title !== undefined) updates.title = parsed.data.title;
    if (parsed.data.description !== undefined) {
      updates.description = parsed.data.description;
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse("Provide at least one of 'title' or 'description'.", 400);
    }

    const image = await GalleryImage.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!image) {
      return notFoundResponse("Gallery image not found");
    }

    return successResponse(image, "Gallery image updated successfully");
  } catch (error) {
    console.error("[GALLERY_IMAGE_PATCH_ERROR]", error);
    return errorResponse("Failed to update gallery image");
  }
}

// DELETE /api/gallery/images/:id — Protected
export async function DELETE(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid gallery image ID", 400);
    }

    const image = await GalleryImage.findById(id);

    if (!image) {
      return notFoundResponse("Gallery image not found");
    }

    await deleteGalleryImage(id);

    return successResponse(null, "Gallery image deleted successfully");
  } catch {
    return errorResponse("Failed to delete gallery image");
  }
}
