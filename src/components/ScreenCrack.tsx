"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * ScreenCrack — click to shatter the broadcast view.
 *
 * The metaphor: the viewer is watching the live Court Hub broadcast
 * THROUGH a screen. Clicking the screen cracks it. The cracks slowly
 * heal back over a few seconds — the broadcast is uninterrupted.
 *
 * Implementation:
 *   - Window-level click listener on the document.
 *   - On every click that ISN'T on an interactive element (button,
 *     link, input, etc.), spawn a CrackBurst at the cursor position.
 *   - Each burst is a fixed-position SVG of 9–12 procedurally
 *     generated jagged radiating paths, plus a brief impact flash.
 *   - Paths draw in over 250 ms (stroke-dashoffset), hold ~1.35 s,
 *     then fade out over ~3.85 s. Total lifecycle ~6.8 s.
 *   - Max 5 active cracks at once; oldest is dropped when a 6th
 *     would spawn.
 *   - Gated: during the PageIntro lifetime (curtain in DOM) clicks
 *     are ignored — the broadcast hasn't started yet.
 *   - Respects prefers-reduced-motion (no-op).
 *
 * The whole overlay is pointer-events: none so it never captures the
 * click — every other interaction on the page is preserved.
 */

const MAX_ACTIVE_CRACKS = 5;
/** Total crack lifecycle — longer heal reads more “premium repair”. */
const CRACK_LIFETIME_MS = 6800;

type Crack = {
  id: number;
  x: number;
  y: number;
  paths: { d: string; len: number; width: number }[];
};

let crackIdCounter = 0;

function generateCrackPaths(cx: number, cy: number): Crack["paths"] {
  const paths: Crack["paths"] = [];
  const numMain = 9 + Math.floor(Math.random() * 4); // 9–12

  for (let i = 0; i < numMain; i++) {
    // Distribute angles evenly around the impact, then jitter so
    // it doesn't look like a perfect star.
    const baseAngle = (i / numMain) * Math.PI * 2;
    const angle = baseAngle + (Math.random() - 0.5) * 0.9;

    const totalLen = 90 + Math.random() * 230; // 90–320 px
    const numSeg = 3 + Math.floor(Math.random() * 3); // 3–5

    let x = cx;
    let y = cy;
    let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    let accumulated = 0;

    for (let j = 0; j < numSeg; j++) {
      const segLen = totalLen / numSeg;
      // Per-segment angle jitter so the crack zigzags like real glass.
      const segAngle = angle + (Math.random() - 0.5) * 0.55;
      x += Math.cos(segAngle) * segLen;
      y += Math.sin(segAngle) * segLen;
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      accumulated += segLen;
    }

    paths.push({
      d,
      len: accumulated,
      width: 1 + Math.random() * 0.8,
    });

    // ~50% chance of a small branch fork off the main crack.
    if (Math.random() > 0.5) {
      const branchT = 0.35 + Math.random() * 0.35;
      const bsx = cx + Math.cos(angle) * (totalLen * branchT);
      const bsy = cy + Math.sin(angle) * (totalLen * branchT);
      const sign = Math.random() > 0.5 ? 1 : -1;
      const branchAngle = angle + sign * (0.45 + Math.random() * 0.55);
      const branchLen = 35 + Math.random() * 85;
      const bex = bsx + Math.cos(branchAngle) * branchLen;
      const bey = bsy + Math.sin(branchAngle) * branchLen;

      paths.push({
        d: `M ${bsx.toFixed(1)} ${bsy.toFixed(1)} L ${bex.toFixed(1)} ${bey.toFixed(1)}`,
        len: branchLen,
        width: 0.6 + Math.random() * 0.4,
      });
    }
  }

  return paths;
}

export function ScreenCrack() {
  const [cracks, setCracks] = useState<Crack[]>([]);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;

    const onClick = (e: MouseEvent) => {
      // Skip while the PageIntro curtain is still up — the broadcast
      // hasn't started yet, so there's nothing to crack.
      if (document.querySelector("[data-intro-curtain]")) return;

      // Preserve native clicks on interactive elements.
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, a, input, textarea, select, label")) {
        return;
      }

      const id = ++crackIdCounter;
      const newCrack: Crack = {
        id,
        x: e.clientX,
        y: e.clientY,
        paths: generateCrackPaths(e.clientX, e.clientY),
      };

      setCracks((prev) => {
        const next = [...prev, newCrack];
        return next.length > MAX_ACTIVE_CRACKS
          ? next.slice(-MAX_ACTIVE_CRACKS)
          : next;
      });

      window.setTimeout(() => {
        setCracks((prev) => prev.filter((c) => c.id !== id));
      }, CRACK_LIFETIME_MS);
    };

    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [prefersReduced]);

  if (prefersReduced) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90]"
      aria-hidden
    >
      {cracks.map((crack) => (
        <CrackBurst key={crack.id} crack={crack} />
      ))}
    </div>
  );
}

function CrackBurst({ crack }: { crack: Crack }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const flash = flashRef.current;
    if (!svg || !flash) return;

    const lines = svg.querySelectorAll<SVGPathElement>("path");

    // Hide each line via stroke-dashoffset = its own length.
    lines.forEach((line) => {
      const len = parseFloat(line.dataset.len || "100");
      gsap.set(line, {
        strokeDasharray: len,
        strokeDashoffset: len,
        opacity: 1,
      });
    });

    const tl = gsap.timeline();

    // Impact flash — quick scale + opacity burst at the click point.
    tl.fromTo(
      flash,
      { scale: 0, opacity: 0.95 },
      { scale: 5, opacity: 0, duration: 0.5, ease: "power2.out" },
      0,
    );

    // Cracks draw out from the impact, randomly staggered.
    tl.to(
      lines,
      {
        strokeDashoffset: 0,
        duration: 0.25,
        ease: "power3.out",
        stagger: { each: 0.012, from: "random" },
      },
      0.02,
    );

    // Hold beat — register the break before self-healing begins.
    tl.to({}, { duration: 1.35 });

    // Heal — slow premium fade; cracks “ease back into” the glass.
    tl.to(lines, {
      opacity: 0,
      duration: 3.85,
      ease: "power1.inOut",
      stagger: { each: 0.025, from: "edges" },
    });

    return () => {
      tl.kill();
    };
  }, [crack]);

  return (
    <>
      {/* Impact flash — small white burst at click center. */}
      <div
        ref={flashRef}
        className="absolute rounded-full bg-white"
        style={{
          left: crack.x - 6,
          top: crack.y - 6,
          width: 12,
          height: 12,
          opacity: 0,
          boxShadow:
            "0 0 24px rgba(255,255,255,0.7), 0 0 60px rgba(255,255,255,0.3)",
          willChange: "transform, opacity",
        }}
        aria-hidden
      />

      {/* Crack lines — screen blend mode + soft drop shadow gives that
          "real fractured glass" glint instead of looking like a sketch. */}
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full overflow-visible"
        style={{
          mixBlendMode: "screen",
          filter: "drop-shadow(0 0 3px rgba(255,255,255,0.32))",
        }}
        aria-hidden
      >
        {crack.paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            stroke="rgba(255,255,255,0.85)"
            strokeWidth={p.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            data-len={p.len}
          />
        ))}
      </svg>
    </>
  );
}
