import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CustomPart from "@/models/CustomPart";

// Color list for all parts
const allColors = [
  "black", "white", "blue", "red", "purple", "cyan", "green", "orange", 
  "yellow", "magenta", "violet", "chartreuse", "dodger-blue", "spring-green"
];

// Seed data from existing images
const seedData = [
  // Base - 14 colors
  ...allColors.map((color, i) => ({
    category: "base",
    name: `Base 60% - ${color.charAt(0).toUpperCase() + color.slice(1)}`,
    price: color === "black" || color === "white" ? 2500 : 2700,
    stock: color === "black" || color === "white" ? 10 : 8,
    image: `/images/products/60_percent/base_60/base_60_${color}.png`,
  })),

  // Switch - 9 types
  { category: "switch", name: "Alpacas (Linear)", price: 1200, stock: 20, image: "/images/products/60_percent/switch_60/switch_60_alpacas.png" },
  { category: "switch", name: "Cherry MX Blacks", price: 900, stock: 25, image: "/images/products/60_percent/switch_60/switch_60_cherry-mx-blacks.png" },
  { category: "switch", name: "Cherry MX Blues", price: 900, stock: 25, image: "/images/products/60_percent/switch_60/switch_60_cherry-mx_blues.png" },
  { category: "switch", name: "Cherry MX Browns", price: 900, stock: 25, image: "/images/products/60_percent/switch_60/switch_60_cherry-mx_browns.png" },
  { category: "switch", name: "Gateron Black Inks", price: 1100, stock: 15, image: "/images/products/60_percent/switch_60/switch_60_gateron-black-inks.png" },
  { category: "switch", name: "Gateron Red Inks", price: 1100, stock: 15, image: "/images/products/60_percent/switch_60/switch_60_gateron-red-inks.png" },
  { category: "switch", name: "Holy Pandas (Tactile)", price: 1500, stock: 10, image: "/images/products/60_percent/switch_60/switch_60_holy-pandas.png" },
  { category: "switch", name: "NovelKeys Creams", price: 1300, stock: 12, image: "/images/products/60_percent/switch_60/switch_60_novelkeys-creams.png" },
  { category: "switch", name: "Turquoise Tealios", price: 1400, stock: 10, image: "/images/products/60_percent/switch_60/switch_60_turquoise-tealios.png" },

  // Keycap Base - 14 colors
  ...allColors.map((color) => ({
    category: "keycapBase",
    name: `Keycap Base - ${color.charAt(0).toUpperCase() + color.slice(1)}`,
    price: color === "black" || color === "white" ? 1200 : 1400,
    stock: color === "black" || color === "white" ? 15 : 10,
    image: `/images/products/60_percent/keycap_60/keycap_60_base/keycap_60_base_${color}.png`,
  })),

  // Keycap Add 1 - 14 colors + ไม่เพิ่ม
  { category: "keycapAdd1", name: "ไม่เพิ่ม", price: 0, stock: 999, image: "" },
  ...allColors.map((color) => ({
    category: "keycapAdd1",
    name: `Keycap Add 1 - ${color.charAt(0).toUpperCase() + color.slice(1)}`,
    price: color === "black" || color === "white" ? 450 : 500,
    stock: color === "black" || color === "white" ? 20 : 15,
    image: `/images/products/60_percent/keycap_60/keycap_60_add_1/keycap_60_add_1_${color}.png`,
  })),

  // Keycap Add 2 - 14 colors + ไม่เพิ่ม
  { category: "keycapAdd2", name: "ไม่เพิ่ม", price: 0, stock: 999, image: "" },
  ...allColors.map((color) => ({
    category: "keycapAdd2",
    name: `Keycap Add 2 - ${color.charAt(0).toUpperCase() + color.slice(1)}`,
    price: color === "black" || color === "white" ? 350 : 400,
    stock: color === "black" || color === "white" ? 20 : 15,
    image: `/images/products/60_percent/keycap_60/keycap_60_add_2/keycap_60_add_2_${color}.png`,
  })),

  // Wire - 14 colors
  ...allColors.map((color) => ({
    category: "wire",
    name: `Wire - ${color.charAt(0).toUpperCase() + color.slice(1)}`,
    price: color === "black" || color === "white" ? 350 : 400,
    stock: color === "black" || color === "white" ? 25 : 20,
    image: `/images/products/60_percent/wire_60/wire_60_${color}.png`,
  })),
];

// POST seed custom parts
export async function POST() {
  try {
    await dbConnect();

    // Clear existing data
    await CustomPart.deleteMany({});

    // Insert seed data
    const parts = await CustomPart.insertMany(
      seedData.map(item => ({ ...item, isActive: true }))
    );

    return NextResponse.json({
      success: true,
      message: `Seeded ${parts.length} custom parts`,
      data: {
        total: parts.length,
        base: parts.filter(p => p.category === 'base').length,
        switch: parts.filter(p => p.category === 'switch').length,
        keycapBase: parts.filter(p => p.category === 'keycapBase').length,
        keycapAdd1: parts.filter(p => p.category === 'keycapAdd1').length,
        keycapAdd2: parts.filter(p => p.category === 'keycapAdd2').length,
        wire: parts.filter(p => p.category === 'wire').length,
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
