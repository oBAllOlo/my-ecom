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
    <div className="p-8 min-h-screen bg-slate-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-slate-50 text-2xl font-bold">⌨️ จัดการ Custom Parts</h1>
        <div className="flex gap-4">
          <Link href="/admin" className="py-3 px-6 rounded-lg font-semibold bg-white/10 text-slate-400 no-underline hover:bg-white/20 transition-all">
            ← กลับ
          </Link>
          <button onClick={handleSeed} className="py-3 px-6 rounded-lg font-semibold bg-amber-500 text-white border-none cursor-pointer hover:bg-amber-600 transition-all">
            🔄 Seed ข้อมูล
          </button>
          <button 
            onClick={() => {
              setEditingPart(null);
              setFormData({ category: "base", name: "", price: 0, image: "", stock: 0, isActive: true });
              setShowForm(true);
            }} 
            className="py-3 px-6 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-violet-500 text-white border-none cursor-pointer hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            + เพิ่ม Part
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <button 
          className={`py-2 px-4 rounded-full border cursor-pointer transition-all ${selectedCategory === "all" ? "bg-blue-500 text-white border-blue-500" : "bg-transparent text-slate-400 border-white/10 hover:bg-blue-500 hover:text-white hover:border-blue-500"}`}
          onClick={() => setSelectedCategory("all")}
        >
          ทั้งหมด ({parts.length})
        </button>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            className={`py-2 px-4 rounded-full border cursor-pointer transition-all ${selectedCategory === key ? "bg-blue-500 text-white border-blue-500" : "bg-transparent text-slate-400 border-white/10 hover:bg-blue-500 hover:text-white hover:border-blue-500"}`}
            onClick={() => setSelectedCategory(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]">
          <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-lg">
            <h2 className="text-slate-50 text-xl mb-6">{editingPart ? "แก้ไข Part" : "เพิ่ม Part ใหม่"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-slate-400 mb-2">หมวดหมู่</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 rounded-lg border border-white/10 bg-white/5 text-slate-50"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key} className="bg-slate-800">{label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-slate-400 mb-2">ชื่อ</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full p-3 rounded-lg border border-white/10 bg-white/5 text-slate-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-slate-400 mb-2">ราคา (฿)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    className="w-full p-3 rounded-lg border border-white/10 bg-white/5 text-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-2">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    required
                    className="w-full p-3 rounded-lg border border-white/10 bg-white/5 text-slate-50"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-slate-400 mb-2">รูปภาพ (URL)</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/images/products/..."
                  className="w-full p-3 rounded-lg border border-white/10 bg-white/5 text-slate-50 placeholder:text-slate-600"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  เปิดขาย
                </label>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 px-6 rounded-lg font-semibold bg-white/10 text-slate-400 border-none cursor-pointer hover:bg-white/20 transition-all">
                  ยกเลิก
                </button>
                <button type="submit" className="flex-1 py-3 px-6 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-violet-500 text-white border-none cursor-pointer hover:shadow-lg transition-all">
                  {editingPart ? "อัปเดต" : "เพิ่ม"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parts List */}
      {loading ? (
        <div className="text-center text-slate-400 py-12">กำลังโหลด...</div>
      ) : (
        <div>
          {selectedCategory === "all" ? (
            Object.entries(groupedParts).map(([category, categoryParts]) => (
              <div key={category} className="mb-8">
                <h2 className="text-slate-50 text-xl mb-4 pb-2 border-b border-white/10">{categoryLabels[category] || category}</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
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
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
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
    <div className={`bg-white/5 rounded-xl overflow-hidden border border-white/10 ${!part.isActive ? "opacity-50" : ""}`}>
      <div className="relative h-[120px] bg-black/20">
        {part.image ? (
          <Image src={part.image} alt={part.name} fill className="object-contain" />
        ) : (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl">📦</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-slate-50 text-sm mb-2">{part.name}</h3>
        <p className="text-blue-500 font-semibold mb-2">{formatPrice(part.price)}</p>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-slate-400 text-sm">Stock:</label>
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
            className="w-[60px] py-1 px-2 rounded border border-white/10 bg-black/20 text-slate-50 text-center"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onToggleActive(part)} 
            className={`flex-1 py-2 rounded-md border-none cursor-pointer text-xs font-semibold ${part.isActive ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"}`}
          >
            {part.isActive ? "✓ เปิด" : "✗ ปิด"}
          </button>
          <button onClick={() => onEdit(part)} className="flex-1 py-2 rounded-md border-none cursor-pointer text-xs font-semibold bg-blue-500 text-white">
            แก้ไข
          </button>
          <button onClick={() => onDelete(part._id)} className="flex-1 py-2 rounded-md border-none cursor-pointer text-xs font-semibold bg-red-500 text-white">
            ลบ
          </button>
        </div>
      </div>
    </div>
  );
}
