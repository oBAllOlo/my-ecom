"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
  ShoppingCart,
  Minus,
  Plus,
  X,
  PenLine,
  MessageSquare,
  Cpu,
  Cable,
  Package,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
import {
  PageContainer,
  Card,
  Badge,
  Button,
  Field,
  Input,
  Textarea,
  EmptyState,
  Spinner,
  buttonClasses,
  cn,
} from "@/components/ui";

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

const formatPrice = (price: number) =>
  `${new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(price)} บาท`;

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("flex", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < Math.round(value)
              ? "h-4 w-4 fill-warning text-warning"
              : "h-4 w-4 text-fg-subtle"
          }
        />
      ))}
    </div>
  );
}

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

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
          const relatedRes = await fetch(`/api/products?category=${data.data.category}`);
          const relatedData = await relatedRes.json();
          if (relatedData.success) {
            setRelatedProducts(
              relatedData.data
                .filter((p: Product) => p._id !== productId)
                .slice(0, 4)
            );
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

  useEffect(() => {
    if (product) setSelectedImage(product.image);
  }, [product]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        const data = await res.json();
        if (data.success) setReviews(data.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, [productId, reviewSuccess]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า", {
        id: "product-detail-add-to-cart-auth",
      });
      router.push("/login");
      return;
    }
    addToCart(product, quantity);
    toast.success(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`);
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
        const productRes = await fetch(`/api/products/${productId}`);
        const productData = await productRes.json();
        if (productData.success) setProduct(productData.data);
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

  const hasUserReviewed = reviews.some((r) => r.userId === user?._id);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer>
        <EmptyState
          icon={Package}
          title="ไม่พบสินค้า"
          description="สินค้าที่คุณกำลังมองหาอาจถูกลบหรือไม่มีอยู่ในระบบ"
          action={
            <Link href="/products" className={buttonClasses({ variant: "primary" })}>
              กลับไปหน้าสินค้า
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const stockTone = product.stock > 10 ? "text-success" : product.stock > 0 ? "text-warning" : "text-danger";

  return (
    <PageContainer>
      {/* Back + breadcrumb */}
      <Link
        href="/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-fg-muted transition-colors hover:text-fg"
      >
        <ChevronLeft className="h-4 w-4" /> ย้อนกลับ
      </Link>
      <nav className="mb-6 text-sm text-fg-subtle">
        <Link href="/" className="hover:text-fg">หน้าแรก</Link>
        <span className="px-1.5">/</span>
        <Link href="/products" className="hover:text-fg">สินค้า</Link>
        <span className="px-1.5">/</span>
        <span className="text-fg">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div
            onClick={() => setLightboxOpen(true)}
            className="cursor-zoom-in overflow-hidden rounded-xl border border-line bg-bg-deep"
          >
            <img
              src={selectedImage || product.image}
              alt={product.name}
              className="block h-auto w-full object-contain"
            />
          </div>
          {product.images && product.images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={cn(
                    "h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors",
                    selectedImage === img ? "border-brand" : "border-line hover:border-line-strong"
                  )}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {product.isNewProduct && <Badge tone="brand">ใหม่</Badge>}
            {discount > 0 && <Badge tone="danger">ลด {discount}%</Badge>}
          </div>

          <span className="text-sm font-semibold uppercase tracking-wide text-brand">
            {product.brand}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            {product.name}
          </h1>

          <div className="flex items-center gap-2">
            <Stars value={product.rating} />
            <span className="text-sm text-fg-muted">
              {product.rating} ({product.reviews} รีวิว)
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-fg">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-lg text-fg-subtle line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="leading-relaxed text-fg-muted">{product.description}</p>

          {product.features && product.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.features.map((feature, index) => (
                <Badge key={index} tone="brand">{feature}</Badge>
              ))}
            </div>
          )}

          <Card className="flex flex-col divide-y divide-line">
            {product.switchType && (
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="flex items-center gap-2 text-fg-muted">
                  <Cpu className="h-4 w-4" /> สวิตช์
                </span>
                <span className="font-medium text-fg">{product.switchType}</span>
              </div>
            )}
            {product.connectivity && (
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="flex items-center gap-2 text-fg-muted">
                  <Cable className="h-4 w-4" /> การเชื่อมต่อ
                </span>
                <span className="font-medium text-fg">{product.connectivity}</span>
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-fg-muted">
                <Package className="h-4 w-4" /> สต็อก
              </span>
              <span className={cn("font-medium", stockTone)}>
                {product.stock > 0 ? `มีสินค้า ${product.stock} ชิ้น` : "สินค้าหมด"}
              </span>
            </div>
          </Card>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-fg-muted">จำนวน</span>
            <div className="flex items-center gap-1 rounded-md border border-line bg-bg-deep p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-8 w-8 items-center justify-center rounded text-fg-muted hover:bg-white/5 hover:text-fg disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-semibold text-fg">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="flex h-8 w-8 items-center justify-center rounded text-fg-muted hover:bg-white/5 hover:text-fg disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full sm:w-auto"
          >
            {addedToCart ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
            {addedToCart ? "เพิ่มแล้ว!" : "เพิ่มลงตะกร้า"}
          </Button>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-fg">
            รีวิวจากลูกค้า ({reviews.length})
          </h2>
          {user && !hasUserReviewed && !showReviewForm && (
            <Button variant="secondary" onClick={() => setShowReviewForm(true)}>
              <PenLine className="h-4 w-4" /> เขียนรีวิว
            </Button>
          )}
        </div>

        {showReviewForm && (
          <Card className="mb-6 p-6">
            <h3 className="mb-4 font-semibold text-fg">เขียนรีวิว</h3>
            {reviewError && (
              <div className="mb-4 rounded-md bg-danger/10 px-4 py-2.5 text-sm text-danger">
                {reviewError}
              </div>
            )}
            <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
              <Field label="คะแนน">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      <Star
                        className={
                          star <= reviewForm.rating
                            ? "h-7 w-7 fill-warning text-warning"
                            : "h-7 w-7 text-fg-subtle"
                        }
                      />
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="หัวข้อรีวิว" required>
                <Input
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  required
                  placeholder="เช่น คุณภาพดีมาก"
                />
              </Field>
              <Field label="รายละเอียด" required>
                <Textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  required
                  rows={4}
                  placeholder="แชร์ประสบการณ์การใช้งานของคุณ..."
                />
              </Field>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
                <Button type="submit" variant="primary" disabled={submittingReview} className="flex-1">
                  {submittingReview ? "กำลังส่ง..." : "ส่งรีวิว"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {reviewSuccess && (
          <div className="mb-6 rounded-md bg-success/10 px-4 py-3 text-center text-sm text-success">
            ส่งรีวิวสำเร็จ! ขอบคุณสำหรับความคิดเห็นของคุณ
          </div>
        )}

        {reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="ยังไม่มีรีวิวสำหรับสินค้านี้"
            action={
              user && !hasUserReviewed ? (
                <Button variant="primary" onClick={() => setShowReviewForm(true)}>
                  เขียนรีวิวแรก
                </Button>
              ) : !user ? (
                <Link href="/login" className={buttonClasses({ variant: "secondary" })}>
                  เข้าสู่ระบบเพื่อเขียนรีวิว
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((review) => (
              <Card key={review._id} className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-semibold text-white">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-fg">{review.userName}</p>
                      <p className="text-xs text-fg-subtle">
                        {new Date(review.createdAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <Stars value={review.rating} />
                </div>
                <h4 className="mb-1 font-semibold text-fg">{review.title}</h4>
                <p className="leading-relaxed text-fg-muted">{review.comment}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-fg">สินค้าที่เกี่ยวข้อง</h2>
            <Link
              href={`/products?category=${product.category}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-hover"
            >
              ดูทั้งหมด <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={selectedImage || product.image}
            alt={product.name}
            className="max-h-[90%] max-w-[90%] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </PageContainer>
  );
}
