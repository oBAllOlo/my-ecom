"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface CustomPart {
  _id: string;
  category: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  isActive: boolean;
}

const categoryLabels: Record<string, string> = {
  base: "Base",
  switch: "Switch",
  keycapBase: "Keycap Base",
  keycapAdd1: "Keycap Add 1",
  keycapAdd2: "Keycap Add 2",
  wire: "Wire",
};

export default function AdminCustomPartsPage() {
  const [parts, setParts] = useState<CustomPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingPart, setEditingPart] = useState<CustomPart | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: "base",
    name: "",
    price: 0,
    image: "",
    stock: 0,
    isActive: true,
  });

  const fetchParts = useCallback(async () => {
    try {
      const url = selectedCategory === "all" 
        ? "/api/custom-parts?activeOnly=false"
        : `/api/custom-parts?category=${selectedCategory}&activeOnly=false`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setParts(data.data);
      }
    } catch (error) {
      console.error("Error fetching parts:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const handleSeed = async () => {
    if (!confirm("จะลบข้อมูลเดิมและ Seed ใหม่ทั้งหมด ยืนยัน?")) return;
    
    try {
      const res = await fetch("/api/custom-parts/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`Seeded ${data.data.length} parts สำเร็จ!`);
        fetchParts();
      }
    } catch (error) {
      console.error("Error seeding:", error);
      alert("Seed ล้มเหลว");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPart) {
        // Update
        const res = await fetch(`/api/custom-parts/${editingPart._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          alert("อัปเดตสำเร็จ!");
          setShowForm(false);
          setEditingPart(null);
          fetchParts();
        }
      } else {
        // Create
        const res = await fetch("/api/custom-parts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          alert("เพิ่มสำเร็จ!");
          setShowForm(false);
          fetchParts();
        }
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("บันทึกล้มเหลว");
    }
  };

  const handleEdit = (part: CustomPart) => {
    setEditingPart(part);
    setFormData({
      category: part.category,
      name: part.name,
      price: part.price,
      image: part.image,
      stock: part.stock,
      isActive: part.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบ?")) return;
    
    try {
      const res = await fetch(`/api/custom-parts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchParts();
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleToggleActive = async (part: CustomPart) => {
    try {
      await fetch(`/api/custom-parts/${part._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !part.isActive }),
      });
      fetchParts();
    } catch (error) {
      console.error("Error toggling:", error);
    }
  };

  const handleUpdateStock = async (part: CustomPart, newStock: number) => {
    try {
      await fetch(`/api/custom-parts/${part._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      fetchParts();
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  const formatPrice = (price: number) => price.toLocaleString("th-TH") + " ฿";

  const groupedParts = parts.reduce((acc, part) => {
    if (!acc[part.category]) acc[part.category] = [];
    acc[part.category].push(part);
    return acc;
  }, {} as Record<string, CustomPart[]>);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>⌨️ จัดการ Custom Parts</h1>
        <div className="header-actions">
          <Link href="/admin" className="btn-secondary">← กลับ</Link>
          <button onClick={handleSeed} className="btn-warning">🔄 Seed ข้อมูล</button>
          <button 
            onClick={() => {
              setEditingPart(null);
              setFormData({ category: "base", name: "", price: 0, image: "", stock: 0, isActive: true });
              setShowForm(true);
            }} 
            className="btn-primary"
          >
            + เพิ่ม Part
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="filter-bar">
        <button 
          className={`filter-btn ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
        >
          ทั้งหมด ({parts.length})
        </button>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            className={`filter-btn ${selectedCategory === key ? "active" : ""}`}
            onClick={() => setSelectedCategory(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingPart ? "แก้ไข Part" : "เพิ่ม Part ใหม่"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>หมวดหมู่</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>ชื่อ</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>ราคา (฿)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>รูปภาพ (URL)</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/images/products/..."
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  {" "}เปิดขาย
                </label>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary">
                  {editingPart ? "อัปเดต" : "เพิ่ม"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parts List */}
      {loading ? (
        <div className="loading">กำลังโหลด...</div>
      ) : (
        <div className="parts-container">
          {selectedCategory === "all" ? (
            Object.entries(groupedParts).map(([category, categoryParts]) => (
              <div key={category} className="category-section">
                <h2 className="category-title">{categoryLabels[category] || category}</h2>
                <div className="parts-grid">
                  {categoryParts.map((part) => (
                    <PartCard
                      key={part._id}
                      part={part}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                      onUpdateStock={handleUpdateStock}
                      formatPrice={formatPrice}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="parts-grid">
              {parts.map((part) => (
                <PartCard
                  key={part._id}
                  part={part}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  onUpdateStock={handleUpdateStock}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .admin-page {
          padding: 2rem;
          min-height: 100vh;
          background: #0f172a;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .admin-header h1 {
          color: #f8fafc;
          font-size: 1.75rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-primary, .btn-secondary, .btn-warning {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
        }

        .btn-secondary {
          background: rgba(255,255,255,0.1);
          color: #94a3b8;
          text-decoration: none;
        }

        .btn-warning {
          background: #f59e0b;
          color: white;
        }

        .filter-bar {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn.active, .filter-btn:hover {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .category-section {
          margin-bottom: 2rem;
        }

        .category-title {
          color: #f8fafc;
          font-size: 1.25rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .parts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: #1e293b;
          padding: 2rem;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
        }

        .modal h2 {
          color: #f8fafc;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #f8fafc;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .loading {
          text-align: center;
          color: #94a3b8;
          padding: 3rem;
        }
      `}</style>
    </div>
  );
}

// Part Card Component
function PartCard({
  part,
  onEdit,
  onDelete,
  onToggleActive,
  onUpdateStock,
  formatPrice,
}: {
  part: CustomPart;
  onEdit: (part: CustomPart) => void;
  onDelete: (id: string) => void;
  onToggleActive: (part: CustomPart) => void;
  onUpdateStock: (part: CustomPart, stock: number) => void;
  formatPrice: (price: number) => string;
}) {
  const [stock, setStock] = useState(part.stock);

  return (
    <div className={`part-card ${!part.isActive ? "inactive" : ""}`}>
      <div className="part-image">
        {part.image ? (
          <Image src={part.image} alt={part.name} fill style={{ objectFit: "contain" }} />
        ) : (
          <span className="no-image">📦</span>
        )}
      </div>
      <div className="part-info">
        <h3>{part.name}</h3>
        <p className="price">{formatPrice(part.price)}</p>
        <div className="stock-control">
          <label>Stock:</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            onBlur={() => {
              if (stock !== part.stock) {
                onUpdateStock(part, stock);
              }
            }}
            min="0"
          />
        </div>
        <div className="part-actions">
          <button onClick={() => onToggleActive(part)} className={part.isActive ? "btn-active" : "btn-inactive"}>
            {part.isActive ? "✓ เปิด" : "✗ ปิด"}
          </button>
          <button onClick={() => onEdit(part)} className="btn-edit">แก้ไข</button>
          <button onClick={() => onDelete(part._id)} className="btn-delete">ลบ</button>
        </div>
      </div>

      <style jsx>{`
        .part-card {
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .part-card.inactive {
          opacity: 0.5;
        }

        .part-image {
          position: relative;
          height: 120px;
          background: rgba(0,0,0,0.2);
        }

        .no-image {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2rem;
        }

        .part-info {
          padding: 1rem;
        }

        .part-info h3 {
          color: #f8fafc;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .price {
          color: #3b82f6;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .stock-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .stock-control label {
          color: #94a3b8;
          font-size: 0.85rem;
        }

        .stock-control input {
          width: 60px;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.2);
          color: #f8fafc;
          text-align: center;
        }

        .part-actions {
          display: flex;
          gap: 0.5rem;
        }

        .part-actions button {
          flex: 1;
          padding: 0.5rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .btn-active {
          background: #10b981;
          color: white;
        }

        .btn-inactive {
          background: #6b7280;
          color: white;
        }

        .btn-edit {
          background: #3b82f6;
          color: white;
        }

        .btn-delete {
          background: #ef4444;
          color: white;
        }
      `}</style>
    </div>
  );
}
