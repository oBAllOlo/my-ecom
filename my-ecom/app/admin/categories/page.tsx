"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: "📁",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        icon: category.icon,
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", slug: "", icon: "📁" });
    }
    setShowModal(true);
    setMessage({ type: "", content: "" });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: "", slug: "", icon: "📁" });
    setMessage({ type: "", content: "" });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", content: "" });

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory._id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          content: editingCategory ? "อัปเดตหมวดหมู่สำเร็จ!" : "เพิ่มหมวดหมู่สำเร็จ!",
        });
        fetchCategories();
        setTimeout(() => {
          handleCloseModal();
        }, 1000);
      } else {
        setMessage({ type: "error", content: data.error || "เกิดข้อผิดพลาด" });
      }
    } catch (error) {
      console.error("Error saving category:", error);
      setMessage({ type: "error", content: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบหมวดหมู่นี้หรือไม่?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        fetchCategories();
      } else {
        alert(data.error || "ไม่สามารถลบหมวดหมู่ได้");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("เกิดข้อผิดพลาดในการลบ");
    }
  };

  const iconOptions = ["📁", "⌨️", "🖱️", "🎧", "🖥️", "💾", "🎮", "📱", "💻", "🔌", "🔋", "📦", "🛒", "⭐", "🎨", "🔧"];

  if (isLoading || loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-bg-pattern"></div>

      <main className="admin-main" style={{ paddingTop: "2rem" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ color: "white", fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              🏷️ จัดการหมวดหมู่
            </h1>
            <p style={{ color: "#64748b" }}>เพิ่ม แก้ไข หรือลบหมวดหมู่สินค้า</p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link
              href="/admin"
              style={{
                padding: "0.75rem 1.5rem",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                color: "white",
                textDecoration: "none",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              ← กลับ Dashboard
            </Link>
            <button
              onClick={() => handleOpenModal()}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 16px rgba(139, 92, 246, 0.3)",
              }}
            >
              ➕ เพิ่มหมวดหมู่
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.25rem 1.5rem",
            background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
            borderRadius: "16px",
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}>🏷️</div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.75rem" }}>หมวดหมู่ทั้งหมด</p>
              <p style={{ color: "white", fontSize: "1.5rem", fontWeight: 700 }}>{categories.length}</p>
            </div>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.25rem 1.5rem",
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            borderRadius: "16px",
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}>📦</div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.75rem" }}>สินค้าทั้งหมด</p>
              <p style={{ color: "white", fontSize: "1.5rem", fontWeight: 700 }}>
                {categories.reduce((sum, c) => sum + c.productCount, 0)}
              </p>
            </div>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1.25rem 1.5rem",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            borderRadius: "16px",
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}>✅</div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.75rem" }}>หมวดหมู่ที่ใช้งาน</p>
              <p style={{ color: "white", fontSize: "1.5rem", fontWeight: 700 }}>
                {categories.filter((c) => c.productCount > 0).length}
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <section style={{
          background: "rgba(30, 41, 59, 0.5)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "1.5rem",
        }}>
          <h3 style={{ color: "white", fontSize: "1.125rem", fontWeight: 600, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>📋</span> รายการหมวดหมู่
          </h3>

          {categories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📁</div>
              <p style={{ color: "#64748b", marginBottom: "1rem" }}>ยังไม่มีหมวดหมู่</p>
              <button
                onClick={() => handleOpenModal()}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ➕ เพิ่มหมวดหมู่แรก
              </button>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}>
              {categories.map((category) => (
                <div
                  key={category._id}
                  style={{
                    background: "rgba(15, 23, 42, 0.5)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                      width: "56px",
                      height: "56px",
                      background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.75rem",
                      border: "1px solid rgba(139, 92, 246, 0.2)",
                    }}>
                      {category.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: "white", fontWeight: 600, marginBottom: "0.25rem" }}>{category.name}</h4>
                      <p style={{ color: "#64748b", fontSize: "0.75rem", fontFamily: "monospace" }}>/{category.slug}</p>
                    </div>
                  </div>

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "1rem",
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                  }}>
                    <span style={{
                      padding: "0.375rem 0.75rem",
                      background: "rgba(139, 92, 246, 0.15)",
                      borderRadius: "8px",
                      color: "#a78bfa",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}>
                      {category.productCount} สินค้า
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleOpenModal(category)}
                        style={{
                          padding: "0.5rem 0.75rem",
                          background: "rgba(59, 130, 246, 0.15)",
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          borderRadius: "8px",
                          color: "#60a5fa",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                        }}
                      >
                        ✏️ แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        style={{
                          padding: "0.5rem 0.75rem",
                          background: "rgba(239, 68, 68, 0.15)",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          borderRadius: "8px",
                          color: "#f87171",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                        }}
                      >
                        🗑️ ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem",
        }}>
          <div style={{
            background: "#1e293b",
            borderRadius: "20px",
            padding: "2rem",
            maxWidth: "500px",
            width: "100%",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.5)",
          }}>
            <h2 style={{ color: "white", fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              {editingCategory ? "✏️ แก้ไขหมวดหมู่" : "➕ เพิ่มหมวดหมู่ใหม่"}
            </h2>

            {message.content && (
              <div style={{
                padding: "1rem",
                borderRadius: "12px",
                marginBottom: "1rem",
                background: message.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                border: `1px solid ${message.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                color: message.type === "success" ? "#10b981" : "#ef4444",
              }}>
                {message.content}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: 500 }}>
                  ไอคอน
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        border: formData.icon === icon ? "2px solid #8b5cf6" : "1px solid rgba(255, 255, 255, 0.1)",
                        background: formData.icon === icon ? "rgba(139, 92, 246, 0.2)" : "rgba(15, 23, 42, 0.5)",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: 500 }}>
                  ชื่อหมวดหมู่
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem",
                    background: "rgba(15, 23, 42, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                  placeholder="เช่น คีย์บอร์ด"
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: 500 }}>
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem",
                    background: "rgba(15, 23, 42, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "1rem",
                    outline: "none",
                    fontFamily: "monospace",
                  }}
                  placeholder="keyboard"
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    flex: 1,
                    padding: "0.875rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    color: "white",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "0.875rem",
                    background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                    border: "none",
                    borderRadius: "12px",
                    color: "white",
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.5 : 1,
                  }}
                >
                  {saving ? "กำลังบันทึก..." : editingCategory ? "อัปเดต" : "เพิ่มหมวดหมู่"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
