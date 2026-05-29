import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/auth";
import { canUserAccessOrder } from "@/lib/order-access";

// DEMO MODE: payment is mocked. No Omise account required.
// Auth + ownership checks are kept; the charge itself is simulated as successful.

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.response || !auth.user) {
      return auth.response!;
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
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

    const chargeId = `demo_chrg_${order._id.toString()}`;

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "paid",
      status: "processing",
      paymentMethod: "card",
      chargeId,
    });

    return NextResponse.json({
      success: true,
      data: {
        chargeId,
        status: "successful",
        paid: true,
      },
    });
  } catch (error: unknown) {
    console.error("Demo charge error:", error);
    const errorMessage = error instanceof Error ? error.message : "Payment failed";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
