"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Package, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  PageHeader,
  Card,
  Field,
  Input,
  Select,
  Button,
  Badge,
  Spinner,
  cn,
} from "@/components/ui";

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

const emptyForm = {
  category: "base",
  name: "",
  price: 0,
  image: "",
  stock: 0,
  isActive: true,
};

export default function AdminCustomPartsPage() {
  const [parts, setParts] = useState<CustomPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingPart, setEditingPart] = useState<CustomPart | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const fetchParts = useCallback(async () => {
    try {
      const url =
        selectedCategory === "all"
          ? "/api/custom-parts?activeOnly=false"
          : `/api/custom-parts?category=${selectedCategory}&activeOnly=false`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setParts(data.data);
    } catch (error) {
      console.error("Error fetching parts:", error);
      toast.error("โหลดข้อมูลล้มเหลว");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPart ? `/api/custom-parts/${editingPart._id}` : "/api/custom-parts";
      const res = await fetch(url, {
        method: editingPart ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingPart ? "อัปเดตสำเร็จ!" : "เพิ่มสำเร็จ!");
        setShowForm(false);
        setEditingPart(null);
        fetchParts();
      } else {
        toast.error(data.error || "บันทึกล้มเหลว");
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("บันทึกล้มเหลว");
    }
  };

  const openAdd = () => {
    setEditingPart(null);
    setFormData(emptyForm);
    setShowForm(true);
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

  const formatPrice = (price: number) => price.toLocaleString("th-TH") + " บาท";

  const groupedParts = parts.reduce((acc, part) => {
    if (!acc[part.category]) acc[part.category] = [];
    acc[part.category].push(part);
    return acc;
  }, {} as Record<string, CustomPart[]>);

  return (
    <>
      <PageHeader
        title="จัดการ Custom Parts"
        subtitle={`${parts.length} ชิ้นส่วน`}
        actions={
          <Button variant="primary" onClick={openAdd}>
            <Plus className="h-4 w-4" /> เพิ่มชิ้นส่วน
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            selectedCategory === "all" ? "bg-brand text-white" : "bg-surface text-fg-muted hover:bg-surface-raised"
          )}
        >
          ทั้งหมด ({parts.length})
        </button>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              selectedCategory === key ? "bg-brand text-white" : "bg-surface text-fg-muted hover:bg-surface-raised"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : selectedCategory === "all" ? (
        Object.entries(groupedParts).map(([category, categoryParts]) => (
          <div key={category} className="mb-8">
            <h2 className="mb-4 border-b border-line pb-2 text-lg font-semibold text-fg">
              {categoryLabels[category] || category}
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {categoryParts.map((part) => (
                <PartCard
                  key={part._id}
                  part={part}
                  onEdit={handleEdit}
                  onToggleActive={handleToggleActive}
                  onUpdateStock={handleUpdateStock}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {parts.map((part) => (
            <PartCard
              key={part._id}
              part={part}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
              onUpdateStock={handleUpdateStock}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-fg">
                {editingPart ? "แก้ไข Part" : "เพิ่ม Part ใหม่"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-fg-subtle hover:bg-white/5 hover:text-fg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="หมวดหมู่">
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="ชื่อ" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="ราคา (บาท)" required>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </Field>
                <Field label="Stock" required>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    required
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-fg-muted">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="accent-brand"
                />
                เปิดขาย
              </label>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                  ยกเลิก
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  {editingPart ? "อัปเดต" : "เพิ่ม"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}

function PartCard({
  part,
  onEdit,
  onToggleActive,
  onUpdateStock,
  formatPrice,
}: {
  part: CustomPart;
  onEdit: (part: CustomPart) => void;
  onToggleActive: (part: CustomPart) => void;
  onUpdateStock: (part: CustomPart, stock: number) => void;
  formatPrice: (price: number) => string;
}) {
  const [stock, setStock] = useState(part.stock);

  return (
    <Card className={cn("overflow-hidden", !part.isActive && "opacity-60")}>
      <div className="relative h-28 bg-bg-deep">
        {part.image ? (
          <Image src={part.image} alt={part.name} fill className="object-contain" />
        ) : (
          <Package className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-fg-subtle" />
        )}
        {part.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Badge tone="danger">สินค้าหมด</Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="mb-1 truncate text-sm font-medium text-fg">{part.name}</h3>
        <p className="mb-3 font-semibold text-brand">{formatPrice(part.price)}</p>
        <div className="mb-3 flex items-center gap-2">
          <label className="text-sm text-fg-muted">Stock:</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            onBlur={() => {
              if (stock !== part.stock) onUpdateStock(part, stock);
            }}
            min="0"
            className="w-16 rounded border border-line bg-bg-deep px-2 py-1 text-center text-fg outline-none focus:border-brand"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={part.isActive ? "primary" : "secondary"}
            onClick={() => onToggleActive(part)}
            className={cn("flex-1", part.isActive && "bg-success hover:opacity-90")}
          >
            {part.isActive ? "เปิด" : "ปิด"}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onEdit(part)} className="flex-1">
            <Pencil className="h-3.5 w-3.5" /> แก้ไข
          </Button>
        </div>
      </div>
    </Card>
  );
}
