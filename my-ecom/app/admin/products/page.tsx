"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import ConfirmModal from "@/components/ConfirmModal";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  stock: number;
  image: string;
  images?: string[];
  rating?: number;
  reviews?: number;
  features?: string[];
  switchType?: string;
  connectivity?: string;
  isFeatured?: boolean;
  isNew?: boolean;
}

interface Category {
  _id: string;
  name: string;
  icon: string;
}

export default function AdminProducts() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({ show: false, id: "", name: "" });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
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

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProducts();
      fetchCategories();
    }
  }, [user]);

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

  const handleDeleteClick = (product: Product) => {
    setDeleteConfirm({ show: true, id: product._id, name: product.name });
  };

  const handleDeleteConfirm = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ show: false, id: "", name: "" });
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p._id !== id));
        showToast("ลบสินค้าแล้ว", "success");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("เกิดข้อผิดพลาดในการลบ", "error");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 relative">
      {/* Admin Header */}
      <header className="bg-slate-800/50 border-b border-white/5 px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-violet-400 no-underline font-medium py-2 px-4 bg-violet-500/10 rounded-lg hover:bg-violet-500/20 transition-all">
              ← กลับ
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-4xl">📦</span>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-50 m-0">จัดการสินค้า</h1>
                <p className="text-sm text-slate-500 m-0">{products.length} สินค้าทั้งหมด</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 border-none rounded-xl text-white font-semibold cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
          >
            <span className="text-xl">+</span> เพิ่มสินค้าใหม่
          </button>
        </div>
      </header>

      <main className="p-8">
        {/* Products Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {products.map((product, index) => (
            <div 
              key={product._id} 
              className="bg-slate-800/50 border border-violet-500/20 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/20 animate-fadeInUp"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                <div className="absolute top-3 left-3 flex gap-2">
                  {product.isNew && <span className="py-1 px-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-xs font-bold rounded-full">ใหม่</span>}
                  {product.isFeatured && <span className="py-1 px-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full">แนะนำ</span>}
                </div>
              </div>
              <div className="p-5">
                <span className="text-xs text-violet-400 font-semibold uppercase tracking-wide">{product.brand}</span>
                <h3 className="text-lg font-bold text-slate-50 mt-1 mb-3 leading-tight">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">{formatPrice(product.price)}</span>
                  <span className={`text-sm font-semibold py-1 px-3 rounded-full ${product.stock > 10 ? 'bg-emerald-500/20 text-emerald-400' : product.stock > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                    {product.stock > 0 ? `${product.stock} ชิ้น` : 'หมด'}
                  </span>
                </div>
              </div>
              <div className="p-4 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="flex-1 py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 font-semibold cursor-pointer transition-all hover:bg-blue-500/20 hover:scale-[1.02]"
                >
                  ✏️ แก้ไข
                </button>
                <button
                  onClick={() => handleDeleteClick(product)}
                  className="flex-1 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-semibold cursor-pointer transition-all hover:bg-red-500/20 hover:scale-[1.02]"
                >
                  🗑️ ลบ
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <span className="text-6xl block mb-4">📦</span>
            <p>ยังไม่มีสินค้า</p>
          </div>
        )}
      </main>

      {/* Add/Edit Modal - rendered via Portal */}
      {(showAddModal || editingProduct) && typeof window !== 'undefined' && createPortal(
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            fetchProducts();
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="ยืนยันการลบ"
        message={`คุณต้องการลบสินค้า "${deleteConfirm.name}" หรือไม่?`}
        confirmText="ลบเลย"
        cancelText="ยกเลิก"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ show: false, id: "", name: "" })}
        type="danger"
      />
    </div>
  );
}

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

