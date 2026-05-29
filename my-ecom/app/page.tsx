"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, ChevronRight, Sparkles, Wrench } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/types";
import { PageContainer, buttonClasses } from "@/components/ui";

function ProductGrid({
  loading,
  products,
}: {
  loading: boolean;
  products: Product[];
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-xl border border-line bg-surface"
          />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

function SectionHeader({
  title,
  href,
}: {
  title: string;
  href: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-2xl font-semibold tracking-tight text-fg">{title}</h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
      >
        ดูทั้งหมด <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await fetch("/api/products");
        const productsData = await productsRes.json();

        if (productsData.success) {
          const allProducts = productsData.data;
          setFeaturedProducts(
            allProducts.filter((p: Product) => p.isFeatured).slice(0, 4)
          );
          setNewProducts(
            allProducts.filter((p: Product) => p.isNewProduct).slice(0, 4)
          );
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
    <PageContainer>
      {/* Hero */}
      <section className="mb-12 overflow-hidden rounded-2xl border border-line bg-surface px-6 py-14 text-center sm:px-12">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-4 py-1.5 text-sm font-medium text-brand">
          <Truck className="h-4 w-4" />
          ส่งฟรีทั่วประเทศ เมื่อสั่งซื้อครบ ฿1,500
        </span>
        <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-tight tracking-tight text-fg sm:text-5xl">
          คีย์บอร์ดคุณภาพ สำหรับทุกสไตล์การใช้งาน
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-fg-muted">
          เลือกซื้อคีย์บอร์ดและชิ้นส่วนคุณภาพ หรือออกแบบคีย์บอร์ดในสไตล์ของคุณเอง
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/products" className={buttonClasses({ variant: "primary", size: "lg" })}>
            เลือกซื้อสินค้า
          </Link>
          <Link href="/custom" className={buttonClasses({ variant: "secondary", size: "lg" })}>
            <Wrench className="h-4 w-4" />
            สร้างคีย์บอร์ดคัสตอม
          </Link>
        </div>
      </section>

      {/* Featured */}
      <section className="mb-12">
        <SectionHeader title="สินค้าแนะนำ" href="/products" />
        <ProductGrid loading={loading} products={featuredProducts} />
      </section>

      {/* New */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-fg">
            <Sparkles className="h-5 w-5 text-brand" />
            สินค้ามาใหม่
          </h2>
          <Link
            href="/products?new=true"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
          >
            ดูทั้งหมด <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid loading={loading} products={newProducts} />
      </section>
    </PageContainer>
  );
}
