import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import { updateReviewSchema } from "@/validations/review";
import { deleteReviewScreenshots } from "@/lib/review";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
} from "@/utils/response";

type Params = { params: Promise<{ id: string }> };

// PUT /api/reviews/:id — Protected
export async function PUT(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid review ID", 400);
    }

    const body = await request.json();
    const parsed = updateReviewSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.errors.map((e) => e.message));
    }

    const review = await Review.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    });

    if (!review) {
      return notFoundResponse("Review not found");
    }

    return successResponse(review, "Review updated successfully");
  } catch {
    return errorResponse("Failed to update review");
  }
}

// DELETE /api/reviews/:id — Protected
export async function DELETE(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return errorResponse("Invalid review ID", 400);
    }

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return notFoundResponse("Review not found");
    }

    await deleteReviewScreenshots(id);

    return successResponse(null, "Review deleted successfully");
  } catch {
    return errorResponse("Failed to delete review");
  }
}
