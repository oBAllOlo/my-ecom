import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import crypto from "crypto";

// Verify Omise webhook signature
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.OMISE_SECRET_KEY!;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return signature === expectedSignature;
}

// Release stock back to products
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function releaseStock(order: any) {
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity }
    });
    console.log(`Released ${item.quantity} stock for product ${item.productId}`);
  }
}

// Handle Omise webhook events
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-omise-signature") || "";

    // In production, verify the signature
    // if (!verifySignature(payload, signature)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const event = JSON.parse(payload);
    
    console.log("Omise webhook event:", event.key);

    await dbConnect();

    // Handle charge complete event
    if (event.key === "charge.complete") {
      const charge = event.data;
      const orderId = charge.metadata?.orderId;

      if (orderId) {
        const order = await Order.findById(orderId);
        
        if (!order) {
          console.error(`Order ${orderId} not found`);
          return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (charge.status === "successful") {
          // Payment successful - keep stock reserved
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "paid",
            status: "processing",
          });
          console.log(`Order ${orderId} payment successful`);
        } else {
          // Payment failed - release stock back
          if (order.stockReserved) {
            await releaseStock(order);
            await Order.findByIdAndUpdate(orderId, {
              paymentStatus: "failed",
              status: "cancelled",
              stockReserved: false,
            });
            console.log(`Order ${orderId} payment failed, stock released`);
          }
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
