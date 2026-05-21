"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { Card } from "@/components/ui/card";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const SPLINE_SCENE_URL =
  "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

const DESKTOP_QUERY = "(min-width: 768px)";

function subscribeDesktop(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getDesktopSnapshot(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getDesktopServerSnapshot(): boolean {
  return false;
}

export function BuildACourtScene() {
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    getDesktopSnapshot,
    getDesktopServerSnapshot,
  );
  const prefersReduced = useReducedMotion();

  const showSpline = isDesktop && !prefersReduced;

  return (
    <Card className="relative h-[460px] w-full overflow-hidden border-white/10 bg-card sm:h-[540px] lg:h-[600px]">
      <Spotlight
        className="-top-20 left-10 md:-top-20 md:left-40"
        fill="rgba(7, 198, 106, 0.55)"
      />
      {showSpline ? (
        <SplineScene
          scene={SPLINE_SCENE_URL}
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <Image
          src="/images/Hero.png.webp"
          alt="Padel court at night"
          fill
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover object-center opacity-90"
        />
      )}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent p-6 sm:p-8">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-padel">
          <span className="h-1.5 w-1.5 rounded-full bg-padel" />
          Live 3D · Drag to inspect
        </div>
      </div>
    </Card>
  );
}
