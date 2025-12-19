import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// GET user's saved address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId).select("address name email");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        address: user.address || null,
      },
    });
  } catch (error) {
    console.error("Error fetching user address:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch address" },
      { status: 500 }
    );
  }
}
