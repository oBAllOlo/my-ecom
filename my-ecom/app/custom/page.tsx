"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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

  const requiredCategories = ["base", "switch", "keycapBase", "wire"];
  const isComplete = requiredCategories.every(cat => selectedOptions[cat]);

  const formatPrice = (price: number) => {
    return price.toLocaleString("th-TH") + " THB";
  };

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

    showToast("เพิ่มคีย์บอร์ด Custom ลงตะกร้าแล้ว!", "success");
    
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
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-500">
        <div className="text-white text-2xl">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-gray-500">
      {/* Sidebar */}
      <aside className="w-[330px] min-w-[330px] bg-slate-800 p-6 overflow-y-auto max-h-[calc(100vh-80px)]">
        <h2 className="text-slate-50 text-xl mb-6 pb-4 border-b border-white/10">
          ⌨️ สร้างคีย์บอร์ดของคุณ
        </h2>
        <nav className="flex flex-col gap-2">
          {categoryOrder.map((categoryId) => {
            const categoryParts = parts[categoryId] || [];
            const isRequired = requiredCategories.includes(categoryId);
            const isExpanded = expandedCategory === categoryId;
            const isSelected = !!selectedOptions[categoryId];
            
            return (
              <div key={categoryId} className="rounded-lg overflow-hidden">
                <button
                  className={`w-full flex justify-between items-center p-4 border-none cursor-pointer text-base transition-all
                    ${isExpanded ? "bg-blue-500/30" : "bg-white/5 hover:bg-white/10"}
                    ${isSelected ? "text-green-400" : "text-slate-50"}`}
                  onClick={() => setExpandedCategory(isExpanded ? null : categoryId)}
                >
                  <span className="flex items-center gap-2">
                    {isSelected && <span className="text-green-400">✓</span>}
                    {categoryLabels[categoryId]}
                    {!isRequired && <span className="text-xs text-slate-500">(เสริม)</span>}
                  </span>
                  <span className={`text-xs transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>
                
                {isExpanded && (
                  <div className="flex flex-col bg-black/20 max-h-[300px] overflow-y-auto">
                    {categoryParts.map((part) => {
                      const isPartSelected = selectedOptions[categoryId]?._id === part._id;
                      const isOutOfStock = part.stock <= 0;
                      
                      return (
                        <button
                          key={part._id}
                          className={`flex items-center gap-3 p-3 border-none cursor-pointer text-left transition-all
                            ${isPartSelected ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:bg-white/5 hover:text-slate-50"}
                            ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={() => handleSelectOption(categoryId, part)}
                          disabled={isOutOfStock}
                        >
                          {part.image && (
                            <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                              <Image 
                                src={part.image} 
                                alt={part.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 flex flex-col">
                            <span className="text-sm">{part.name}</span>
                            {part.stock <= 3 && part.stock > 0 && (
                              <span className="text-xs text-amber-500">เหลือ {part.stock} ชิ้น</span>
                            )}
                            {isOutOfStock && (
                              <span className="text-xs text-red-500">หมด</span>
                            )}
                          </div>
                          <span className={`text-sm flex-shrink-0 ${isPartSelected ? "text-blue-400" : "text-slate-500"}`}>
                            {formatPrice(part.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 flex gap-6">
        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center bg-black/10 rounded-xl min-h-[400px] relative">
          {previewLayers.length > 0 ? (
            <div className="relative w-full h-full min-h-[400px]">
              {previewLayers.map((layer) => (
                <div key={layer.id} className="absolute inset-0" style={{ zIndex: layer.zIndex }}>
                  <Image
                    src={layer.image}
                    alt={layer.id}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/50">
              <span className="text-7xl block mb-4">⌨️</span>
              <p>Preview Area</p>
              <p className="text-sm opacity-70">เลือกอุปกรณ์เพื่อดูตัวอย่าง</p>
            </div>
          )}
        </div>

        {/* Selected Options Panel */}
        <div className="w-80 bg-white/95 rounded-xl p-6 self-start">
          <h3 className="text-slate-800 text-xl mb-4">Selected Options</h3>
          
          {Object.keys(selectedOptions).length === 0 ? (
            <p className="text-slate-500 italic">ยังไม่ได้เลือกอุปกรณ์</p>
          ) : (
            <ul className="list-none p-0 m-0">
              {categoryOrder.map((cat) => {
                const part = selectedOptions[cat];
                if (!part) return null;
                return (
                  <li key={cat} className="flex flex-col py-3 border-b border-slate-200">
                    <span className="text-xs text-slate-500 uppercase">{categoryLabels[cat]}:</span>
                    <span className="text-slate-800 font-medium">{part.name}</span>
                    <span className="text-blue-500 text-sm">{formatPrice(part.price)}</span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-6 pt-4 border-t-2 border-slate-800">
            <h4 className="text-slate-800 text-lg">Total Price: {formatPrice(totalPrice)}</h4>
          </div>

          <button
            className={`w-full mt-4 p-4 rounded-lg text-base font-semibold cursor-pointer transition-all
              ${isComplete 
                ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30" 
                : "bg-slate-400 text-white cursor-not-allowed"}`}
            disabled={!isComplete}
            onClick={handleOrder}
          >
            {isComplete ? "🛒 สั่งซื้อเลย" : "กรุณาเลือกให้ครบ"}
          </button>
        </div>
      </main>
    </div>
  );
}
