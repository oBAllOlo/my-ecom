"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { getCartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

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

          {/* Cart */}
          <Link href="/cart" className="cart-link">
            <span className="cart-icon">🛒</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-avatar">👤</span>
                <span className="user-name">{user?.name?.split(" ")[0]}</span>
                <span className="dropdown-arrow">▼</span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <span className="user-dropdown-name">{user?.name}</span>
                    <span className="user-dropdown-email">{user?.email}</span>
                  </div>
                  <div className="user-dropdown-divider"></div>
                  <Link
                    href="/profile"
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    👤 โปรไฟล์
                  </Link>
                  <Link
                    href="/orders"
                    className="user-dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    📦 คำสั่งซื้อ
                  </Link>
                  <div className="user-dropdown-divider"></div>
                  <button
                    className="user-dropdown-item logout"
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                  >
                    🚪 ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link href="/login" className="auth-btn login">
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className="auth-btn register">
                สมัครสมาชิก
              </Link>
            </div>
          )}
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

          {/* Mobile Auth */}
          {isAuthenticated ? (
            <>
              <div className="mobile-user-info">
                <span>👤 {user?.name}</span>
              </div>
              <Link
                href="/profile"
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                โปรไฟล์
              </Link>
              <Link
                href="/orders"
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                คำสั่งซื้อ
              </Link>
              <button
                className="mobile-logout-btn"
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
              >
                🚪 ออกจากระบบ
              </button>
            </>
          ) : (
            <div className="mobile-auth-buttons">
              <Link
                href="/login"
                className="btn btn-secondary"
                onClick={() => setIsMenuOpen(false)}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="btn btn-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
