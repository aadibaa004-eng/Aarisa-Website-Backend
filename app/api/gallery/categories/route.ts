import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import GalleryCategory from "@/models/GalleryCategory";
import { getCategoryImageCounts, isDuplicateCategoryName } from "@/lib/gallery";
import { createCategorySchema, resolveActiveFlag } from "@/validations/galleryCategory";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/utils/response";

// GET /api/gallery/categories — Public
// Unauthenticated callers only receive active categories (admins see all).
// Optional query param: is_active=true|false
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const isAuthenticated = !!request.cookies.get("auth_token")?.value;

    const isActiveParam = searchParams.get("is_active");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (isActiveParam === "true" || isActiveParam === "false") {
      query.isActive = isActiveParam === "true";
    } else if (!isAuthenticated) {
      query.isActive = true;
    }

    const [categories, counts] = await Promise.all([
      GalleryCategory.find(query).sort({ createdAt: 1 }),
      getCategoryImageCounts(),
    ]);

    const data = categories.map((category) => ({
      ...category.toObject(),
      imageCount: counts.get(category._id.toString()) ?? 0,
    }));

    return successResponse(data, "Gallery categories retrieved successfully");
  } catch (error) {
    console.error("[GALLERY_CATEGORIES_GET_ERROR]", error);
    return errorResponse("Failed to retrieve gallery categories");
  }
}

// POST /api/gallery/categories — Protected
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors.map((e) => e.message));
    }

    if (await isDuplicateCategoryName(parsed.data.name)) {
      return errorResponse("A category with this name already exists", 409);
    }

    const isActive = resolveActiveFlag(parsed.data) ?? true;
    const category = await GalleryCategory.create({
      name: parsed.data.name,
      description: parsed.data.description ?? "",
      isActive,
    });

    return successResponse(category, "Gallery category created successfully", 201);
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      "code" in err &&
      (err as NodeJS.ErrnoException).code === "11000"
    ) {
      return errorResponse("A category with a similar name already exists", 409);
    }
    return errorResponse("Failed to create gallery category");
  }
}
