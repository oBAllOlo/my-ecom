import { NextRequest, NextResponse } from "next/server";
import Omise from "omise";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/auth";
import { canUserAccessOrder } from "@/lib/order-access";
import { toOmiseAmount } from "@/lib/payment";

const omise = Omise({
  secretKey: process.env.OMISE_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.response || !auth.user) {
      return auth.response!;
    }

    const { token, amount, orderId, currency = "thb" } = await request.json();

    if (!token || !amount || !orderId) {
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

    const charge = await omise.charges.create({
      amount: toOmiseAmount(amount),
      currency,
      card: token,
      metadata: { orderId },
    });

    const updateData: Record<string, unknown> = {
      paymentStatus: charge.status === "successful" ? "paid" : "pending",
      chargeId: charge.id,
      paymentMethod: "card",
    };

    if (charge.status === "successful") {
      updateData.status = "processing";
    }

    await Order.findByIdAndUpdate(orderId, updateData);

    return NextResponse.json({
      success: true,
      data: {
        chargeId: charge.id,
        status: charge.status,
        paid: charge.paid,
      },
    });
  } catch (error: unknown) {
    console.error("Omise charge error:", error);
    const errorMessage = error instanceof Error ? error.message : "Payment failed";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
