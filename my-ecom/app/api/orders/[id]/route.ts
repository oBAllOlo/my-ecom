import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

// GET single order by ID (supports full ID or last 8 characters)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    let order;

    // If ID is 24 characters, it's a full MongoDB ObjectId
    if (id.length === 24) {
      order = await Order.findById(id).populate("userId", "name email");
    } else {
      // Otherwise, search by the last 8 characters of _id
      // This allows customers to search with short order numbers like "1232D2D"
      const searchPattern = id.toLowerCase();
      order = await Order.findOne({
        $expr: {
          $regexMatch: {
            input: { $toString: "$_id" },
            regex: new RegExp(searchPattern + "$", "i"),
          },
        },
      }).populate("userId", "name email");
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}


// PUT update order status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { status } = await request.json();

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE order
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
