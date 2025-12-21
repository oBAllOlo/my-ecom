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
      {/* Image - Stack images for custom builds */}
      <div 
        className="cart-item-image" 
        style={{ 
          position: "relative", 
          width: "120px", 
          height: "120px",
          minWidth: "120px",
          flexShrink: 0,
          overflow: "hidden",
          borderRadius: "12px",
          backgroundColor: "#1e293b"
        }}
      >
        {product.category === "custom" && product.images && product.images.length > 1 ? (
          // Stacked images for custom keyboard
          <>
            {product.images.map((img, index) => (
              <Image
                key={index}
                src={img}
                alt={`${product.name} layer ${index + 1}`}
                fill
                className="cart-image"
                style={{
                  objectFit: "contain",
                  zIndex: index + 1,
                }}
              />
            ))}
          </>
        ) : (
          // Single image for regular products
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="cart-image"
            style={{ objectFit: "contain" }}
          />
        )}
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
        {quantity >= product.stock && (
          <span style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '0.25rem' }}>
            (สูงสุด {product.stock} ชิ้น)
          </span>
        )}
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
