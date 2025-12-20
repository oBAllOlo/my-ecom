import { NextRequest, NextResponse } from "next/server";
import Omise from "omise";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

const omise = Omise({
    secretKey: process.env.OMISE_SECRET_KEY!,
});

// Check payment status for an order and update if successful
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get("orderId");

        if (!orderId) {
            return NextResponse.json(
                { success: false, error: "Missing orderId" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json(
                { success: false, error: "Order not found" },
                { status: 404 }
            );
        }

        // If already paid, return current status
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

        // If no chargeId, payment hasn't been initiated
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

        // Retrieve charge status from Omise
        const charge = await omise.charges.retrieve(order.chargeId);

        // Update order based on charge status
        if (charge.status === "successful" && order.paymentStatus !== "paid") {
            order.paymentStatus = "paid";
            order.status = "processing";
            await order.save();

            console.log(`Order ${orderId} payment verified - status updated to processing`);

            return NextResponse.json({
                success: true,
                data: {
                    paymentStatus: "paid",
                    orderStatus: "processing",
                    updated: true,
                },
            });
        } else if (charge.status === "failed") {
            order.paymentStatus = "failed";
            await order.save();

            return NextResponse.json({
                success: true,
                data: {
                    paymentStatus: "failed",
                    orderStatus: order.status,
                },
            });
        }

        // Still pending
        return NextResponse.json({
            success: true,
            data: {
                paymentStatus: order.paymentStatus,
                orderStatus: order.status,
                chargeStatus: charge.status,
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
