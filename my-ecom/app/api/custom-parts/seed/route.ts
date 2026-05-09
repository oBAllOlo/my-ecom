import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CustomPart from "@/models/CustomPart";

const optimizeUrl = (url: string, width = 200) => {
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};

const cloudinaryUrls: Record<string, Record<string, string>> = {
  base: {
    black: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419605/keyboard-parts/base_60/base_60_black.png",
    blue: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419609/keyboard-parts/base_60/base_60_blue.png",
    chartreuse: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419613/keyboard-parts/base_60/base_60_chartreuse.png",
    cyan: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419616/keyboard-parts/base_60/base_60_cyan.png",
    "dodger-blue": "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419619/keyboard-parts/base_60/base_60_dodger-blue.png",
    green: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419623/keyboard-parts/base_60/base_60_green.png",
    magenta: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419626/keyboard-parts/base_60/base_60_magenta.png",
    orange: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419630/keyboard-parts/base_60/base_60_orange.png",
    purple: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419633/keyboard-parts/base_60/base_60_purple.png",
    red: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419637/keyboard-parts/base_60/base_60_red.png",
    "spring-green": "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419641/keyboard-parts/base_60/base_60_spring-green.png",
    violet: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419646/keyboard-parts/base_60/base_60_violet.png",
    white: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419652/keyboard-parts/base_60/base_60_white.png",
    yellow: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419658/keyboard-parts/base_60/base_60_yellow.png",
  },
  switch: {
    alpacas: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419824/keyboard-parts/switch_60/switch_60_alpacas.png",
    "cherry-mx-blacks": "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419828/keyboard-parts/switch_60/switch_60_cherry-mx-blacks.png",
    "cherry-mx-blues": "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419831/keyboard-parts/switch_60/switch_60_cherry-mx_blues.png",
    "cherry-mx-browns": "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419834/keyboard-parts/switch_60/switch_60_cherry-mx_browns.png",
    "gateron-black-inks": "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419837/keyboard-parts/switch_60/switch_60_gateron-black-inks.png",
    "gateron-red-inks": "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419841/keyboard-parts/switch_60/switch_60_gateron-red-inks.png",
    "holy-pandas": "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419843/keyboard-parts/switch_60/switch_60_holy-pandas.png",
    "novelkeys-creams": "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419846/keyboard-parts/switch_60/switch_60_novelkeys-creams.png",
    "turquoise-tealios": "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419850/keyboard-parts/switch_60/switch_60_turquoise-tealios.png",
  },
  keycapBase: {
    black: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419779/keyboard-parts/keycap_60/keycap_60_base/keycap_60_base_black.png",
    blue: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419782/keyboard-parts/keycap_60/keycap_60_base/keycap_60_base_blue.png",
    chartreuse: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419786/keyboard-parts/keycap_60/keycap_60_base/keycap_60_base_chartreuse.png",
    cyan: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419789/keyboard-parts/keycap_60/keycap_60_base/keycap_60_base_cyan.png",
    "dodger-blue": "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419793/keyboard-parts/keycap_60/keycap_60_base/keycap_60_base_dodger-blue.png",
    green: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419796/keyboard-parts/keycap_60/keycap_60_base/keycap_60_base_green.png",
    magenta: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419800/keyboard-parts/keycap_60/keycap_60_base/keycap_60_base_magenta.png",
    orange: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419803/keyboard-parts/keycap_60/keycap_60_base/keycap_60_base_orange.png",
    purple: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419806/keyboard-parts/keycap_60/keycap_60_base/keycap_60_base_purple.png",
    red: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419809/keyboard-parts/keycap_60/keycap_60_base/keycap_60_base_red.png",
    "spring-green": "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419812/keyboard-parts/keycap_60/keycap_60_base/keycap_60_base_spring-green.png",
    violet: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419816/keyboard-parts/keycap_60/keycap_60_base/keycap_60_base_violet.png",
    white: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419818/keyboard-parts/keycap_60/keycap_60_base/keycap_60_base_white.png",
    yellow: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419822/keyboard-parts/keycap_60/keycap_60_base/keycap_60_base_yellow.png",
  },
  wire: {
    black: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419853/keyboard-parts/wire_60/wire_60_black.png",
    blue: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419855/keyboard-parts/wire_60/wire_60_blue.png",
    chartreuse: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419857/keyboard-parts/wire_60/wire_60_chartreuse.png",
    cyan: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419860/keyboard-parts/wire_60/wire_60_cyan.png",
    "dodger-blue": "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419863/keyboard-parts/wire_60/wire_60_dodger-blue.png",
    green: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419866/keyboard-parts/wire_60/wire_60_green.png",
    magenta: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419869/keyboard-parts/wire_60/wire_60_magenta.png",
    orange: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419872/keyboard-parts/wire_60/wire_60_orange.png",
    purple: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419876/keyboard-parts/wire_60/wire_60_purple.png",
    red: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419880/keyboard-parts/wire_60/wire_60_red.png",
    "spring-green": "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419883/keyboard-parts/wire_60/wire_60_spring-green.png",
    violet: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419885/keyboard-parts/wire_60/wire_60_violet.png",
    white: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419888/keyboard-parts/wire_60/wire_60_white.png",
    yellow: "https://res.cloudinary.com/dea7e29r0/image/upload/v1766419890/keyboard-parts/wire_60/wire_60_yellow.png",
  },
};

