import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

// GET all orders
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    // Build query
    const query: Record<string, unknown> = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST create new order
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    if (!body.userId || !body.items || !body.total || !body.shippingAddress || !body.paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check and reserve stock for each item
    for (const item of body.items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return NextResponse.json(
          { success: false, error: `สินค้า ${item.name} ไม่พบในระบบ` },
          { status: 400 }
        );
      }
      
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `สินค้า ${item.name} มีเหลือเพียง ${product.stock} ชิ้น` },
          { status: 400 }
        );
      }
    }

    // Decrease stock for each item (reserve stock)
    for (const item of body.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // Create order with stockReserved = true
    const order = await Order.create({
      ...body,
      stockReserved: true,
    });

    // Save shipping address to user for future orders
    await User.findByIdAndUpdate(body.userId, {
      address: body.shippingAddress,
    });

    console.log(`Order created with stock reserved, address saved to user`);

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
