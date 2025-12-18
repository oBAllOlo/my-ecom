"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/mockData";

export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const subtotal = getCartTotal();
  const shipping = subtotal >= 1500 ? 0 : 50;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setOrderComplete(true);
    clearCart();
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="checkout-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h3 className="cart-empty-title">ตะกร้าว่างเปล่า</h3>
          <p className="cart-empty-text">กรุณาเพิ่มสินค้าก่อนทำการชำระเงิน</p>
          <Link href="/products" className="btn btn-primary">
            🛍️ เลือกซื้อสินค้า
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="checkout-page">
        <div
          className="cart-empty"
          style={{ background: "rgba(34, 197, 94, 0.1)" }}
        >
          <div className="cart-empty-icon">🎉</div>
          <h3 className="cart-empty-title" style={{ color: "#22C55E" }}>
            สั่งซื้อสำเร็จ!
          </h3>
          <p className="cart-empty-text">
            ขอบคุณสำหรับการสั่งซื้อ เราจะดำเนินการจัดส่งโดยเร็วที่สุด
          </p>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
            หมายเลขคำสั่งซื้อ: #KB{Date.now().toString().slice(-8)}
          </p>
          <Link href="/" className="btn btn-primary">
            🏠 กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">💳 ชำระเงิน</h1>

      <div className="checkout-layout">
        {/* Checkout Form */}
        <form className="checkout-form" onSubmit={handleSubmit}>
          {/* Shipping Information */}
          <div className="form-section">
            <h2 className="form-section-title">📦 ข้อมูลการจัดส่ง</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="กรอกชื่อ-นามสกุล"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="0xx-xxx-xxxx"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">อีเมล</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label">ที่อยู่</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="บ้านเลขที่ ถนน ซอย"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">แขวง/ตำบล</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="แขวง/ตำบล"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">เขต/อำเภอ</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="เขต/อำเภอ"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">จังหวัด</label>
                <select className="form-select" required>
                  <option value="">เลือกจังหวัด</option>
                  <option value="bangkok">กรุงเทพมหานคร</option>
                  <option value="nonthaburi">นนทบุรี</option>
                  <option value="pathum-thani">ปทุมธานี</option>
                  <option value="samut-prakan">สมุทรปราการ</option>
                  <option value="chiang-mai">เชียงใหม่</option>
                  <option value="chonburi">ชลบุรี</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">รหัสไปรษณีย์</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="10xxx"
                  required
                  maxLength={5}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="form-section">
            <h2 className="form-section-title">💰 วิธีการชำระเงิน</h2>
            <div className="payment-options">
              <label
                className={`payment-option ${
                  paymentMethod === "credit-card" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="credit-card"
                  checked={paymentMethod === "credit-card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="payment-icon">💳</span>
                <span className="payment-label">บัตรเครดิต/เดบิต</span>
              </label>

              <label
                className={`payment-option ${
                  paymentMethod === "bank-transfer" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="bank-transfer"
                  checked={paymentMethod === "bank-transfer"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="payment-icon">🏦</span>
                <span className="payment-label">โอนเงินผ่านธนาคาร</span>
              </label>

              <label
                className={`payment-option ${
                  paymentMethod === "promptpay" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="promptpay"
                  checked={paymentMethod === "promptpay"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="payment-icon">📱</span>
                <span className="payment-label">พร้อมเพย์ / QR Code</span>
              </label>

              <label
                className={`payment-option ${
                  paymentMethod === "cod" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="payment-icon">📦</span>
                <span className="payment-label">เก็บเงินปลายทาง (+฿30)</span>
              </label>
            </div>
          </div>

          {/* Credit Card Form (shown only if credit card selected) */}
          {paymentMethod === "credit-card" && (
            <div className="form-section">
              <h2 className="form-section-title">💳 ข้อมูลบัตร</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">หมายเลขบัตร</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="xxxx xxxx xxxx xxxx"
                    maxLength={19}
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">ชื่อบนบัตร</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="NAME ON CARD"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">วันหมดอายุ</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="xxx"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Order Summary */}
        <div className="order-summary">
          <h2 className="order-summary-title">📋 สรุปคำสั่งซื้อ</h2>

          {/* Order Items */}
          <div className="order-items">
            {items.map((item) => (
              <div key={item.product._id} className="order-item">
                <div className="order-item-image">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    width={60}
                    height={60}
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="order-item-info">
                  <p className="order-item-name">{item.product.name}</p>
                  <p className="order-item-qty">จำนวน: {item.quantity}</p>
                </div>
                <span className="order-item-price">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Price Summary */}
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

          {paymentMethod === "cod" && (
            <div className="cart-summary-row">
              <span>ค่าเก็บเงินปลายทาง</span>
              <span>{formatPrice(30)}</span>
            </div>
          )}

          <div className="cart-summary-total">
            <span>ยอดรวมทั้งสิ้น</span>
            <span className="total-price">
              {formatPrice(total + (paymentMethod === "cod" ? 30 : 0))}
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary place-order-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "⏳ กำลังดำเนินการ..." : "✓ ยืนยันคำสั่งซื้อ"}
          </button>

          <div className="cart-summary-note">
            🔒 ข้อมูลของคุณได้รับการปกป้องด้วยการเข้ารหัส SSL
          </div>

          <Link
            href="/cart"
            style={{
              display: "block",
              textAlign: "center",
              marginTop: "1rem",
              color: "var(--primary-light)",
              textDecoration: "none",
            }}
          >
            ← กลับไปตะกร้าสินค้า
          </Link>
        </div>
      </div>
    </div>
  );
}
