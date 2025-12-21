import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CustomPart from "@/models/CustomPart";

// GET all custom parts
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const activeOnly = searchParams.get("activeOnly") !== "false";

    // Build query
    const query: Record<string, unknown> = {};
    if (category) query.category = category;
    if (activeOnly) query.isActive = true;

    const parts = await CustomPart.find(query).sort({ category: 1, name: 1 });

    return NextResponse.json({ success: true, data: parts });
  } catch (error) {
    console.error("Error fetching custom parts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch custom parts" },
      { status: 500 }
    );
  }
}

// POST create new custom part
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    if (!body.category || !body.name || body.price === undefined || !body.image) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const part = await CustomPart.create(body);

    return NextResponse.json({ success: true, data: part }, { status: 201 });
  } catch (error) {
    console.error("Error creating custom part:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create custom part" },
      { status: 500 }
    );
  }
}
