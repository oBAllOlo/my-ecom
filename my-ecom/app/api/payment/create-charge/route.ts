import { NextRequest, NextResponse } from "next/server";
import Omise from "omise";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

const omise = Omise({
  secretKey: process.env.OMISE_SECRET_KEY!,
});

// Create charge for Credit Card payment
export async function POST(request: NextRequest) {
  try {
    const { token, amount, orderId, currency = "thb" } = await request.json();

    if (!token || !amount || !orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create charge via Omise
    const charge = await omise.charges.create({
      amount: Math.round(amount * 100), // Convert to satang
      currency,
      card: token,
      metadata: { orderId },
    });

    await dbConnect();

    // Update order with payment info
    // If payment is successful, also update order status to "processing"
    const updateData: Record<string, unknown> = {
      paymentStatus: charge.status === "successful" ? "paid" : "pending",
      chargeId: charge.id,
      paymentMethod: "card",
    };

    // If charge is successful, update order status to processing
    if (charge.status === "successful") {
      updateData.status = "processing";
      console.log(`Order ${orderId} payment successful - status updated to processing`);
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
