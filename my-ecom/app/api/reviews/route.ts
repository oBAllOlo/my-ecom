import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";

// GET reviews for a product
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST create new review
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { productId, userId, userName, rating, title, comment } = body;

    // Validate required fields
    if (!productId || !userId || !rating || !title || !comment) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "คุณได้รีวิวสินค้านี้ไปแล้ว" },
        { status: 400 }
      );
    }

    // Create review
    const review = await Review.create({
      productId,
      userId,
      userName,
      rating,
      title,
      comment,
    });

    // Update product rating
    const reviews = await Review.find({ productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviews: reviews.length,
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 }
    );
  }
}
