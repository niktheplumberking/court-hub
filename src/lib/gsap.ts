"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins exactly once per browser session.
// Importing this module anywhere in client components is enough.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Court Hub easing system. Cinematic, slow-out, signature.
  gsap.defaults({
    ease: "power3.out",
    duration: 1,
  });
}

export { gsap, ScrollTrigger };

// Shared easing tokens so every animation matches the brand cadence.
export const EASE = {
  cinematic: "power3.out",
  drop: "power4.in",
  hero: "expo.out",
  bounce: "back.out(1.7)",
} as const;
