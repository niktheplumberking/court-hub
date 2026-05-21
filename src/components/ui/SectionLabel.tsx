"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = {
  children: string;
  accent?: "lime" | "fire" | "padel" | "court" | "white";
};

const accentMap = {
  lime: "text-lime",
  fire: "text-fire",
  padel: "text-padel",
  court: "text-court",
  white: "text-white/60",
};

/**
 * SectionLabel — eyebrow-style section anchor with a drawn underline.
 *
 * The 32px line grows horizontally from 0 → full width when the label
 * scrolls into view, syncing the rhythm of every section opener. Letters
 * gently fade up alongside the line draw.
 */
export function SectionLabel({ children, accent = "lime" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (!ref.current) return;
      const line = ref.current.querySelector<HTMLSpanElement>("[data-line]");
      const text = ref.current.querySelector<HTMLSpanElement>("[data-text]");

      if (prefersReduced) {
        if (line) line.style.transform = "scaleX(1)";
        if (text) text.style.opacity = "1";
        return;
      }

      const trigger = ScrollTrigger.create({
        trigger: ref.current,
        start: "top 88%",
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          if (line) tl.to(line, { scaleX: 1, duration: 0.7, ease: "expo.out" }, 0);
          if (text)
            tl.to(text, { opacity: 1, y: 0, duration: 0.55, ease: "expo.out" }, 0.1);
        },
      });

      return () => trigger.kill();
    },
    { dependencies: [prefersReduced] },
  );

  return (
    <span
      ref={ref}
      className={`inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] ${accentMap[accent]}`}
    >
      <span
        data-line
        aria-hidden
        className="block h-px w-10 origin-left bg-current opacity-70"
        style={{ transform: prefersReduced ? "scaleX(1)" : "scaleX(0)" }}
      />
      <span
        data-text
        className="inline-block"
        style={{
          opacity: prefersReduced ? 1 : 0,
          transform: prefersReduced ? "translateY(0)" : "translateY(6px)",
        }}
      >
        {children}
      </span>
    </span>
  );
}
