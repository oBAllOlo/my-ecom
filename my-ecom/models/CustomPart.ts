import mongoose, { Schema, Document, Model } from "mongoose";

export type PartCategory = "base" | "switch" | "keycapBase" | "keycapAdd1" | "keycapAdd2" | "wire";

export interface ICustomPart extends Document {
  category: PartCategory;
  name: string;
  price: number;
  image: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomPartSchema = new Schema<ICustomPart>(
  {
    category: {
      type: String,
      enum: ["base", "switch", "keycapBase", "keycapAdd1", "keycapAdd2", "wire"],
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for faster queries
CustomPartSchema.index({ category: 1, isActive: 1 });

const CustomPart: Model<ICustomPart> =
  mongoose.models.CustomPart || mongoose.model<ICustomPart>("CustomPart", CustomPartSchema);

export default CustomPart;