type ColorKey =
  | "black"
  | "white"
  | "blue"
  | "red"
  | "purple"
  | "cyan"
  | "green"
  | "orange"
  | "yellow"
  | "magenta"
  | "violet"
  | "chartreuse"
  | "dodger-blue"
  | "spring-green";

const allColors: ColorKey[] = [
  "black",
  "white",
  "blue",
  "red",
  "purple",
  "cyan",
  "green",
  "orange",
  "yellow",
  "magenta",
  "violet",
  "chartreuse",
  "dodger-blue",
  "spring-green",
];

const seedData = [
  ...allColors.map((color) => ({
    category: "base",
    name: `Base 60% - ${color.charAt(0).toUpperCase() + color.slice(1)}`,
    price: color === "black" || color === "white" ? 2500 : 2700,
    stock: color === "black" || color === "white" ? 10 : 8,
    image: optimizeUrl(cloudinaryUrls.base[color] || ""),
  })),
  { category: "switch", name: "Alpacas (Linear)", price: 1200, stock: 20, image: optimizeUrl(cloudinaryUrls.switch.alpacas) },
  { category: "switch", name: "Cherry MX Blacks", price: 900, stock: 25, image: optimizeUrl(cloudinaryUrls.switch["cherry-mx-blacks"]) },
  { category: "switch", name: "Cherry MX Blues", price: 900, stock: 25, image: optimizeUrl(cloudinaryUrls.switch["cherry-mx-blues"]) },
  { category: "switch", name: "Cherry MX Browns", price: 900, stock: 25, image: optimizeUrl(cloudinaryUrls.switch["cherry-mx-browns"]) },
  { category: "switch", name: "Gateron Black Inks", price: 1100, stock: 15, image: optimizeUrl(cloudinaryUrls.switch["gateron-black-inks"]) },
  { category: "switch", name: "Gateron Red Inks", price: 1100, stock: 15, image: optimizeUrl(cloudinaryUrls.switch["gateron-red-inks"]) },
  { category: "switch", name: "Holy Pandas (Tactile)", price: 1500, stock: 10, image: optimizeUrl(cloudinaryUrls.switch["holy-pandas"]) },
  { category: "switch", name: "NovelKeys Creams", price: 1300, stock: 12, image: optimizeUrl(cloudinaryUrls.switch["novelkeys-creams"]) },
  { category: "switch", name: "Turquoise Tealios", price: 1400, stock: 10, image: optimizeUrl(cloudinaryUrls.switch["turquoise-tealios"]) },
  ...allColors.map((color) => ({
    category: "keycapBase",
    name: `Keycap Base - ${color.charAt(0).toUpperCase() + color.slice(1)}`,
    price: color === "black" || color === "white" ? 1200 : 1400,
    stock: color === "black" || color === "white" ? 15 : 10,
    image: optimizeUrl(cloudinaryUrls.keycapBase[color] || ""),
  })),
  ...allColors.map((color) => ({
    category: "wire",
    name: `Wire - ${color.charAt(0).toUpperCase() + color.slice(1)}`,
    price: color === "black" || color === "white" ? 350 : 400,
    stock: color === "black" || color === "white" ? 25 : 20,
    image: optimizeUrl(cloudinaryUrls.wire[color] || ""),
  })),
];

export async function POST() {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: "Seed route is disabled in production" },
        { status: 403 }
      );
    }

    await dbConnect();
    await CustomPart.deleteMany({});

    const parts = await CustomPart.insertMany(
      seedData.map((item) => ({ ...item, isActive: true }))
    );

    return NextResponse.json({
      success: true,
      message: `Seeded ${parts.length} custom parts with Cloudinary images`,
      data: {
        total: parts.length,
        base: parts.filter((p) => p.category === "base").length,
        switch: parts.filter((p) => p.category === "switch").length,
        keycapBase: parts.filter((p) => p.category === "keycapBase").length,
        keycapAdd1: parts.filter((p) => p.category === "keycapAdd1").length,
        keycapAdd2: parts.filter((p) => p.category === "keycapAdd2").length,
        wire: parts.filter((p) => p.category === "wire").length,
      },
    });
  } catch (error) {
    console.error("Error seeding custom parts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed custom parts" },
      { status: 500 }
    );
  }
}
