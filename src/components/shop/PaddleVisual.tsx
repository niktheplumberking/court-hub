"use client";

import type { Product } from "@/lib/products";

const accentHex: Record<Product["accent"], string> = {
  lime: "#C8FF3D",
  court: "#1E5AE8",
  padel: "#07C66A",
  fire: "#E84525",
};

type Props = { product: Product };

/**
 * PaddleVisual — premium SVG paddle silhouette.
 *
 * Renders a teardrop face with the brand wordmark and a model sub-line,
 * a tapered throat, a wrapped grip, and a brand-accented butt cap. A
 * brand-tinted radial bloom sits behind the head so each spotlight swap
 * reads as a cinematic lighting change.
 *
 * No animation here — the parent wraps this in AnimatePresence so the
 * wipe choreography stays in one place alongside the meta column.
 */
export function PaddleVisual({ product }: Props) {
  const accent = accentHex[product.accent];
  const brand = product.brand.toUpperCase();
  // First two tokens of the product name, with "(Pre-Owned)" stripped —
  // mirrors a real paddle face print without inventing copy.
  const model = product.name
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(" ")
    .slice(0, 2)
    .join(" ")
    .toUpperCase();

  const ids = `pv-${product.id}`;

  return (
    <svg
      viewBox="0 0 320 540"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <radialGradient id={`${ids}-glow`} cx="50%" cy="33%" r="58%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="55%" stopColor={accent} stopOpacity="0.12" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${ids}-face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1c20" />
          <stop offset="100%" stopColor="#08090c" />
        </linearGradient>
        <linearGradient id={`${ids}-grip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1c20" />
          <stop offset="100%" stopColor="#040508" />
        </linearGradient>
      </defs>

      {/* Brand-tinted bloom behind the head */}
      <ellipse cx="160" cy="178" rx="190" ry="235" fill={`url(#${ids}-glow)`} />

      {/* Face — teardrop */}
      <path
        d="M160 30 C 246 30, 290 84, 290 184 C 290 274, 246 330, 208 348 L 112 348 C 74 330, 30 274, 30 184 C 30 84, 74 30, 160 30 Z"
        fill={`url(#${ids}-face)`}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />

      {/* Inner accent ring */}
      <path
        d="M160 48 C 234 48, 274 96, 274 184 C 274 260, 236 308, 202 322 L 118 322 C 84 308, 46 260, 46 184 C 46 96, 86 48, 160 48 Z"
        fill="none"
        stroke={accent}
        strokeOpacity="0.22"
        strokeWidth="1"
      />

      {/* Brand wordmark */}
      <text
        x="160"
        y="172"
        textAnchor="middle"
        fontFamily="Archivo Black, system-ui, sans-serif"
        fontSize="34"
        fontWeight="900"
        fill="white"
        fillOpacity="0.92"
        letterSpacing="3"
      >
        {brand}
      </text>

      {/* Model sub-line */}
      <text
        x="160"
        y="204"
        textAnchor="middle"
        fontFamily="ui-monospace, SFMono-Regular, monospace"
        fontSize="9"
        fill={accent}
        fillOpacity="0.8"
        letterSpacing="3.5"
      >
        /// {model}
      </text>

      {/* Throat */}
      <path
        d="M138 348 L 182 348 L 178 378 L 142 378 Z"
        fill="#0f1115"
        stroke="rgba(255,255,255,0.04)"
      />

      {/* Handle */}
      <rect
        x="138"
        y="378"
        width="44"
        height="128"
        rx="11"
        fill={`url(#${ids}-grip)`}
        stroke="rgba(255,255,255,0.05)"
      />

      {/* Grip wrap diagonal lines */}
      <g opacity="0.3" stroke="rgba(255,255,255,0.6)" strokeWidth="0.9">
        {Array.from({ length: 11 }).map((_, i) => (
          <line
            key={i}
            x1="138"
            y1={388 + i * 11}
            x2="182"
            y2={398 + i * 11}
          />
        ))}
      </g>

      {/* Butt cap with accent line */}
      <rect x="135" y="502" width="50" height="9" rx="2" fill="#08090c" />
      <rect x="135" y="502" width="50" height="2" fill={accent} fillOpacity="0.55" />
    </svg>
  );
}
