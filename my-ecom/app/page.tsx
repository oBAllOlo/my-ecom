"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { Product, Category } from "@/lib/types";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        if (productsData.success) {
          const allProducts = productsData.data;
          setFeaturedProducts(allProducts.filter((p: Product) => p.isFeatured).slice(0, 4));
          setNewProducts(allProducts.filter((p: Product) => p.isNew).slice(0, 4));
        }

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/products?category=${encodeURIComponent(category.name)}`}
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
        )}
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
        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-product"></div>
            ))}
          </div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
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
        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-product"></div>
            ))}
          </div>
        ) : (
          <div className="products-grid">
            {newProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>




      <style jsx>{`
        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        .skeleton-card {
          height: 120px;
          background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 16px;
        }
        .skeleton-product {
          height: 350px;
          background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 16px;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}
