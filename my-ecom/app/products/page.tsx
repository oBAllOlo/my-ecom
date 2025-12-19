"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";

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
  isNew?: boolean;
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
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");
  const newParam = searchParams.get("new");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParam || "");

  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryParam || ""
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState<string>("featured");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
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
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchParam, newParam, priceRange.min, priceRange.max, sortBy]);

  // Get unique brands from fetched products
  const brands = useMemo(() => {
    return [...new Set(products.map((p) => p.brand))].sort();
  }, [products]);

  // Apply client-side brand filter
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      router.push("/products");
    }
  };

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    if (categoryName) {
      router.push(`/products?category=${encodeURIComponent(categoryName)}`);
    } else {
      router.push("/products");
    }
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedBrands([]);
    setPriceRange({ min: "", max: "" });
    setSortBy("featured");
    setSearchInput("");
    router.push("/products");
  };

  return (
    <div className="products-page">
      <div className="products-page-header">
        <h1 className="products-page-title">
          {searchParam
            ? `ผลการค้นหา "${searchParam}"`
            : newParam
            ? "สินค้ามาใหม่"
            : selectedCategory
            ? selectedCategory
            : "สินค้าทั้งหมด"}
        </h1>
        <p className="products-count">พบ {filteredProducts.length} สินค้า</p>
      </div>

      <div className="products-layout">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          {/* Category Filter */}
          <div className="filter-section">
            <h3 className="filter-title">หมวดหมู่</h3>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === ""}
                  onChange={() => handleCategoryChange("")}
                />
                <span>ทั้งหมด</span>
              </label>
              {categories.map((category) => (
                <label key={category._id} className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category.name}
                    onChange={() => handleCategoryChange(category.name)}
                  />
                  <span>
                    {category.icon} {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="filter-section">
            <h3 className="filter-title">แบรนด์</h3>
            <div className="filter-options">
              {brands.map((brand) => (
                <label key={brand} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="filter-section">
            <h3 className="filter-title">ราคา (บาท)</h3>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="ต่ำสุด"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                }
                className="price-input"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="สูงสุด"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                }
                className="price-input"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="filter-section">
            <h3 className="filter-title">เรียงตาม</h3>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  name="sort"
                  checked={sortBy === "featured"}
                  onChange={() => setSortBy("featured")}
                />
                <span>แนะนำ</span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="sort"
                  checked={sortBy === "price-low"}
                  onChange={() => setSortBy("price-low")}
                />
                <span>ราคาต่ำ - สูง</span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="sort"
                  checked={sortBy === "price-high"}
                  onChange={() => setSortBy("price-high")}
                />
                <span>ราคาสูง - ต่ำ</span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="sort"
                  checked={sortBy === "rating"}
                  onChange={() => setSortBy("rating")}
                />
                <span>คะแนนสูงสุด</span>
              </label>
              <label className="filter-option">
                <input
                  type="radio"
                  name="sort"
                  checked={sortBy === "newest"}
                  onChange={() => setSortBy("newest")}
                />
                <span>ใหม่ล่าสุด</span>
              </label>
            </div>
          </div>

          {/* Clear Filters */}
          <button
            className="btn btn-secondary"
            onClick={clearFilters}
            style={{ width: "100%" }}
          >
            ล้างตัวกรอง
          </button>
        </aside>

        {/* Products Grid */}
        <div className="products-grid">
          {loading ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem" }}>
              <div className="admin-loading-spinner" style={{ margin: "0 auto 1rem" }}></div>
              <p style={{ color: "#64748b" }}>กำลังโหลดสินค้า...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <div className="cart-empty" style={{ gridColumn: "1 / -1" }}>
              <div className="cart-empty-icon">🔍</div>
              <h3 className="cart-empty-title">ไม่พบสินค้า</h3>
              <p className="cart-empty-text">
                ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น
              </p>
              <button className="btn btn-primary" onClick={clearFilters}>
                ล้างตัวกรอง
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div className="admin-loading-spinner"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
