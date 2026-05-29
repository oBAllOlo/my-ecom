import CustomKeyboardBuilder from "@/app/custom/CustomKeyboardBuilder";
import {
  customPartSelect,
  type CustomPartRecord,
} from "@/lib/custom-parts";
import dbConnect from "@/lib/mongodb";
import CustomPart from "@/models/CustomPart";

// This page reads from MongoDB at render time, so it must be rendered
// per-request (dynamic) instead of being prerendered at build time —
// otherwise `next build` fails when the build machine can't reach the DB.
export const dynamic = "force-dynamic";

async function getCustomParts(): Promise<CustomPartRecord[]> {
  await dbConnect();

  const parts = await CustomPart.find({ isActive: true })
    .select(customPartSelect)
    .sort({ category: 1, name: 1 })
    .lean();

  return parts.map((part) => ({
    _id: String(part._id),
    category: part.category,
    name: part.name,
    price: part.price,
    image: part.image,
    stock: part.stock,
    isActive: part.isActive,
  })) as CustomPartRecord[];
}

export default async function CustomKeyboardPage() {
  const initialParts = await getCustomParts();

  return <CustomKeyboardBuilder initialParts={initialParts} />;
}
