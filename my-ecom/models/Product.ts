import mongoose, { Schema, Model } from "mongoose";

// Separate interface for Product data (without Document properties)
export interface IProductData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  brand: string;
  stock: number;
  rating: number;
  reviews: number;
  features?: string[];
  switchType?: string;
  connectivity?: string;
  isNewProduct?: boolean;
  isFeatured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Export IProduct as alias for backward compatibility
export type IProduct = IProductData & mongoose.Document;

const ProductSchema = new Schema<IProductData>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    image: { type: String, required: true },
    images: [{ type: String }],
    category: { type: String, required: true },
    brand: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    features: [{ type: String }],
    switchType: { type: String },
    connectivity: { type: String },
    isNewProduct: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product: Model<IProductData> =
  mongoose.models.Product || mongoose.model<IProductData>("Product", ProductSchema);

export default Product;
