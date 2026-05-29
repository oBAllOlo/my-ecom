"use client";

import React, { memo, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Wrench,
  Volume2,
  Keyboard,
  Cpu,
  CircleDot,
  Type,
  Cable,
  Check,
  ChevronDown,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";
import {
  categoryLabels,
  categoryOrder,
  isCloudinaryUrl,
  optimizeCloudinaryImage,
  type CategoryType,
  type CustomPartRecord,
} from "@/lib/custom-parts";

const categoryIconMap: Record<CategoryType, LucideIcon> = {
  base: Cpu,
  switch: CircleDot,
  keycapBase: Keyboard,
  keycapAdd1: Type,
  keycapAdd2: Type,
  wire: Cable,
};

const switchAudioMap: Record<string, string> = {
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

const switchImageMap: Record<string, string> = {
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

const nextCategoryByCategory: Record<CategoryType, CategoryType | null> = {
  base: "switch",
  switch: "keycapBase",
  keycapBase: "keycapAdd1",
  keycapAdd1: "keycapAdd2",
  keycapAdd2: "wire",
  wire: null,
};

function getSwitchAudioPath(switchName: string) {
  return switchAudioMap[switchName] || null;
}

function getSwitchImagePath(switchName: string) {
  return switchImageMap[switchName] || null;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("th-TH").format(price);
}

// Track URLs already requested so repeated preload effects don't re-fire the
// same network requests (selecting a part triggers several preload paths).
const preloadedUrls = new Set<string>();

function preloadImage(url: string | null) {
  if (!url || typeof window === "undefined") {
    return;
  }

  if (preloadedUrls.has(url)) {
    return;
  }
  preloadedUrls.add(url);

  const image = new window.Image();
  image.decoding = "async";
  image.src = url;
}

function preloadImages(urls: string[]) {
  urls.forEach((url) => preloadImage(url));
}

function getThumbnailSrc(url: string) {
  return optimizeCloudinaryImage(url, 96);
}

function getPreviewSrc(url: string) {
  return optimizeCloudinaryImage(url, 1200);
}

type SelectedParts = Record<CategoryType, CustomPartRecord | null>;

function createEmptySelection(): SelectedParts {
  return {
    base: null,
    switch: null,
    keycapBase: null,
    keycapAdd1: null,
    keycapAdd2: null,
    wire: null,
  };
}

const PartOptionButton = memo(function PartOptionButton({
  part,
  isSelected,
  onSelect,
}: {
  part: CustomPartRecord;
  isSelected: boolean;
  onSelect: (part: CustomPartRecord) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const thumbnailSrc = useMemo(() => getThumbnailSrc(part.image), [part.image]);

  return (
    <button
      onClick={() => onSelect(part)}
      disabled={part.stock === 0}
      className={`w-full px-4 py-3 text-left transition-all flex items-center gap-3 ${
        isSelected
          ? "border-l-2"
          : part.stock === 0
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-white/5 border-l-2 border-transparent"
      }`}
      style={
        isSelected
          ? {
              background: "rgba(28, 77, 141, 0.4)",
              borderLeftColor: "var(--primary-light)",
            }
          : undefined
      }
    >
      {part.image && (
        <div
          className={`w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0 bg-slate-600 ring-2 ring-white/10 ${
            isLoaded ? "" : "animate-pulse"
          }`}
        >
          <Image
            src={thumbnailSrc}
            alt={part.name}
            fill
            className="object-cover"
            sizes="48px"
            unoptimized={isCloudinaryUrl(thumbnailSrc)}
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{part.name}</p>
        <p className="text-success text-sm font-bold">
          ฿{formatPrice(part.price)}
        </p>
      </div>
      {isSelected && <Check className="h-4 w-4 text-brand" />}
    </button>
  );
});

const LayeredPreview = memo(function LayeredPreview({
  images,
  className,
  sizes,
}: {
  images: Array<{ key: CategoryType; alt: string; src: string }>;
  className: string;
  sizes: string;
}) {
  return (
    <>
      {images.map((image, index) => (
        <Image
          key={image.key}
          src={image.src}
          alt={image.alt}
          fill
          className={className}
          sizes={sizes}
          priority={index === 0}
          unoptimized={isCloudinaryUrl(image.src)}
          style={{ zIndex: index + 1 }}
        />
      ))}
    </>
  );
});

const PartsSelector = memo(function PartsSelector({
  openCategory,
  partsByCategory,
  previewImages,
  selectedCount,
  selectedParts,
  currentSwitchAudioPath,
  currentSwitchImageSrc,
  onAddToCart,
  onOpenCategoryChange,
  onPlaySound,
  onSelectPart,
  isComplete,
}: {
  openCategory: CategoryType | null;
  partsByCategory: Record<CategoryType, CustomPartRecord[]>;
  previewImages: Array<{ key: CategoryType; alt: string; src: string }>;
  selectedCount: number;
  selectedParts: SelectedParts;
  currentSwitchAudioPath: string | null;
  currentSwitchImageSrc: string | null;
  onAddToCart: () => void;
  onOpenCategoryChange: (category: CategoryType | null) => void;
  onPlaySound: (audioPath: string) => void;
  onSelectPart: (category: CategoryType, part: CustomPartRecord) => void;
  isComplete: boolean;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <Wrench className="h-5 w-5 text-brand" /> สร้างคีย์บอร์ด
        </h2>
        <p className="text-slate-500 text-sm mt-1">เลือกชิ้นส่วนที่ต้องการ</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {categoryOrder.map((category) => {
          const selected = selectedParts[category];
          const options = partsByCategory[category];
          const isOpen = openCategory === category;
          const isLocked = category !== "base" && !selectedParts.base;
          const CatIcon = categoryIconMap[category];

          return (
            <div
              key={category}
              className={`border-b border-white/5 ${isLocked ? "opacity-50" : ""}`}
            >
              <button
                onClick={() => {
                  if (isLocked) {
                    return;
                  }
                  onOpenCategoryChange(isOpen ? null : category);
                }}
                disabled={isLocked}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${
                  isLocked
                    ? "cursor-not-allowed"
                    : isOpen
                    ? "border-l-2"
                    : "hover:bg-white/5 border-l-2 border-transparent"
                }`}
                style={
                  isOpen
                    ? {
                        background: "rgba(28, 77, 141, 0.2)",
                        borderLeftColor: "var(--primary)",
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-3">
                  <CatIcon className="h-5 w-5 text-fg-muted" />
                  <div>
                    <span className="text-sm font-semibold text-white">
                      {categoryLabels[category]}
                    </span>
                    {selected && (
                      <p className="text-success text-xs truncate max-w-[140px]">
                        {selected.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selected && <Check className="h-4 w-4 text-success" />}
                  <ChevronDown
                    className={`h-4 w-4 text-fg-subtle transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {isOpen && (
                <div className="bg-slate-800/50 max-h-72 overflow-y-auto">
                  {options.map((part) => (
                    <PartOptionButton
                      key={part._id}
                      part={part}
                      isSelected={selected?._id === part._id}
                      onSelect={(nextPart) => onSelectPart(category, nextPart)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/10 bg-slate-900/80">
        {previewImages.length > 0 && (
          <div className="p-3 lg:hidden">
            <p className="text-slate-400 text-xs mb-2">ตัวอย่าง:</p>
            <div className="relative w-full h-24 bg-slate-700 rounded-lg overflow-hidden">
              <LayeredPreview
                images={previewImages}
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {selectedParts.switch && currentSwitchImageSrc && (
              <div className="mt-3 flex items-center gap-3 bg-slate-800/50 rounded-lg p-2">
                <div className="relative w-16 h-16 flex-shrink-0 bg-slate-700 rounded-lg overflow-hidden">
                  <Image
                    src={currentSwitchImageSrc}
                    alt={selectedParts.switch.name}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                    unoptimized={isCloudinaryUrl(currentSwitchImageSrc)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">
                    {selectedParts.switch.name}
                  </p>
                  {currentSwitchAudioPath && (
                    <button
                      onClick={() => onPlaySound(currentSwitchAudioPath)}
                      className="mt-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                    >
                      <Volume2 className="h-4 w-4" /> ฟังเสียง
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="px-3 py-2 bg-slate-800/50 flex justify-between items-center">
          <span className="text-slate-400 text-sm">ราคารวม</span>
          <span className="text-xl font-bold text-success">
            ฿{formatPrice(
              Object.values(selectedParts).reduce(
                (sum, part) => sum + (part?.price || 0),
                0
              )
            )}
          </span>
        </div>

        <div className="px-3 py-2">
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                background: "var(--gradient-primary)",
                width: `${(selectedCount / categoryOrder.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="p-3">
          <button
            onClick={onAddToCart}
            disabled={!isComplete}
            className={`flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-semibold transition-colors ${
              isComplete
                ? "bg-brand text-white hover:bg-brand-hover"
                : "cursor-not-allowed bg-surface-raised text-fg-subtle"
            }`}
          >
            {isComplete && <ShoppingCart className="h-4 w-4" />}
            {isComplete
              ? "เพิ่มลงตะกร้า"
              : `เลือก ${selectedCount}/${categoryOrder.length} รายการ`}
          </button>
        </div>
      </div>
    </div>
  );
});

export default function CustomKeyboardBuilder({
  initialParts,
}: {
  initialParts: CustomPartRecord[];
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedParts, setSelectedParts] = useState<SelectedParts>(
    createEmptySelection
  );
  const [openCategory, setOpenCategory] = useState<CategoryType | null>("base");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบก่อนใช้งานฟีเจอร์นี้", {
        id: "custom-auth-required",
      });
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const partsByCategory = useMemo(() => {
    const categories: Record<CategoryType, CustomPartRecord[]> = {
      base: [],
      switch: [],
      keycapBase: [],
      keycapAdd1: [],
      keycapAdd2: [],
      wire: [],
    };

    initialParts.forEach((part) => {
      categories[part.category].push(part);
    });

    return categories;
  }, [initialParts]);

  const totalPrice = useMemo(
    () =>
      Object.values(selectedParts).reduce(
        (sum, part) => sum + (part?.price || 0),
        0
      ),
    [selectedParts]
  );

  const selectedCount = useMemo(
    () => Object.values(selectedParts).filter(Boolean).length,
    [selectedParts]
  );

  const previewImages = useMemo(
    () =>
      categoryOrder.flatMap((category) => {
        const part = selectedParts[category];
        if (!part?.image) {
          return [];
        }

        return [
          {
            key: category,
            alt: categoryLabels[category],
            src: getPreviewSrc(part.image),
          },
        ];
      }),
    [selectedParts]
  );

  const currentSwitchAudioPath = selectedParts.switch
    ? getSwitchAudioPath(selectedParts.switch.name)
    : null;
  const currentSwitchImagePath = selectedParts.switch
    ? getSwitchImagePath(selectedParts.switch.name)
    : null;
  const currentSwitchImageSrc = currentSwitchImagePath
    ? optimizeCloudinaryImage(currentSwitchImagePath, 320)
    : null;

  useEffect(() => {
    const visibleOptions = openCategory ? partsByCategory[openCategory] : [];
    preloadImages(
      visibleOptions
        .slice(0, 8)
        .map((part) => getThumbnailSrc(part.image))
    );
  }, [openCategory, partsByCategory]);

  useEffect(() => {
    preloadImages(previewImages.map((image) => image.src));
  }, [previewImages]);

  useEffect(() => {
    const lastSelectedCategory = [...categoryOrder]
      .reverse()
      .find((category) => selectedParts[category]);

    if (!lastSelectedCategory) {
      return;
    }

    const nextCategory = nextCategoryByCategory[lastSelectedCategory];
    if (!nextCategory) {
      return;
    }

    preloadImages(
      partsByCategory[nextCategory]
        .slice(0, 10)
        .map((part) => getThumbnailSrc(part.image))
    );
  }, [partsByCategory, selectedParts]);

  const playSound = (audioPath: string) => {
    const audio = new Audio(audioPath);
    audio.volume = 1;
    audio.play().catch(console.error);
  };

  const handleSelectPart = (category: CategoryType, part: CustomPartRecord) => {
    if (!isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบก่อนเลือกชิ้นส่วน");
      router.push("/login");
      return;
    }

    preloadImage(getPreviewSrc(part.image));

    const switchImagePath =
      category === "switch" ? getSwitchImagePath(part.name) : null;
    if (switchImagePath) {
      preloadImage(optimizeCloudinaryImage(switchImagePath, 320));
    }

    const nextCategory = nextCategoryByCategory[category];
    if (nextCategory) {
      preloadImages(
        partsByCategory[nextCategory]
          .slice(0, 10)
          .map((nextPart) => getThumbnailSrc(nextPart.image))
      );
    }

    setSelectedParts((prev) => ({ ...prev, [category]: part }));

    if (category === "switch") {
      const audioPath = getSwitchAudioPath(part.name);
      if (audioPath) {
        playSound(audioPath);
      }
    }
  };

  const isComplete = categoryOrder.every((category) => !!selectedParts[category]);

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

    const partImages = categoryOrder
      .map((category) => selectedParts[category]?.image)
      .filter(Boolean) as string[];

    const partsDescription = [
      `Base: ${selectedParts.base?.name}`,
      `Switch: ${selectedParts.switch?.name}`,
      `Keycap Base: ${selectedParts.keycapBase?.name}`,
      `Keycap Add 1: ${selectedParts.keycapAdd1?.name}`,
      `Keycap Add 2: ${selectedParts.keycapAdd2?.name}`,
      `Wire: ${selectedParts.wire?.name}`,
    ].join(" | ");

    const customProduct: Product = {
      _id: `custom-${Date.now()}`,
      name: "คีย์บอร์ด Custom 60%",
      description: partsDescription,
      price: totalPrice,
      image:
        selectedParts.base?.image || "/images/keyboard-placeholder.png",
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

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row lg:h-screen overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a1628 0%, #050d18 50%, #0f2854 100%)",
      }}
    >
        {/* Sidebar — rendered once; layout switches via CSS (no duplicate DOM) */}
        <div className="w-full flex-1 lg:flex-none lg:w-72 lg:h-full flex flex-col overflow-hidden bg-slate-900/80 lg:backdrop-blur-xl lg:border-r lg:border-white/10">
          <PartsSelector
            openCategory={openCategory}
            partsByCategory={partsByCategory}
            previewImages={previewImages}
            selectedCount={selectedCount}
            selectedParts={selectedParts}
            currentSwitchAudioPath={currentSwitchAudioPath}
            currentSwitchImageSrc={currentSwitchImageSrc}
            onAddToCart={handleAddToCart}
            onOpenCategoryChange={setOpenCategory}
            onPlaySound={playSound}
            onSelectPart={handleSelectPart}
            isComplete={isComplete}
          />
        </div>

        {/* Big preview — desktop only */}
        <div
          className="hidden lg:flex lg:flex-1 lg:h-full relative items-center justify-center overflow-hidden min-h-0"
          style={{
            background:
              "linear-gradient(135deg, #0a1628 0%, #050d18 50%, #0f2854 100%)",
          }}
        >
          {selectedParts.switch && currentSwitchImageSrc && (
            <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-sm rounded-xl border border-white/10 p-3 w-32 lg:w-44">
              <div className="relative w-full aspect-square mb-2 bg-slate-700 rounded-lg overflow-hidden">
                <Image
                  src={currentSwitchImageSrc}
                  alt={selectedParts.switch.name}
                  fill
                  className="object-contain p-2"
                  sizes="176px"
                  unoptimized={isCloudinaryUrl(currentSwitchImageSrc)}
                />
              </div>
              <p className="text-white text-xs lg:text-sm font-bold text-center mb-2 truncate">
                {selectedParts.switch.name}
              </p>
              {currentSwitchAudioPath && (
                <button
                  onClick={() => playSound(currentSwitchAudioPath)}
                  className="w-full py-1.5 lg:py-2 text-white text-xs lg:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                  style={{
                    background: "var(--primary)",
                    boxShadow: "0 4px 15px rgba(28, 77, 141, 0.3)",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = "var(--primary-light)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "var(--primary)";
                  }}
                >
                  <Volume2 className="h-4 w-4" /> <span className="hidden sm:inline">Play</span>
                </button>
              )}
            </div>
          )}

          {previewImages.length > 0 ? (
            <div className="relative w-full h-full max-w-5xl mx-auto">
              <LayeredPreview
                images={previewImages}
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, calc(100vw - 18rem)"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 p-8">
              <Keyboard className="mb-4 h-16 w-16 opacity-30 lg:mb-6 lg:h-24 lg:w-24" strokeWidth={1.5} />
              <p className="text-lg lg:text-2xl font-medium text-center">
                เลือก Base เพื่อดูตัวอย่าง
              </p>
              <p className="text-sm lg:text-base mt-2 text-slate-600 text-center">
                เลือกจากเมนูด้านซ้าย
              </p>
            </div>
          )}
        </div>
    </div>
  );
}
