"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Variant =
  | "fold"
  | "marquee-pros"
  | "blueprint"
  | "stadium-lights"
  | "lights-out";

type Props = {
  variant: Variant;
  height?: string;
};

export function SectionBridge({ variant, height = "100vh" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  if (prefersReduced) {
    return <div aria-hidden style={{ height: "8vh" }} className="bg-ink" />;
  }

  return (
    <div
      ref={ref}
      aria-hidden
      style={{ height, position: "relative" }}
      className="w-full overflow-hidden"
    >
      {variant === "fold" && <FoldBridge progress={scrollYProgress} />}
      {variant === "marquee-pros" && <MarqueeProsBridge progress={scrollYProgress} />}
      {variant === "blueprint" && <BlueprintBridge progress={scrollYProgress} />}
      {variant === "stadium-lights" && <StadiumLightsBridge progress={scrollYProgress} />}
      {variant === "lights-out" && <LightsOutBridge progress={scrollYProgress} />}
    </div>
  );
}

/* ---------- Fold: sand → ink wipe (Hero → WhoWeAre) ---------- */
function FoldBridge({ progress }: { progress: MotionValue<number> }) {
  const topInset = useTransform(progress, [0, 1], [100, 0]);
  const clipPath = useTransform(topInset, (v) => `inset(${v}% 0% 0% 0%)`);
  return (
    <div className="absolute inset-0 bg-[#EDE8E1]">
      <motion.div
        className="absolute inset-0 bg-ink"
        style={{ clipPath }}
      />
    </div>
  );
}

/* ---------- Marquee "For the Pros" (WhoWeAre → Shop) ---------- */
function MarqueeProsBridge({ progress }: { progress: MotionValue<number> }) {
  const x1 = useTransform(progress, [0, 1], ["0%", "-40%"]);
  const x2 = useTransform(progress, [0, 1], ["-40%", "0%"]);
  const phrase = "FOR THE PROS";
  const row = Array.from({ length: 10 });

  return (
    <div className="absolute inset-0 flex flex-col items-stretch justify-center gap-6 bg-ink">
      <motion.div
        style={{ x: x1 }}
        className="flex whitespace-nowrap font-display text-[14vw] leading-none text-white/10"
      >
        {row.map((_, i) => (
          <span key={i} className="pr-8">
            {phrase} ·
          </span>
        ))}
      </motion.div>
      <motion.div
        style={{ x: x2 }}
        className="flex whitespace-nowrap font-display text-[14vw] leading-none text-lime/15"
      >
        {row.map((_, i) => (
          <span key={i} className="pr-8">
            {phrase} ·
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------- Blueprint unfold (Shop → BuildACourt) ---------- */
function BlueprintBridge({ progress }: { progress: MotionValue<number> }) {
  const rotateY = useTransform(progress, [0, 1], [-75, 0]);
  const opacity = useTransform(progress, [0, 0.5, 1], [0, 0.7, 1]);
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-ink"
      style={{ perspective: "1500px" }}
    >
      <motion.div
        style={{
          rotateY,
          opacity,
          transformOrigin: "center center",
          backgroundImage:
            "linear-gradient(rgba(30,90,232,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(30,90,232,0.35) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          backgroundColor: "rgba(7, 12, 25, 0.8)",
        }}
        className="absolute inset-x-10 inset-y-12 rounded-3xl border border-court/30 sm:inset-x-24"
      />
    </div>
  );
}

/* ---------- Stadium lights (BuildACourt → Tournaments) ---------- */
function StadiumLightsBridge({ progress }: { progress: MotionValue<number> }) {
  const scale = useTransform(progress, [0, 1], [0.3, 1.8]);
  const opacity = useTransform(progress, [0, 0.5, 1], [0, 0.7, 1]);
  return (
    <div className="absolute inset-0 bg-ink">
      <motion.div
        style={{ scale, opacity }}
        className="absolute left-1/2 top-0 h-[200vh] w-[200vw] -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(232,69,37,0.55) 0%, rgba(232,69,37,0.18) 35%, transparent 70%)",
          }}
        />
      </motion.div>
    </div>
  );
}

/* ---------- Lights out (Tournaments → Footer) ---------- */
function LightsOutBridge({ progress }: { progress: MotionValue<number> }) {
  const x = useTransform(progress, [0, 1], ["0%", "-30%"]);
  const glowOpacity = useTransform(progress, [0, 0.4, 1], [1, 0.3, 0]);
  return (
    <div className="absolute inset-0 flex items-center bg-ink">
      <motion.div
        style={{ opacity: glowOpacity }}
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "radial-gradient(ellipse at center top, rgba(232,69,37,0.25) 0%, transparent 60%)",
          }}
        />
      </motion.div>
      <motion.div
        style={{ x }}
        className="flex whitespace-nowrap font-display text-[18vw] leading-none text-white/5"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="pr-10">
            COURT HUB ·
          </span>
        ))}
      </motion.div>
    </div>
  );
}