function ProductModal({ product, categories, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    originalPrice: product?.originalPrice || 0,
    image: product?.image || "",
    images: product?.images || [] as string[],
    category: product?.category || "",
    brand: product?.brand || "",
    stock: product?.stock || 0,
    rating: product?.rating || 0,
    reviews: product?.reviews || 0,
    features: product?.features?.join(", ") || "",
    switchType: product?.switchType || "",
    connectivity: product?.connectivity || "",
    isNew: product?.isNew || false,
    isFeatured: product?.isFeatured || false,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();
      if (data.success) {
        const newImages = [...formData.images, data.url];
        if (!formData.image) {
          setFormData({ ...formData, image: data.url, images: newImages });
        } else {
          setFormData({ ...formData, images: newImages });
        }
      } else {
        alert(data.error || "อัพโหลดรูปไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("เกิดข้อผิดพลาดในการอัพโหลด");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = formData.images.filter((_, i) => i !== indexToRemove);
    const removedUrl = formData.images[indexToRemove];
    if (formData.image === removedUrl) {
      setFormData({ ...formData, image: newImages[0] || "", images: newImages });
    } else {
      setFormData({ ...formData, images: newImages });
    }
  };

  const setAsMainImage = (url: string) => {
    setFormData({ ...formData, image: url });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = product ? `/api/products/${product._id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSave();
      } else {
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/85 flex items-center justify-center z-[99999] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-violet-500/30 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl text-slate-50 m-0">{product ? "✏️ แก้ไขสินค้า" : "➕ เพิ่มสินค้าใหม่"}</h2>
          <button onClick={onClose} className="bg-none border-none text-slate-500 text-2xl cursor-pointer hover:text-white transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">ชื่อสินค้า *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full py-3 px-4 bg-violet-500/10 border border-violet-500/30 rounded-xl text-slate-50 text-base outline-none focus:border-violet-500/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">แบรนด์ *</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full py-3 px-4 bg-violet-500/10 border border-violet-500/30 rounded-xl text-slate-50 text-base outline-none focus:border-violet-500/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.2)] transition-all"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-slate-400 text-sm mb-2">รายละเอียด</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full py-3 px-4 bg-violet-500/10 border border-violet-500/30 rounded-xl text-slate-50 text-base outline-none focus:border-violet-500/60 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">ราคา *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : 0 })}
                className="w-full py-3 px-4 bg-violet-500/10 border border-violet-500/30 rounded-xl text-slate-50 text-base outline-none focus:border-violet-500/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">ราคาเดิม</label>
              <input
                type="number"
                min="0"
                value={formData.originalPrice || ""}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? Number(e.target.value) : 0 })}
                className="w-full py-3 px-4 bg-violet-500/10 border border-violet-500/30 rounded-xl text-slate-50 text-base outline-none focus:border-violet-500/60 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">สต็อก *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock || ""}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value ? Number(e.target.value) : 0 })}
                className="w-full py-3 px-4 bg-violet-500/10 border border-violet-500/30 rounded-xl text-slate-50 text-base outline-none focus:border-violet-500/60 transition-all"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-slate-400 text-sm mb-2">หมวดหมู่ *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full py-3 px-4 bg-violet-500/10 border border-violet-500/30 rounded-xl text-slate-50 text-base outline-none focus:border-violet-500/60 transition-all"
            >
              <option value="" className="bg-slate-800">เลือกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name} className="bg-slate-800">{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* Image Upload Zone */}
          <div className="mb-4">
            <label className="block text-slate-400 text-sm mb-2">รูปภาพสินค้า * (สามารถเพิ่มได้หลายรูป)</label>
            <div 
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all min-h-[150px] flex items-center justify-center ${dragActive ? 'border-violet-500 bg-violet-500/10' : 'border-violet-500/40 bg-violet-500/5 hover:border-violet-500 hover:bg-violet-500/10'} ${uploading ? 'pointer-events-none opacity-70' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-3 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
                  <p className="text-violet-400 m-0">กำลังอัพโหลด...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-5xl">📷</span>
                  <p className="text-slate-50 font-medium m-0">คลิกหรือลากไฟล์มาวางที่นี่</p>
                  <span className="text-slate-500 text-sm">รองรับ JPG, PNG, WEBP (สูงสุด 5MB ต่อรูป)</span>
                </div>
              )}
            </div>
            
            {/* Image Gallery */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 mt-4">
                {formData.images.map((img, index) => (
                  <div 
                    key={index}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer ${formData.image === img ? 'ring-3 ring-violet-500' : 'border border-white/10'}`}
                    onClick={() => setPreviewImage(img)}
                  >
                    <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    {formData.image === img && (
                      <div className="absolute top-1 left-1 bg-violet-500 text-white text-[10px] py-0.5 px-1.5 rounded font-semibold">หลัก</div>
                    )}
                    <div className="absolute top-1 right-1 bg-black/60 text-white text-xs py-0.5 px-1.5 rounded">🔍</div>
                    <div className="absolute bottom-0 left-0 right-0 flex gap-0.5">
                      {formData.image !== img && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setAsMainImage(img); }}
                          className="flex-1 py-1 bg-violet-500/90 border-none text-white text-[10px] cursor-pointer"
                        >
                          ตั้งเป็นหลัก
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                        className={`py-1 bg-red-500/90 border-none text-white text-[10px] cursor-pointer ${formData.image === img ? 'flex-1' : 'flex-[0.5]'}`}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Fallback URL input */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <label className="block text-slate-500 text-xs mb-2">หรือใส่ URL รูปภาพ:</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="urlInput"
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 py-3 px-4 bg-violet-500/10 border border-violet-500/30 rounded-xl text-slate-50 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('urlInput') as HTMLInputElement;
                    if (input.value) {
                      const newImages = [...formData.images, input.value];
                      if (!formData.image) {
                        setFormData({ ...formData, image: input.value, images: newImages });
                      } else {
                        setFormData({ ...formData, images: newImages });
                      }
                      input.value = '';
                    }
                  }}
                  className="py-2 px-4 bg-violet-500 border-none rounded-lg text-white cursor-pointer"
                >
                  เพิ่ม
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8 mb-6">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                className="accent-violet-500"
              />
              <span>สินค้าใหม่</span>
            </label>
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="accent-violet-500"
              />
              <span>สินค้าแนะนำ</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 p-4 bg-slate-500/20 border border-slate-500/30 rounded-xl text-slate-400 font-semibold cursor-pointer hover:bg-slate-500/30 transition-all">
              ยกเลิก
            </button>
            <button type="submit" disabled={saving} className={`flex-1 p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 border-none rounded-xl text-white font-semibold transition-all ${saving ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/30'}`}>
              {saving ? "กำลังบันทึก..." : "💾 บันทึก"}
            </button>
          </div>
        </form>

        {/* Image Preview Lightbox */}
        {previewImage && (
          <div 
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100001] p-8"
            onClick={() => setPreviewImage(null)}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-5 right-5 bg-white/20 border-none text-white text-3xl w-12 h-12 rounded-full cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>
            <img 
              src={previewImage} 
              alt="Preview"
              className="max-w-[90%] max-h-[90%] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
