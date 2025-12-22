"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // ต้อง login ก่อนถึงจะเพิ่มสินค้าลงตะกร้าได้
    if (!user) {
      showToast("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า", "error");
      router.push("/login");
      return;
    }

    addToCart(product, 1);
    showToast(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`, "success");
  };


  const discount = product.originalPrice
    ? Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100
    )
    : 0;

  return (
    <Link href={`/products/${product._id}`} className="product-card">
      {/* Badges */}
      <div className="product-badges">
        {product.isNewProduct && <span className="badge badge-new">ใหม่</span>}
        {discount > 0 && <span className="badge badge-sale">-{discount}%</span>}
      </div>

      {/* Image */}
      <div className="product-image-container">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={300}
          className="product-image"
        />
        <button className="quick-add-button" onClick={handleAddToCart}>
          🛒 เพิ่มลงตะกร้า
        </button>
      </div>

      {/* Info */}
      <div className="product-info">
        <span className="product-brand">{product.brand}</span>
        <h3 className="product-name">{product.name}</h3>

        {/* Rating */}
        <div className="product-rating">
          <span className="stars">
            {"★".repeat(Math.round(product.rating))}
            {"☆".repeat(5 - Math.round(product.rating))}
          </span>
          <span className="rating-text">({product.reviews})</span>
        </div>

        {/* Switch Type */}
        {product.switchType && (
          <p className="product-switch">🔘 {product.switchType}</p>
        )}

        {/* Price */}
        <div className="product-price-container">
          <span className="product-price">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="product-original-price">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock */}
        <div
          className={`stock-status ${product.stock > 10
              ? "in-stock"
              : product.stock > 0
                ? "low-stock"
                : "out-of-stock"
            }`}
        >
          {product.stock > 10
            ? "✓ มีสินค้า"
            : product.stock > 0
              ? `เหลือ ${product.stock} ชิ้น`
              : "สินค้าหมด"}
        </div>
      </div>
    </Link>
  );
}
