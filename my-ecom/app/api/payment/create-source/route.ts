import { NextRequest, NextResponse } from "next/server";
import Omise from "omise";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { requireAuth } from "@/lib/auth";
import { canUserAccessOrder } from "@/lib/order-access";
import { toOmiseAmount } from "@/lib/payment";

const secretKey = process.env.OMISE_SECRET_KEY;
const publicKey =
  process.env.OMISE_PUBLIC_KEY || process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY;

const omise = Omise({
  publicKey: publicKey || "",
  secretKey: secretKey || "",
});

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.response || !auth.user) {
      return auth.response!;
    }

    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: "OMISE_SECRET_KEY not configured" },
        { status: 500 }
      );
    }

    const { type, amount, orderId, currency = "thb" } = await request.json();

    if (!type || !amount || !orderId) {
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

    const amountInSatang = toOmiseAmount(amount);

    const source = await omise.sources.create({
      type,
      amount: amountInSatang,
      currency,
    } as Parameters<typeof omise.sources.create>[0]);

    const charge = await omise.charges.create({
      amount: amountInSatang,
      currency,
      source: source.id,
      return_uri: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/checkout/complete?orderId=${orderId}`,
      metadata: { orderId },
    } as Parameters<typeof omise.charges.create>[0]);

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "pending",
      chargeId: charge.id,
      paymentMethod: type === "promptpay" ? "promptpay" : "banking",
    });

    const sourceData = source as unknown as {
      type: string;
      scannable_code?: { image?: { download_uri?: string } };
    };

    return NextResponse.json({
      success: true,
      data: {
        chargeId: charge.id,
        status: charge.status,
        authorizeUri: (charge as unknown as { authorize_uri?: string }).authorize_uri,
        source: {
          type: sourceData.type,
          scannable_code: sourceData.scannable_code,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Omise source error:", error);

    let errorMessage = "Payment failed";
    if (error && typeof error === "object") {
      const omiseError = error as { message?: string; code?: string };
      errorMessage = omiseError.message || omiseError.code || errorMessage;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
