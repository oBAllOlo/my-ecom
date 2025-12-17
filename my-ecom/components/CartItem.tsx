"use client";

import Image from "next/image";
import { CartItem as CartItemType } from "@/lib/types";
import { formatPrice } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  return (
    <div className="cart-item">
      {/* Image */}
      <div className="cart-item-image">
        <Image
          src={product.image}
          alt={product.name}
          width={100}
          height={100}
          className="cart-image"
        />
      </div>

      {/* Info */}
      <div className="cart-item-info">
        <h3 className="cart-item-name">{product.name}</h3>
        <p className="cart-item-brand">{product.brand}</p>
        {product.switchType && (
          <p className="cart-item-switch">🔘 {product.switchType}</p>
        )}
      </div>

      {/* Price */}
      <div className="cart-item-price">
        <span className="price-label">ราคา</span>
        <span className="price-value">{formatPrice(product.price)}</span>
      </div>

      {/* Quantity */}
      <div className="cart-item-quantity">
        <span className="quantity-label">จำนวน</span>
        <div className="quantity-controls">
          <button
            className="quantity-button"
            onClick={() => updateQuantity(product._id, quantity - 1)}
          >
            −
          </button>
          <span className="quantity-value">{quantity}</span>
          <button
            className="quantity-button"
            onClick={() => updateQuantity(product._id, quantity + 1)}
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="cart-item-subtotal">
        <span className="subtotal-label">รวม</span>
        <span className="subtotal-value">
          {formatPrice(product.price * quantity)}
        </span>
      </div>

      {/* Remove */}
      <button
        className="cart-item-remove"
        onClick={() => removeFromCart(product._id)}
      >
        🗑️
      </button>
    </div>
  );
}
