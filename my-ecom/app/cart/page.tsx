"use client";

import Link from "next/link";
import { ShoppingCart, Wrench, Trash2, CreditCard, Truck, ChevronLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRequireAuth } from "@/lib/useRequireAuth";
import CartItemComponent from "@/components/CartItem";
import { formatPrice } from "@/lib/mockData";
import { toast } from "sonner";
import {
  PageContainer,
  PageHeader,
  Card,
  EmptyState,
  Button,
  Spinner,
  buttonClasses,
} from "@/components/ui";

export default function CartPage() {
  const { items, getCartTotal, clearCart } = useCart();
  const { authorized } = useRequireAuth();

  const subtotal = getCartTotal();
  const shipping = subtotal >= 1500 ? 0 : 50;
  const total = subtotal + shipping;

  const customItems = items.filter((i) => i.product.category === "custom");
  const regularItems = items.filter((i) => i.product.category !== "custom");

  if (!authorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="ตะกร้าสินค้า" />
        <EmptyState
          icon={ShoppingCart}
          title="ตะกร้าว่างเปล่า"
          description="คุณยังไม่ได้เพิ่มสินค้าลงในตะกร้า"
          action={
            <Link href="/products" className={buttonClasses({ variant: "primary" })}>
              เลือกซื้อสินค้า
            </Link>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={`ตะกร้าสินค้า (${items.length} รายการ)`} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* Items */}
        <div className="flex flex-col gap-6">
          {customItems.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg-muted">
                <Wrench className="h-4 w-4 text-brand" />
                คีย์บอร์ด Custom Build
              </h2>
              <div className="flex flex-col gap-3">
                {customItems.map((item) => (
                  <CartItemComponent key={item.product._id} item={item} />
                ))}
              </div>
            </div>
          )}

          {regularItems.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg-muted">
                <ShoppingCart className="h-4 w-4 text-brand" />
                สินค้าทั่วไป
              </h2>
              <div className="flex flex-col gap-3">
                {regularItems.map((item) => (
                  <CartItemComponent key={item.product._id} item={item} />
                ))}
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={() => {
              if (confirm("ต้องการลบสินค้าทั้งหมดออกจากตะกร้าหรือไม่?")) {
                clearCart();
                toast.success("ลบสินค้าทั้งหมดออกจากตะกร้าแล้ว");
              }
            }}
            className="w-fit text-danger hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
            ลบสินค้าทั้งหมด
          </Button>
        </div>

        {/* Summary */}
        <Card className="p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-semibold text-fg">สรุปคำสั่งซื้อ</h2>

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between text-fg-muted">
              <span>ราคาสินค้า</span>
              <span className="text-fg">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-fg-muted">
              <span>ค่าจัดส่ง</span>
              <span className={shipping === 0 ? "text-success" : "text-fg"}>
                {shipping === 0 ? "ฟรี!" : formatPrice(shipping)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="font-semibold text-fg">ยอดรวมทั้งสิ้น</span>
            <span className="text-xl font-bold text-fg">{formatPrice(total)}</span>
          </div>

          <Link
            href="/checkout"
            className={buttonClasses({ variant: "primary", className: "mt-5 w-full" })}
          >
            <CreditCard className="h-4 w-4" />
            ดำเนินการชำระเงิน
          </Link>

          {subtotal < 1500 && (
            <div className="mt-4 flex items-start gap-2 rounded-md bg-brand-subtle px-3 py-2.5 text-xs text-fg-muted">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>
                สั่งซื้อเพิ่มอีก{" "}
                <strong className="text-warning">{formatPrice(1500 - subtotal)}</strong>{" "}
                เพื่อรับส่งฟรี!
              </span>
            </div>
          )}

          <Link
            href="/products"
            className="mt-4 flex items-center justify-center gap-1 text-sm text-brand hover:text-brand-hover"
          >
            <ChevronLeft className="h-4 w-4" />
            เลือกซื้อสินค้าเพิ่มเติม
          </Link>
        </Card>
      </div>
    </PageContainer>
  );
}
