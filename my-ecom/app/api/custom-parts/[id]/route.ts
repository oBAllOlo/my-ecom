import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CustomPart from "@/models/CustomPart";
import { requireAdmin } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  try {
    await dbConnect();
    const { id } = await params;

    const part = await CustomPart.findById(id);

    if (!part) {
      return NextResponse.json(
        { success: false, error: "Custom part not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: part });
  } catch (error) {
    console.error("Error fetching custom part:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch custom part" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (auth.response) {
      return auth.response;
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const part = await CustomPart.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!part) {
      return NextResponse.json(
        { success: false, error: "Custom part not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: part });
  } catch (error) {
    console.error("Error updating custom part:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update custom part" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const auth = await requireAdmin();
    if (auth.response) {
      return auth.response;
    }

    await dbConnect();
    const { id } = await params;

    const part = await CustomPart.findByIdAndDelete(id);

    if (!part) {
      return NextResponse.json(
        { success: false, error: "Custom part not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Custom part deleted" });
  } catch (error) {
    console.error("Error deleting custom part:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete custom part" },
      { status: 500 }
    );
  }
}
