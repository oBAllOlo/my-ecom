"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Package, X, ImagePlus, Star, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ConfirmModal from "@/components/ConfirmModal";
import {
  PageHeader,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Button,
  Badge,
  EmptyState,
  Spinner,
  cn,
} from "@/components/ui";

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
  isNewProduct?: boolean;
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({
    show: false,
    id: "",
    name: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const brands = [...new Set(products.map((p) => p.brand))].sort();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, isLoading, router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProducts();
      fetchCategories();
    }
  }, [user]);

  const handleDeleteConfirm = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ show: false, id: "", name: "" });
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter((p) => p._id !== id));
        toast.success("ลบสินค้าแล้ว");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("เกิดข้อผิดพลาดในการลบ");
    }
  };

  const formatPrice = (price: number) =>
    `${new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(price)} บาท`;

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (!user || user.role !== "admin") return null;

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "" || product.category === selectedCategory;
    const matchesBrand = selectedBrand === "" || product.brand === selectedBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  return (
    <>
      <PageHeader
        title="จัดการสินค้า"
        subtitle={`${products.length} สินค้าทั้งหมด`}
        actions={
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" /> เพิ่มสินค้าใหม่
          </Button>
        }
      />

      <Card className="mb-5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
            <Input
              placeholder="ค้นหาสินค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-44">
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </Select>
          <Select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-44">
            <option value="">ทุกแบรนด์</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </Select>
        </div>
      </Card>

      <p className="mb-4 text-sm text-fg-muted">
        แสดง {filteredProducts.length} จาก {products.length} สินค้า
      </p>

      {products.length === 0 ? (
        <EmptyState icon={Package} title="ยังไม่มีสินค้าในระบบ" />
      ) : filteredProducts.length === 0 ? (
        <EmptyState icon={Search} title="ไม่พบสินค้าที่ตรงกับเงื่อนไข" />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden bg-bg-deep">
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                <div className="absolute left-3 top-3 flex gap-1.5">
                  {product.isNewProduct && <Badge tone="brand">ใหม่</Badge>}
                  {product.isFeatured && <Badge tone="warning">แนะนำ</Badge>}
                </div>
              </div>
              <div className="p-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand">{product.brand}</span>
                <h3 className="mb-3 mt-1 line-clamp-1 font-semibold text-fg">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-fg">{formatPrice(product.price)}</span>
                  <Badge tone={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "danger"}>
                    {product.stock > 0 ? `${product.stock} ชิ้น` : "หมด"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 border-t border-line p-3">
                <Button variant="secondary" size="sm" onClick={() => setEditingProduct(product)} className="flex-1">
                  <Pencil className="h-3.5 w-3.5" /> แก้ไข
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirm({ show: true, id: product._id, name: product.name })}
                  className="text-danger hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(showAddModal || editingProduct) &&
        typeof window !== "undefined" &&
        createPortal(
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
    </>
  );
}

// Upload via XHR (not fetch) so we can report upload progress to the UI.
function uploadFileWithProgress(
  file: File,
  onProgress: (loaded: number, total: number) => void
): Promise<string | null> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", file);
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded, e.total);
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (data.success) {
          resolve(data.data?.url ?? null);
        } else {
          toast.error(`${file.name}: ${data.error || "อัพโหลดไม่สำเร็จ"}`);
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    xhr.onerror = () => resolve(null);
    xhr.send(fd);
  });
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
    images: product?.images || ([] as string[]),
    category: product?.category || "",
    brand: product?.brand || "",
    stock: product?.stock || 0,
    rating: product?.rating || 0,
    reviews: product?.reviews || 0,
    features: product?.features?.join(", ") || "",
    switchType: product?.switchType || "",
    connectivity: product?.connectivity || "",
    isNewProduct: product?.isNewProduct || false,
    isFeatured: product?.isFeatured || false,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name}: ไม่ใช่ไฟล์รูปภาพ`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: ไฟล์ต้องมีขนาดไม่เกิน 5MB`);
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    try {
      const loaded = new Array(validFiles.length).fill(0);
      const totals = validFiles.map((f) => f.size);
      const updateProgress = () => {
        const totalBytes = totals.reduce((a, b) => a + b, 0);
        const loadedBytes = loaded.reduce((a, b) => a + b, 0);
        setUploadProgress(
          totalBytes > 0 ? Math.round((loadedBytes / totalBytes) * 100) : 0
        );
      };

      const uploadedUrls = (
        await Promise.all(
          validFiles.map((file, i) =>
            uploadFileWithProgress(file, (l, t) => {
              loaded[i] = l;
              totals[i] = t;
              updateProgress();
            })
          )
        )
      ).filter(Boolean) as string[];
      if (uploadedUrls.length > 0) {
        const newImages = [...formData.images, ...uploadedUrls];
        if (!formData.image) setFormData({ ...formData, image: uploadedUrls[0], images: newImages });
        else setFormData({ ...formData, images: newImages });
        toast.success(`อัพโหลดสำเร็จ ${uploadedUrls.length} รูป`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("เกิดข้อผิดพลาดในการอัพโหลด");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = formData.images.filter((_, i) => i !== indexToRemove);
    const removedUrl = formData.images[indexToRemove];
    if (formData.image === removedUrl) setFormData({ ...formData, image: newImages[0] || "", images: newImages });
    else setFormData({ ...formData, images: newImages });
  };

  const setAsMainImage = (url: string) => setFormData({ ...formData, image: url });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleImageUpload(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageUpload(e.target.files);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = product ? `/api/products/${product._id}` : "/api/products";
      const res = await fetch(url, {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) onSave();
      else toast.error(data.error || "เกิดข้อผิดพลาด");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <Card className="max-h-[88vh] w-full max-w-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="text-lg font-semibold text-fg">{product ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-fg-subtle hover:bg-white/5 hover:text-fg">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="ชื่อสินค้า" required>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </Field>
            <Field label="แบรนด์" required>
              <Input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
            </Field>
          </div>

          <Field label="รายละเอียด">
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="ราคา" required>
              <Input type="number" min="0" required value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : 0 })} />
            </Field>
            <Field label="ราคาเดิม">
              <Input type="number" min="0" value={formData.originalPrice || ""} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? Number(e.target.value) : 0 })} />
            </Field>
            <Field label="สต็อก" required>
              <Input type="number" min="0" required value={formData.stock || ""} onChange={(e) => setFormData({ ...formData, stock: e.target.value ? Number(e.target.value) : 0 })} />
            </Field>
          </div>

          <Field label="หมวดหมู่" required>
            <Select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="รูปภาพสินค้า (เพิ่มได้หลายรูป)">
            <div
              className={cn(
                "flex min-h-[140px] cursor-pointer items-center justify-center rounded-md border-2 border-dashed p-6 text-center transition-colors",
                dragActive ? "border-brand bg-brand-subtle" : "border-line bg-bg-deep hover:border-brand/50",
                uploading && "pointer-events-none opacity-70"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
              {uploading ? (
                <div className="flex w-full max-w-[220px] flex-col items-center gap-3">
                  <Spinner className="h-7 w-7" />
                  <p className="text-sm font-medium text-fg">
                    กำลังอัพโหลด... {uploadProgress}%
                  </p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-fg-muted">
                  <ImagePlus className="h-8 w-8 text-fg-subtle" />
                  <p className="text-sm font-medium text-fg">คลิกหรือลากไฟล์มาวางที่นี่</p>
                  <span className="text-xs text-fg-subtle">รองรับ JPG, PNG, WEBP (สูงสุด 5MB ต่อรูป)</span>
                </div>
              )}
            </div>

            {formData.images.length > 0 && (
              <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-3">
                {formData.images.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setPreviewImage(img)}
                    className={cn(
                      "relative aspect-square cursor-pointer overflow-hidden rounded-md",
                      formData.image === img ? "ring-2 ring-brand" : "border border-line"
                    )}
                  >
                        <img src={img} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />
                    {formData.image === img && (
                      <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-brand px-1 py-0.5 text-[10px] font-semibold text-white">
                        <Star className="h-2.5 w-2.5" /> หลัก
                      </span>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 flex">
                      {formData.image !== img && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAsMainImage(img);
                          }}
                          className="flex-1 bg-brand/90 py-1 text-[10px] text-white"
                        >
                          ตั้งเป็นหลัก
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="flex-1 bg-danger/90 py-1 text-[10px] text-white"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Field>

          <Field label="การแสดงผลหน้าแรก">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <label className="flex flex-1 cursor-pointer items-center gap-2.5 rounded-md border border-line bg-bg-deep px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="accent-brand"
                />
                <Star className="h-4 w-4 text-warning" />
                <span className="text-fg">สินค้าแนะนำ</span>
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-2.5 rounded-md border border-line bg-bg-deep px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={formData.isNewProduct}
                  onChange={(e) => setFormData({ ...formData, isNewProduct: e.target.checked })}
                  className="accent-brand"
                />
                <Sparkles className="h-4 w-4 text-brand" />
                <span className="text-fg">สินค้ามาใหม่</span>
              </label>
            </div>
          </Field>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary" disabled={saving} className="flex-1">
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </form>

        {previewImage && (
          <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/95 p-8" onClick={() => setPreviewImage(null)}>
            <button onClick={() => setPreviewImage(null)} className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
            <img src={previewImage} alt="Preview" className="max-h-[90%] max-w-[90%] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
          </div>
        )}
      </Card>
    </div>
  );
}
