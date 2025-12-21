import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartItem {
  productId: string; // Changed to string to support custom product IDs
  name: string;
  description?: string;
  price: number;
  image: string;
  images?: string[]; // For custom products with stacked images
  quantity: number;
  customParts?: {
    base?: { name?: string; image?: string };
    switch?: { name?: string; image?: string };
    keycapBase?: { name?: string; image?: string };
    keycapAdd1?: { name?: string; image?: string };
    keycapAdd2?: { name?: string; image?: string };
    wire?: { name?: string; image?: string };
  };
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;

  items: ICartItem[];
  total: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    district: string;
    province: string;
    postalCode: string;
  };
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "card" | "promptpay" | "banking" | "cod";
  paymentStatus: "pending" | "paid" | "failed";
  chargeId?: string;
  stockReserved: boolean;
  // Shipping tracking
  trackingNumber?: string;
  carrier?: "kerry" | "flash" | "jt" | "thaipost" | "scg" | "other";
  shippedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}


const CartItemSchema = new Schema<ICartItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  images: { type: [String], default: [] },
  quantity: { type: Number, required: true, min: 1 },
  customParts: {
    type: {
      base: { name: String, image: String },
      switch: { name: String, image: String },
      keycapBase: { name: String, image: String },
      keycapAdd1: { name: String, image: String },
      keycapAdd2: { name: String, image: String },
      wire: { name: String, image: String },
    },
    default: null,
  },
});

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [CartItemSchema],
    total: { type: Number, required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      district: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "promptpay", "banking", "cod"],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    chargeId: { type: String },
    stockReserved: { type: Boolean, default: false },
    // Shipping tracking
    trackingNumber: { type: String },
    carrier: {
      type: String,
      enum: ["kerry", "flash", "jt", "thaipost", "scg", "other"]
    },
    shippedAt: { type: Date },
  },

  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
