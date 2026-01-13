"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface CustomPart {
  _id: string;
  category: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  isActive: boolean;
}

type CategoryType =
  | "base"
  | "switch"
  | "keycapBase"
  | "keycapAdd1"
  | "keycapAdd2"
  | "wire";

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
  keycapAdd1: "🔠",
  keycapAdd2: "🔣",
  wire: "🔌",
};

export default function CustomKeyboardPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  // const { showToast } = useToast();

  const [parts, setParts] = useState<CustomPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParts, setSelectedParts] = useState<
    Record<CategoryType, CustomPart | null>
  >({
    base: null,
    switch: null,
    keycapBase: null,
    keycapAdd1: null,
    keycapAdd2: null,
    wire: null,
  });
  const [openCategory, setOpenCategory] = useState<CategoryType | null>("base");


  // Check authentication when page loads
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // ใช้ toast.id เพื่อป้องกันการแสดง toast ซ้ำ
      toast.error("กรุณาเข้าสู่ระบบก่อนใช้งานฟีเจอร์นี้", {
        id: "custom-auth-required",
      });
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

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
    return Object.values(selectedParts).reduce(
      (sum, part) => sum + (part?.price || 0),
      0
    );
  }, [selectedParts]);

  const selectedCount = useMemo(() => {
    return Object.values(selectedParts).filter((p) => p !== null).length;
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

  // Map switch names to switch image (Cloudinary URLs with optimization)
  const getSwitchImagePath = (switchName: string) => {
    const imageMap: Record<string, string> = {
      "Alpacas (Linear)":
        "https://res.cloudinary.com/dea7e29r0/image/upload/f_auto,q_auto,w_300/v1766420897/keyboard-parts/switch/switch_alpacas.png",
      "Cherry MX Blacks":
        "https://res.cloudinary.com/dea7e29r0/image/upload/f_auto,q_auto,w_300/v1766420898/keyboard-parts/switch/switch_cherry-mx-blacks.png",
      "Cherry MX Blues":
        "https://res.cloudinary.com/dea7e29r0/image/upload/f_auto,q_auto,w_300/v1766420902/keyboard-parts/switch/switch_cherry-mx-blues.png",
      "Cherry MX Browns":
        "https://res.cloudinary.com/dea7e29r0/image/upload/f_auto,q_auto,w_300/v1766420904/keyboard-parts/switch/switch_cherry-mx-browns.png",
      "Gateron Black Inks":
        "https://res.cloudinary.com/dea7e29r0/image/upload/f_auto,q_auto,w_300/v1766420906/keyboard-parts/switch/switch_gateron-black-inks.png",
      "Gateron Red Inks":
        "https://res.cloudinary.com/dea7e29r0/image/upload/f_auto,q_auto,w_300/v1766420907/keyboard-parts/switch/switch_gateron-red-inks.png",
      "Holy Pandas (Tactile)":
        "https://res.cloudinary.com/dea7e29r0/image/upload/f_auto,q_auto,w_300/v1766420908/keyboard-parts/switch/switch_holy-pandas.png",
      "NovelKeys Creams":
        "https://res.cloudinary.com/dea7e29r0/image/upload/f_auto,q_auto,w_300/v1766420909/keyboard-parts/switch/switch_novelkeys-creams.png",
      "Turquoise Tealios":
        "https://res.cloudinary.com/dea7e29r0/image/upload/f_auto,q_auto,w_300/v1766420911/keyboard-parts/switch/switch_turquoise-tealios.png",
    };
    return imageMap[switchName] || null;
  };

  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [currentSwitchAudio, setCurrentSwitchAudio] = useState<string | null>(
    null
  );
  const [currentSwitchImage, setCurrentSwitchImage] = useState<string | null>(
    null
  );
  const [currentSwitchName, setCurrentSwitchName] = useState<string>("");

  const playSound = (audioPath: string) => {
    const audio = new Audio(audioPath);
    audio.volume = 1.0;
    audio.play().catch(console.error);
  };

  const handleSelectPart = (category: CategoryType, part: CustomPart) => {
    if (!isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบก่อนเลือกชิ้นส่วน");
      router.push("/login");
      return;
    }

    setSelectedParts((prev) => ({ ...prev, [category]: part }));

    if (category === "switch") {
      const audioPath = getSwitchAudioPath(part.name);
      const imagePath = getSwitchImagePath(part.name);

      setCurrentSwitchName(part.name);
      setCurrentSwitchAudio(audioPath);
      setCurrentSwitchImage(imagePath);
      setShowSwitchModal(true);
    }
  };

  const isComplete =
    selectedParts.base &&
    selectedParts.switch &&
    selectedParts.keycapBase &&
    selectedParts.keycapAdd1 &&
    selectedParts.keycapAdd2 &&
    selectedParts.wire;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า");
      router.push("/login");
      return;
    }

    if (!isComplete) {
      toast.error("กรุณาเลือกชิ้นส่วนให้ครบ");
      return;
    }

    const partImages = [
      selectedParts.base?.image,
      selectedParts.switch?.image,
      selectedParts.keycapBase?.image,
      selectedParts.keycapAdd1?.image,
      selectedParts.keycapAdd2?.image,
      selectedParts.wire?.image,
    ].filter(Boolean) as string[];

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
      images: partImages,
      category: "custom",
      brand: "Custom Build",
      stock: 1,
      rating: 5,
      reviews: 0,
      customParts: {
        base: {
          name: selectedParts.base?.name,
          image: selectedParts.base?.image,
        },
        switch: {
          name: selectedParts.switch?.name,
          image: selectedParts.switch?.image,
        },
        keycapBase: {
          name: selectedParts.keycapBase?.name,
          image: selectedParts.keycapBase?.image,
        },
        keycapAdd1: {
          name: selectedParts.keycapAdd1?.name,
          image: selectedParts.keycapAdd1?.image,
        },
        keycapAdd2: {
          name: selectedParts.keycapAdd2?.name,
          image: selectedParts.keycapAdd2?.image,
        },
        wire: {
          name: selectedParts.wire?.name,
          image: selectedParts.wire?.image,
        },
      },
    };

    addToCart(customProduct);
    toast.success("เพิ่มสินค้าลงตะกร้าแล้ว");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH").format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">กำลังโหลดชิ้นส่วน...</p>
        </div>
      </div>
    );
  }

  // Parts Selector Component
  const PartsSelector = () => (
    <div className="flex flex-col h-full">
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
          const isOptional =
            category === "keycapAdd1" || category === "keycapAdd2";
          // Lock other categories until Base is selected
          const isLocked = category !== "base" && !selectedParts.base;

          return (
            <div
              key={category}
              className={`border-b border-white/5 ${
                isLocked ? "opacity-50" : ""
              }`}
            >
              <button
                onClick={() => {
                  if (isLocked) return;
                  setOpenCategory(isOpen ? null : category);
                }}
                disabled={isLocked}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${
                  isLocked
                    ? "cursor-not-allowed"
                    : isOpen
                    ? "border-l-2"
                    : "hover:bg-white/5 border-l-2 border-transparent"
                }`}
                style={isOpen ? { background: "rgba(28, 77, 141, 0.2)", borderLeftColor: "var(--primary)" } : {}}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{categoryIcons[category]}</span>
                  <div>
                    <span className="text-sm font-semibold text-white">
                      {categoryLabels[category]}
                    </span>
                    {selected && (
                      <p className="text-emerald-400 text-xs truncate max-w-[140px]">
                        {selected.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selected && (
                    <span className="text-emerald-400 text-xs font-bold">
                      ✓
                    </span>
                  )}
                  <span
                    className={`text-slate-400 text-xs transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
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
                          ? "border-l-2"
                          : part.stock === 0
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-white/5 border-l-2 border-transparent"
                      }`}
                      style={selected?._id === part._id ? { background: "rgba(28, 77, 141, 0.4)", borderLeftColor: "var(--primary-light)" } : {}}
                    >
                      {part.image && (
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0 bg-slate-600 ring-2 ring-white/10 animate-pulse">
                          <Image
                            src={part.image}
                            alt={part.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                            loading="eager"
                            onLoad={(e) => {
                              const target = e.target as HTMLElement;
                              target.parentElement?.classList.remove(
                                "animate-pulse"
                              );
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {part.name}
                        </p>
                        <p className="text-emerald-400 text-sm font-bold">
                          ฿{formatPrice(part.price)}
                        </p>
                      </div>
                      {selected?._id === part._id && (
                        <span className="text-lg" style={{ color: "var(--primary-light)" }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary & Action */}
      <div className="border-t border-white/10 bg-slate-900/80">
        {/* Mini Preview for Mobile */}
        {selectedParts.base && (
          <div className="p-3 lg:hidden">
            <p className="text-slate-400 text-xs mb-2">ตัวอย่าง:</p>
            <div className="relative w-full h-24 bg-slate-700 rounded-lg overflow-hidden">
              {selectedParts.base?.image && (
                <Image
                  src={selectedParts.base.image}
                  alt="Base"
                  fill
                  className="object-contain"
                  style={{ zIndex: 1 }}
                />
              )}
              {selectedParts.switch?.image && (
                <Image
                  src={selectedParts.switch.image}
                  alt="Switch"
                  fill
                  className="object-contain"
                  style={{ zIndex: 2 }}
                />
              )}
              {selectedParts.keycapBase?.image && (
                <Image
                  src={selectedParts.keycapBase.image}
                  alt="Keycap Base"
                  fill
                  className="object-contain"
                  style={{ zIndex: 3 }}
                />
              )}
              {selectedParts.keycapAdd1?.image && (
                <Image
                  src={selectedParts.keycapAdd1.image}
                  alt="Keycap Add 1"
                  fill
                  className="object-contain"
                  style={{ zIndex: 4 }}
                />
              )}
              {selectedParts.keycapAdd2?.image && (
                <Image
                  src={selectedParts.keycapAdd2.image}
                  alt="Keycap Add 2"
                  fill
                  className="object-contain"
                  style={{ zIndex: 5 }}
                />
              )}
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
            {/* Switch Image and Sound Test */}
            {selectedParts.switch && (
              <div className="mt-3 flex items-center gap-3 bg-slate-800/50 rounded-lg p-2">
                {/* Switch Image */}
                {getSwitchImagePath(selectedParts.switch.name) && (
                  <div className="relative w-16 h-16 flex-shrink-0 bg-slate-700 rounded-lg overflow-hidden">
                    <Image
                      src={getSwitchImagePath(selectedParts.switch.name)!}
                      alt={selectedParts.switch.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">
                    {selectedParts.switch.name}
                  </p>
                  {getSwitchAudioPath(selectedParts.switch.name) && (
                    <button
                      onClick={() =>
                        playSound(
                          getSwitchAudioPath(selectedParts.switch!.name)!
                        )
                      }
                      className="mt-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                    >
                      🔊 ฟังเสียง
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Total */}
        <div className="px-3 py-2 bg-slate-800/50 flex justify-between items-center">
          <span className="text-slate-400 text-sm">ราคารวม</span>
          <span className="text-xl font-bold text-emerald-400">
            ฿{formatPrice(totalPrice)}
          </span>
        </div>

        {/* Progress */}
        <div className="px-3 py-2">
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{ background: "var(--gradient-primary)" }}
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
                ? "text-white hover:shadow-lg"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
            style={isComplete ? { background: "var(--gradient-primary)", boxShadow: "0 10px 30px rgba(28, 77, 141, 0.3)" } : {}}
          >
            {isComplete
              ? "🛒 เพิ่มลงตะกร้า"
              : `เลือก ${selectedCount}/6 รายการ`}
          </button>
        </div>
      </div>
    </div>
  );

  // Preview Component
  const PreviewArea = () => (
    <div className="flex-1 relative flex items-center justify-center overflow-hidden min-h-[300px] lg:min-h-0" style={{ background: "linear-gradient(135deg, #0a1628 0%, #050d18 50%, #0f2854 100%)" }}>
      {/* Switch Display Card - Top Left */}
      {selectedParts.switch && (
        <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-sm rounded-xl border border-white/10 p-3 w-32 lg:w-44">
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
          <p className="text-white text-xs lg:text-sm font-bold text-center mb-2 truncate">
            {selectedParts.switch.name}
          </p>
          {getSwitchAudioPath(selectedParts.switch.name) && (
            <button
              onClick={() =>
                playSound(getSwitchAudioPath(selectedParts.switch!.name)!)
              }
              className="w-full py-1.5 lg:py-2 text-white text-xs lg:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1"
              style={{ background: "var(--primary)", boxShadow: "0 4px 15px rgba(28, 77, 141, 0.3)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-light)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--primary)"; }}
            >
              <span>🔊</span> <span className="hidden sm:inline">Play</span>
            </button>
          )}
        </div>
      )}

      {/* Stacked Keyboard Parts Preview */}
      {selectedParts.base?.image ? (
        <div className="relative w-full h-full max-w-5xl mx-auto">
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
          {selectedParts.switch?.image && (
            <Image
              src={selectedParts.switch.image}
              alt="Switch"
              fill
              className="object-contain"
              style={{ zIndex: 2 }}
            />
          )}
          {selectedParts.keycapBase?.image && (
            <Image
              src={selectedParts.keycapBase.image}
              alt="Keycap Base"
              fill
              className="object-contain"
              style={{ zIndex: 3 }}
            />
          )}
          {selectedParts.keycapAdd1?.image && (
            <Image
              src={selectedParts.keycapAdd1.image}
              alt="Keycap Add 1"
              fill
              className="object-contain"
              style={{ zIndex: 4 }}
            />
          )}
          {selectedParts.keycapAdd2?.image && (
            <Image
              src={selectedParts.keycapAdd2.image}
              alt="Keycap Add 2"
              fill
              className="object-contain"
              style={{ zIndex: 5 }}
            />
          )}
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
        <div className="flex flex-col items-center justify-center text-slate-500 p-8">
          <span className="text-6xl lg:text-8xl mb-4 lg:mb-6 opacity-30">
            ⌨️
          </span>
          <p className="text-lg lg:text-2xl font-medium text-center">
            เลือก Base เพื่อดูตัวอย่าง
          </p>
          <p className="text-sm lg:text-base mt-2 text-slate-600 text-center">
            เลือกจากเมนูด้านซ้าย
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row lg:h-screen overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1628 0%, #050d18 50%, #0f2854 100%)" }}>


      {/* Mobile View - Conditional rendering */}
      <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden bg-slate-900/80">
          <PartsSelector />
        </div>
      </div>

      {/* Desktop View - Side by side */}
      <div className="hidden lg:flex lg:flex-1 lg:h-full">
        {/* LEFT SIDEBAR - Category Selectors */}
        <div className="w-72 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col h-full">
          <PartsSelector />
        </div>

        {/* CENTER - Large Preview */}
        <PreviewArea />
      </div>
    </div>
  );
}
