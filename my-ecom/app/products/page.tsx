"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
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

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryParam || ""
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showFilters, setShowFilters] = useState(false);

  // Check authentication when page loads
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // ใช้ toast.id เพื่อป้องกันการแสดง toast ซ้ำ
      toast.error("กรุณาเข้าสู่ระบบก่อนดูสินค้า", {
        id: "products-auth-required",
      });
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

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
  }, [
    selectedCategory,
    searchParam,
    newParam,
    priceRange.min,
    priceRange.max,
    sortBy,
  ]);

  // Get unique brands
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

  // Handlers
  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
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
    router.push("/products");
  };

  // Page title
  const pageTitle = searchParam
    ? `ผลการค้นหา "${searchParam}"`
    : newParam
    ? "สินค้ามาใหม่"
    : selectedCategory
    ? selectedCategory
    : "สินค้าทั้งหมด";

  // Styles
  const styles = {
    page: {
      minHeight: "100vh",
      padding: "2rem 0",
    },
    header: {
      background:
        "linear-gradient(135deg, rgba(28, 77, 141, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
      borderRadius: "1rem",
      padding: "1.5rem 2rem",
      marginBottom: "1.5rem",
      border: "1px solid rgba(28, 77, 141, 0.2)",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "800",
      background: "var(--gradient-primary)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "0.25rem",
    },
    count: {
      color: "var(--text-muted)",
      fontSize: "0.95rem",
    },
    sortSelect: {
      background: "rgba(30, 41, 59, 0.8)",
      color: "#fff",
      border: "1px solid rgba(28, 77, 141, 0.3)",
      borderRadius: "0.5rem",
      padding: "0.5rem 1rem",
      minWidth: "170px",
      backdropFilter: "blur(10px)",
    },
    filterBtn: {
      background: "linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%)",
      border: "none",
      borderRadius: "0.75rem",
      padding: "0.75rem 1.5rem",
      color: "#fff",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      width: "100%",
      justifyContent: "center",
      boxShadow: "0 4px 15px rgba(28, 77, 141, 0.3)",
    },
    sidebar: {
      background:
        "linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
      borderRadius: "1rem",
      padding: "1.5rem",
      border: "1px solid rgba(28, 77, 141, 0.15)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    },
    filterTitle: {
      color: "var(--primary-light)",
      fontSize: "0.9rem",
      fontWeight: "700",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
      marginBottom: "1rem",
      paddingBottom: "0.5rem",
      borderBottom: "1px solid var(--border-color)",
    },
    filterOption: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.5rem 0.75rem",
      borderRadius: "0.5rem",
      cursor: "pointer",
      transition: "all 0.2s ease",
      color: "#cbd5e1",
      fontSize: "0.95rem",
    },
    priceInput: {
      background: "rgba(15, 23, 42, 0.8)",
      color: "#fff",
      border: "1px solid rgba(28, 77, 141, 0.2)",
      borderRadius: "0.5rem",
      padding: "0.5rem 0.75rem",
      width: "100%",
    },
    clearBtn: {
      background: "transparent",
      border: "1px solid var(--border-color)",
      borderRadius: "0.5rem",
      padding: "0.75rem",
      color: "var(--primary-light)",
      fontWeight: "500",
      width: "100%",
      marginTop: "1rem",
      transition: "all 0.2s ease",
    },
    loadingContainer: {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      padding: "4rem",
      gap: "1rem",
    },
    spinner: {
      width: "3rem",
      height: "3rem",
      border: "3px solid rgba(28, 77, 141, 0.2)",
      borderTop: "3px solid #1C4D8D",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    emptyState: {
      textAlign: "center" as const,
      padding: "4rem 2rem",
      background: "rgba(30, 41, 59, 0.5)",
      borderRadius: "1rem",
      border: "1px dashed rgba(28, 77, 141, 0.3)",
    },
  };

  return (
    <main style={styles.page} className="products-main">
      <div className="container">
        {/* Page Header */}
        <div style={styles.header}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h1 style={styles.title}>{pageTitle}</h1>
              <span style={styles.count}>
                พบ {filteredProducts.length} สินค้า
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="d-flex align-items-center gap-2">
              <label className="d-none d-md-block" style={{ color: "var(--text-muted)" }}>
                เรียงตาม:
              </label>
              <select
                style={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">⭐ แนะนำ</option>
                <option value="price-low">💰 ราคาต่ำ - สูง</option>
                <option value="price-high">💎 ราคาสูง - ต่ำ</option>
                <option value="rating">🏆 คะแนนสูงสุด</option>
                <option value="newest">🆕 ใหม่ล่าสุด</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          className="d-lg-none mb-4"
          style={styles.filterBtn}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "✕ ซ่อนตัวกรอง" : "🔍 แสดงตัวกรอง"}
        </button>

        {/* Main Layout */}
        <div className="row g-4">
          {/* Filters Sidebar */}
          <div
            className={`col-12 col-lg-3 ${
              showFilters ? "" : "d-none d-lg-block"
            }`}
          >
            <div style={styles.sidebar}>
              {/* Category Filter */}
              <div className="mb-4">
                <h6 style={styles.filterTitle}>📂 หมวดหมู่</h6>
                <div className="d-flex flex-column gap-1">
                  <label
                    style={{
                      ...styles.filterOption,
                      background:
                        selectedCategory === ""
                          ? "rgba(28, 77, 141, 0.15)"
                          : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === ""}
                      onChange={() => handleCategoryChange("")}
                      style={{ accentColor: "#1C4D8D" }}
                    />
                    <span>ทั้งหมด</span>
                  </label>
                  {categories.map((category) => (
                    <label
                      key={category._id}
                      style={{
                        ...styles.filterOption,
                        background:
                          selectedCategory === category.name
                            ? "rgba(28, 77, 141, 0.15)"
                            : "transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.name}
                        onChange={() => handleCategoryChange(category.name)}
                        style={{ accentColor: "#1C4D8D" }}
                      />
                      <span>
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              {brands.length > 0 && (
                <div className="mb-4">
                  <h6 style={styles.filterTitle}>🏷️ แบรนด์</h6>
                  <div className="d-flex flex-column gap-1">
                    {brands.map((brand) => (
                      <label
                        key={brand}
                        style={{
                          ...styles.filterOption,
                          background: selectedBrands.includes(brand)
                            ? "rgba(28, 77, 141, 0.15)"
                            : "transparent",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandChange(brand)}
                          style={{ accentColor: "#1C4D8D" }}
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Filter */}
              <div className="mb-4">
                <h6 style={styles.filterTitle}>💵 ราคา (บาท)</h6>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="number"
                    placeholder="ต่ำสุด"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    style={styles.priceInput}
                  />
                  <span style={{ color: "#64748b" }}>-</span>
                  <input
                    type="number"
                    placeholder="สูงสุด"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    style={styles.priceInput}
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <button
                style={styles.clearBtn}
                onClick={clearFilters}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(28, 77, 141, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                🗑️ ล้างตัวกรอง
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="col-12 col-lg-9">
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={{ color: "#94a3b8" }}>กำลังโหลดสินค้า...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="row row-cols-2 row-cols-md-3 g-3 g-md-4">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="col">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
                <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>
                  ไม่พบสินค้า
                </h3>
                <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
                  ลองปรับตัวกรองหรือค้นหาด้วยคำอื่น
                </p>
                <button
                  onClick={clearFilters}
                  style={{
                    background:
                      "linear-gradient(135deg, #1C4D8D 0%, #4988C4 100%)",
                    border: "none",
                    borderRadius: "0.5rem",
                    padding: "0.75rem 2rem",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  ล้างตัวกรอง
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
            background: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)",
          }}
        >
          <div
            style={{
              width: "3rem",
              height: "3rem",
              border: "3px solid rgba(28, 77, 141, 0.2)",
              borderTop: "3px solid #1C4D8D",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
