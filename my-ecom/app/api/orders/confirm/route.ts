import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

// POST - Customer confirms they received the order
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const { orderId, userId } = await request.json();

        if (!orderId) {
            return NextResponse.json(
                { success: false, error: "กรุณาระบุหมายเลขคำสั่งซื้อ" },
                { status: 400 }
            );
        }

        // Find the order
        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json(
                { success: false, error: "ไม่พบคำสั่งซื้อ" },
                { status: 404 }
            );
        }

        // Verify the order belongs to the user (if userId provided)
        if (userId && order.userId.toString() !== userId) {
            return NextResponse.json(
                { success: false, error: "ไม่มีสิทธิ์ยืนยันคำสั่งซื้อนี้" },
                { status: 403 }
            );
        }

        // Order must be in "shipped" status to confirm delivery
        if (order.status !== "shipped") {
            return NextResponse.json(
                { success: false, error: "สถานะคำสั่งซื้อไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        // Update order to delivered
        order.status = "delivered";
        await order.save();

        return NextResponse.json({
            success: true,
            message: "ยืนยันรับสินค้าเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ!",
            data: {
                status: order.status,
            },
        });
    } catch (error) {
        console.error("Error confirming delivery:", error);
        return NextResponse.json(
            { success: false, error: "เกิดข้อผิดพลาดในการยืนยัน" },
            { status: 500 }
        );
    }
}
