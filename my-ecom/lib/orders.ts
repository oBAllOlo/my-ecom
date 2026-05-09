import Product from "@/models/Product";

interface StockReleaseOrder {
  items: Array<{ productId: string; quantity: number }>;
  stockReserved?: boolean;
}

export async function releaseReservedStock(order: StockReleaseOrder) {
  for (const item of order.items) {
    if (item.productId.startsWith("custom-")) {
      continue;
    }

    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity },
    });
  }
}
