"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
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

type CategoryType = "base" | "switch" | "keycapBase" | "keycapAdd1" | "keycapAdd2" | "wire";

const categoryLabels: Record<CategoryType, string> = {
  base: "Base",
  switch: "Switch",
  keycapBase: "Keycap Base",
  keycapAdd1: "Keycap Add One",
  keycapAdd2: "Keycap Add Two",
  wire: "Wire",
};

const categoryIcons: Record<CategoryType, string> = {
  base: "🖥️",
  switch: "🔘",
  keycapBase: "⌨️",
  keycapAdd1: "🎨",
  keycapAdd2: "✨",
  wire: "🔌",
};

export default function CustomKeyboardPage() {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  const [parts, setParts] = useState<CustomPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParts, setSelectedParts] = useState<Record<CategoryType, CustomPart | null>>({
    base: null,
    switch: null,
    keycapBase: null,
    keycapAdd1: null,
    keycapAdd2: null,
    wire: null,
  });
  const [openCategory, setOpenCategory] = useState<CategoryType | null>("base");

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const res = await fetch("/api/custom-parts");
        const data = await res.json();
        if (data.success) {
          setParts(data.data.filter((p: CustomPart) => p.isActive));
        }
      } catch (error) {
        console.error("Error fetching parts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, []);

  const partsByCategory = useMemo(() => {
    const categories: Record<CategoryType, CustomPart[]> = {
      base: [],
      switch: [],
      keycapBase: [],
      keycapAdd1: [],
      keycapAdd2: [],
      wire: [],
    };
    parts.forEach((part) => {
      if (part.category in categories) {
        categories[part.category as CategoryType].push(part);
      }
    });
    return categories;
  }, [parts]);

  const totalPrice = useMemo(() => {
    return Object.values(selectedParts).reduce((sum, part) => sum + (part?.price || 0), 0);
  }, [selectedParts]);

  const selectedCount = useMemo(() => {
    return Object.values(selectedParts).filter(p => p !== null).length;
  }, [selectedParts]);

  // Map switch names to audio file names
  const getSwitchAudioPath = (switchName: string) => {
    const audioMap: Record<string, string> = {
      "Alpacas (Linear)": "/audio/alpacas.mp3",
      "Cherry MX Blacks": "/audio/cherry-mx-blacks.mp3",
      "Cherry MX Blues": "/audio/cherry-mx-blues.mp3",
      "Cherry MX Browns": "/audio/cherry-mx-browns.mp3",
      "Gateron Black Inks": "/audio/gateron-black-inks.mp3",
      "Gateron Red Inks": "/audio/gateron-red-inks.mp3",
      "Holy Pandas (Tactile)": "/audio/holy-pandas.mp3",
      "NovelKeys Creams": "/audio/novelkeys-creams.mp3",
      "Turquoise Tealios": "/audio/turquoise-tealios.mp3",
    };
    return audioMap[switchName] || null;
  };

  // Map switch names to switch image
  const getSwitchImagePath = (switchName: string) => {
    const imageMap: Record<string, string> = {
      "Alpacas (Linear)": "/images/switch/switch_alpacas.png",
      "Cherry MX Blacks": "/images/switch/switch_cherry-mx-blacks.png",
      "Cherry MX Blues": "/images/switch/switch_cherry-mx-blues.png",
      "Cherry MX Browns": "/images/switch/switch_cherry-mx-browns.png",
      "Gateron Black Inks": "/images/switch/switch_gateron-black-inks.png",
      "Gateron Red Inks": "/images/switch/switch_gateron-red-inks.png",
      "Holy Pandas (Tactile)": "/images/switch/switch_holy-pandas.png",
      "NovelKeys Creams": "/images/switch/switch_novelkeys-creams.png",
      "Turquoise Tealios": "/images/switch/switch_turquoise-tealios.png",
    };
    return imageMap[switchName] || null;
  };

  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [currentSwitchAudio, setCurrentSwitchAudio] = useState<string | null>(null);
  const [currentSwitchImage, setCurrentSwitchImage] = useState<string | null>(null);
  const [currentSwitchName, setCurrentSwitchName] = useState<string>("");

  const playSound = (audioPath: string) => {
    const audio = new Audio(audioPath);
    audio.volume = 1.0; // Maximum volume
    audio.play().catch(console.error);
  };

  const handleSelectPart = (category: CategoryType, part: CustomPart) => {
    setSelectedParts((prev) => ({ ...prev, [category]: part }));
    
    // If selecting a switch, show modal with image and play sound
    if (category === "switch") {
      const audioPath = getSwitchAudioPath(part.name);
      const imagePath = getSwitchImagePath(part.name);
      
      setCurrentSwitchName(part.name);
      setCurrentSwitchAudio(audioPath);
      setCurrentSwitchImage(imagePath);
      setShowSwitchModal(true);
      
      if (audioPath) {
        playSound(audioPath);
      }
    }
  };

  const isComplete = selectedParts.base && selectedParts.switch && selectedParts.keycapBase && selectedParts.keycapAdd1 && selectedParts.keycapAdd2 && selectedParts.wire;

  const handleAddToCart = () => {
    if (!isComplete) {
      showToast("กรุณาเลือกชิ้นส่วนให้ครบ", "error");
      return;
    }

    // Collect all part images for stacking display
    const partImages = [
      selectedParts.base?.image,
      selectedParts.switch?.image,
      selectedParts.keycapBase?.image,
      selectedParts.keycapAdd1?.image,
      selectedParts.keycapAdd2?.image,
      selectedParts.wire?.image,
    ].filter(Boolean) as string[];

    // Create description with all parts
    const partsDescription = [
      `Base: ${selectedParts.base?.name}`,
      `Switch: ${selectedParts.switch?.name}`,
      `Keycap Base: ${selectedParts.keycapBase?.name}`,
      `Keycap Add 1: ${selectedParts.keycapAdd1?.name}`,
      `Keycap Add 2: ${selectedParts.keycapAdd2?.name}`,
      `Wire: ${selectedParts.wire?.name}`,
    ].join(" | ");

    const customProduct = {
      _id: `custom-${Date.now()}`,
      name: "คีย์บอร์ด Custom 60%",
      description: partsDescription,
      price: totalPrice,
      image: selectedParts.base?.image || "/images/keyboard-placeholder.png",
      images: partImages, // Store all part images for stacking
      category: "custom",
      brand: "Custom Build",
      stock: 1,
      rating: 5,
      reviews: 0,
      // Store individual part names AND images for order display
      customParts: {
        base: { name: selectedParts.base?.name, image: selectedParts.base?.image },
        switch: { name: selectedParts.switch?.name, image: selectedParts.switch?.image },
        keycapBase: { name: selectedParts.keycapBase?.name, image: selectedParts.keycapBase?.image },
        keycapAdd1: { name: selectedParts.keycapAdd1?.name, image: selectedParts.keycapAdd1?.image },
        keycapAdd2: { name: selectedParts.keycapAdd2?.name, image: selectedParts.keycapAdd2?.image },
        wire: { name: selectedParts.wire?.name, image: selectedParts.wire?.image },
      },
    };

    addToCart(customProduct);
    showToast("เพิ่มคีย์บอร์ด Custom ลงตะกร้าแล้ว!", "success");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH").format(price);
  };

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-violet-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">กำลังโหลดชิ้นส่วน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* LEFT SIDEBAR - Category Selectors */}
      <div className="w-72 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <span className="text-2xl">🛠️</span> สร้างคีย์บอร์ด
          </h2>
          <p className="text-slate-500 text-sm mt-1">เลือกชิ้นส่วนที่ต้องการ</p>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto">
          {(Object.keys(categoryLabels) as CategoryType[]).map((category) => {
            const selected = selectedParts[category];
            const options = partsByCategory[category];
            const isOpen = openCategory === category;
            const isOptional = category === "keycapAdd1" || category === "keycapAdd2";

            return (
              <div key={category} className="border-b border-white/5">
                <button
                  onClick={() => setOpenCategory(isOpen ? null : category)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${
                    isOpen 
                      ? "bg-violet-500/20 border-l-2 border-violet-500" 
                      : "hover:bg-white/5 border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{categoryIcons[category]}</span>
                    <div>
                      <span className={`text-sm font-semibold ${isOptional ? "text-amber-400" : "text-white"}`}>
                        {categoryLabels[category]}
                      </span>
                      {selected && (
                        <p className="text-emerald-400 text-xs truncate max-w-[140px]">{selected.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selected && (
                      <span className="text-emerald-400 text-xs font-bold">✓</span>
                    )}
                    <span className={`text-slate-400 text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="bg-slate-800/50 max-h-72 overflow-y-auto">
                    {options.map((part) => (
                      <button
                        key={part._id}
                        onClick={() => handleSelectPart(category, part)}
                        disabled={part.stock === 0}
                        className={`w-full px-4 py-3 text-left transition-all flex items-center gap-3 ${
                          selected?._id === part._id
                            ? "bg-gradient-to-r from-violet-600/40 to-fuchsia-600/40 border-l-2 border-violet-400"
                            : part.stock === 0
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-white/5 border-l-2 border-transparent"
                        }`}
                      >
                        {part.image && (
                          <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0 bg-slate-700 ring-2 ring-white/10">
                            <Image src={part.image} alt={part.name} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{part.name}</p>
                          <p className="text-emerald-400 text-sm font-bold">฿{formatPrice(part.price)}</p>
                        </div>
                        {selected?._id === part._id && (
                          <span className="text-violet-400 text-lg">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary & Action - Fixed at bottom */}
        <div className="border-t border-white/10 bg-slate-900/80">
          {/* Price Summary */}
          <div className="p-3 space-y-2">
            {(Object.keys(categoryLabels) as CategoryType[]).map((category) => {
              const part = selectedParts[category];
              if (!part) return null;
              return (
                <div key={category} className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{categoryLabels[category]}</span>
                  <span className="text-emerald-400 font-bold">฿{formatPrice(part.price)}</span>
                </div>
              );
            })}
          </div>
          
          {/* Total */}
          <div className="px-3 py-2 bg-slate-800/50 flex justify-between items-center">
            <span className="text-slate-400 text-sm">ราคารวม</span>
            <span className="text-xl font-bold text-emerald-400">฿{formatPrice(totalPrice)}</span>
          </div>
          
          {/* Progress */}
          <div className="px-3 py-2">
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${(selectedCount / 6) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Action Button */}
          <div className="p-3">
            <button
              onClick={handleAddToCart}
              disabled={!isComplete}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                isComplete
                  ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:shadow-lg hover:shadow-violet-500/30"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
            >
              {isComplete ? "🛒 เพิ่มลงตะกร้า" : `เลือก ${selectedCount}/4 รายการ`}
            </button>
          </div>
        </div>
      </div>

      {/* CENTER - Large Preview */}
      <div className="flex-1 relative flex items-center justify-center bg-slate-800 overflow-hidden">
        {/* Switch Display Card - Top Left */}
        {selectedParts.switch && (
          <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-sm rounded-xl border border-white/10 p-3 w-44">
            <div className="relative w-full aspect-square mb-2 bg-slate-700 rounded-lg overflow-hidden">
              {getSwitchImagePath(selectedParts.switch.name) && (
                <Image
                  src={getSwitchImagePath(selectedParts.switch.name)!}
                  alt={selectedParts.switch.name}
                  fill
                  className="object-contain p-2"
                />
              )}
            </div>
            <p className="text-white text-sm font-bold text-center mb-2 truncate">{selectedParts.switch.name}</p>
            {getSwitchAudioPath(selectedParts.switch.name) && (
              <button
                onClick={() => playSound(getSwitchAudioPath(selectedParts.switch!.name)!)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1"
              >
                <span>🔊</span> Play Sound
              </button>
            )}
          </div>
        )}

        {/* Stacked Keyboard Parts Preview */}
        {selectedParts.base?.image ? (
          <div className="relative w-full h-full max-w-5xl mx-auto">
            {/* Layer 1: Base */}
            {selectedParts.base?.image && (
              <Image
                src={selectedParts.base.image}
                alt="Base"
                fill
                className="object-contain"
                priority
                style={{ zIndex: 1 }}
              />
            )}
            
            {/* Layer 2: Switch */}
            {selectedParts.switch?.image && (
              <Image
                src={selectedParts.switch.image}
                alt="Switch"
                fill
                className="object-contain"
                style={{ zIndex: 2 }}
              />
            )}
            
            {/* Layer 3: Keycap Base */}
            {selectedParts.keycapBase?.image && (
              <Image
                src={selectedParts.keycapBase.image}
                alt="Keycap Base"
                fill
                className="object-contain"
                style={{ zIndex: 3 }}
              />
            )}
            
            {/* Layer 4: Keycap Add 1 */}
            {selectedParts.keycapAdd1?.image && (
              <Image
                src={selectedParts.keycapAdd1.image}
                alt="Keycap Add 1"
                fill
                className="object-contain"
                style={{ zIndex: 4 }}
              />
            )}
            
            {/* Layer 5: Keycap Add 2 */}
            {selectedParts.keycapAdd2?.image && (
              <Image
                src={selectedParts.keycapAdd2.image}
                alt="Keycap Add 2"
                fill
                className="object-contain"
                style={{ zIndex: 5 }}
              />
            )}
            
            {/* Layer 6: Wire */}
            {selectedParts.wire?.image && (
              <Image
                src={selectedParts.wire.image}
                alt="Wire"
                fill
                className="object-contain"
                style={{ zIndex: 6 }}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500">
            <span className="text-8xl mb-6 opacity-30">⌨️</span>
            <p className="text-2xl font-medium">เลือก Base เพื่อดูตัวอย่าง</p>
            <p className="text-base mt-2 text-slate-600">← คลิกที่เมนูด้านซ้าย</p>
          </div>
        )}
      </div>

    </div>
  );
}
