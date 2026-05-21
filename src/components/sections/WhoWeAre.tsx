"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const WhoWeAreScene = dynamic(
  () => import("@/components/sections/WhoWeAreScene").then((m) => m.WhoWeAreScene),
  { ssr: false, loading: () => null },
);

function Waveform() {
  return (
    <svg viewBox="0 0 800 38" className="w-full max-w-2xl" aria-hidden>
      <polyline points="0,19 28,10 58,27 92,7 128,21 162,13 198,25 232,9 268,20 302,16 336,24 372,9 408,20 442,13 478,25 512,9 548,20 582,15 616,24 652,11 686,19 720,14 754,22 800,17" fill="none" stroke="#C8FF3D" strokeWidth="0.9" opacity="0.45" />
      <polyline points="0,21 38,13 76,25 112,14 148,22 184,15 220,23 256,12 292,21 328,17 364,23 400,12 436,21 472,15 508,23 544,12 580,21 616,15 652,23 688,13 724,20 762,15 800,19" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
      {[
        { x: 92, label: "SIGNAL LOCK" },
        { x: 232, label: "CVBNG" },
        { x: 372, label: "BPST" },
        { x: 512, label: "TEDW" },
        { x: 652, label: "BLXCY" },
      ].map(({ x, label }) => (
        <g key={label}>
          <rect x={x - 1.5} y={5} width={3} height={3} fill="rgba(255,255,255,0.28)" />
          <text x={x} y={2.5} textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="3.4" fontFamily="monospace" letterSpacing="0.4">{label}</text>
        </g>
      ))}
    </svg>
  );
}

function Stats({ pr }: { pr: React.MutableRefObject<number> }) {
  const r0 = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const p = pr.current;
      let o0 = 0, o1 = 0, o2 = 0;
      if (p <= 0.28) o0 = 1;
      else if (p < 0.38) { const f = (p - 0.28) / 0.1; o0 = 1 - f; o1 = f; }
      else if (p <= 0.62) o1 = 1;
      else if (p < 0.72) { const f = (p - 0.62) / 0.1; o1 = 1 - f; o2 = f; }
      else o2 = 1;
      if (r0.current) r0.current.style.opacity = String(o0);
      if (r1.current) r1.current.style.opacity = String(o1);
      if (r2.current) r2.current.style.opacity = String(o2);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pr]);

  const cls = "pointer-events-none absolute select-none text-center";
  const pos = "left-[67%] top-[58%] -translate-x-1/2 -translate-y-1/2";

  return (
    <>
      <div ref={r0} className={`${cls} ${pos}`} style={{ opacity: 1 }}>
        <p className="font-display leading-none tracking-tighter" style={{ fontSize: "clamp(56px, 6.8vw, 92px)", color: "#fff", textShadow: "0 0 24px rgba(200,255,61,0.7), 0 0 60px rgba(200,255,61,0.3)" }}>
          250K+
        </p>
        <p className="mt-2 font-mono text-[11px] tracking-[0.22em] uppercase text-white/70">Monthly active rackets</p>
        <div style={{ transform: "scaleY(-0.38) translateY(4px)", opacity: 0.22, maskImage: "linear-gradient(to top, white 0%, transparent 85%)", WebkitMaskImage: "linear-gradient(to top, white 0%, transparent 85%)" }}>
          <p className="font-display leading-none tracking-tighter" style={{ fontSize: "clamp(56px, 6.8vw, 92px)", color: "#fff" }}>250K+</p>
          <p className="mt-2 font-mono text-[11px] tracking-[0.22em] uppercase text-white/50">Monthly active rackets</p>
        </div>
      </div>

      <div ref={r1} className={`${cls} ${pos}`} style={{ opacity: 0 }}>
        <div style={{ background: "linear-gradient(145deg, #3d3d3d 0%, #1a1a1a 45%, #2d2d2d 100%)", border: "1px solid rgba(255,255,255,0.13)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 8px 40px rgba(0,0,0,0.7)", padding: "22px 32px 18px", borderRadius: 2, minWidth: 260 }}>
          <p className="font-display leading-[1.05] tracking-tight" style={{ fontSize: 36, color: "#e5e5e5" }}>HEAD</p>
          <p className="font-display leading-[1.05] tracking-tight" style={{ fontSize: 28, color: "#a0a0a0", marginTop: 2 }}>+ Wilson</p>
          <div className="my-3 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)" }} />
          <p className="font-mono text-[9px] tracking-[0.26em] uppercase" style={{ color: "#666" }}>Authorized retailer</p>
        </div>
      </div>

      <div ref={r2} className={`${cls} ${pos}`} style={{ opacity: 0 }}>
        <p className="font-display leading-none tracking-tighter" style={{ fontSize: "clamp(80px, 10vw, 118px)", color: "#1E5AE8", textShadow: "0 0 44px rgba(30,90,232,0.9), 0 0 90px rgba(30,90,232,0.4)" }}>3</p>
        <p className="mt-1 font-mono text-[11px] tracking-[0.22em] uppercase text-white/70">Pillars of Court Hub</p>
        <p className="mt-1 font-mono text-[9px] tracking-[0.15em] uppercase text-white/40">Equipment · Courts · Tournaments</p>
      </div>
    </>
  );
}

