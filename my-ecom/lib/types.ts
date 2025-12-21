// MongoDB-ready TypeScript interfaces

export interface Product {
  _id: string;
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
  isNew?: boolean;
  isFeatured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // Custom keyboard parts
  customParts?: {
    base?: { name?: string; image?: string };
    switch?: { name?: string; image?: string };
    keycapBase?: { name?: string; image?: string };
    keycapAdd1?: { name?: string; image?: string };
    keycapAdd2?: { name?: string; image?: string };
    wire?: { name?: string; image?: string };
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  icon: string;
  productCount: number;
}

export type UserRole = "user" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  address?: Address;
  createdAt?: Date;
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  district: string;
  province: string;
  postalCode: string;
}

export interface Order {
  _id: string;
  userId: string;
  items: CartItem[];
  total: number;
  shippingAddress: Address;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  createdAt: Date;
}
