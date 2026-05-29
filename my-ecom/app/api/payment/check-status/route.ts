import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/auth";
import { canUserAccessOrder } from "@/lib/order-access";

// DEMO MODE: no Omise lookup. Payment status reflects whatever is stored on the
// order (the mocked charge marks it "paid" immediately at checkout).

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.response || !auth.user) {
      return auth.response!;
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing orderId" },
        { status: 400 }
      );
    }

    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (
      !canUserAccessOrder(order.userId.toString(), auth.user._id, auth.user.role)
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({
        success: true,
        data: {
          paymentStatus: order.paymentStatus,
          orderStatus: order.status,
          alreadyPaid: true,
        },
      });
    }

    if (!order.chargeId) {
      return NextResponse.json({
        success: true,
        data: {
          paymentStatus: order.paymentStatus,
          orderStatus: order.status,
          noCharge: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
      },
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
