export type Brand = "HEAD" | "Wilson";
export type Category = "HEAD" | "Wilson" | "Pre-Owned";

export type Product = {
  id: string;
  brand: Brand;
  name: string;
  tagline: string;
  priceAed: number;
  isPreOwned: boolean;
  // Visual treatment: gradient blob colors expressed as full Tailwind classes.
  gradient: string;
  accent: "lime" | "court" | "padel" | "fire";
};

export const products: Product[] = [
  {
    id: "head-speed-motion",
    brand: "HEAD",
    name: "Speed Motion 2024",
    tagline: "Power on the smash, precision on the bandeja.",
    priceAed: 1049,
    isPreOwned: false,
    gradient: "from-court via-ink to-ink",
    accent: "court",
  },
  {
    id: "head-delta-pro",
    brand: "HEAD",
    name: "Delta Pro 2024",
    tagline: "The diamond shape weapon used by Arturo Coello.",
    priceAed: 1249,
    isPreOwned: false,
    gradient: "from-court/60 via-ink to-ink",
    accent: "court",
  },
  {
    id: "wilson-bela-pro-v2",
    brand: "Wilson",
    name: "Bela Pro v2",
    tagline: "Round head control for the GOAT-tier game.",
    priceAed: 1099,
    isPreOwned: false,
    gradient: "from-padel/70 via-ink to-ink",
    accent: "padel",
  },
  {
    id: "wilson-carbon-force-lt",
    brand: "Wilson",
    name: "Carbon Force LT",
    tagline: "Lightweight teardrop balance for all-court players.",
    priceAed: 899,
    isPreOwned: false,
    gradient: "from-lime/40 via-ink to-ink",
    accent: "lime",
  },
  {
    id: "head-graphene-touch",
    brand: "HEAD",
    name: "Graphene Touch (Pre-Owned)",
    tagline: "Certified condition. Tested by our pros. Half the price.",
    priceAed: 549,
    isPreOwned: true,
    gradient: "from-fire/40 via-ink to-ink",
    accent: "fire",
  },
  {
    id: "wilson-bela-lt-camo",
    brand: "Wilson",
    name: "Bela LT Camo (Pre-Owned)",
    tagline: "Limited camo edition. Lightly used. Court-ready.",
    priceAed: 469,
    isPreOwned: true,
    gradient: "from-padel/40 via-ink to-ink",
    accent: "padel",
  },
];

export const categories: Category[] = ["HEAD", "Wilson", "Pre-Owned"];

export function filterProducts(products: Product[], category: Category): Product[] {
  if (category === "Pre-Owned") return products.filter((p) => p.isPreOwned);
  return products.filter((p) => p.brand === category && !p.isPreOwned);
}

export function formatAed(amount: number): string {
  return `AED ${amount.toLocaleString("en-AE")}`;
}
