"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { getCartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const cartCount = getCartCount();

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link href="/" className="logo">
          <span className="logo-icon">⌨️</span>
          <span className="logo-text">
            KeyBoard<span className="logo-highlight">TH</span>
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="search-container">
          <input
            type="text"
            placeholder="ค้นหาคีย์บอร์ด..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <Link
            href={searchQuery ? `/products?search=${searchQuery}` : "/products"}
            className="search-button"
          >
            🔍
          </Link>
        </div>

        {/* Navigation - Desktop */}
        <nav className="nav-desktop">
          <Link href="/" className="nav-link">
            หน้าแรก
          </Link>
          <Link href="/products" className="nav-link">
            สินค้าทั้งหมด
          </Link>
          <Link href="/cart" className="cart-link">
            <span className="cart-icon">🛒</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-search">
            <input
              type="text"
              placeholder="ค้นหาคีย์บอร์ด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <Link
            href="/"
            className="mobile-nav-link"
            onClick={() => setIsMenuOpen(false)}
          >
            หน้าแรก
          </Link>
          <Link
            href="/products"
            className="mobile-nav-link"
            onClick={() => setIsMenuOpen(false)}
          >
            สินค้าทั้งหมด
          </Link>
          <Link
            href="/cart"
            className="mobile-nav-link"
            onClick={() => setIsMenuOpen(false)}
          >
            ตะกร้าสินค้า ({cartCount})
          </Link>
        </div>
      )}
    </header>
  );
}
