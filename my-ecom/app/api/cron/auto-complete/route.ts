import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

function isAuthorizedCronRequest(request: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET;

  if (!configuredSecret) {
    return process.env.NODE_ENV !== "production";
  }

  const headerSecret = request.headers.get("x-cron-secret");
  return headerSecret === configuredSecret;
}

async function runAutoComplete() {
  await dbConnect();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

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

  const result = await Order.updateMany(
    {
      status: "shipped",
      shippedAt: { $lt: sevenDaysAgo },
    },
    {
      $set: { status: "delivered" },
    }
  );

  return NextResponse.json({
    success: true,
    message: `Auto-complete ${result.modifiedCount} คำสั่งซื้อสำเร็จ`,
    updated: result.modifiedCount,
    orderIds: ordersToComplete.map((o) => o._id),
  });
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized cron request" },
        { status: 401 }
      );
    }

    return await runAutoComplete();
  } catch (error) {
    console.error("Error in auto-complete cron:", error);
    return NextResponse.json(
      { success: false, error: "Auto-complete failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
