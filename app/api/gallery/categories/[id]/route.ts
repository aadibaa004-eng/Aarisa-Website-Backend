import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import GalleryCategory from "@/models/GalleryCategory";
import GalleryImage from "@/models/GalleryImage";
import {
  deleteCategoryAndImages,
  getCategoryImageCounts,
  isDuplicateCategoryName,
} from "@/lib/gallery";
import {
  updateCategorySchema,
  resolveActiveFlag,
} from "@/validations/galleryCategory";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} from "@/utils/response";

type Params = { params: Promise<{ id: string }> };

// GET /api/gallery/categories/:id — Public
// Optional query param: include_images=true
export async function GET(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid gallery category ID", 400);
    }

    const category = await GalleryCategory.findById(id);

    if (!category) {
      return notFoundResponse("Gallery category not found");
    }

    const counts = await getCategoryImageCounts();
    const data: Record<string, unknown> = {
      ...category.toObject(),
      imageCount: counts.get(category._id.toString()) ?? 0,
    };

    if (request.nextUrl.searchParams.get("include_images") === "true") {
      data.images = await GalleryImage.find({ categoryId: id }).sort({
        createdAt: -1,
      });
    }

    return successResponse(data, "Gallery category retrieved successfully");
  } catch {
    return errorResponse("Failed to retrieve gallery category");
  }
}

// PUT /api/gallery/categories/:id — Protected
export async function PUT(
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
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors.map((e) => e.message));
    }

    const category = await GalleryCategory.findById(id);

    if (!category) {
      return notFoundResponse("Gallery category not found");
    }

    const isActive = resolveActiveFlag(parsed.data);

    if (parsed.data.name !== undefined && parsed.data.name !== category.name) {
      if (await isDuplicateCategoryName(parsed.data.name, id)) {
        return errorResponse("A category with this name already exists", 409);
      }
      // save() re-triggers the unique slug generation hook
      category.name = parsed.data.name;
    }

    if (parsed.data.description !== undefined) {
      category.description = parsed.data.description;
    }

    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    await category.save();

    return successResponse(category, "Gallery category updated successfully");
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      "code" in err &&
      (err as NodeJS.ErrnoException).code === "11000"
    ) {
      return errorResponse("A category with a similar name already exists", 409);
    }
    return errorResponse("Failed to update gallery category");
  }
}

// DELETE /api/gallery/categories/:id — Protected
export async function DELETE(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid gallery category ID", 400);
    }

    const category = await GalleryCategory.findById(id);

    if (!category) {
      return notFoundResponse("Gallery category not found");
    }

    const { deletedImages } = await deleteCategoryAndImages(id);

    return successResponse(
      { deletedImages },
      `Gallery category and ${deletedImages} image(s) deleted successfully`
    );
  } catch {
    return errorResponse("Failed to delete gallery category");
  }
}
