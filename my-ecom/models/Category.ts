import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  icon: string;
  productCount: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    icon: { type: String, required: true },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
