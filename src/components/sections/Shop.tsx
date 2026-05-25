"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SectionHeadline } from "@/components/ui/SectionHeadline";
import { FilterTabs } from "@/components/shop/FilterTabs";
import { RackChip } from "@/components/shop/RackChip";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  categories,
  filterProducts,
  products,
  type Category,
  type Product,
} from "@/lib/products";

const RackShowcase3D = dynamic(
  () =>
    import("@/components/shop/RackShowcase3D").then((m) => m.RackShowcase3D),
  { ssr: false, loading: () => <Showcase3DFallback /> },
);

/* ── design tokens ────────────────────────────────────────────────────── */

const BRAND_TINT: Record<Category, string> = {
  HEAD: "#1E5AE8",
  Wilson: "#07C66A",
  "Pre-Owned": "#E84525",
};

const ACCENT_HEX: Record<Product["accent"], string> = {
  lime: "#C8FF3D",
  court: "#1E5AE8",
  padel: "#07C66A",
  fire: "#E84525",
};

const accentMap = {
  lime: { text: "text-lime", bg: "bg-lime", border: "border-lime/35" },
  court: { text: "text-court", bg: "bg-court", border: "border-court/35" },
  padel: { text: "text-padel", bg: "bg-padel", border: "border-padel/35" },
  fire: { text: "text-fire", bg: "bg-fire", border: "border-fire/35" },
} as const;

const SWAP_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Matching WhoWeAre's hex-mesh SVG exactly
const HEX = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'><path d='M28 1 L54 15.5 L54 44.5 L28 59 L2 44.5 L2 15.5 Z' fill='none' stroke='rgba(90,130,180,0.14)' stroke-width='0.65'/><path d='M28 41 L54 55.5 L54 84.5 L28 99 L2 84.5 L2 55.5 Z' fill='none' stroke='rgba(90,130,180,0.11)' stroke-width='0.65'/></svg>")`;
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

/* ── Shop section ─────────────────────────────────────────────────────── */

