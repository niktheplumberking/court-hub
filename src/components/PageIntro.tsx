"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * PageIntro — premium broadcast loader.
 *
 * Design decisions:
 *   - Root starts at opacity:0 via CSS animation `introReveal` so the very
 *     first frame the user sees is black, then the stage materialises.
 *     No GSAP conflict — the CSS anim fires from the initial style, GSAP
 *     never touches root opacity.
 *
 *   - Bar fill is driven by a GSAP tween on a proxy object, not `gsap.set`
 *     per ticker frame.  GSAP's internal RAF interpolation gives buttery
 *     smooth motion with zero dropped frames.  `power2.out` over 3 s:
 *       t = 0.45 s (when row fades in) → ~67 % already filled
 *       t = 2.50 s (MIN_HOLD fires)   → ~97 % → gated at 96 %
 *     Then snaps to 100 % in 0.35 s with `power2.out`.
 *
 *   - Bar shimmer: an inner div with CSS `barShimmer` keyframe sweeps a
 *     bright highlight across the fill every 2 s — makes it feel alive.
 *
 *   - `court-intro-complete` event is dispatched at the MOMENT the curtain
 *     STARTS lifting (t = 0.32 of exit timeline), not after unmount.
 *     Hero.tsx begins its reveal animation 1 s before it becomes visible,
 *     so the handoff is completely seamless — no blink.
 *
 *   - White flash softened to 0.5 opacity — punchy but not harsh.
 *
 *   - Mouse spotlight 260 px, court-blue, uses mix-blend-mode: screen so
 *     it subtly brightens the hex grid dots under the cursor.
 *
 * Timing:
 *   MIN_HOLD_MS  = 2500   total cinematic hold
 *   MAX_HOLD_MS  = 5000   safety cap for slow networks
 *   ON_AIR_HOLD  = 650    beat at locked before flash
 *
 * Fonts: wordmark → Archivo Black (font-display)
 *        HUD text  → Inter (font-sans, default)
 */

const MIN_HOLD_MS = 2500;
const MAX_HOLD_MS = 5000;
const ON_AIR_HOLD_MS = 650;
const READY_BUFFER_RATIO = 0.18;
const BUFFER_GATE_MAX = 0.96;
const INTRO_COMPLETE_EVENT = "court-intro-complete";

