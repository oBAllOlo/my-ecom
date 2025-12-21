import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CustomPart from "@/models/CustomPart";

// Seed data from existing images
const seedData = [
  // Base - 14 colors
  { category: "base", name: "Base 60% - Black", price: 2500, stock: 10, image: "/images/products/60_percent/base_60/base_60_black.png" },
  { category: "base", name: "Base 60% - White", price: 2500, stock: 10, image: "/images/products/60_percent/base_60/base_60_white.png" },
  { category: "base", name: "Base 60% - Blue", price: 2700, stock: 8, image: "/images/products/60_percent/base_60/base_60_blue.png" },
  { category: "base", name: "Base 60% - Red", price: 2700, stock: 8, image: "/images/products/60_percent/base_60/base_60_red.png" },
  { category: "base", name: "Base 60% - Purple", price: 2700, stock: 8, image: "/images/products/60_percent/base_60/base_60_purple.png" },
  { category: "base", name: "Base 60% - Cyan", price: 2700, stock: 8, image: "/images/products/60_percent/base_60/base_60_cyan.png" },
  { category: "base", name: "Base 60% - Green", price: 2700, stock: 8, image: "/images/products/60_percent/base_60/base_60_green.png" },
  { category: "base", name: "Base 60% - Orange", price: 2700, stock: 8, image: "/images/products/60_percent/base_60/base_60_orange.png" },
  { category: "base", name: "Base 60% - Yellow", price: 2700, stock: 8, image: "/images/products/60_percent/base_60/base_60_yellow.png" },
  { category: "base", name: "Base 60% - Magenta", price: 2700, stock: 8, image: "/images/products/60_percent/base_60/base_60_magenta.png" },
  { category: "base", name: "Base 60% - Violet", price: 2700, stock: 8, image: "/images/products/60_percent/base_60/base_60_violet.png" },
  { category: "base", name: "Base 60% - Chartreuse", price: 2700, stock: 8, image: "/images/products/60_percent/base_60/base_60_chartreuse.png" },
  { category: "base", name: "Base 60% - Dodger Blue", price: 2700, stock: 8, image: "/images/products/60_percent/base_60/base_60_dodger-blue.png" },
  { category: "base", name: "Base 60% - Spring Green", price: 2700, stock: 8, image: "/images/products/60_percent/base_60/base_60_spring-green.png" },

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

  // Keycap Base - 10 colors
  { category: "keycapBase", name: "Keycap Base - Black", price: 1200, stock: 15, image: "/images/products/60_percent/keycap_60/keycap_60_base/keycap_60_base_black.png" },
  { category: "keycapBase", name: "Keycap Base - White", price: 1200, stock: 15, image: "/images/products/60_percent/keycap_60/keycap_60_base/keycap_60_base_white.png" },
  { category: "keycapBase", name: "Keycap Base - Blue", price: 1400, stock: 10, image: "/images/products/60_percent/keycap_60/keycap_60_base/keycap_60_base_blue.png" },
  { category: "keycapBase", name: "Keycap Base - Red", price: 1400, stock: 10, image: "/images/products/60_percent/keycap_60/keycap_60_base/keycap_60_base_red.png" },
  { category: "keycapBase", name: "Keycap Base - Purple", price: 1400, stock: 10, image: "/images/products/60_percent/keycap_60/keycap_60_base/keycap_60_base_purple.png" },
  { category: "keycapBase", name: "Keycap Base - Cyan", price: 1400, stock: 10, image: "/images/products/60_percent/keycap_60/keycap_60_base/keycap_60_base_cyan.png" },
  { category: "keycapBase", name: "Keycap Base - Green", price: 1400, stock: 10, image: "/images/products/60_percent/keycap_60/keycap_60_base/keycap_60_base_green.png" },
  { category: "keycapBase", name: "Keycap Base - Orange", price: 1400, stock: 10, image: "/images/products/60_percent/keycap_60/keycap_60_base/keycap_60_base_orange.png" },
  { category: "keycapBase", name: "Keycap Base - Yellow", price: 1400, stock: 10, image: "/images/products/60_percent/keycap_60/keycap_60_base/keycap_60_base_yellow.png" },
  { category: "keycapBase", name: "Keycap Base - Magenta", price: 1400, stock: 10, image: "/images/products/60_percent/keycap_60/keycap_60_base/keycap_60_base_magenta.png" },

  // Keycap Add 1
  { category: "keycapAdd1", name: "ไม่เพิ่ม", price: 0, stock: 999, image: "" },
  { category: "keycapAdd1", name: "Keycap Add 1 - Black", price: 450, stock: 20, image: "/images/products/60_percent/keycap_60/keycap_60_add_1/keycap_60_add_1_black.png" },
  { category: "keycapAdd1", name: "Keycap Add 1 - White", price: 450, stock: 20, image: "/images/products/60_percent/keycap_60/keycap_60_add_1/keycap_60_add_1_white.png" },
  { category: "keycapAdd1", name: "Keycap Add 1 - Blue", price: 500, stock: 15, image: "/images/products/60_percent/keycap_60/keycap_60_add_1/keycap_60_add_1_blue.png" },
  { category: "keycapAdd1", name: "Keycap Add 1 - Red", price: 500, stock: 15, image: "/images/products/60_percent/keycap_60/keycap_60_add_1/keycap_60_add_1_red.png" },
  { category: "keycapAdd1", name: "Keycap Add 1 - Purple", price: 500, stock: 15, image: "/images/products/60_percent/keycap_60/keycap_60_add_1/keycap_60_add_1_purple.png" },

  // Keycap Add 2
  { category: "keycapAdd2", name: "ไม่เพิ่ม", price: 0, stock: 999, image: "" },
  { category: "keycapAdd2", name: "Keycap Add 2 - Black", price: 350, stock: 20, image: "/images/products/60_percent/keycap_60/keycap_60_add_2/keycap_60_add_2_black.png" },
  { category: "keycapAdd2", name: "Keycap Add 2 - White", price: 350, stock: 20, image: "/images/products/60_percent/keycap_60/keycap_60_add_2/keycap_60_add_2_white.png" },
  { category: "keycapAdd2", name: "Keycap Add 2 - Blue", price: 400, stock: 15, image: "/images/products/60_percent/keycap_60/keycap_60_add_2/keycap_60_add_2_blue.png" },
  { category: "keycapAdd2", name: "Keycap Add 2 - Red", price: 400, stock: 15, image: "/images/products/60_percent/keycap_60/keycap_60_add_2/keycap_60_add_2_red.png" },

  // Wire - 10 colors
  { category: "wire", name: "Wire - Black", price: 350, stock: 25, image: "/images/products/60_percent/wire_60/wire_60_black.png" },
  { category: "wire", name: "Wire - White", price: 350, stock: 25, image: "/images/products/60_percent/wire_60/wire_60_white.png" },
  { category: "wire", name: "Wire - Blue", price: 400, stock: 20, image: "/images/products/60_percent/wire_60/wire_60_blue.png" },
  { category: "wire", name: "Wire - Red", price: 400, stock: 20, image: "/images/products/60_percent/wire_60/wire_60_red.png" },
  { category: "wire", name: "Wire - Purple", price: 400, stock: 20, image: "/images/products/60_percent/wire_60/wire_60_purple.png" },
  { category: "wire", name: "Wire - Cyan", price: 400, stock: 20, image: "/images/products/60_percent/wire_60/wire_60_cyan.png" },
  { category: "wire", name: "Wire - Green", price: 400, stock: 20, image: "/images/products/60_percent/wire_60/wire_60_green.png" },
  { category: "wire", name: "Wire - Orange", price: 400, stock: 20, image: "/images/products/60_percent/wire_60/wire_60_orange.png" },
  { category: "wire", name: "Wire - Yellow", price: 400, stock: 20, image: "/images/products/60_percent/wire_60/wire_60_yellow.png" },
  { category: "wire", name: "Wire - Magenta", price: 400, stock: 20, image: "/images/products/60_percent/wire_60/wire_60_magenta.png" },
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
      data: parts,
    });
  } catch (error) {
    console.error("Error seeding custom parts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed custom parts" },
      { status: 500 }
    );
  }
}
