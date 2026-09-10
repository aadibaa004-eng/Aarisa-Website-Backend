import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ReviewScreenshot from "@/models/ReviewScreenshot";
import {
  successResponse,
  errorResponse,
} from "@/utils/response";

// GET /api/reviews/screenshots — Public
// Returns all approved review screenshots across all reviews.
// If authenticated, returns all screenshots (including unapproved).
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const isAuthenticated = !!request.cookies.get("auth_token")?.value;
    const query = isAuthenticated ? {} : { approved: true };

    const screenshots = await ReviewScreenshot.find(query)
      .sort({ createdAt: -1 })
      .populate("reviewId", "clientName rating");

    return successResponse(
      screenshots,
      "Review screenshots retrieved successfully"
    );
  } catch {
    return errorResponse("Failed to retrieve review screenshots");
  }
}
