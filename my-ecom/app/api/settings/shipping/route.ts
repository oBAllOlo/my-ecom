import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { requireAdmin } from "@/lib/auth";

const defaultShippingSettings = {
  shippingCost: 50,
  freeShippingThreshold: 1500,
};

export async function GET() {
  try {
    await connectDB();

    let settings = await Settings.findOne({ key: "shipping" });

    if (!settings) {
      settings = await Settings.create({
        key: "shipping",
        value: defaultShippingSettings,
      });
    }

    return NextResponse.json({
      success: true,
      data: settings.value,
    });
  } catch (error) {
    console.error("Error fetching shipping settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) {
      return auth.response;
    }

    await connectDB();

    const body = await request.json();
    const { shippingCost, freeShippingThreshold } = body;

    if (typeof shippingCost !== "number" || shippingCost < 0) {
      return NextResponse.json(
        { success: false, error: "ค่าจัดส่งต้องเป็นตัวเลขที่ไม่ติดลบ" },
        { status: 400 }
      );
    }

    if (
      typeof freeShippingThreshold !== "number" ||
      freeShippingThreshold < 0
    ) {
      return NextResponse.json(
        { success: false, error: "ยอดขั้นต่ำสำหรับส่งฟรีต้องเป็นตัวเลขที่ไม่ติดลบ" },
        { status: 400 }
      );
    }

    const settings = await Settings.findOneAndUpdate(
      { key: "shipping" },
      { value: { shippingCost, freeShippingThreshold } },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: settings.value,
      message: "บันทึกการตั้งค่าเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error updating shipping settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
