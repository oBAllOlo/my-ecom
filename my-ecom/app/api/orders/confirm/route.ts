import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/auth";
import { canUserAccessOrder } from "@/lib/order-access";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.response || !auth.user) {
      return auth.response!;
    }

    await dbConnect();

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุหมายเลขคำสั่งซื้อ" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "ไม่พบคำสั่งซื้อ" },
        { status: 404 }
      );
    }

    if (
      !canUserAccessOrder(order.userId.toString(), auth.user._id, auth.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: "ไม่มีสิทธิ์ยืนยันคำสั่งซื้อนี้" },
        { status: 403 }
      );
    }

    if (order.status !== "shipped") {
      return NextResponse.json(
        { success: false, error: "สถานะคำสั่งซื้อไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    order.status = "delivered";
    await order.save();

    return NextResponse.json({
      success: true,
      message: "ยืนยันรับสินค้าเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ!",
      data: { status: order.status },
    });
  } catch (error) {
    console.error("Error confirming delivery:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการยืนยัน" },
      { status: 500 }
    );
  }
}
