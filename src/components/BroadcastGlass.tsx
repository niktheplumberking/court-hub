"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * BroadcastGlass — subtle "watching through a display" chrome over the site.
 *
 * Fixed bezel, inner vignette, and hairline scan texture. Pointer-events
 * none so it never blocks clicks (ScreenCrack still sits above when
 * cracks spawn).
 *
 * Reveal: starts at opacity 0 and fades up the moment PageIntro
 * dispatches `court-intro-complete`. Combined with the curtain lift
 * this reads as the panel chrome appearing with the live feed.
 *
 * Safety: if for any reason the event never fires (e.g. PageIntro
 * crashed), reveal after FALLBACK_MS so the chrome is never stuck off.
 */

const FALLBACK_MS = 12000;

export function BroadcastGlass() {
  const prefersReduced = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const reveal = () => setRevealed(true);
    window.addEventListener("court-intro-complete", reveal, { once: true });
    const fallback = window.setTimeout(reveal, FALLBACK_MS);
    return () => {
      window.removeEventListener("court-intro-complete", reveal);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[40] ${prefersReduced ? "opacity-40" : ""}`}
      style={{
        opacity: revealed ? 1 : 0,
        transition: "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      aria-hidden
    >
      {/* Inner vignette — draws eye to centre like a panel. */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow:
            "inset 0 0 120px rgba(0,0,0,0.45), inset 0 0 40px rgba(0,0,0,0.35)",
        }}
      />

      {/* Ultra-light scan texture — motion-safe via prefers-reduced. */}
      {!prefersReduced && (
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            background:
              "repeating-linear-gradient(to bottom, transparent 0, transparent 3px, rgba(255,255,255,0.08) 4px, rgba(255,255,255,0.08) 5px)",
            mixBlendMode: "overlay",
          }}
        />
      )}
    </div>
  );
}
