import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

// Auto-complete orders that have been shipped for more than 7 days
// This can be called by a cron job service (e.g., Vercel Cron, or external service)
export async function GET() {
    try {
        await dbConnect();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Find orders that:
        // 1. Status is "shipped"
        // 2. Were shipped more than 7 days ago
        const ordersToComplete = await Order.find({
            status: "shipped",
            shippedAt: { $lt: sevenDaysAgo },
        });

        if (ordersToComplete.length === 0) {
            return NextResponse.json({
                success: true,
                message: "ไม่มีคำสั่งซื้อที่ต้อง auto-complete",
                updated: 0,
            });
        }

        // Update all matching orders to delivered
        const result = await Order.updateMany(
            {
                status: "shipped",
                shippedAt: { $lt: sevenDaysAgo },
            },
            {
                $set: { status: "delivered" },
            }
        );

        console.log(`Auto-completed ${result.modifiedCount} orders`);

        return NextResponse.json({
            success: true,
            message: `Auto-complete ${result.modifiedCount} คำสั่งซื้อสำเร็จ`,
            updated: result.modifiedCount,
            orderIds: ordersToComplete.map((o) => o._id),
        });
    } catch (error) {
        console.error("Error in auto-complete cron:", error);
        return NextResponse.json(
            { success: false, error: "Auto-complete failed" },
            { status: 500 }
        );
    }
}

// POST can also be used to trigger manually
export async function POST() {
    return GET();
}
