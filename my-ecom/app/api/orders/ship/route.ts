import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { sendShippingEmail } from "@/lib/email";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.response) {
      return auth.response;
    }

    await dbConnect();

    const { orderId, trackingNumber, carrier } = await request.json();

    if (!orderId || !trackingNumber || !carrier) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId).populate("userId", "name email");
    if (!order) {
      return NextResponse.json(
        { success: false, error: "ไม่พบคำสั่งซื้อ" },
        { status: 404 }
      );
    }

    order.trackingNumber = trackingNumber;
    order.carrier = carrier;
    order.status = "shipped";
    order.shippedAt = new Date();
    await order.save();

    const user = order.userId as unknown as { name: string; email: string };
    if (user?.email) {
      await sendShippingEmail({
        to: user.email,
        customerName: user.name || order.shippingAddress.fullName,
        orderId: order._id.toString(),
        trackingNumber,
        carrier,
        items: order.items.map((item: { name: string; quantity: number }) => ({
          name: item.name,
          quantity: item.quantity,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: "อัปเดตการจัดส่งสำเร็จและส่งอีเมลแจ้งลูกค้าแล้ว",
      data: {
        trackingNumber,
        carrier,
        shippedAt: order.shippedAt,
      },
    });
  } catch (error) {
    console.error("Error updating shipping:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตการจัดส่ง" },
      { status: 500 }
    );
  }
}
