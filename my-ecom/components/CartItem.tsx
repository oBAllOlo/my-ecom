"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/lib/types";
import { formatPrice } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;
  const atMax = quantity >= product.stock;

  return (
    <div className="flex gap-4 rounded-xl border border-line bg-surface p-4">
      {/* Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-bg-deep sm:h-28 sm:w-28">
        {product.category === "custom" &&
        product.images &&
        product.images.length > 1 ? (
          product.images.map((img, index) => (
            <Image
              key={index}
              src={img}
              alt={`${product.name} layer ${index + 1}`}
              fill
              className="object-contain"
              style={{ zIndex: index + 1 }}
            />
          ))
        ) : (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain"
          />
        )}
      </div>

      {/* Info + controls */}
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-fg">{product.name}</h3>
          <p className="text-sm font-medium text-brand">{product.brand}</p>
          {product.switchType && (
            <p className="text-sm text-fg-muted">{product.switchType}</p>
          )}
          <p className="mt-1 text-sm text-fg-subtle">
            {formatPrice(product.price)} / ชิ้น
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <div className="flex flex-col items-start gap-1 sm:items-center">
            <div className="flex items-center gap-1 rounded-md border border-line bg-bg-deep p-1">
              <button
                onClick={() => updateQuantity(product._id, quantity - 1)}
                className="flex h-7 w-7 items-center justify-center rounded text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
                aria-label="ลดจำนวน"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-fg">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(product._id, quantity + 1)}
                disabled={atMax}
                className="flex h-7 w-7 items-center justify-center rounded text-fg-muted transition-colors hover:bg-white/5 hover:text-fg disabled:opacity-40"
                aria-label="เพิ่มจำนวน"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {atMax && (
              <span className="text-xs text-warning">สูงสุด {product.stock} ชิ้น</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-fg">
              {formatPrice(product.price * quantity)}
            </span>
            <button
              onClick={() => removeFromCart(product._id)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-fg-subtle transition-colors hover:bg-danger/10 hover:text-danger"
              aria-label="ลบสินค้า"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
