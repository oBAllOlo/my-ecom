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
      <section className="hero py-24 px-8 text-center bg-gradient-to-br from-violet-900/50 via-slate-900 to-slate-900">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-2 px-6 rounded-full text-sm font-medium mb-8">
            🎉 ส่งฟรีทั่วประเทศ เมื่อสั่งซื้อครบ ฿1,500
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            คีย์บอร์ดคุณภาพ
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">สำหรับทุกสไตล์การใช้งาน</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            เลือกช้อปคีย์บอร์ด Mechanical และ Gaming จากแบรนด์ชั้นนำทั่วโลก
            พร้อมรับประกันสินค้าและบริการหลังการขายครบวงจร
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section py-16 px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            หมวดหมู่<span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">สินค้า</span>
          </h2>
          <Link href="/products" className="text-violet-400 hover:text-violet-300 transition-colors">
            ดูทั้งหมด →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[120px] bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="categories-grid grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="category-card bg-slate-800/50 border border-white/10 rounded-2xl p-6 text-center hover:border-violet-500/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 transition-all group"
              >
                <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{category.icon}</span>
                <span className="text-white font-semibold block mb-1">{category.name}</span>
                <span className="text-slate-500 text-sm">{category.productCount} สินค้า</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products Section */}
      <section className="section py-16 px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            สินค้า<span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">แนะนำ</span>
          </h2>
          <Link href="/products" className="text-violet-400 hover:text-violet-300 transition-colors">
            ดูทั้งหมด →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[350px] bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer rounded-2xl"></div>
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
            สินค้า<span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">มาใหม่</span>
          </h2>
          <Link href="/products?new=true" className="text-violet-400 hover:text-violet-300 transition-colors">
            ดูทั้งหมด →
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[350px] bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] animate-shimmer rounded-2xl"></div>
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
