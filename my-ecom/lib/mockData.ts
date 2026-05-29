import { Product, Category } from "./types";

export const categories: Category[] = [
  {
    _id: "1",
    name: "คีย์บอร์ดเกมมิ่ง",
    slug: "gaming",
    icon: "🎮",
    productCount: 4,
  },
  {
    _id: "2",
    name: "คีย์บอร์ดไร้สาย",
    slug: "wireless",
    icon: "📡",
    productCount: 3,
  },
  {
    _id: "3",
    name: "คีย์บอร์ดเครื่องพิมพ์ดีด",
    slug: "mechanical",
    icon: "⌨️",
    productCount: 4,
  },
  {
    _id: "4",
    name: "คีย์บอร์ดมินิมอล",
    slug: "minimal",
    icon: "✨",
    productCount: 3,
  },
];

export const products: Product[] = [
  {
    _id: "1",
    name: "Keychron K2 Pro",
    description:
      "คีย์บอร์ดไร้สาย 75% พร้อม Hot-swappable Gateron G Pro สวิตช์ รองรับ Bluetooth 5.1 และ USB-C พร้อมแบตเตอรี่ 4000mAh ใช้งานได้นานถึง 100 ชั่วโมง",
    price: 3490,
    originalPrice: 3990,
    image:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80",
    category: "wireless",
    brand: "Keychron",
    stock: 25,
    rating: 4.8,
    reviews: 156,
    features: [
      "Hot-swappable",
      "Bluetooth 5.1",
      "USB-C",
      "RGB Backlight",
      "Mac/Windows",
    ],
    switchType: "Gateron G Pro Red",
    connectivity: "Wireless + Wired",
    isNewProduct: true,
    isFeatured: true,
  },
  {
    _id: "2",
    name: "Razer BlackWidow V4 Pro",
    description:
      "คีย์บอร์ดเกมมิ่งระดับโปร พร้อม Razer Green Mechanical Switches และ Command Dial มัลติฟังก์ชั่น RGB Underglow สุดอลังการ",
    price: 7990,
    originalPrice: 8990,
    image:
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80",
    category: "gaming",
    brand: "Razer",
    stock: 15,
    rating: 4.9,
    reviews: 234,
    features: [
      "Command Dial",
      "Wrist Rest",
      "RGB Underglow",
      "Dedicated Macro Keys",
    ],
    switchType: "Razer Green",
    connectivity: "Wired USB",
    isFeatured: true,
  },
  {
    _id: "3",
    name: "Logitech MX Keys S",
    description:
      "คีย์บอร์ดไร้สายสำหรับทำงาน พิมพ์เงียบและแม่นยำ รองรับ Smart Illumination และ Easy-Switch เชื่อมต่อได้ 3 อุปกรณ์",
    price: 4290,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
    category: "wireless",
    brand: "Logitech",
    stock: 30,
    rating: 4.7,
    reviews: 189,
    features: [
      "Smart Illumination",
      "Easy-Switch",
      "USB-C Charging",
      "Low Profile Keys",
    ],
    connectivity: "Bluetooth + USB Receiver",
    isFeatured: true,
  },
  {
    _id: "4",
    name: "Akko 3068B Plus",
    description:
      "คีย์บอร์ด 65% สไตล์ Retro พร้อม Akko CS Jelly สวิตช์นุ่มเงียบ มาพร้อม PBT Double-shot Keycaps สีสันสดใส",
    price: 2490,
    originalPrice: 2790,
    image:
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&q=80",
    category: "mechanical",
    brand: "Akko",
    stock: 40,
    rating: 4.6,
    reviews: 98,
    features: [
      "PBT Keycaps",
      "Hot-swappable",
      "Gasket Mount",
      "3-mode Connection",
    ],
    switchType: "Akko CS Jelly Pink",
    connectivity: "Wireless + Wired",
    isNewProduct: true,
  },
  {
    _id: "5",
    name: "Ducky One 3 TKL",
    description:
      "คีย์บอร์ด Tenkeyless จาก Ducky มาตรฐานเกมเมอร์มืออาชีพ พร้อม Hot-swap PCB และ PBT Double-shot Keycaps",
    price: 4590,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    category: "gaming",
    brand: "Ducky",
    stock: 20,
    rating: 4.8,
    reviews: 145,
    features: [
      "Hot-swap PCB",
      "PBT Keycaps",
      "Detachable USB-C",
      "Dye-sub Legends",
    ],
    switchType: "Cherry MX Red",
    connectivity: "Wired USB-C",
  },
  {
    _id: "6",
    name: "HHKB Professional Hybrid",
    description:
      "คีย์บอร์ด Topre Switch ระดับตำนาน Layout 60% สำหรับโปรแกรมเมอร์ พิมพ์สะใจทุกตัวอักษร",
    price: 9990,
    image:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80",
    category: "minimal",
    brand: "HHKB",
    stock: 8,
    rating: 4.9,
    reviews: 67,
    features: ["Topre Switch", "Bluetooth", "USB-C", "Programmable"],
    switchType: "Topre 45g",
    connectivity: "Bluetooth + USB-C",
  },
  {
    _id: "7",
    name: "SteelSeries Apex Pro TKL",
    description:
      "คีย์บอร์ดเกมมิ่ง พร้อม OmniPoint 2.0 Adjustable Switches ปรับ Actuation Point ได้ตั้งแต่ 0.2mm - 3.8mm",
    price: 6490,
    originalPrice: 7290,
    image:
      "https://images.unsplash.com/photo-1529236183275-4fdcf2bc987e?w=800&q=80",
    category: "gaming",
    brand: "SteelSeries",
    stock: 12,
    rating: 4.7,
    reviews: 178,
    features: [
      "Adjustable Actuation",
      "OLED Smart Display",
      "Aircraft-grade Aluminum",
      "USB Passthrough",
    ],
    switchType: "OmniPoint 2.0",
    connectivity: "Wired USB",
    isFeatured: true,
  },
  {
    _id: "8",
    name: "NuPhy Air75 V2",
    description:
      "คีย์บอร์ด Low-profile 75% บางเฉียบ น้ำหนักเบา พกพาสะดวก รองรับ Mac และ Windows",
    price: 3890,
    image:
      "https://images.unsplash.com/photo-1561112078-7d24e04c3407?w=800&q=80",
    category: "wireless",
    brand: "NuPhy",
    stock: 22,
    rating: 4.6,
    reviews: 89,
    features: ["Low-profile", "Tri-mode", "RGB", "Mac Compatible"],
    switchType: "NuPhy Wisteria",
    connectivity: "Bluetooth + 2.4GHz + USB-C",
    isNewProduct: true,
  },
  {
    _id: "9",
    name: "Leopold FC660M",
    description:
      "คีย์บอร์ด Compact 66 keys คุณภาพสูงจากเกาหลี เน้นความทนทานและสัมผัสการพิมพ์ที่ดีเยี่ยม",
    price: 3990,
    image:
      "https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=800&q=80",
    category: "mechanical",
    brand: "Leopold",
    stock: 18,
    rating: 4.8,
    reviews: 112,
    features: ["PBT Double-shot", "Sound-absorbing Pad", "Detachable Cable"],
    switchType: "Cherry MX Blue",
    connectivity: "Wired USB",
  },
  {
    _id: "10",
    name: "Varmilo VA87M Sakura",
    description:
      "คีย์บอร์ด TKL ลาย Sakura สวยงาม Keycaps คุณภาพสูง Dye-sub PBT สีไม่ซีดแม้ใช้งานนาน",
    price: 4290,
    originalPrice: 4790,
    image:
      "https://images.unsplash.com/photo-1618499890638-3a0dd4b278cd?w=800&q=80",
    category: "mechanical",
    brand: "Varmilo",
    stock: 14,
    rating: 4.7,
    reviews: 76,
    features: ["Dye-sub PBT", "Cherry MX", "Limited Edition Design"],
    switchType: "Cherry MX Silent Red",
    connectivity: "Wired USB-C",
  },
  {
    _id: "11",
    name: "Wooting 60HE",
    description:
      "คีย์บอร์ดเกมมิ่ง 60% พร้อม Lekker สวิตช์ Analog รองรับ Rapid Trigger และ SOCD ตัวเลือกของโปรเพลเยอร์",
    price: 7490,
    image:
      "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=800&q=80",
    category: "gaming",
    brand: "Wooting",
    stock: 10,
    rating: 4.9,
    reviews: 203,
    features: ["Rapid Trigger", "Analog Input", "SOCD", "Hot-swappable"],
    switchType: "Lekker L45",
    connectivity: "Wired USB-C",
    isNewProduct: true,
  },
  {
    _id: "12",
    name: "Monsgeek M1W",
    description:
      "คีย์บอร์ด 75% Gasket Mount คุณภาพดีในราคาไม่แพง มาพร้อม Aluminum Case และ South-facing LEDs",
    price: 2990,
    image:
      "https://images.unsplash.com/photo-1544642899-f0d6e5f6ed6f?w=800&q=80",
    category: "mechanical",
    brand: "Monsgeek",
    stock: 35,
    rating: 4.5,
    reviews: 64,
    features: ["Gasket Mount", "Aluminum Case", "VIA Support", "Hot-swappable"],
    switchType: "Akko V3 Cream Yellow",
    connectivity: "Bluetooth + 2.4GHz + USB-C",
  },
];

export const featuredProducts = products.filter((p) => p.isFeatured);
export const newProducts = products.filter((p) => p.isNewProduct);

export const formatPrice = (price: number): string => {
  return `${new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
  }).format(price)} บาท`;
};
