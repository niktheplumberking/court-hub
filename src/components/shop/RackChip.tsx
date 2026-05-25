"use client";

import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { formatAed } from "@/lib/products";

const ACCENT_HEX: Record<Product["accent"], string> = {
  lime: "#C8FF3D",
  court: "#1E5AE8",
  padel: "#07C66A",
  fire: "#E84525",
};

type Props = {
  product: Product;
  index: number;
  isActive: boolean;
  onSelect: () => void;
};

/**
 * RackChip — compact horizontal entry in the bottom rack strip.
 *
 * Designed for single-viewport layouts: each chip carries the same data
 * as a full rack row (number, brand pill, model name, price) but in a
 * tight, glanceable footprint. Hover lifts the chip and lights its top
 * edge with the brand accent; the active chip stays lit.
 */
export function RackChip({ product, index, isActive, onSelect }: Props) {
  const accent = ACCENT_HEX[product.accent];

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? "true" : undefined}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={`group relative flex w-44 shrink-0 snap-start flex-col gap-2 overflow-hidden rounded-2xl border bg-white/[0.025] px-4 py-3.5 text-left backdrop-blur-sm transition-colors sm:w-52 ${isActive ? "border-white/40" : "border-white/[0.08] hover:border-white/25"}`}
    >
      {/* Top accent rail — slides in on hover, stays lit when active */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
        style={{
          background: accent,
          boxShadow: `0 0 12px ${accent}66`,
          transform: isActive ? "scaleX(1)" : undefined,
        }}
      />

      {/* Index + brand pip */}
      <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-white/45">
        <span className="tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className="inline-flex items-center gap-1.5"
          style={{ color: isActive ? accent : undefined }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: accent, boxShadow: `0 0 6px ${accent}aa` }}
          />
          {product.brand.toUpperCase()}
        </span>
      </div>

      {/* Model name */}
      <h4
        className={`font-display truncate text-[15px] leading-tight transition-colors sm:text-[16px] ${isActive ? "text-white" : "text-white/85 group-hover:text-white"}`}
      >
        {product.name}
      </h4>

      {/* Price */}
      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="font-mono text-[11px] tabular-nums text-white/55">
          {formatAed(product.priceAed)}
        </span>
        <svg
          aria-hidden
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-all duration-300 ${isActive ? "translate-x-0" : "-translate-x-1 opacity-50 group-hover:translate-x-0 group-hover:opacity-100"}`}
          style={{ color: isActive ? accent : undefined }}
        >
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </div>
    </motion.button>
  );
}
