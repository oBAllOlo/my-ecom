"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  image: string;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบสินค้านี้หรือไม่?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p._id !== id));
      }
    } catch (error) {
      console.error("Error deleting product:", error);
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

      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <Link href="/admin" className="admin-back-link">
              ← กลับ
            </Link>
            <div className="admin-page-title">
              <span className="admin-page-icon">📦</span>
              <div>
                <h1>จัดการสินค้า</h1>
                <p>{products.length} สินค้าทั้งหมด</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="add-product-btn"
          >
            <span>+</span> เพิ่มสินค้าใหม่
          </button>
        </div>
      </header>

      <main className="admin-main">
        {/* Products Grid */}
        <div className="products-grid">
          {products.map((product, index) => (
            <div 
              key={product._id} 
              className="product-admin-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="product-admin-image">
                <img src={product.image} alt={product.name} />
                <div className="product-admin-badges">
                  {product.isNew && <span className="badge-new">ใหม่</span>}
                  {product.isFeatured && <span className="badge-featured">แนะนำ</span>}
                </div>
              </div>
              <div className="product-admin-info">
                <span className="product-admin-brand">{product.brand}</span>
                <h3 className="product-admin-name">{product.name}</h3>
                <div className="product-admin-meta">
                  <span className="product-admin-price">{formatPrice(product.price)}</span>
                  <span className={`product-admin-stock ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-stock'}`}>
                    {product.stock > 0 ? `${product.stock} ชิ้น` : 'หมด'}
                  </span>
                </div>
              </div>
              <div className="product-admin-actions">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="edit-btn"
                >
                  ✏️ แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="delete-btn"
                >
                  🗑️ ลบ
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="admin-empty-state">
            <span className="empty-icon">📦</span>
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

      <style jsx>{`
        .admin-back-link {
          color: #a78bfa;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .admin-back-link:hover {
          background: rgba(139, 92, 246, 0.2);
        }
        .admin-page-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .admin-page-icon {
          font-size: 2.5rem;
        }
        .admin-page-title h1 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #f8fafc;
          margin: 0;
        }
        .admin-page-title p {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }
        .add-product-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .add-product-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
        }
        .add-product-btn span {
          font-size: 1.25rem;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .product-admin-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          animation: fadeInUp 0.6s ease forwards;
          opacity: 0;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .product-admin-card:hover {
          transform: translateY(-8px);
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 25px 50px -12px rgba(139, 92, 246, 0.3);
        }
        .product-admin-image {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
        }
        .product-admin-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .product-admin-card:hover .product-admin-image img {
          transform: scale(1.1);
        }
        .product-admin-badges {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          display: flex;
          gap: 0.5rem;
        }
        .badge-new {
          padding: 0.35rem 0.75rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 100px;
        }
        .badge-featured {
          padding: 0.35rem 0.75rem;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 100px;
        }
        .product-admin-info {
          padding: 1.25rem;
        }
        .product-admin-brand {
          font-size: 0.75rem;
          color: #a78bfa;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .product-admin-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f8fafc;
          margin: 0.25rem 0 0.75rem 0;
          line-height: 1.3;
        }
        .product-admin-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .product-admin-price {
          font-size: 1.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .product-admin-stock {
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          border-radius: 100px;
        }
        .product-admin-stock.in-stock {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
        }
        .product-admin-stock.low-stock {
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
        }
        .product-admin-stock.out-stock {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }
        .product-admin-actions {
          padding: 1rem 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          gap: 0.75rem;
        }
        .edit-btn {
          flex: 1;
          padding: 0.75rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 10px;
          color: #60a5fa;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .edit-btn:hover {
          background: rgba(59, 130, 246, 0.2);
          transform: scale(1.02);
        }
        .delete-btn {
          flex: 1;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #f87171;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: scale(1.02);
        }
        .admin-empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #64748b;
        }
        .empty-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }
      `}</style>
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
    description: "",
    price: product?.price || 0,
    originalPrice: 0,
    image: product?.image || "",
    images: [] as string[],
    category: product?.category || "",
    brand: product?.brand || "",
    stock: product?.stock || 0,
    rating: 0,
    reviews: 0,
    features: "",
    switchType: "",
    connectivity: "",
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
        // Add to images array
        const newImages = [...formData.images, data.url];
        // Set first image as main if no main image yet
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
    // If removed image was main, set first remaining as main
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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{product ? "✏️ แก้ไขสินค้า" : "➕ เพิ่มสินค้าใหม่"}</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>ชื่อสินค้า *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>แบรนด์ *</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>รายละเอียด</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-row three-col">
            <div className="form-group">
              <label>ราคา *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : 0 })}
              />
            </div>
            <div className="form-group">
              <label>ราคาเดิม</label>
              <input
                type="number"
                min="0"
                value={formData.originalPrice || ""}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? Number(e.target.value) : 0 })}
              />
            </div>
            <div className="form-group">
              <label>สต็อก *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock || ""}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value ? Number(e.target.value) : 0 })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>หมวดหมู่ *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload Zone */}
          <div className="form-group">
            <label>รูปภาพสินค้า * (สามารถเพิ่มได้หลายรูป)</label>
            <div 
              className={`upload-zone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
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
                style={{ display: 'none' }}
              />
              {uploading ? (
                <div className="upload-loading">
                  <div className="upload-spinner"></div>
                  <p>กำลังอัพโหลด...</p>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📷</span>
                  <p>คลิกหรือลากไฟล์มาวางที่นี่</p>
                  <span className="upload-hint">รองรับ JPG, PNG, WEBP (สูงสุด 5MB ต่อรูป)</span>
                </div>
              )}
            </div>
            
            {/* Image Gallery */}
            {formData.images.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '0.75rem',
                marginTop: '1rem'
              }}>
                {formData.images.map((img, index) => (
                  <div 
                    key={index}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: formData.image === img ? '3px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setPreviewImage(img)}
                  >
                    <img 
                      src={img} 
                      alt={`Product ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {formData.image === img && (
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        background: '#8b5cf6',
                        color: 'white',
                        fontSize: '0.65rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        หลัก
                      </div>
                    )}
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      fontSize: '0.75rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      🔍
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      display: 'flex',
                      gap: '2px'
                    }}>
                      {formData.image !== img && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setAsMainImage(img); }}
                          style={{
                            flex: 1,
                            padding: '4px',
                            background: 'rgba(139, 92, 246, 0.9)',
                            border: 'none',
                            color: 'white',
                            fontSize: '0.65rem',
                            cursor: 'pointer'
                          }}
                        >
                          ตั้งเป็นหลัก
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                        style={{
                          flex: formData.image === img ? 1 : 0.5,
                          padding: '4px',
                          background: 'rgba(239, 68, 68, 0.9)',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.65rem',
                          cursor: 'pointer'
                        }}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Fallback URL input */}
            <div className="url-fallback">
              <label>หรือใส่ URL รูปภาพ:</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="url"
                  id="urlInput"
                  placeholder="https://example.com/image.jpg"
                  style={{ flex: 1 }}
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
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#8b5cf6',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  เพิ่ม
                </button>
              </div>
            </div>
          </div>

          <div className="form-checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
              />
              <span>สินค้าใหม่</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              />
              <span>สินค้าแนะนำ</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              ยกเลิก
            </button>
            <button type="submit" disabled={saving} className="btn-submit">
              {saving ? "กำลังบันทึก..." : "💾 บันทึก"}
            </button>
          </div>
        </form>

        {/* Image Preview Lightbox */}
        {previewImage && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100001,
              padding: '2rem'
            }}
            onClick={() => setPreviewImage(null)}
          >
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                fontSize: '2rem',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
            <img 
              src={previewImage} 
              alt="Preview"
              style={{
                maxWidth: '90%',
                maxHeight: '90%',
                objectFit: 'contain',
                borderRadius: '12px'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 1rem;
            animation: fadeIn 0.2s ease;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .modal-content {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 24px;
            max-width: 600px;
            width: 100%;
            max-height: 85vh;
            overflow-y: auto;
            position: relative;
            animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.1);
          }
          @keyframes popIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          .modal-header h2 {
            font-size: 1.25rem;
            color: #f8fafc;
            margin: 0;
          }
          .modal-close {
            background: none;
            border: none;
            color: #64748b;
            font-size: 1.5rem;
            cursor: pointer;
            transition: color 0.3s ease;
          }
          .modal-close:hover {
            color: #f8fafc;
          }
          .modal-form {
            padding: 1.5rem;
          }
          .form-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-bottom: 1rem;
          }
          .form-row.three-col {
            grid-template-columns: repeat(3, 1fr);
          }
          .form-group {
            margin-bottom: 1rem;
          }
          .form-group label {
            display: block;
            color: #94a3b8;
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
          }
          .form-group input,
          .form-group textarea,
          .form-group select {
            width: 100%;
            padding: 0.75rem 1rem;
            background: rgba(139, 92, 246, 0.1);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 12px;
            color: #f8fafc;
            font-size: 1rem;
            transition: all 0.3s ease;
          }
          .form-group input:focus,
          .form-group textarea:focus,
          .form-group select:focus {
            outline: none;
            border-color: rgba(139, 92, 246, 0.6);
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
          }
          .form-group select option {
            background: #1e293b;
          }
          .form-checkboxes {
            display: flex;
            gap: 2rem;
            margin-bottom: 1.5rem;
          }
          .checkbox-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #94a3b8;
            cursor: pointer;
          }
          .checkbox-label input {
            accent-color: #8b5cf6;
          }
          .form-actions {
            display: flex;
            gap: 1rem;
          }
          .btn-cancel {
            flex: 1;
            padding: 1rem;
            background: rgba(100, 116, 139, 0.2);
            border: 1px solid rgba(100, 116, 139, 0.3);
            border-radius: 12px;
            color: #94a3b8;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .btn-cancel:hover {
            background: rgba(100, 116, 139, 0.3);
          }
          .btn-submit {
            flex: 1;
            padding: 1rem;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border: none;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .btn-submit:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
          }
          .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          /* Upload Zone Styles */
          .upload-zone {
            border: 2px dashed rgba(139, 92, 246, 0.4);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: rgba(139, 92, 246, 0.05);
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .upload-zone:hover, .upload-zone.active {
            border-color: #8b5cf6;
            background: rgba(139, 92, 246, 0.1);
          }
          .upload-zone.uploading {
            pointer-events: none;
            opacity: 0.7;
          }
          .upload-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }
          .upload-icon {
            font-size: 3rem;
          }
          .upload-placeholder p {
            color: #f8fafc;
            font-weight: 500;
            margin: 0;
          }
          .upload-hint {
            color: #64748b;
            font-size: 0.85rem;
          }
          .upload-preview {
            position: relative;
            width: 100%;
            max-width: 300px;
          }
          .upload-preview img {
            width: 100%;
            height: auto;
            border-radius: 12px;
            max-height: 200px;
            object-fit: cover;
          }
          .upload-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .upload-preview:hover .upload-overlay {
            opacity: 1;
          }
          .upload-overlay span {
            color: white;
            font-weight: 600;
          }
          .upload-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          .upload-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(139, 92, 246, 0.2);
            border-top-color: #8b5cf6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .upload-loading p {
            color: #a78bfa;
            margin: 0;
          }
          .url-fallback {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
          .url-fallback label {
            font-size: 0.8rem;
            color: #64748b;
            margin-bottom: 0.5rem;
          }
          .url-fallback input {
            width: 100%;
            padding: 0.75rem 1rem;
            background: rgba(139, 92, 246, 0.1);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 12px;
            color: #f8fafc;
            font-size: 0.9rem;
          }
        `}</style>
      </div>
    </div>
  );
}
