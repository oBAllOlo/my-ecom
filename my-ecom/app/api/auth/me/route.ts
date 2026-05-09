import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch current user" },
      { status: 500 }
    );
  }
}
