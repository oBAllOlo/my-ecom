import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import User, { hashPassword } from "@/models/User";
import { products, categories } from "@/lib/mockData";

export async function POST() {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: "Seed route is disabled in production" },
        { status: 403 }
      );
    }

    await dbConnect();

    await Product.deleteMany({});
    await Category.deleteMany({});

    const insertedCategories = await Category.insertMany(
      categories.map((cat) => ({
        name: cat.name,
        icon: cat.icon,
        productCount: cat.productCount,
      }))
    );

    const insertedProducts = await Product.insertMany(
      products.map((prod) => ({
        name: prod.name,
        description: prod.description,
        price: prod.price,
        originalPrice: prod.originalPrice,
        image: prod.image,
        images: prod.images,
        category: prod.category,
        brand: prod.brand,
        stock: prod.stock,
        rating: prod.rating,
        reviews: prod.reviews,
        features: prod.features,
        switchType: prod.switchType,
        connectivity: prod.connectivity,
        isNewProduct: prod.isNewProduct,
        isFeatured: prod.isFeatured,
      }))
    );

    // Demo accounts — upserted so re-running seed always applies the latest
    // credentials even if the accounts already exist.
    const demoAccounts = [
      { email: "admin@keyboardth.com", name: "Admin", password: "Admin123!", role: "admin" as const },
      { email: "user@keyboardth.com", name: "Test User", password: "User1234!", role: "user" as const },
    ];

    for (const acc of demoAccounts) {
      const hashed = await hashPassword(acc.password);
      await User.findOneAndUpdate(
        { email: acc.email },
        { name: acc.name, email: acc.email, password: hashed, role: acc.role, isVerified: true },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      data: {
        categories: insertedCategories.length,
        products: insertedProducts.length,
      },
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to seed database", details: errorMessage },
      { status: 500 }
    );
  }
}
