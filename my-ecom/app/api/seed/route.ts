import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import User, { hashPassword } from "@/models/User";
import { products, categories } from "@/lib/mockData";

// Seed database with mock data
export async function POST() {
  try {
    await dbConnect();

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Insert categories
    const insertedCategories = await Category.insertMany(
      categories.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        productCount: cat.productCount,
      }))
    );

    // Insert products
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
        isNew: prod.isNew,
        isFeatured: prod.isFeatured,
      }))
    );

    // Create or update admin user
    const adminEmail = "admin@keyboardth.com";
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      const hashedAdminPassword = await hashPassword("admin123");
      adminUser = await User.create({
        name: "Admin",
        email: adminEmail,
        password: hashedAdminPassword,
        role: "admin",
      });
    }

    // Create or update test user
    const testEmail = "user@keyboardth.com";
    let testUser = await User.findOne({ email: testEmail });
    
    if (!testUser) {
      const hashedUserPassword = await hashPassword("user123");
      testUser = await User.create({
        name: "Test User",
        email: testEmail,
        password: hashedUserPassword,
        role: "user",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      data: {
        categories: insertedCategories.length,
        products: insertedProducts.length,
        adminUser: { email: adminEmail, password: "admin123" },
        testUser: { email: testEmail, password: "user123" },
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

