import mongoose, { Schema, Document, Model } from "mongoose";
import slugify from "slugify";

export interface IGalleryCategory extends Document {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryCategorySchema = new Schema<IGalleryCategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Category description cannot exceed 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Auto-generate unique slug from name
GalleryCategorySchema.pre("save", async function (next) {
  if (!this.isModified("name") && this.slug) return next();

  const base = slugify(this.name, { lower: true, strict: true, trim: true });
  let slug = base;
  let counter = 1;

  // Ensure slug uniqueness
  while (
    await (mongoose.models.GalleryCategory as Model<IGalleryCategory>).exists({
      slug,
      _id: { $ne: this._id },
    })
  ) {
    slug = `${base}-${counter}`;
    counter++;
  }

  this.slug = slug;
  next();
});

const GalleryCategory: Model<IGalleryCategory> =
  mongoose.models.GalleryCategory ??
  mongoose.model<IGalleryCategory>("GalleryCategory", GalleryCategorySchema);

export default GalleryCategory;