export function Shop() {
  const [active, setActive] = useState<Category>("HEAD");
  const visible = useMemo(() => filterProducts(products, active), [active]);
  const [index, setIndex] = useState(0);

  const safeIndex = Math.min(index, Math.max(visible.length - 1, 0));
  const featured: Product | undefined = visible[safeIndex];

  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReduced || !sectionRef.current) return;

      gsap.set("[data-shop-header]", { opacity: 0, y: 16 });
      gsap.set("[data-shop-stage]", { opacity: 0, scale: 0.97 });
      gsap.set("[data-shop-chip]", { opacity: 0, y: 14 });

      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 78%",
        once: true,
        onEnter: () => {
          gsap.to("[data-shop-header]", {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "expo.out",
            stagger: 0.1,
          });
          gsap.to("[data-shop-stage]", {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "expo.out",
            delay: 0.1,
          });
          gsap.to("[data-shop-chip]", {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "expo.out",
            stagger: 0.07,
            delay: 0.3,
          });
        },
      });

      return () => trigger.kill();
    },
    { dependencies: [prefersReduced] },
  );

  const handleCategory = (c: Category) => {
    setActive(c);
    setIndex(0);
  };

  const handleNav = (dir: 1 | -1) => {
    if (!visible.length) return;
    setIndex((i) => {
      const cur = Math.min(i, visible.length - 1);
      return (cur + dir + visible.length) % visible.length;
    });
  };

  return (
    <section
      ref={sectionRef}
      id="shop"
      className="relative flex h-full min-h-dvh flex-col overflow-hidden py-20 sm:py-24 lg:py-20"
      style={{ backgroundColor: "#060810" }}
    >
      {/* Background — same visual language as WhoWeAre */}
      <ShopBackground />

      <Container className="relative z-10 flex flex-1 flex-col">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div data-shop-header className="max-w-2xl">
            <SectionLabel accent="lime">The Rack</SectionLabel>
            <SectionHeadline
              as="h2"
              className="font-display mt-4 text-[10vw] leading-[0.94] tracking-tight sm:text-[6vw] lg:mt-5 lg:text-[3.7vw]"
            >
              The paddles{" "}
              <span className="text-lime">the pros play with.</span>
            </SectionHeadline>
          </div>

          <div data-shop-header className="flex flex-col items-start gap-3 lg:items-end">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30">
              /// Pick your weapon ///
            </p>
            <FilterTabs
              categories={categories}
              active={active}
              onChange={handleCategory}
            />
          </div>
        </div>

        {/* ── Stage + meta ─────────────────────────────────────────────── */}
        <div className="mt-8 grid flex-1 grid-cols-1 items-stretch gap-6 lg:mt-10 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <SpotlightStage activeBrand={active} />

          <div className="relative flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {featured ? (
                <motion.div
                  key={`${featured.id}-meta`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.5, ease: SWAP_EASE }}
                >
                  <ProductMeta
                    product={featured}
                    index={safeIndex}
                    total={visible.length}
                    onPrev={() => handleNav(-1)}
                    onNext={() => handleNav(1)}
                  />
                </motion.div>
              ) : (
                <p className="text-center text-white/40">
                  Nothing on the rack yet — check back soon.
                </p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Rack strip ───────────────────────────────────────────────── */}
        {visible.length > 0 && (
          <div className="mt-8 lg:mt-10">
            <div className="mb-3 flex items-end justify-between gap-4">
              <SectionLabel accent="white">{`All ${active} drops`}</SectionLabel>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
                {visible.length} {visible.length === 1 ? "model" : "models"}
              </p>
            </div>
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {visible.map((p, i) => (
                <div data-shop-chip key={p.id}>
                  <RackChip
                    product={p}
                    index={i}
                    isActive={i === safeIndex}
                    onSelect={() => setIndex(i)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* Edge fade into next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-24"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, #060810 60%, #060810 100%)",
        }}
      />
    </section>
  );
}

/* ── 3D stage card ────────────────────────────────────────────────────── */

function SpotlightStage({ activeBrand }: { activeBrand: Category }) {
  return (
    <div
      data-shop-stage
      className="relative flex h-[360px] overflow-hidden rounded-2xl border border-white/[0.07] lg:h-auto lg:min-h-[440px]"
      style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
    >
      {/* Brand-colour ambient wash — transitions on brand change */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 65% 60% at 50% 75%, ${BRAND_TINT[activeBrand]}1a 0%, transparent 70%)`,
        }}
      />

      {/* 3D canvas */}
      <div className="absolute inset-0">
        <RackShowcase3D activeBrand={activeBrand} />
      </div>

      {/* Single minimal label — brand name only */}
      <AnimatePresence mode="wait">
        <motion.p
          key={activeBrand}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.4, ease: SWAP_EASE }}
          className="pointer-events-none absolute bottom-4 left-5 font-mono text-[9px] uppercase tracking-[0.3em] text-white/35"
        >
          {activeBrand} · Live 3D
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/* ── 3D loading fallback ──────────────────────────────────────────────── */

function Showcase3DFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-1.5 w-1.5 rounded-full bg-lime opacity-60 animate-pulse" />
    </div>
  );
}

/* ── Product meta column ──────────────────────────────────────────────── */

function ProductMeta({
  product,
  index,
  total,
  onPrev,
  onNext,
}: {
  product: Product;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const accent = accentMap[product.accent];

  return (
    <div className="flex flex-col gap-5">
      {/* Index odometer */}
      <div className="flex items-center gap-3">
        <OdometerNumber value={index + 1} />
        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/35">
          / {String(total).padStart(2, "0")}
        </span>
        <span className="flex-1" />
        <motion.span
          layout
          key={product.accent}
          className={`h-px w-14 ${accent.bg} opacity-80`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.55, ease: SWAP_EASE }}
        />
      </div>

      {/* Brand + condition */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-2 rounded-full border ${accent.border} bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${accent.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${accent.bg}`} />
          {product.brand}
        </span>
        {product.isPreOwned && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
            Pre-Owned · Certified
          </span>
        )}
      </div>

      {/* Model name */}
      <h3 className="font-display text-3xl leading-[1.02] tracking-tight sm:text-4xl lg:text-[2.4vw] lg:leading-[1.05] xl:text-5xl">
        {product.name}
      </h3>

      {/* Tagline — per-word blur reveal */}
      <WordTagline key={`tag-${product.id}`} text={product.tagline} />

      {/* Price + CTA */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4 pt-1">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">
            Price
          </p>
          <p className="mt-0.5 font-display text-3xl tabular-nums text-white sm:text-4xl">
            <CountUpAed value={product.priceAed} />
          </p>
        </div>
        <button
          type="button"
          aria-label={`Add ${product.name} to bag`}
          className="group inline-flex h-12 items-center gap-3 rounded-full bg-lime px-6 text-sm font-semibold uppercase tracking-[0.15em] text-ink transition-all hover:bg-lime/90 active:scale-[0.97] min-h-[44px]"
        >
          Add to bag
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:translate-x-0.5"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Prev / next */}
      {total > 1 && (
        <div className="mt-1 flex flex-wrap items-center gap-3 border-t border-white/[0.08] pt-4">
          <NavButton label="Prev" dir="left" onClick={onPrev} />
          <NavButton label="Next" dir="right" onClick={onNext} />
        </div>
      )}
    </div>
  );
}

/* ── Odometer index — slot-machine slide ──────────────────────────────── */

function OdometerNumber({ value }: { value: number }) {
  const text = String(value).padStart(2, "0");
  return (
    <span className="relative inline-flex h-[1em] items-baseline overflow-hidden font-display text-4xl leading-none tabular-nums text-white sm:text-5xl">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={text}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.42, ease: SWAP_EASE }}
          className="inline-block"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ── WordTagline — staggered blur+y reveal per word ──────────────────── */

function WordTagline({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <p className="max-w-md text-[15px] leading-[1.72] text-white/55">
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, delay: i * 0.038, ease: SWAP_EASE }}
          className="mr-1.5 inline-block"
        >
          {w}
        </motion.span>
      ))}
    </p>
  );
}

