import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

// Configuration
const NEW_PRODUCT_DAYS = 7;
const FEATURED_COUNT = 4; // Number of featured products to show

// Helper function to check if product is new based on createdAt
function isProductNew(createdAt: Date | undefined): boolean {
  if (!createdAt) return false;
  const now = new Date();
  const diffTime = now.getTime() - new Date(createdAt).getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= NEW_PRODUCT_DAYS;
}

// Seeded random function for consistent daily rotation
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Get today's date as seed (rotates daily)
function getDailySeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

// Shuffle array with seed
function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  const random = seededRandom(seed);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// GET all products with search and filter
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const isNew = searchParams.get("new");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort");
    const brand = searchParams.get("brand");

    // Build query (without featured filter - we'll handle it dynamically)
    const query: Record<string, unknown> = {};
    
    // Category filter
    if (category && category !== "all") query.category = category;
    
    // Brand filter
    if (brand) query.brand = brand;
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) (query.price as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (query.price as Record<string, number>).$lte = Number(maxPrice);
    }

    // Build sort options
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "price-low") sortOption = { price: 1 };
    if (sort === "price-high") sortOption = { price: -1 };
    if (sort === "name-asc") sortOption = { name: 1 };
    if (sort === "name-desc") sortOption = { name: -1 };
    if (sort === "rating") sortOption = { rating: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };

    let products = await Product.find(query).sort(sortOption).lean();

    // Get daily rotation seed
    const dailySeed = getDailySeed();
    
    // Randomly select featured products (rotates daily)
    const shuffledForFeatured = shuffleWithSeed(products, dailySeed);
    const featuredIds = new Set(
      shuffledForFeatured.slice(0, FEATURED_COUNT).map(p => p._id.toString())
    );

    // Add dynamic properties
    products = products.map((product) => ({
      ...product,
      isNewProduct: product.isNewProduct || isProductNew(product.createdAt),
      isFeatured: featuredIds.has(product._id.toString()),
    }));

    // Filter by featured if requested
    if (featured === "true") {
      products = products.filter((p) => p.isFeatured);
    }

    // Filter by new products if requested
    if (isNew === "true") {
      products = products.filter((p) => p.isNewProduct);
    }

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const product = await Product.create(body);

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
