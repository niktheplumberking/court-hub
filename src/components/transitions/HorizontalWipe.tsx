"use client";

import { Children, useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = { children: ReactNode };

/**
 * HorizontalWipe — section 2 → 3 slides left on scroll.
 *
 * CSS sticky holds the viewport; GSAP scrub (no pin) drives the track X
 * so it stays in sync with Lenis via ScrollTrigger.update.
 */
export function HorizontalWipe({ children }: Props) {
  const items = Children.toArray(children);
  const reduced = useReducedMotion();
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const outer = outerRef.current;
      const track = trackRef.current;
      if (!outer || !track || reduced) return;

      const tween = gsap.fromTo(
        track,
        { x: 0 },
        {
          x: () => -window.innerWidth,
          ease: "none",
          scrollTrigger: {
            trigger: outer,
            start: "top top",
            end: () => `+=${window.innerWidth}`,
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        },
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: outerRef, dependencies: [reduced] },
  );

  if (reduced || items.length < 2) {
    return <>{items}</>;
  }

  return (
    <div
      ref={outerRef}
      className="relative"
      style={{ height: "calc(100dvh + 100vw)" }}
    >
      <div className="sticky top-0 h-dvh w-full overflow-hidden">
        <div
          ref={trackRef}
          className="flex h-full will-change-transform"
          style={{ width: `${items.length * 100}vw` }}
        >
          {items.map((child, i) => (
            <div
              key={i}
              className="h-full w-screen shrink-0 overflow-hidden"
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