/* ── CountUpAed — rAF price tween, no extra deps ─────────────────────── */

function CountUpAed({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const from = prev.current;
    const to = value;
    if (from === to) {
      node.textContent = `AED ${to.toLocaleString("en-AE")}`;
      return;
    }
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 750);
      const eased = 1 - Math.pow(1 - t, 3);
      node.textContent = `AED ${Math.round(from + (to - from) * eased).toLocaleString("en-AE")}`;
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    prev.current = to;
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span ref={ref}>{`AED ${value.toLocaleString("en-AE")}`}</span>;
}

/* ── Nav button ───────────────────────────────────────────────────────── */

function NavButton({
  label,
  dir,
  onClick,
}: {
  label: string;
  dir: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="group inline-flex h-10 min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60 transition-colors hover:border-white/35 hover:text-white"
    >
      {dir === "left" && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5">
          <path d="M19 12H5M11 19l-7-7 7-7" />
        </svg>
      )}
      {label}
      {dir === "right" && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}

/* ── Background — identical visual grammar to WhoWeAre ───────────────── */

function ShopBackground() {
  return (
    <>
      {/* Hex mesh + directional glows (matches WhoWeAre exactly) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: "#060810",
          backgroundImage: [
            HEX,
            "radial-gradient(ellipse 70% 60% at 75% 50%, rgba(18,38,72,0.45) 0%, transparent 68%)",
            "radial-gradient(ellipse 55% 50% at 18% 48%, rgba(8,18,38,0.55) 0%, transparent 72%)",
            "radial-gradient(ellipse 95% 88% at 50% 50%, transparent 34%, rgba(4,6,10,0.88) 100%)",
          ].join(","),
          backgroundSize: "56px 100px, 100% 100%, 100% 100%, 100% 100%",
        }}
      />
      {/* Film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
    </>
  );
}
