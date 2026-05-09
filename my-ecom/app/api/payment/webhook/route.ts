import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { verifyOmiseSignature } from "@/lib/payment";
import { releaseReservedStock } from "@/lib/orders";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-omise-signature") || "";

    if (
      !verifyOmiseSignature(payload, signature, process.env.OMISE_SECRET_KEY || "")
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);

    await dbConnect();

    if (event.key === "charge.complete") {
      const charge = event.data;
      const orderId = charge.metadata?.orderId;

      if (orderId) {
        const order = await Order.findById(orderId);

        if (!order) {
          return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (charge.status === "successful") {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "paid",
            status: "processing",
          });
        } else if (order.stockReserved) {
          await releaseReservedStock(order);
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "failed",
            status: "cancelled",
            stockReserved: false,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
