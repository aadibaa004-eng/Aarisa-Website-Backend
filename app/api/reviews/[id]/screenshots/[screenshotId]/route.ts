import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import ReviewScreenshot from "@/models/ReviewScreenshot";
import { deleteImage } from "@/lib/cloudinary";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from "@/utils/response";

type Params = {
  params: Promise<{ id: string; screenshotId: string }>;
};

// DELETE /api/reviews/:id/screenshots/:screenshotId — Protected
export async function DELETE(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id, screenshotId } = await params;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(screenshotId)) {
      return errorResponse("Invalid ID", 400);
    }

    const screenshot = await ReviewScreenshot.findOne({
      _id: screenshotId,
      reviewId: id,
    });

    if (!screenshot) {
      return notFoundResponse("Screenshot not found");
    }

    if (screenshot.publicId) {
      try {
        await deleteImage(screenshot.publicId);
      } catch {
        // Best effort — record is still removed below
      }
    }

    await ReviewScreenshot.findByIdAndDelete(screenshotId);

    return successResponse(null, "Screenshot deleted successfully");
  } catch {
    return errorResponse("Failed to delete screenshot");
  }
}
