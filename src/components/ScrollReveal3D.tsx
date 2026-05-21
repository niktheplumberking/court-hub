"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = {
  children: ReactNode;
  className?: string;
  rotateXFrom?: number;
  yFrom?: number;
};

/**
 * ScrollReveal3D — subtle 3D-feeling scroll reveal wrapper.
 *
 * The outer container is always `position: relative` and the perspective
 * is always defined, so framer-motion's useScroll has a stable, non-static
 * target on every render path (including reduced-motion).
 */
export function ScrollReveal3D({
  children,
  className = "",
  rotateXFrom = 12,
  yFrom = 80,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [rotateXFrom, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [yFrom, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0.85, 1]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", perspective: "1200px" }}
    >
      {prefersReduced ? (
        children
      ) : (
        <motion.div
          style={{
            rotateX,
            y,
            opacity,
            transformStyle: "preserve-3d",
            transformOrigin: "center top",
          }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
