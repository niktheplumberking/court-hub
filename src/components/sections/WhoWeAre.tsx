"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState, type CSSProperties } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const BG = "#060810"; // matches Shop + bridge — zero seam

const WhoWeAreScene = dynamic(
  () => import("./WhoWeAreScene").then((m) => m.WhoWeAreScene),
  { ssr: false, loading: () => null },
);

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;
const HEX  = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'><path d='M28 1 L54 15.5 L54 44.5 L28 59 L2 44.5 L2 15.5 Z' fill='none' stroke='rgba(90,130,180,0.13)' stroke-width='0.65'/><path d='M28 41 L54 55.5 L54 84.5 L28 99 L2 84.5 L2 55.5 Z' fill='none' stroke='rgba(90,130,180,0.10)' stroke-width='0.65'/></svg>")`;
const E = [0.16, 1, 0.3, 1] as const;

function fade(delay = 0, y = 28) {
  return {
    hidden:  { opacity: 0, y },
    visible: { opacity: 1, y: 0, transition: { duration: 0.85, delay, ease: E } },
  };
}

function SignalBar() {
  return (
    <div className="flex items-center gap-[3px]" aria-hidden>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="h-[10px] w-[5px] rounded-[1px]"
          style={{
            background: i < 4 ? "linear-gradient(180deg,#d8ff72 0%,#C8FF3D 100%)" : "rgba(255,255,255,0.11)",
            boxShadow: i < 4 ? "0 0 5px rgba(200,255,61,0.42)" : undefined,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}

export function WhoWeAre() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Single reliable trigger — fires when the section is 10% in view
  const inView = useInView(sectionRef, { once: true, amount: 0.1 });
  const animate = inView ? "visible" : "hidden";

  // Parallax
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const rawHoloY = useTransform(scrollYProgress, [0, 1], ["4%", "-6%"]);
  const rawCopyY = useTransform(scrollYProgress, [0, 1], ["-2%", "4%"]);
  const holoY = useSpring(rawHoloY, { stiffness: 55, damping: 20 });
  const copyY = useSpring(rawCopyY, { stiffness: 55, damping: 20 });

  // HUD scroll-scrub opacity
  const hudOpacity = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);

  // Mouse glow
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    setMouse({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      id="who-we-are"
      onMouseMove={onMouseMove}
      className="relative z-[30] h-full min-h-dvh w-full overflow-hidden text-white"
      style={{ backgroundColor: BG }}
    >
      {/* Hex bg */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: BG,
          backgroundImage: [HEX,
            "radial-gradient(ellipse 65% 55% at 72% 52%, rgba(15,35,68,0.5) 0%, transparent 68%)",
            "radial-gradient(ellipse 50% 45% at 20% 50%, rgba(6,14,34,0.6) 0%, transparent 72%)",
            "radial-gradient(ellipse 95% 88% at 50% 50%, transparent 30%, rgba(6,8,16,0.88) 100%)",
          ].join(","),
          backgroundSize: "56px 100px, 100% 100%, 100% 100%, 100% 100%",
        }}
      />

      {/* Mouse glow */}
      {!reduced && (
        <div aria-hidden className="pointer-events-none absolute inset-0 transition-[background] duration-500"
          style={{ background: `radial-gradient(ellipse 38% 38% at ${mouse.x}% ${mouse.y}%, rgba(200,255,61,0.04) 0%, transparent 70%)` }}
        />
      )}

      {/* Grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.048] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }} />

      {/* HUD */}
      <motion.div aria-hidden style={{ opacity: reduced ? 1 : hudOpacity }}
        className="pointer-events-none absolute inset-0 z-20"
      >
        <div className="absolute left-7 top-7 flex items-center gap-3 sm:left-11 sm:top-11">
          <div className="flex items-center gap-[7px] font-mono text-[9px] tracking-[0.2em] uppercase text-white/50">
            <span className="relative flex h-[7px] w-[7px]">
              <span className="absolute inset-0 rounded-full bg-fire" style={{ animation: "recRing 1.4s cubic-bezier(0,0,0.2,1) infinite", opacity: 0.6 }} />
              <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-fire" style={{ animation: "recPulse 1.4s ease-in-out infinite" }} />
            </span>
            REC [TIME]
          </div>
          <SignalBar />
        </div>
        <p className="absolute right-7 top-7 font-mono text-[9px] tracking-[0.16em] uppercase text-white/18 sm:right-11 sm:top-11">
          CH 58 · ID 5400 · FRED [A]
        </p>
        <p className="absolute bottom-7 left-7 font-mono text-[9px] tracking-[0.16em] uppercase text-white/22 sm:bottom-11 sm:left-11">
          LIVE · COURT HUB
        </p>
        <div className="absolute bottom-7 right-7 flex items-center gap-[7px] sm:bottom-11 sm:right-11">
          <span className="h-[7px] w-[7px] bg-lime"
            style={{ animation: "livePulse 2s ease-in-out infinite", boxShadow: "0 0 6px #C8FF3D" }} />
          <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-lime/55">LIVE FEED</span>
        </div>
      </motion.div>

      {/* Two-column layout */}
      <div className="relative z-10 grid h-full lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">

        {/* Left: copy */}
        <motion.div style={{ y: reduced ? 0 : copyY }}
          className="flex items-center px-12 py-16 sm:px-16 lg:px-20 xl:px-24"
        >
          <div>
            {/* Eyebrow */}
            <motion.p
              variants={fade(0)} initial="hidden" animate={animate}
              className="mb-7 font-mono text-[10px] tracking-[0.32em] uppercase text-white/50"
            >
              /// The home of premium padel ///
            </motion.p>

            {/* Headline */}
            <h2 className="font-display text-[clamp(3.2rem,7.8vw,6.4rem)] leading-[0.9] tracking-[-0.02em]">
              <motion.span variants={fade(0.1)} initial="hidden" animate={animate} className="block">
                The home of
              </motion.span>
              <motion.span variants={fade(0.18)} initial="hidden" animate={animate} className="block">
                premium padel
              </motion.span>
              <motion.span variants={fade(0.26)} initial="hidden" animate={animate} className="block text-lime">
                in the UAE.
              </motion.span>
            </h2>

            {/* Body */}
            <motion.p
              variants={fade(0.4, 20)} initial="hidden" animate={animate}
              className="mt-9 max-w-[30rem] text-[15px] leading-[1.78] text-white/55 sm:text-[16px]"
            >
              From racket to court to championship moment — Court Hub Group powers
              every part of the game. We stock what the pros play with, build the
              surfaces they win on, and stage the tournaments where careers are made.
            </motion.p>
          </div>
        </motion.div>

        {/* Right: hologram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.88 }}
          transition={{ duration: 1.5, ease: E, delay: 0.3 }}
          style={{ y: reduced ? 0 : holoY }}
          className="relative h-[46vh] min-h-[300px] lg:h-full"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 55% 48% at 50% 60%, rgba(200,255,61,0.07) 0%, transparent 70%)" }}
          />
          <WhoWeAreScene />
        </motion.div>
      </div>

      {/* Bottom seam — matches bridge & Shop bg exactly */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[25] h-32"
        style={{ background: `linear-gradient(to bottom, transparent 0%, ${BG} 100%)` }}
      />
    </section>
  );
}
