"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CartItemComponent from "@/components/CartItem";
import { formatPrice } from "@/lib/mockData";

export default function CartPage() {
  const { items, getCartTotal, clearCart } = useCart();

  const subtotal = getCartTotal();
  const shipping = subtotal >= 1500 ? 0 : 50;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-page-title">🛒 ตะกร้าสินค้า</h1>
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h3 className="cart-empty-title">ตะกร้าว่างเปล่า</h3>
          <p className="cart-empty-text">คุณยังไม่ได้เพิ่มสินค้าลงในตะกร้า</p>
          <Link href="/products" className="btn btn-primary">
            🛍️ เลือกซื้อสินค้า
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-page-title">
        🛒 ตะกร้าสินค้า ({items.length} รายการ)
      </h1>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          {items.map((item) => (
            <CartItemComponent key={item.product._id} item={item} />
          ))}

          {/* Clear Cart Button */}
          <button
            onClick={clearCart}
            className="btn btn-secondary"
            style={{ alignSelf: "flex-start", marginTop: "1rem" }}
          >
            🗑️ ลบสินค้าทั้งหมด
          </button>
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <h2 className="cart-summary-title">สรุปคำสั่งซื้อ</h2>

          <div className="cart-summary-row">
            <span>ราคาสินค้า</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="cart-summary-row">
            <span>ค่าจัดส่ง</span>
            <span style={{ color: shipping === 0 ? "#22C55E" : "inherit" }}>
              {shipping === 0 ? "ฟรี!" : formatPrice(shipping)}
            </span>
          </div>

          <div className="cart-summary-total">
            <span>ยอดรวมทั้งสิ้น</span>
            <span className="total-price">{formatPrice(total)}</span>
          </div>

          <Link href="/checkout" className="btn btn-primary checkout-button">
            💳 ดำเนินการชำระเงิน
          </Link>

          {subtotal < 1500 && (
            <div className="cart-summary-note">
              🚚 สั่งซื้อเพิ่มอีก {formatPrice(1500 - subtotal)} เพื่อรับส่งฟรี!
            </div>
          )}

          <Link
            href="/products"
            style={{
              display: "block",
              textAlign: "center",
              marginTop: "1rem",
              color: "var(--primary-light)",
              textDecoration: "none",
            }}
          >
            ← เลือกซื้อสินค้าเพิ่มเติม
          </Link>
        </div>
      </div>
    </div>
  );
}
