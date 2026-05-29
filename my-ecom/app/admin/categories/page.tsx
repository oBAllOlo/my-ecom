"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, FolderTree, Package, CheckCircle2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ConfirmModal from "@/components/ConfirmModal";
import {
  PageHeader,
  Card,
  Field,
  Input,
  Button,
  Badge,
  EmptyState,
  Spinner,
  cn,
} from "@/components/ui";

interface Category {
  _id: string;
  name: string;
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
  const [formData, setFormData] = useState({ name: "", icon: "folder" });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({
    show: false,
    id: "",
    name: "",
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, icon: category.icon || "folder" });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", icon: "folder" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: "", icon: "folder" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingCategory ? `/api/categories/${editingCategory._id}` : "/api/categories";
      const res = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingCategory ? "อัปเดตหมวดหมู่สำเร็จ!" : "เพิ่มหมวดหมู่สำเร็จ!");
        fetchCategories();
        handleCloseModal();
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ show: false, id: "", name: "" });
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("ลบหมวดหมู่แล้ว");
        fetchCategories();
      } else {
        toast.error(data.error || "ไม่สามารถลบหมวดหมู่ได้");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("เกิดข้อผิดพลาดในการลบ");
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (!user || user.role !== "admin") return null;

  const stats = [
    { icon: FolderTree, tone: "bg-brand-subtle text-brand", value: categories.length, label: "หมวดหมู่ทั้งหมด" },
    { icon: Package, tone: "bg-info/10 text-info", value: categories.reduce((s, c) => s + c.productCount, 0), label: "สินค้าทั้งหมด" },
    { icon: CheckCircle2, tone: "bg-success/10 text-success", value: categories.filter((c) => c.productCount > 0).length, label: "หมวดหมู่ที่ใช้งาน" },
  ];

  return (
    <>
      <PageHeader
        title="จัดการหมวดหมู่"
        subtitle="เพิ่ม แก้ไข หรือลบหมวดหมู่สินค้า"
        actions={
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4" /> เพิ่มหมวดหมู่
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="flex items-center gap-3 p-4">
              <span className={cn("flex h-11 w-11 items-center justify-center rounded-md", s.tone)}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-fg-subtle">{s.label}</p>
                <p className="text-xl font-bold text-fg">{s.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="ยังไม่มีหมวดหมู่"
          action={
            <Button variant="primary" onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4" /> เพิ่มหมวดหมู่แรก
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category._id} className="flex flex-col gap-4 p-5">
              <h4 className="font-semibold text-fg">{category.name}</h4>
              <div className="flex items-center justify-between border-t border-line pt-4">
                <Badge tone="brand">{category.productCount} สินค้า</Badge>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleOpenModal(category)}>
                    <Pencil className="h-3.5 w-3.5" /> แก้ไข
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm({ show: true, id: category._id, name: category.name })}
                    className="text-danger hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-fg">
                {editingCategory ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="flex h-8 w-8 items-center justify-center rounded-md text-fg-subtle hover:bg-white/5 hover:text-fg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="ชื่อหมวดหมู่" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="กรุณาใส่หมวดหมู่"
                />
              </Field>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
                  ยกเลิก
                </Button>
                <Button type="submit" variant="primary" disabled={saving} className="flex-1">
                  {saving ? "กำลังบันทึก..." : editingCategory ? "อัปเดต" : "เพิ่มหมวดหมู่"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="ยืนยันการลบ"
        message={`คุณต้องการลบหมวดหมู่ "${deleteConfirm.name}" หรือไม่?`}
        confirmText="ลบเลย"
        cancelText="ยกเลิก"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ show: false, id: "", name: "" })}
        type="danger"
      />
    </>
  );
}
