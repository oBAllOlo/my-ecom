import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";

interface OrderItemInput {
  productId: string;
  name: string;
  quantity: number;
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if (auth.response || !auth.user) {
      return auth.response!;
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    if (auth.user.role === "admin" && requestedUserId) {
      query.userId = requestedUserId;
    } else {
      query.userId = auth.user._id;
    }

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

export async function POST(request: Request) {
  const reservedItems: Array<{ productId: string; quantity: number }> = [];

  try {
    const auth = await requireAuth();
    if (auth.response || !auth.user) {
      return auth.response!;
    }

    await dbConnect();

    const body = await request.json();

    if (
      !body.items ||
      !Array.isArray(body.items) ||
      !body.total ||
      !body.shippingAddress ||
      !body.paymentMethod
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    for (const item of body.items as OrderItemInput[]) {
      if (item.productId.startsWith("custom-")) {
        continue;
      }

      const result = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!result) {
        for (const reserved of reservedItems) {
          await Product.findByIdAndUpdate(reserved.productId, {
            $inc: { stock: reserved.quantity },
          });
        }

        const currentProduct = await Product.findById(item.productId);
        const availableStock = currentProduct?.stock || 0;

        return NextResponse.json(
          {
            success: false,
            error:
              availableStock > 0
                ? `สินค้า "${item.name}" เหลือเพียง ${availableStock} ชิ้น`
                : `สินค้า "${item.name}" หมดแล้ว`,
          },
          { status: 400 }
        );
      }

      reservedItems.push({ productId: item.productId, quantity: item.quantity });
    }

    const order = await Order.create({
      ...body,
      userId: auth.user._id,
      stockReserved: true,
    });

    await User.findByIdAndUpdate(auth.user._id, {
      address: body.shippingAddress,
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    for (const reserved of reservedItems) {
      try {
        await Product.findByIdAndUpdate(reserved.productId, {
          $inc: { stock: reserved.quantity },
        });
      } catch (rollbackError) {
        console.error("Error rolling back reserved stock:", rollbackError);
      }
    }

    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
