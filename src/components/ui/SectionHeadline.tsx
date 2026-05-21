"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = {
  children: ReactNode;
  className?: string;
  /** Tag to render; defaults to <h2>. Use h1 only inside the Hero. */
  as?: "h1" | "h2" | "h3";
};

/**
 * SectionHeadline — cinematic GSAP mask-reveal for section titles.
 *
 * The headline starts hidden behind a top-clip mask, sits 60px below its
 * resting position, and rises into the clip window as it enters the
 * viewport. Drawn with expo.out so it lands like a film card — sharp settle,
 * no bounce.
 *
 * Triggered when the element crosses 82% of the viewport, plays exactly
 * once per session. Reduced motion users see the headline immediately.
 */
export function SectionHeadline({ children, className = "", as = "h2" }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (!ref.current) return;

      if (prefersReduced) {
        gsap.set(ref.current, { clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1 });
        return;
      }

      const trigger = ScrollTrigger.create({
        trigger: ref.current,
        start: "top 82%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            ref.current,
            {
              clipPath: "inset(0 0 100% 0)",
              y: 60,
              opacity: 0,
            },
            {
              clipPath: "inset(0 0 0% 0)",
              y: 0,
              opacity: 1,
              duration: 1.2,
              ease: "expo.out",
            },
          );
        },
      });

      return () => trigger.kill();
    },
    { dependencies: [prefersReduced] },
  );

  const Tag = as;
  return (
    <Tag
      ref={ref as React.Ref<HTMLHeadingElement>}
      className={className}
      style={{
        clipPath: prefersReduced ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
        opacity: prefersReduced ? 1 : 0,
        willChange: "clip-path, transform, opacity",
      }}
    >
      {children}
    </Tag>
  );
}
