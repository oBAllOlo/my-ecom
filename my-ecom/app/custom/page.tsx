"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

interface CustomPart {
  _id: string;
  category: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  isActive: boolean;
}

interface GroupedParts {
  [key: string]: CustomPart[];
}

const categoryLabels: Record<string, string> = {
  base: "Base",
  switch: "Switch",
  keycapBase: "Keycap Base",
  keycapAdd1: "Keycap Add One",
  keycapAdd2: "Keycap Add Two",
  wire: "Wire",
};

const categoryOrder = ["base", "switch", "keycapBase", "keycapAdd1", "keycapAdd2", "wire"];

export default function CustomKeyboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [parts, setParts] = useState<GroupedParts>({});
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("base");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, CustomPart>>({});

  // Fetch parts from API
  useEffect(() => {
    const fetchParts = async () => {
      try {
        const res = await fetch("/api/custom-parts");
        const data = await res.json();
        
        if (data.success) {
          // Group by category
          const grouped = data.data.reduce((acc: GroupedParts, part: CustomPart) => {
            if (!acc[part.category]) acc[part.category] = [];
            acc[part.category].push(part);
            return acc;
          }, {});
          setParts(grouped);
        }
      } catch (error) {
        console.error("Error fetching parts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, []);

  const handleSelectOption = (categoryId: string, part: CustomPart) => {
    if (part.stock <= 0) {
      showToast("สินค้าหมด", "error");
      return;
    }
    
    setSelectedOptions(prev => ({
      ...prev,
      [categoryId]: part,
    }));
  };

  const totalPrice = Object.values(selectedOptions).reduce(
    (sum, part) => sum + part.price,
    0
  );

  // Required categories (exclude optional add-ons)
  const requiredCategories = ["base", "switch", "keycapBase", "wire"];
  const isComplete = requiredCategories.every(cat => selectedOptions[cat]);

  const formatPrice = (price: number) => {
    return price.toLocaleString("th-TH") + " THB";
  };

  // Get preview images for selected options
  const getPreviewLayers = () => {
    const layers: { id: string; image: string; zIndex: number }[] = [];
    
    categoryOrder.forEach((cat, index) => {
      const selected = selectedOptions[cat];
      if (selected?.image) {
        layers.push({ id: cat, image: selected.image, zIndex: index + 1 });
      }
    });
    
    return layers;
  };

  const handleOrder = async () => {
    if (!user) {
      showToast("กรุณาเข้าสู่ระบบก่อนสั่งซื้อ", "error");
      router.push("/login");
      return;
    }

    if (!isComplete) {
      showToast("กรุณาเลือกให้ครบก่อน", "error");
      return;
    }

    // Build custom keyboard product
    const customProduct = {
      _id: `custom_${Date.now()}`,
      name: "Custom Keyboard 60%",
      description: Object.entries(selectedOptions)
        .map(([cat, part]) => `${categoryLabels[cat]}: ${part.name}`)
        .join(", "),
      price: totalPrice,
      stock: 1,
      images: [selectedOptions.base?.image || ""],
      category: { _id: "custom", name: "Custom" },
      customParts: Object.values(selectedOptions).map(p => p._id),
    };

    // For now, show success and redirect to checkout
    showToast("เพิ่มคีย์บอร์ด Custom ลงตะกร้าแล้ว!", "success");
    
    // Store custom order in localStorage for checkout
    localStorage.setItem("customOrder", JSON.stringify({
      product: customProduct,
      parts: selectedOptions,
      total: totalPrice,
    }));
    
    router.push("/checkout");
  };

  const previewLayers = getPreviewLayers();

  if (loading) {
    return (
      <div className="custom-page loading-page">
        <div className="loading">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="custom-page">
      {/* Sidebar */}
      <aside className="custom-sidebar">
        <h2 className="sidebar-title">⌨️ สร้างคีย์บอร์ดของคุณ</h2>
        <nav className="category-menu">
          {categoryOrder.map((categoryId) => {
            const categoryParts = parts[categoryId] || [];
            const isRequired = requiredCategories.includes(categoryId);
            
            return (
              <div key={categoryId} className="category-item">
                <button
                  className={`category-header ${expandedCategory === categoryId ? "active" : ""} ${selectedOptions[categoryId] ? "completed" : ""}`}
                  onClick={() => setExpandedCategory(
                    expandedCategory === categoryId ? null : categoryId
                  )}
                >
                  <span className="category-name">
                    {selectedOptions[categoryId] && <span className="check">✓</span>}
                    {categoryLabels[categoryId]}
                    {!isRequired && <span className="optional">(เสริม)</span>}
                  </span>
                  <span className={`arrow ${expandedCategory === categoryId ? "open" : ""}`}>
                    ▼
                  </span>
                </button>
                
                {expandedCategory === categoryId && (
                  <div className="option-list">
                    {categoryParts.map((part) => (
                      <button
                        key={part._id}
                        className={`option-item ${selectedOptions[categoryId]?._id === part._id ? "selected" : ""} ${part.stock <= 0 ? "out-of-stock" : ""}`}
                        onClick={() => handleSelectOption(categoryId, part)}
                        disabled={part.stock <= 0}
                      >
                        {part.image && (
                          <div className="option-thumb">
                            <Image 
                              src={part.image} 
                              alt={part.name}
                              width={40}
                              height={40}
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        )}
                        <div className="option-info">
                          <span className="option-name">{part.name}</span>
                          {part.stock <= 3 && part.stock > 0 && (
                            <span className="stock-warning">เหลือ {part.stock} ชิ้น</span>
                          )}
                          {part.stock <= 0 && (
                            <span className="stock-out">หมด</span>
                          )}
                        </div>
                        <span className="option-price">{formatPrice(part.price)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="custom-main">
        {/* Preview Area */}
        <div className="preview-area">
          {previewLayers.length > 0 ? (
            <div className="preview-stack">
              {previewLayers.map((layer) => (
                <div key={layer.id} className="preview-layer" style={{ zIndex: layer.zIndex }}>
                  <Image
                    src={layer.image}
                    alt={layer.id}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="preview-placeholder">
              <span className="preview-icon">⌨️</span>
              <p>Preview Area</p>
              <p className="preview-hint">เลือกอุปกรณ์เพื่อดูตัวอย่าง</p>
            </div>
          )}
        </div>

        {/* Selected Options Panel */}
        <div className="options-panel">
          <h3>Selected Options</h3>
          
          {Object.keys(selectedOptions).length === 0 ? (
            <p className="no-selection">ยังไม่ได้เลือกอุปกรณ์</p>
          ) : (
            <ul className="selected-list">
              {categoryOrder.map((cat) => {
                const part = selectedOptions[cat];
                if (!part) return null;
                return (
                  <li key={cat} className="selected-item">
                    <span className="item-category">{categoryLabels[cat]}:</span>
                    <span className="item-name">{part.name}</span>
                    <span className="item-price">{formatPrice(part.price)}</span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="total-section">
            <h4>Total Price: {formatPrice(totalPrice)}</h4>
          </div>

          <button
            className="order-button"
            disabled={!isComplete}
            onClick={handleOrder}
          >
            {isComplete ? "🛒 สั่งซื้อเลย" : "กรุณาเลือกให้ครบ"}
          </button>
        </div>
      </main>

      <style jsx>{`
        .custom-page {
          display: flex;
          min-height: calc(100vh - 80px);
          background: #6c757d;
        }

        .loading-page {
          justify-content: center;
          align-items: center;
        }

        .loading {
          color: white;
          font-size: 1.5rem;
        }

        .custom-sidebar {
          width: 330px;
          min-width: 330px;
          background: #1e293b;
          padding: 1.5rem;
          overflow-y: auto;
          max-height: calc(100vh - 80px);
        }

        .sidebar-title {
          color: #f8fafc;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .category-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .category-item {
          border-radius: 8px;
          overflow: hidden;
        }

        .category-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255,255,255,0.05);
          color: #f8fafc;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .category-header:hover {
          background: rgba(255,255,255,0.1);
        }

        .category-header.active {
          background: rgba(59, 130, 246, 0.3);
        }

        .category-header.completed .category-name {
          color: #4ade80;
        }

        .check {
          margin-right: 0.5rem;
          color: #4ade80;
        }

        .optional {
          font-size: 0.75rem;
          color: #64748b;
          margin-left: 0.5rem;
        }

        .arrow {
          font-size: 0.75rem;
          transition: transform 0.2s;
        }

        .arrow.open {
          transform: rotate(180deg);
        }

        .option-list {
          display: flex;
          flex-direction: column;
          background: rgba(0,0,0,0.2);
          max-height: 300px;
          overflow-y: auto;
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .option-item:hover:not(:disabled) {
          background: rgba(255,255,255,0.05);
          color: #f8fafc;
        }

        .option-item.selected {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .option-item.out-of-stock {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .option-thumb {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .option-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .option-name {
          font-size: 0.9rem;
        }

        .stock-warning {
          font-size: 0.7rem;
          color: #f59e0b;
        }

        .stock-out {
          font-size: 0.7rem;
          color: #ef4444;
        }

        .option-price {
          font-size: 0.85rem;
          color: #64748b;
          flex-shrink: 0;
        }

        .option-item.selected .option-price {
          color: #60a5fa;
        }

        .custom-main {
          flex: 1;
          padding: 1.5rem;
          display: flex;
          gap: 1.5rem;
        }

        .preview-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.1);
          border-radius: 12px;
          min-height: 400px;
          position: relative;
        }

        .preview-stack {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 400px;
        }

        .preview-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .preview-placeholder {
          text-align: center;
          color: rgba(255,255,255,0.5);
        }

        .preview-icon {
          font-size: 5rem;
          display: block;
          margin-bottom: 1rem;
        }

        .preview-hint {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .options-panel {
          width: 320px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          padding: 1.5rem;
          align-self: flex-start;
        }

        .options-panel h3 {
          color: #1e293b;
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        .no-selection {
          color: #64748b;
          font-style: italic;
        }

        .selected-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .selected-item {
          display: flex;
          flex-direction: column;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .item-category {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
        }

        .item-name {
          color: #1e293b;
          font-weight: 500;
        }

        .item-price {
          color: #3b82f6;
          font-size: 0.9rem;
        }

        .total-section {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 2px solid #1e293b;
        }

        .total-section h4 {
          color: #1e293b;
          font-size: 1.1rem;
        }

        .order-button {
          width: 100%;
          margin-top: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .order-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }

        .order-button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        @media (max-width: 1024px) {
          .custom-page {
            flex-direction: column;
          }

          .custom-sidebar {
            width: 100%;
            min-width: 100%;
            max-height: none;
          }

          .custom-main {
            flex-direction: column;
          }

          .options-panel {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
