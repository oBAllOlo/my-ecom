"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { products, formatPrice } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const product = products.find((p) => p._id === productId);

  if (!product) {
    return (
      <div className="product-detail">
        <div className="cart-empty">
          <div className="cart-empty-icon">😕</div>
          <h3 className="cart-empty-title">ไม่พบสินค้า</h3>
          <p className="cart-empty-text">
            สินค้าที่คุณกำลังมองหาอาจถูกลบหรือไม่มีอยู่ในระบบ
          </p>
          <Link href="/products" className="btn btn-primary">
            กลับไปหน้าสินค้า
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Get related products (same category, excluding current)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p._id !== product._id)
    .slice(0, 4);

  return (
    <div className="product-detail">
      {/* Breadcrumb */}
      <nav style={{ marginBottom: "2rem", color: "var(--text-muted)" }}>
        <Link
          href="/"
          style={{ color: "var(--text-muted)", textDecoration: "none" }}
        >
          หน้าแรก
        </Link>
        {" / "}
        <Link
          href="/products"
          style={{ color: "var(--text-muted)", textDecoration: "none" }}
        >
          สินค้า
        </Link>
        {" / "}
        <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
      </nav>

      <div className="product-detail-grid">
        {/* Product Gallery */}
        <div className="product-gallery">
          <div className="product-main-image">
            <Image
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="product-detail-info">
          {/* Badges */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {product.isNew && <span className="badge badge-new">ใหม่</span>}
            {discount > 0 && (
              <span className="badge badge-sale">ลด {discount}%</span>
            )}
          </div>

          <span className="product-detail-brand">{product.brand}</span>
          <h1 className="product-detail-name">{product.name}</h1>

          {/* Rating */}
          <div className="product-detail-rating">
            <span className="stars" style={{ fontSize: "1.25rem" }}>
              {"★".repeat(Math.round(product.rating))}
              {"☆".repeat(5 - Math.round(product.rating))}
            </span>
            <span style={{ color: "var(--text-secondary)" }}>
              {product.rating} ({product.reviews} รีวิว)
            </span>
          </div>

          {/* Price */}
          <div className="product-detail-price">
            <span className="detail-price">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="detail-original-price">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="product-detail-description">{product.description}</p>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="product-features">
              {product.features.map((feature, index) => (
                <span key={index} className="feature-tag">
                  {feature}
                </span>
              ))}
            </div>
          )}

          {/* Specs */}
          <div className="product-specs">
            {product.switchType && (
              <div className="spec-item">
                <span className="spec-label">🔘 สวิตช์</span>
                <span className="spec-value">{product.switchType}</span>
              </div>
            )}
            {product.connectivity && (
              <div className="spec-item">
                <span className="spec-label">🔌 การเชื่อมต่อ</span>
                <span className="spec-value">{product.connectivity}</span>
              </div>
            )}
            <div className="spec-item">
              <span className="spec-label">📦 สต็อก</span>
              <span
                className="spec-value"
                style={{
                  color:
                    product.stock > 10
                      ? "#22C55E"
                      : product.stock > 0
                      ? "#F59E0B"
                      : "#EF4444",
                }}
              >
                {product.stock > 10
                  ? "มีสินค้า"
                  : product.stock > 0
                  ? `เหลือ ${product.stock} ชิ้น`
                  : "สินค้าหมด"}
              </span>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="quantity-selector">
            <span className="quantity-selector-label">จำนวน:</span>
            <div className="quantity-selector-controls">
              <button
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="add-to-cart-section">
            <button
              className="btn btn-primary btn-add-to-cart"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {addedToCart ? "✓ เพิ่มแล้ว!" : "🛒 เพิ่มลงตะกร้า"}
            </button>
          </div>

          {/* Extra Info */}
          <div
            style={{
              padding: "1rem",
              background: "rgba(139, 92, 246, 0.1)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
            }}
          >
            <p>🚚 ส่งฟรีเมื่อสั่งซื้อครบ ฿1,500</p>
            <p>🔒 รับประกันสินค้า 1 ปี</p>
            <p>↩️ เปลี่ยน/คืนสินค้าภายใน 7 วัน</p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section" style={{ padding: "3rem 0" }}>
          <div className="section-header">
            <h2 className="section-title">
              สินค้า<span>ที่เกี่ยวข้อง</span>
            </h2>
            <Link
              href={`/products?category=${product.category}`}
              className="view-all-link"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="products-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
