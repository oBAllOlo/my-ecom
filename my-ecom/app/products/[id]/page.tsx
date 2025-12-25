"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  brand: string;
  stock: number;
  rating: number;
  reviews: number;
  features?: string[];
  switchType?: string;
  connectivity?: string;
  isNewProduct?: boolean;
  isFeatured?: boolean;
}

interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(price);
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addToCart } = useCart();
  const { user } = useAuth();


  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Image gallery state
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
          // Fetch related products
          const relatedRes = await fetch(`/api/products?category=${data.data.category}`);
          const relatedData = await relatedRes.json();
          if (relatedData.success) {
            setRelatedProducts(relatedData.data.filter((p: Product) => p._id !== productId).slice(0, 4));
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // Set initial selected image when product loads
  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
    }
  }, [product]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, [productId, reviewSuccess]);

  const handleAddToCart = () => {
    if (!product) return;

    // ต้อง login ก่อนถึงจะเพิ่มสินค้าลงตะกร้าได้
    if (!user) {
      // ใช้ toast.id เพื่อป้องกันการแสดง toast ซ้ำ
      toast.error("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า", {
        id: "product-detail-add-to-cart-auth",
      });
      router.push("/login");
      return;
    }

    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmittingReview(true);
    setReviewError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          userId: user._id,
          userName: user.name,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setReviewSuccess(true);
        setShowReviewForm(false);
        setReviewForm({ rating: 5, title: "", comment: "" });
        // Refresh product to get updated rating
        const productRes = await fetch(`/api/products/${productId}`);
        const productData = await productRes.json();
        if (productData.success) {
          setProduct(productData.data);
        }
      } else {
        setReviewError(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewError("ไม่สามารถส่งรีวิวได้");
    } finally {
      setSubmittingReview(false);
    }
  };

  const hasUserReviewed = reviews.some(r => r.userId === user?._id);

  if (loading) {
    return (
      <div className="product-detail" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div className="admin-loading-spinner"></div>
      </div>
    );
  }

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
          {/* Main Image */}
          <div
            className="product-main-image"
            onClick={() => setLightboxOpen(true)}
            style={{ cursor: 'zoom-in', position: 'relative' }}
          >

            <img
              src={selectedImage || product.image}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '16px'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem'
            }}>
              🔍 คลิกเพื่อขยาย
            </div>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '1rem',
              flexWrap: 'wrap'
            }}>
              {product.images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedImage === img ? '3px solid #8b5cf6' : '2px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.95)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                fontSize: '2rem',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
            <img
              src={selectedImage || product.image}
              alt={product.name}
              style={{
                maxWidth: '90%',
                maxHeight: '90%',
                objectFit: 'contain',
                borderRadius: '12px'
              }}
              onClick={(e) => e.stopPropagation()}
            />
            {/* Lightbox Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  display: 'flex',
                  gap: '0.5rem'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedImage === img ? '2px solid #8b5cf6' : '2px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Product Info */}
        <div className="product-detail-info">
          {/* Badges */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {product.isNewProduct && <span className="badge badge-new">ใหม่</span>}
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
                {product.stock > 0
                  ? `มีสินค้า ${product.stock} ชิ้น`
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

      {/* Reviews Section */}
      <section style={{ marginTop: "4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2 style={{ color: "white", fontSize: "1.5rem", fontWeight: 700 }}>
            ⭐ รีวิวจากลูกค้า ({reviews.length})
          </h2>
          {user && !hasUserReviewed && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ✍️ เขียนรีวิว
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div style={{
            background: "rgba(30, 41, 59, 0.5)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "2rem",
            marginBottom: "2rem"
          }}>
            <h3 style={{ color: "white", marginBottom: "1.5rem" }}>เขียนรีวิว</h3>

            {reviewError && (
              <div style={{
                padding: "1rem",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "12px",
                color: "#ef4444",
                marginBottom: "1rem"
              }}>
                {reviewError}
              </div>
            )}

            <form onSubmit={handleSubmitReview}>
              {/* Rating */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  คะแนน
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "2rem",
                        cursor: "pointer",
                        color: star <= reviewForm.rating ? "#fbbf24" : "#4b5563"
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  หัวข้อรีวิว
                </label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem",
                    background: "rgba(15, 23, 42, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "1rem",
                    outline: "none"
                  }}
                  placeholder="เช่น คุณภาพดีมาก"
                />
              </div>

              {/* Comment */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  รายละเอียด
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  required
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem",
                    background: "rgba(15, 23, 42, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "1rem",
                    outline: "none",
                    resize: "vertical"
                  }}
                  placeholder="แชร์ประสบการณ์การใช้งานของคุณ..."
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  style={{
                    flex: 1,
                    padding: "0.875rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "white",
                    fontWeight: 500,
                    cursor: "pointer"
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    flex: 1,
                    padding: "0.875rem",
                    background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                    border: "none",
                    borderRadius: "12px",
                    color: "white",
                    fontWeight: 600,
                    cursor: submittingReview ? "not-allowed" : "pointer",
                    opacity: submittingReview ? 0.5 : 1
                  }}
                >
                  {submittingReview ? "กำลังส่ง..." : "ส่งรีวิว"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Success Message */}
        {reviewSuccess && (
          <div style={{
            padding: "1rem",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "12px",
            color: "#10b981",
            marginBottom: "2rem",
            textAlign: "center"
          }}>
            ✅ ส่งรีวิวสำเร็จ! ขอบคุณสำหรับความคิดเห็นของคุณ
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div style={{
            background: "rgba(30, 41, 59, 0.5)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "3rem",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
            <p style={{ color: "#64748b" }}>ยังไม่มีรีวิวสำหรับสินค้านี้</p>
            {user && !hasUserReviewed && (
              <button
                onClick={() => setShowReviewForm(true)}
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                เขียนรีวิวแรก
              </button>
            )}
            {!user && (
              <p style={{ color: "#64748b", marginTop: "1rem", fontSize: "0.875rem" }}>
                <Link href="/login" style={{ color: "#8b5cf6" }}>เข้าสู่ระบบ</Link> เพื่อเขียนรีวิว
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {reviews.map((review) => (
              <div
                key={review._id}
                style={{
                  background: "rgba(30, 41, 59, 0.5)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "1.5rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 600
                      }}>
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{review.userName}</p>
                        <p style={{ color: "#64748b", fontSize: "0.75rem" }}>
                          {new Date(review.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={{ color: "#fbbf24", fontSize: "1rem" }}>
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </div>
                </div>
                <h4 style={{ color: "white", fontWeight: 600, marginBottom: "0.5rem" }}>{review.title}</h4>
                <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

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
