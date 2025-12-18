"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { categories, featuredProducts, newProducts } from "@/lib/mockData";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">
            🎉 ส่งฟรีทั่วประเทศ เมื่อสั่งซื้อครบ ฿1,500
          </span>
          <h1 className="hero-title">
            คีย์บอร์ดคุณภาพ
            <br />
            สำหรับทุกสไตล์การใช้งาน
          </h1>
          <p className="hero-description">
            เลือกช้อปคีย์บอร์ด Mechanical และ Gaming จากแบรนด์ชั้นนำทั่วโลก
            พร้อมรับประกันสินค้าและบริการหลังการขายครบวงจร
          </p>
          <div className="hero-buttons">
            <Link href="/products" className="btn btn-primary">
              🛍️ ช้อปเลย
            </Link>
            <Link
              href="/products?category=gaming"
              className="btn btn-secondary"
            >
              🎮 คีย์บอร์ดเกมมิ่ง
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">
            หมวดหมู่<span>สินค้า</span>
          </h2>
          <Link href="/products" className="view-all-link">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/products?category=${category.slug}`}
              className="category-card"
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
              <span className="category-count">
                {category.productCount} สินค้า
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">
            สินค้า<span>แนะนำ</span>
          </h2>
          <Link href="/products" className="view-all-link">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* New Products Section */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">
            สินค้า<span>มาใหม่</span>
          </h2>
          <Link href="/products?new=true" className="view-all-link">
            ดูทั้งหมด →
          </Link>
        </div>
        <div className="products-grid">
          {newProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter">
        <h2 className="newsletter-title">📬 รับข่าวสารและโปรโมชั่น</h2>
        <p className="newsletter-description">
          สมัครรับข่าวสารเพื่อไม่พลาดโปรโมชั่นพิเศษและสินค้าใหม่ก่อนใคร
        </p>
        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="กรอกอีเมลของคุณ"
            className="newsletter-input"
          />
          <button type="submit" className="btn btn-primary">
            สมัครรับข่าวสาร
          </button>
        </form>
      </section>
    </>
  );
}
