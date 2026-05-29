"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
import {
  PageContainer,
  PageHeader,
  Card,
  Select,
  Input,
  Button,
  EmptyState,
  Spinner,
  cn,
} from "@/components/ui";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  stock: number;
  rating: number;
  reviews: number;
  isNewProduct?: boolean;
  isFeatured?: boolean;
}

interface Category {
  _id: string;
  name: string;
  icon: string;
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");
  const newParam = searchParams.get("new");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบก่อนดูสินค้า", { id: "products-auth-required" });
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.append("category", selectedCategory);
        if (searchParam) params.append("search", searchParam);
        if (newParam === "true") params.append("new", "true");
        if (priceRange.min) params.append("minPrice", priceRange.min);
        if (priceRange.max) params.append("maxPrice", priceRange.max);
        if (sortBy !== "featured") params.append("sort", sortBy);

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.success) setProducts(data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchParam, newParam, priceRange.min, priceRange.max, sortBy]);

  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand))].sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }
    return result;
  }, [products, selectedBrands]);

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    router.push(
      categoryName
        ? `/products?category=${encodeURIComponent(categoryName)}`
        : "/products"
    );
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedBrands([]);
    setPriceRange({ min: "", max: "" });
    setSortBy("featured");
    router.push("/products");
  };

  const pageTitle = searchParam
    ? `ผลการค้นหา "${searchParam}"`
    : newParam
    ? "สินค้ามาใหม่"
    : selectedCategory || "สินค้าทั้งหมด";

  const filterOptionClass = (active: boolean) =>
    cn(
      "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
      active ? "bg-brand-subtle text-fg" : "text-fg-muted hover:bg-white/5"
    );

  const sidebar = (
    <Card className="p-5">
      <div className="mb-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-subtle">
          หมวดหมู่
        </h3>
        <div className="flex flex-col gap-0.5">
          <label className={filterOptionClass(selectedCategory === "")}>
            <input
              type="radio"
              name="category"
              checked={selectedCategory === ""}
              onChange={() => handleCategoryChange("")}
              className="accent-brand"
            />
            <span>ทั้งหมด</span>
          </label>
          {categories.map((category) => (
            <label
              key={category._id}
              className={filterOptionClass(selectedCategory === category.name)}
            >
              <input
                type="radio"
                name="category"
                checked={selectedCategory === category.name}
                onChange={() => handleCategoryChange(category.name)}
                className="accent-brand"
              />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-subtle">
            แบรนด์
          </h3>
          <div className="flex flex-col gap-0.5">
            {brands.map((brand) => (
              <label key={brand} className={filterOptionClass(selectedBrands.includes(brand))}>
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                  className="accent-brand"
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-subtle">
          ราคา (บาท)
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="ต่ำสุด"
            value={priceRange.min}
            onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
          />
          <span className="text-fg-subtle">-</span>
          <Input
            type="number"
            placeholder="สูงสุด"
            value={priceRange.max}
            onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
          />
        </div>
      </div>

      <Button variant="secondary" onClick={clearFilters} className="w-full">
        ล้างตัวกรอง
      </Button>
    </Card>
  );

  return (
    <PageContainer>
      <PageHeader
        title={pageTitle}
        subtitle={`พบ ${filteredProducts.length} สินค้า`}
        actions={
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-44"
          >
            <option value="featured">แนะนำ</option>
            <option value="price-low">ราคาต่ำ - สูง</option>
            <option value="price-high">ราคาสูง - ต่ำ</option>
            <option value="rating">คะแนนสูงสุด</option>
            <option value="newest">ใหม่ล่าสุด</option>
          </Select>
        }
      />

      <Button
        variant="secondary"
        onClick={() => setShowFilters(!showFilters)}
        className="mb-4 w-full lg:hidden"
      >
        {showFilters ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
        {showFilters ? "ซ่อนตัวกรอง" : "แสดงตัวกรอง"}
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
        <div className={cn(showFilters ? "block" : "hidden", "lg:block")}>{sidebar}</div>

        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Spinner className="h-8 w-8" />
              <p className="text-sm text-fg-muted">กำลังโหลดสินค้า...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="ไม่พบสินค้า"
              description="ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น"
              action={
                <Button variant="primary" onClick={clearFilters}>
                  ล้างตัวกรอง
                </Button>
              }
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
