"use client";

import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { formatAed } from "@/lib/products";

const accentText = {
  lime: "text-lime",
  court: "text-court",
  padel: "text-padel",
  fire: "text-fire",
} as const;

const accentRing = {
  lime: "ring-lime/40",
  court: "ring-court/40",
  padel: "ring-padel/40",
  fire: "ring-fire/40",
} as const;

type Props = { product: Product };

export function ProductCard({ product }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br ring-1 ring-inset ${product.gradient} ${accentRing[product.accent]}`}
    >
      <div className="relative flex aspect-[4/5] flex-1 items-end p-7 sm:p-8">
        {/* Decorative paddle silhouette */}
        <svg
          aria-hidden
          viewBox="0 0 200 280"
          className="pointer-events-none absolute -right-6 -top-6 h-[110%] w-auto opacity-15 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-20"
        >
          <ellipse cx="100" cy="110" rx="78" ry="98" fill="currentColor" />
          <rect x="92" y="200" width="16" height="68" rx="8" fill="currentColor" />
        </svg>

        <div className="relative flex flex-col gap-2">
          <span
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${accentText[product.accent]}`}
          >
            {product.brand}
            {product.isPreOwned ? " · Pre-Owned" : ""}
          </span>
          <h3 className="font-display text-3xl leading-tight sm:text-4xl">
            {product.name}
          </h3>
          <p className="mt-1 max-w-xs text-sm text-white/60">
            {product.tagline}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 bg-black/30 px-7 py-5 backdrop-blur-sm sm:px-8">
        <span className="text-lg font-semibold text-white">
          {formatAed(product.priceAed)}
        </span>
        <button
          type="button"
          aria-label={`Add ${product.name} to cart`}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-sm font-semibold text-ink transition-all hover:bg-lime/90 active:scale-[0.97] min-h-[44px]"
        >
          Add
          <svg
            aria-hidden
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.article>
  );
}
