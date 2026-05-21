"use client";

import { motion } from "framer-motion";
import type { Category } from "@/lib/products";

type Props = {
  categories: readonly Category[];
  active: Category;
  onChange: (c: Category) => void;
};

export function FilterTabs({ categories, active, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Product brand filter"
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm"
    >
      {categories.map((c) => {
        const isActive = c === active;
        return (
          <button
            key={c}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(c)}
            className="relative inline-flex h-11 items-center px-5 text-sm font-semibold transition-colors min-h-[44px]"
          >
            {isActive && (
              <motion.span
                layoutId="filter-pill"
                className="absolute inset-0 rounded-full bg-lime"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span
              className={`relative z-10 ${isActive ? "text-ink" : "text-white/70 hover:text-white"}`}
            >
              {c}
            </span>
          </button>
        );
      })}
    </div>
  );
}
