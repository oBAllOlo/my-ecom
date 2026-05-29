"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, ShoppingCart } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Badge, Button } from "@/components/ui";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า", {
        id: "product-add-to-cart-auth",
      });
      router.push("/login");
      return;
    }

    addToCart(product, 1);
    toast.success(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`);
  };

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const rounded = Math.round(product.rating);
  const stockTone =
    product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "danger";
  const stockLabel =
    product.stock > 10
      ? "มีสินค้า"
      : product.stock > 0
      ? `เหลือ ${product.stock} ชิ้น`
      : "สินค้าหมด";

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-line-strong">
      <Link href={`/products/${product._id}`} className="relative block">
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.isNewProduct && <Badge tone="brand">ใหม่</Badge>}
          {discount > 0 && <Badge tone="danger">-{discount}%</Badge>}
        </div>
        <div className="aspect-[4/3] overflow-hidden bg-bg-deep">
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={300}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/products/${product._id}`} className="flex flex-1 flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand">
            {product.brand}
          </span>
          <h3 className="line-clamp-2 font-semibold leading-snug text-fg">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < rounded
                      ? "h-3.5 w-3.5 fill-warning text-warning"
                      : "h-3.5 w-3.5 text-fg-subtle"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-fg-subtle">({product.reviews})</span>
          </div>

          {product.switchType && (
            <p className="text-sm text-fg-muted">{product.switchType}</p>
          )}

          <div className="mt-auto flex items-baseline gap-2 pt-1">
            <span className="text-xl font-bold text-fg">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-fg-subtle line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <Badge tone={stockTone} className="w-fit">
            {stockLabel}
          </Badge>
        </Link>

        <Button
          variant="primary"
          size="sm"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="mt-2 w-full"
        >
          <ShoppingCart className="h-4 w-4" />
          เพิ่มลงตะกร้า
        </Button>
      </div>
    </div>
  );
}
