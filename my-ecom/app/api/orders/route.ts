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

    // =============================================
    // Atomic Stock Update - ป้องกัน Race Condition
    // =============================================

    // เก็บ items ที่ลด stock สำเร็จแล้ว (สำหรับ rollback ถ้าเกิด error)
    const reservedItems: { productId: string; quantity: number }[] = [];

    for (const item of body.items) {
      // Skip stock check for custom products (they don't exist in Product DB)
      if (item.productId.startsWith("custom-")) {
        console.log(`Skipping stock check for custom product: ${item.productId}`);
        continue;
      }

      // ใช้ Atomic Update: ตรวจสอบ stock และลดในคำสั่งเดียว
      const result = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: item.quantity }  // เงื่อนไข: stock ต้อง >= จำนวนที่ต้องการ
        },
        {
          $inc: { stock: -item.quantity }  // ลด stock
        },
        { new: true }
      );

      if (!result) {
        // Stock ไม่พอ หรือสินค้าไม่มี - ต้อง rollback ที่ลดไปก่อนหน้า
        console.log(`Stock insufficient for ${item.name}, rolling back...`);

        // Rollback: คืน stock ที่ลดไปแล้ว
        for (const reserved of reservedItems) {
          await Product.findByIdAndUpdate(reserved.productId, {
            $inc: { stock: reserved.quantity }
          });
        }

        // ดึงข้อมูล stock ปัจจุบันเพื่อแจ้งลูกค้า
        const currentProduct = await Product.findById(item.productId);
        const availableStock = currentProduct?.stock || 0;

        return NextResponse.json(
          {
            success: false,
            error: availableStock > 0
              ? `สินค้า "${item.name}" เหลือเพียง ${availableStock} ชิ้น`
              : `สินค้า "${item.name}" หมดแล้ว`
          },
          { status: 400 }
        );
      }

      // สำเร็จ - เก็บไว้สำหรับ rollback ถ้า item ถัดไปมีปัญหา
      reservedItems.push({ productId: item.productId, quantity: item.quantity });
    }

    // ผ่านหมดแล้ว - สร้าง order
    const order = await Order.create({
      ...body,
      stockReserved: true,
    });

    // Save shipping address to user for future orders
    await User.findByIdAndUpdate(body.userId, {
      address: body.shippingAddress,
    });

    console.log(`Order created with atomic stock reservation, address saved to user`);


    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
