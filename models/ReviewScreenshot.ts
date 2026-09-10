import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReviewScreenshot extends Document {
  reviewId: Types.ObjectId;
  imageUrl: string;
  publicId: string;
  caption: string;
  approved: boolean;
  createdAt: Date;
}

const ReviewScreenshotSchema = new Schema<IReviewScreenshot>(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      required: [true, "Review ID is required"],
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    publicId: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
      trim: true,
      maxlength: [300, "Caption cannot exceed 300 characters"],
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ReviewScreenshotSchema.index({ reviewId: 1, createdAt: -1 });

const ReviewScreenshot: Model<IReviewScreenshot> =
  mongoose.models.ReviewScreenshot ??
  mongoose.model<IReviewScreenshot>("ReviewScreenshot", ReviewScreenshotSchema);

export default ReviewScreenshot;
