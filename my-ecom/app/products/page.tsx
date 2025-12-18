"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/lib/mockData";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");
  const newParam = searchParams.get("new");

  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryParam || ""
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState<string>("featured");

  // Get unique brands
  const brands = useMemo(() => {
    return [...new Set(products.map((p) => p.brand))].sort();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by brand
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    // Filter by price range
    if (priceRange.min) {
      result = result.filter((p) => p.price >= Number(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter((p) => p.price <= Number(priceRange.max));
    }

    // Filter by search
    if (searchParam) {
      const search = searchParam.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.brand.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    // Filter by new
    if (newParam === "true") {
      result = result.filter((p) => p.isNew);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [
    selectedCategory,
    selectedBrands,
    priceRange,
    sortBy,
    searchParam,
    newParam,
  ]);

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedBrands([]);
    setPriceRange({ min: "", max: "" });
    setSortBy("featured");
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
            ? categories.find((c) => c.slug === selectedCategory)?.name ||
              "สินค้าทั้งหมด"
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
                  onChange={() => setSelectedCategory("")}
                />
                <span>ทั้งหมด</span>
              </label>
              {categories.map((category) => (
                <label key={category._id} className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category.slug}
                    onChange={() => setSelectedCategory(category.slug)}
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
          {filteredProducts.length > 0 ? (
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
