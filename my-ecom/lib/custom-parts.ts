export type CategoryType =
  | "base"
  | "switch"
  | "keycapBase"
  | "keycapAdd1"
  | "keycapAdd2"
  | "wire";

export interface CustomPartRecord {
  _id: string;
  category: CategoryType;
  name: string;
  price: number;
  image: string;
  stock: number;
  isActive: boolean;
}

export const categoryOrder: CategoryType[] = [
  "base",
  "switch",
  "keycapBase",
  "keycapAdd1",
  "keycapAdd2",
  "wire",
];

export const categoryLabels: Record<CategoryType, string> = {
  base: "Base",
  switch: "Switch",
  keycapBase: "Keycap Base",
  keycapAdd1: "Keycap Add One",
  keycapAdd2: "Keycap Add Two",
  wire: "Wire",
};

export const categoryIcons: Record<CategoryType, string> = {
  base: "🖥️",
  switch: "🔘",
  keycapBase: "⌨️",
  keycapAdd1: "🔠",
  keycapAdd2: "🔣",
  wire: "🔌",
};

export const customPartSelect = "_id category name price image stock isActive";

export function optimizeCloudinaryImage(url: string, width: number) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  const transformedUrl = url.replace(
    /\/upload\/(?:[^/]+\/)?(?=v\d+\/)/,
    `/upload/f_auto,q_auto,w_${width}/`
  );

  if (transformedUrl !== url) {
    return transformedUrl;
  }

  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}

export function isCloudinaryUrl(url: string) {
  return url.includes("res.cloudinary.com");
}