export function WhoWeAre() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const pr = useRef(0);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReduced || !sectionRef.current || !pinRef.current) return;
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=400%",
        scrub: 1,
        pin: pinRef.current,
        anticipatePin: 1,
        id: "who-we-are",
        onUpdate: (self) => { pr.current = self.progress; },
      });
      return () => st.kill();
    },
    { scope: sectionRef, dependencies: [prefersReduced] },
  );

  if (prefersReduced) {
    return (
      <section id="who-we-are" className="relative z-[30] bg-[#080a0e] py-28 text-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
          <p className="mb-4 font-mono text-[9px] tracking-[0.28em] uppercase text-white/30">/// The home of premium padel ///</p>
          <h2 className="font-display text-[10vw] leading-[0.93] tracking-tight sm:text-[6vw]">The home of premium padel <span className="text-lime">in the UAE.</span></h2>
          <p className="mt-7 max-w-lg text-base leading-[1.75] text-white/55">From racket to court to championship moment — Court Hub Group powers every part of the game.</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="who-we-are" className="relative z-[30] bg-[#080a0e]">
      <div ref={pinRef} className="relative h-screen w-full overflow-hidden text-white">

        {/* Opaque base — nothing from hero bleeds through */}
        <div className="absolute inset-0 bg-[#080a0e]" aria-hidden />

        {/* Atmospheric layers */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{
          backgroundImage: [
            "radial-gradient(ellipse 58% 52% at 66% 58%, rgba(12,45,28,0.9) 0%, transparent 68%)",
            "radial-gradient(ellipse 34% 30% at 66% 58%, rgba(200,255,61,0.08) 0%, transparent 62%)",
            "radial-gradient(ellipse 28% 22% at 18% 78%, rgba(10,18,55,0.55) 0%, transparent 65%)",
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.014) 3px, rgba(255,255,255,0.014) 4px)",
            "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.014) 3px, rgba(255,255,255,0.014) 4px)",
          ].join(","),
        }} />

        {/* 3D — right half */}
        <div className="absolute inset-y-0 right-0 w-[55%]">
          <WhoWeAreScene pr={pr} />
        </div>

        <Stats pr={pr} />

        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 88% 78% at 50% 50%, transparent 40%, rgba(8,10,14,0.75) 100%)" }} />

        {/* Left copy */}
        <div className="absolute inset-y-0 left-0 z-10 flex max-w-[44%] flex-col justify-center px-8 sm:px-11 lg:px-14 xl:px-16">
          <p className="mb-5 font-mono text-[9px] tracking-[0.28em] uppercase text-white/28">/// The home of premium padel ///</p>
          <h2 className="font-display text-[clamp(30px,3.6vw,55px)] leading-[0.91] tracking-tight">
            The home of<br />premium padel<br /><span className="text-lime">in the UAE.</span>
          </h2>
          <p className="mt-6 max-w-[280px] text-[14px] leading-[1.78] text-white/50 sm:text-[15px]">
            From racket to court to championship moment — Court Hub Group powers every part of the game. We stock what the pros play with, build the surfaces they win on, and stage the tournaments where careers are made.
          </p>
        </div>

        {/* HUD */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
          <div className="absolute left-6 top-5 flex items-center gap-2 font-mono text-[9px] tracking-[0.2em] uppercase text-white/55">
            <span className="relative flex h-[7px] w-[7px]"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fire opacity-60" /><span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-fire" /></span>
            REC [TIME]
          </div>
          <div className="absolute right-6 top-5 font-mono text-[9px] tracking-[0.18em] uppercase text-white/28">CH 33 · ID S400 · FRED [A]</div>
          <div className="absolute bottom-5 left-6 flex items-center gap-2">
            <div className="flex h-[15px] w-[15px] items-center justify-center rounded-full border border-white/25 font-mono text-[7px] text-white/40">N</div>
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-white/32">Live · Court Hub</span>
          </div>
          <div className="absolute bottom-5 right-6 flex items-center gap-2">
            <span className="inline-block h-[7px] w-[7px] bg-lime" style={{ boxShadow: "0 0 5px #C8FF3D, 0 0 12px rgba(200,255,61,0.5)" }} />
            <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-lime/70">Live Feed</span>
          </div>
          <div className="absolute left-4 top-4 h-7 w-7 border-l border-t border-white/14" />
          <div className="absolute right-4 top-4 h-7 w-7 border-r border-t border-white/14" />
          <div className="absolute left-4 bottom-4 h-7 w-7 border-b border-l border-white/14" />
          <div className="absolute right-4 bottom-4 h-7 w-7 border-b border-r border-white/14" />
          <div className="absolute bottom-[46px] left-1/2 w-[56%] min-w-[280px] -translate-x-1/2"><Waveform /></div>
        </div>
      </div>
    </section>
  );
}