export function PageIntro() {
  const root     = useRef<HTMLDivElement>(null);
  const curtain  = useRef<HTMLDivElement>(null);
  const spotlight = useRef<HTMLDivElement>(null);
  const bar      = useRef<HTMLDivElement>(null);
  const counter  = useRef<HTMLSpanElement>(null);
  const statusEl = useRef<HTMLSpanElement>(null);
  const statusSq = useRef<HTMLSpanElement>(null);
  const flash    = useRef<HTMLDivElement>(null);
  const recTime  = useRef<HTMLSpanElement>(null);
  const tagline  = useRef<HTMLParagraphElement>(null);

  const [done, setDone] = useState(false);
  const prefersReduced  = useReducedMotion();

  // Lock scroll for the duration of the intro.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // After component unmounts ensure ScrollTrigger measures correctly.
  useEffect(() => {
    if (done) ScrollTrigger.refresh();
  }, [done]);

  // Mouse-follow spotlight — direct style mutation, zero React re-renders.
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlight.current || !curtain.current) return;
    const r = curtain.current.getBoundingClientRect();
    spotlight.current.style.transform =
      `translate(${e.clientX - r.left - 130}px, ${e.clientY - r.top - 130}px)`;
  };

  useGSAP(() => {
    const t0 = performance.now();
    let ready      = false;
    let minElapsed = false;
    let resolved   = false;
    let stage: "acquiring" | "locking" | "locked" = "acquiring";

    // ── Video readiness gate ──────────────────────────────────────────
    const video = document.querySelector("[data-hero-video]") as HTMLVideoElement | null;
    const markReady = () => { ready = true; tryFinish(); };

    if (video) {
      if (
        video.readyState >= 3 ||
        (video.duration &&
          video.buffered.length > 0 &&
          video.buffered.end(0) / video.duration >= READY_BUFFER_RATIO)
      ) {
        ready = true;
      } else {
        video.addEventListener("canplaythrough", markReady, { once: true });
      }
    } else {
      ready = true;
    }

    const minTimer = window.setTimeout(() => { minElapsed = true; tryFinish(); }, MIN_HOLD_MS);
    const maxTimer = window.setTimeout(() => { tryFinish(true); }, MAX_HOLD_MS);

    // ── Smooth bar tween — proxy object, GSAP RAF interpolation ──────
    // Starting immediately (before the row is visible) so the user sees
    // a partially-filled bar the moment it fades in — feels instant.
    const barProxy = { value: 0 };
    const barTween = gsap.to(barProxy, {
      value: BUFFER_GATE_MAX,
      duration: MIN_HOLD_MS / 1000 + 0.5, // 3 s — smooth power2.out arc
      ease: "power2.out",
      onUpdate: () => {
        const v = ready
          ? barProxy.value
          : Math.min(barProxy.value, BUFFER_GATE_MAX);

        if (bar.current)     bar.current.style.transform = `scaleX(${v})`;
        if (counter.current) counter.current.textContent =
          `${String(Math.floor(v * 100)).padStart(3, "0")}%`;

        // Status copy synced to visual progress.
        if (stage === "acquiring" && v > 0.45 && statusEl.current) {
          stage = "locking";
          statusEl.current.textContent = "Signal · Locking";
        } else if (stage === "locking" && v > 0.88 && statusEl.current) {
          stage = "locked";
          statusEl.current.textContent = "Signal · Locked";
        }
      },
    });

    // ── Ticker — only for the live REC timecode ───────────────────────
    const timeTick = () => {
      if (!recTime.current) return;
      const s = Math.floor((performance.now() - t0) / 1000);
      const m = Math.floor(s / 60);
      recTime.current.textContent =
        `[TIM 00:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}]`;
    };
    gsap.ticker.add(timeTick);

    // ── Readiness logic ───────────────────────────────────────────────
    function tryFinish(force = false) {
      if (resolved) return;
      if (!force && (!ready || !minElapsed)) return;
      resolved = true;
      runExit();
    }

    function runExit() {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      barTween.kill();
      gsap.ticker.remove(timeTick);

      // Snap bar to 100 %.
      gsap.to(barProxy, {
        value: 1,
        duration: 0.35,
        ease: "power2.out",
        onUpdate: () => {
          if (bar.current) bar.current.style.transform = `scaleX(${barProxy.value})`;
          if (counter.current)
            counter.current.textContent = `${Math.round(barProxy.value * 100)}%`;
        },
        onComplete: () => {
          if (counter.current) counter.current.textContent = "100%";
        },
      });

      // Glow pulse at lock moment.
      if (bar.current) {
        gsap.fromTo(
          bar.current,
          { boxShadow: "0 0 16px rgba(200,255,61,0.55)" },
          {
            boxShadow: "0 0 38px rgba(200,255,61,1), 0 0 90px rgba(200,255,61,0.55)",
            duration: 0.2, yoyo: true, repeat: 1, ease: "sine.inOut", delay: 0.1,
          },
        );
      }

      // ON AIR flip.
      gsap.delayedCall(0.35, () => {
        if (statusEl.current) {
          statusEl.current.textContent = "On Air";
          statusEl.current.style.color = "var(--color-fire)";
        }
        if (statusSq.current) {
          statusSq.current.classList.replace("bg-lime", "bg-fire");
          statusSq.current.style.boxShadow = "0 0 12px rgba(232,69,37,0.8)";
        }
        if (tagline.current) tagline.current.textContent = "Broadcast Feed Locked";
      });

      // Held beat → exit choreography.
      gsap.delayedCall(0.35 + ON_AIR_HOLD_MS / 1000, () => {
        const exitTl = gsap.timeline({
          defaults: { ease: "power3.inOut" },
          onComplete: () => setDone(true),
        });

        // HUD chrome fades first so the lift feels clean.
        exitTl.to(
          ["[data-intro-mark]", "[data-intro-tagline]", "[data-intro-corner]",
           "[data-intro-progress-row]", "[data-intro-bracket]", "[data-intro-line]"],
          { opacity: 0, duration: 0.24, ease: "power3.in", stagger: 0.018 },
          0,
        );

        // Unlock scroll the moment the curtain starts moving.
        exitTl.call(() => {
          document.body.style.overflow = "";
        }, [], 0.3);

        // Curtain lifts off the top.
        exitTl.to(
          curtain.current,
          { yPercent: -100, duration: 1.0, ease: "expo.inOut" },
          0.3,
        );

        // ── Dispatch handoff event JUST BEFORE curtain finishes ────────
        // Fires at t=1.2 — curtain is 90 % gone, hero has been pre-set
        // to scale 1.04 / opacity 0.85. Its 0.9 s reveal starts NOW, so
        // when the curtain clears (t=1.3) the hero is ~0.1 s into its
        // zoom-out. The user watches the remaining 0.8 s of zoom play out
        // live — the effect is fully visible, zero blink.
        exitTl.call(() => {
          window.dispatchEvent(new CustomEvent(INTRO_COMPLETE_EVENT));
        }, [], 1.2);
      });
    }

    // ── Reduced motion: skip choreography, keep readiness gate ───────
    if (prefersReduced) {
      gsap.set(["[data-intro-line]", "[data-intro-bracket]", "[data-intro-mark]",
                "[data-intro-corner]", "[data-intro-tagline]", "[data-intro-progress-row]"],
        { opacity: 1, scaleX: 1, yPercent: 0, y: 0, scale: 1 });
      return () => {
        window.clearTimeout(minTimer);
        window.clearTimeout(maxTimer);
        barTween.kill();
        gsap.ticker.remove(timeTick);
        if (video) video.removeEventListener("canplaythrough", markReady);
      };
    }

    // ── Entry choreography ────────────────────────────────────────────
    // Dark stage materialises first, then each layer reveals in sequence
    // so the visitor feels welcomed rather than thrown at the screen.
    gsap.timeline({ defaults: { ease: "power3.out" } })
      // Prime initial hidden states.
      .set("[data-intro-line]",         { scaleX: 0, opacity: 0 })
      .set("[data-intro-bracket]",      { opacity: 0, scale: 0.55 })
      .set("[data-intro-mark]",         { yPercent: 115, opacity: 0 })
      .set("[data-intro-corner]",       { opacity: 0, y: 12 })
      .set("[data-intro-tagline]",      { opacity: 0, y: 18 })
      .set("[data-intro-progress-row]", { opacity: 0, y: 14 })

      // Brackets materialise — viewfinder frames the stage.
      .to("[data-intro-bracket]",
        { opacity: 1, scale: 1, duration: 0.7, stagger: 0.08, ease: "expo.out" }, 0.2)

      // Wordmark rises from behind the rule line.
      .to("[data-intro-mark]",
        { yPercent: 0, opacity: 1, duration: 1.0, ease: "expo.out" }, 0.55)

      // Rule draws across.
      .to("[data-intro-line]",
        { scaleX: 1, opacity: 1, duration: 0.8, ease: "expo.out" }, 0.85)

      // Tagline lifts up.
      .to("[data-intro-tagline]",
        { opacity: 1, y: 0, duration: 0.65, ease: "expo.out" }, 1.05)

      // Progress row fades in — bar is already ~50 % filled at this point.
      .to("[data-intro-progress-row]",
        { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }, 1.2)

      // Edge HUD settles in last.
      .to("[data-intro-corner]",
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "expo.out" }, 1.35);

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      barTween.kill();
      gsap.ticker.remove(timeTick);
      if (video) video.removeEventListener("canplaythrough", markReady);
    };
  }, { dependencies: [prefersReduced] });

  if (done) return null;

  return (
    // opacity:0 initial style + CSS introReveal animation = the page
    // fades in from black without any GSAP conflict.
    <div
      ref={root}
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{ animation: "introReveal 0.55s ease-out forwards", opacity: 0 }}
      aria-hidden
    >
      <div
        ref={curtain}
        data-intro-curtain
        className="absolute inset-0 overflow-hidden bg-ink"
        style={{ willChange: "transform", pointerEvents: "auto" }}
        onMouseMove={handleMouseMove}
      >
        {/* ── Hex dot grid — staggered honeycomb texture ───────────── */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: [
              "radial-gradient(circle, rgba(255,255,255,0.13) 1.5px, transparent 1.5px)",
              "radial-gradient(circle, rgba(255,255,255,0.07) 1.5px, transparent 1.5px)",
            ].join(","),
            backgroundSize: "22px 13px, 22px 13px",
            backgroundPosition: "0 0, 11px 6.5px",
          }}
        />

        {/* ── Mouse spotlight — small torch brightens hex beneath cursor */}
        <div
          ref={spotlight}
          className="pointer-events-none absolute"
          style={{
            top: 0, left: 0,
            width: 260, height: 260,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.09) 0%, rgba(30,90,232,0.07) 40%, transparent 72%)",
            mixBlendMode: "screen",
            transform: "translate(-9999px,-9999px)",
            willChange: "transform",
          }}
        />

        {/* ── Court-blue radial glow — focal depth behind wordmark ─── */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 58% 48% at 50% 50%, rgba(30,90,232,0.16) 0%, rgba(30,90,232,0.06) 32%, transparent 62%)",
          }}
        />

        {/* ── Edge vignette — letterbox feel ───────────────────────── */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        {/* ── Film grain ───────────────────────────────────────────── */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            opacity: 0.042,
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
          aria-hidden
        />

        {/* ── Corner viewfinder brackets ────────────────────────────── */}
        <div className="pointer-events-none absolute inset-7 sm:inset-11">
          {(["tl","tr","bl","br"] as const).map((p) => (
            <div
              key={p}
              data-intro-bracket
              className={[
                "absolute h-7 w-7 border-white/70 sm:h-9 sm:w-9",
                p === "tl" && "left-0 top-0 border-l-2 border-t-2",
                p === "tr" && "right-0 top-0 border-r-2 border-t-2",
                p === "bl" && "bottom-0 left-0 border-b-2 border-l-2",
                p === "br" && "bottom-0 right-0 border-b-2 border-r-2",
              ].filter(Boolean).join(" ")}
            />
          ))}
        </div>

        {/* ── Top-left: REC + live timecode ────────────────────────── */}
        <div className="pointer-events-none absolute left-10 top-10 sm:left-14 sm:top-14">
          <span
            data-intro-corner
            className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] sm:text-[11px]"
          >
            <span className="relative inline-flex h-2 w-2">
              {/* Outer ring — faster ping */}
              <span
                className="absolute inset-0 rounded-full bg-fire"
                style={{ animation: "recRing 0.75s cubic-bezier(0,0,0.2,1) infinite" }}
              />
              {/* Inner dot — tally-light heartbeat */}
              <span
                className="relative inline-flex h-2 w-2 rounded-full bg-fire"
                style={{ animation: "recPulse 1.4s ease-in-out infinite" }}
              />
            </span>
            <span className="text-fire">REC</span>
            <span ref={recTime} className="tabular-nums text-white/50">
              [TIM 00:00:00]
            </span>
          </span>
        </div>

        {/* ── Top-right: channel / feed ─────────────────────────────── */}
        <div className="pointer-events-none absolute right-10 top-10 sm:right-14 sm:top-14">
          <span
            data-intro-corner
            className="tabular-nums text-[10px] font-semibold uppercase tracking-[0.3em] text-white/55 sm:text-[11px]"
          >
            CH 03 · ID 1400 · FEED [A]
          </span>
        </div>

        {/* ── Centre ident stack ────────────────────────────────────── */}
        <div className="pointer-events-none relative flex h-full w-full flex-col items-center justify-center px-8">

          {/* Wordmark — overflow-hidden creates the mask-reveal effect. */}
          <div className="relative overflow-hidden pb-1.5">
            <h1
              data-intro-mark
              className="font-display leading-[0.85] tracking-tight"
              style={{ fontSize: "clamp(2.75rem, 8vw, 6.75rem)", letterSpacing: "-0.015em" }}
            >
              <span className="text-white">COURT</span>{" "}
              <span className="text-court">HUB</span>
            </h1>
          </div>

          {/* Thin rule — draws across after wordmark lands. */}
          <div
            data-intro-line
            className="mt-10 h-px w-[min(48vw,540px)] origin-center bg-white/25"
          />

          {/* Tagline */}
          <p
            ref={tagline}
            data-intro-tagline
            className="mt-7 text-center text-[11px] font-semibold uppercase tracking-[0.44em] text-white/60 sm:text-[12px]"
          >
            Connecting to Broadcast Feed
          </p>

          {/* Progress bar row */}
          <div
            data-intro-progress-row
            className="mt-7 flex w-[min(54vw,580px)] flex-col items-center gap-3"
          >
            {/* Track */}
            <div className="relative h-[10px] w-full overflow-hidden rounded-full bg-white/[0.05]"
                 style={{ boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}>
              {/* Fill */}
              <div
                ref={bar}
                className="absolute inset-y-0 left-0 h-full w-full origin-left rounded-full bg-lime"
                style={{
                  transform: "scaleX(0)",
                  boxShadow:
                    "0 0 16px rgba(200,255,61,0.6), 0 0 40px rgba(200,255,61,0.25)",
                  willChange: "transform, box-shadow",
                }}
              >
                {/* Shimmer sweep — CSS animation so it runs independently of progress */}
                <div
                  className="pointer-events-none absolute inset-y-0 w-[45%] rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.42) 50%, transparent 100%)",
                    animation: "barShimmer 2s ease-in-out infinite",
                  }}
                  aria-hidden
                />
              </div>
            </div>

            {/* Counter */}
            <span
              ref={counter}
              className="tabular-nums text-[11px] font-semibold uppercase tracking-[0.44em] text-white/35 sm:text-[12px]"
            >
              000%
            </span>
          </div>
        </div>

        {/* ── Bottom-left: GPS coordinates ──────────────────────────── */}
        <div className="pointer-events-none absolute bottom-10 left-10 sm:bottom-14 sm:left-14">
          <div
            data-intro-corner
            className="flex flex-col gap-1 text-[10px] font-semibold uppercase leading-tight tracking-[0.3em] sm:text-[11px]"
          >
            <span className="tabular-nums text-white/60">N 25.07° · E 55.14°</span>
            <span className="text-white/35">Dubai · UAE</span>
          </div>
        </div>

        {/* ── Bottom-right: signal status ───────────────────────────── */}
        <div className="pointer-events-none absolute bottom-10 right-10 sm:bottom-14 sm:right-14">
          <span
            data-intro-corner
            className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.3em] sm:text-[11px]"
          >
            <span
              ref={statusSq}
              className="inline-block h-2 w-2 bg-lime"
              style={{ boxShadow: "0 0 8px rgba(200,255,61,0.65)" }}
              aria-hidden
            />
            <span ref={statusEl} className="text-white/60">
              Signal · Acquiring
            </span>
          </span>
        </div>

        {/* ── TV flash overlay ──────────────────────────────────────── */}
        <div
          ref={flash}
          className="pointer-events-none absolute inset-0 bg-white"
          style={{ opacity: 0, willChange: "opacity" }}
          aria-hidden
        />
      </div>
    </div>
  );
}
