import { NextRequest, NextResponse } from "next/server";
import Omise from "omise";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

const secretKey = process.env.OMISE_SECRET_KEY;
const publicKey = process.env.OMISE_PUBLIC_KEY;
console.log("Omise Secret Key loaded:", secretKey ? `${secretKey.substring(0, 15)}...` : "NOT SET");
console.log("Omise Public Key loaded:", publicKey ? `${publicKey.substring(0, 15)}...` : "NOT SET");

const omise = Omise({
  publicKey: publicKey || "",
  secretKey: secretKey || "",
});

// Create source for PromptPay or Internet Banking
export async function POST(request: NextRequest) {
  try {
    // Check if key is set
    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: "OMISE_SECRET_KEY not configured" },
        { status: 500 }
      );
    }

    const { type, amount, orderId, currency = "thb" } = await request.json();

    console.log("Create source request:", { type, amount, orderId, currency });

    if (!type || !amount || !orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const amountInSatang = Math.round(amount * 100);

    // Create source
    const source = await omise.sources.create({
      type,
      amount: amountInSatang,
      currency,
    } as Parameters<typeof omise.sources.create>[0]);

    console.log("Source created:", source.id);

    // Create charge with source
    const charge = await omise.charges.create({
      amount: amountInSatang,
      currency,
      source: source.id,
      return_uri: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/complete?orderId=${orderId}`,
      metadata: { orderId },
    } as Parameters<typeof omise.charges.create>[0]);

    console.log("Charge created:", charge.id, "Status:", charge.status);

    await dbConnect();

    // Update order
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "pending",
      chargeId: charge.id,
      paymentMethod: type === "promptpay" ? "promptpay" : "banking",
    });

    // Get scannable_code for PromptPay
    const sourceData = source as unknown as { 
      type: string; 
      scannable_code?: { 
        image?: { 
          download_uri?: string 
        } 
      } 
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
    
    // Extract error message from Omise error format
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
