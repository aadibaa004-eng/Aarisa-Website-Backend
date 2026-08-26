import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IGalleryImage extends Document {
  categoryId: Types.ObjectId | null;
  imageUrl: string;
  publicId: string;
  title: string;
  description: string;
  createdAt: Date;
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "GalleryCategory",
      default: null,
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
    title: {
      type: String,
      default: "",
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
  },
  { timestamps: true }
);

GalleryImageSchema.index({ categoryId: 1, createdAt: -1 });

const GalleryImage: Model<IGalleryImage> =
  mongoose.models.GalleryImage ??
  mongoose.model<IGalleryImage>("GalleryImage", GalleryImageSchema);

export default GalleryImage;
