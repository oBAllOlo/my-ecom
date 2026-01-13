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
          setNewProducts(allProducts.filter((p: Product) => p.isNewProduct).slice(0, 4));
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
      <section className="hero py-24 px-8 text-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-4xl mx-auto">
          <span className="inline-block text-white py-2 px-6 rounded-full text-sm font-medium mb-8" style={{ background: "var(--gradient-primary)" }}>
            🎉 ส่งฟรีทั่วประเทศ เมื่อสั่งซื้อครบ ฿1,500
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            คีย์บอร์ดคุณภาพ
            <br />
            <span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>สำหรับทุกสไตล์การใช้งาน</span>
          </h1>

        </div>
      </section>



      {/* Featured Products Section */}
      <section className="section py-16 px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            สินค้า<span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>แนะนำ</span>
          </h2>
          <Link href="/products" style={{ color: "var(--primary-light)", textDecoration: "none" }} className="hover:opacity-80 transition-opacity">
            ดูทั้งหมด →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[350px] rounded-2xl animate-shimmer" style={{ background: "linear-gradient(90deg, var(--bg-light) 0%, var(--bg-card) 50%, var(--bg-light) 100%)", backgroundSize: "200% 100%" }}></div>
            ))}
          </div>
        ) : (
          <div className="products-grid grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* New Products Section */}
      <section className="section py-16 px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            สินค้า<span style={{ background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>มาใหม่</span>
          </h2>
          <Link href="/products?new=true" style={{ color: "var(--primary-light)", textDecoration: "none" }} className="hover:opacity-80 transition-opacity">
            ดูทั้งหมด →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[350px] rounded-2xl animate-shimmer" style={{ background: "linear-gradient(90deg, var(--bg-light) 0%, var(--bg-card) 50%, var(--bg-light) 100%)", backgroundSize: "200% 100%" }}></div>
            ))}
          </div>
        ) : (
          <div className="products-grid grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
            {newProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
