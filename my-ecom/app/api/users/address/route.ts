import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.response || !auth.user) {
      return auth.response!;
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");

    if (requestedUserId && requestedUserId !== auth.user._id && auth.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    await dbConnect();

    const user = await User.findById(requestedUserId || auth.user._id).select(
      "address name email"
    );

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
