import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CustomPart from "@/models/CustomPart";
import { requireAdmin } from "@/lib/auth";
import { customPartSelect } from "@/lib/custom-parts";

export const revalidate = 300;

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const query: Record<string, unknown> = {};
    if (category) query.category = category;
    if (activeOnly) query.isActive = true;

    const parts = await CustomPart.find(query)
      .select(customPartSelect)
      .sort({ category: 1, name: 1 })
      .lean();

    const data = parts.map((part) => ({
      _id: String(part._id),
      category: part.category,
      name: part.name,
      price: part.price,
      image: part.image,
      stock: part.stock,
      isActive: part.isActive,
    }));

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching custom parts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch custom parts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) {
      return auth.response;
    }

    await dbConnect();

    const body = await request.json();

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
