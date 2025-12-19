import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";

// GET all categories with product counts
export async function GET() {
  try {
    await dbConnect();

    const categories = await Category.find({}).sort({ name: 1 }).lean();
    
    // Calculate product count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ category: category.name });
        return {
          ...category,
          productCount,
        };
      })
    );

    return NextResponse.json({ success: true, data: categoriesWithCounts });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const category = await Category.create(body);

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}
