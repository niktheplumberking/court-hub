"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Hero — Court Hub scroll-driven opener with full forward/reverse video
 * control, velocity-boosted playback, and a cinematic field-zoom at the end.
 *
 * Architecture:
 *
 *   1. The full 10.04 s original clip is re-encoded with every frame as
 *      a keyframe (scripts/encode-hero-video.mjs). Any seek is instant.
 *      The field-zoom fires only after the last frame has been reached.
 *
 *   2. video.currentTime is driven by a per-frame gsap.ticker using a
 *      two-phase state machine:
 *
 *      PHASE "video"
 *        - Playhead advances in lastDirection at speedMultiplier (1.25×
 *          while scrolling, decays to 1.0× when idle). Never parks.
 *        - Chrome (timecode + brackets) fades out near the clip end.
 *        - Orange "COURT HUB" text fades in at the last frame.
 *        - Transitions to phase "zoom" once playhead ≥ duration.
 *
 *      PHASE "zoom"
 *        - Scroll band 0.78–1.00 maps to zoomTarget 0–1 (via onUpdate).
 *        - zoomT chases zoomTarget at speedMultiplier pace.
 *        - Field zoom: video scale 1 → 2.6 (transformOrigin 50% 65%).
 *        - Blue overlay fades in alongside; orange text scales up.
 *        - Transitions back to "video" when user scrolls back to 0.
 *
 *      KEY RULE: zoom never starts until the full clip has played.
 *
 *   3. End state: field zoomed in, COURT HUB overlay visible. The
 *      section-transition work (blanket → WhoWeAre) is deferred.
 *
 * Mobile / Desktop:
 *   Two <source> elements. Mobile gets a 5 MB cut at 960x960; desktop
 *   gets the 13 MB master at 1600x1600. Browser picks via media query.
 *
 * Smooth scroll:
 *   Lenis runs on the page (components/SmoothScroll.tsx) and is wired
 *   into gsap.ticker. ScrollTrigger sees the smoothed scroll value;
 *   the ticker and the scrub stay perfectly in sync.
 *
 * Reduced motion:
 *   Ticker + ScrollTrigger pin are skipped. Video stays on frame 0,
 *   blue and blanket stay hidden. Page scrolls naturally.
 */

const FALLBACK_DURATION = 10.04;

/**
 * Playback model tuning.
 *
 *   BOOST_MULTIPLIER     Speed multiplier while actively scrolling.
 *   BASELINE_MULTIPLIER  Speed multiplier when scroll has stopped.
 *                        The video decays to this and keeps playing —
 *                        it NEVER parks at a scroll-position checkpoint.
 *   ACTIVE_WINDOW_MS     ms of scroll silence before "idle" mode kicks in.
 *   ATTACK_TAU_S / DECAY_TAU_S
 *                        Exponential time constants for ramping up/down.
 *
 *   ZOOM_START           Scroll progress at which chrome fades and the
 *                        field-zoom begins. Guaranteed to be reached
 *                        only after the video has run to completion at
 *                        typical scroll speeds.
 *   BLANKET_START        Scroll progress at which the blanket begins
 *                        to rise. Must be > ZOOM_START + zoom duration
 *                        so the two phases never visually overlap.
 */
const BOOST_MULTIPLIER = 1.25;
const BASELINE_MULTIPLIER = 1.0;
const ACTIVE_WINDOW_MS = 90;
const ATTACK_TAU_S = 0.08;
// Slower decay so the cinematic slow-down lingers visibly after the
// user lifts their finger off the scroll wheel.
const DECAY_TAU_S = 0.8;

// ─── Phase scroll-progress boundaries ────────────────────────────────────────
//
// Container: 600 vh.  At ~187 px per scroll notch (Lenis 1.05×):
//
//  Band                  Start   End    vh    ≈ scrolls
//  ─────────────────────────────────────────────────────
//  Video scrub           0.000  0.700   420    ~20
//  Pause on last frame   0.700  0.833    80     ~4
//  WhoWeAre rises        0.833  1.000   100     ~5  (natural scroll flow)
//  ─────────────────────────────────────────────────────
//  Total                                600 vh  ~29 scrolls
//
// WhoWeAre enters the viewport bottom naturally at progress 0.833
// (= (600-100)/600 vh). No animation required — it rises via normal scroll.
// The hero video blurs when WhoWeAre has covered 70 % of the viewport.
//
const ZOOM_START     = 0.700;  // video scrub ends; view locks on last frame
// WhoWeAre enters viewport bottom at (600-100)/600 ≈ 0.833 — computed inline.

type HeroState = {
  duration: number;
  scrollProgress: number;
  lastScrollMoveAt: number;
  hasInteracted: boolean;
  lastDirection: 1 | -1;
  speedMultiplier: number;
  /** Video playhead in seconds — source of truth for currentTime + progress bar. */
  playhead: number;
  /**
   * One-way gate. Becomes true the first time the playhead reaches the end
   * of the clip while scrollProgress >= ZOOM_START. Prevents the zoom firing
   * before the video genuinely finishes. Resets if the user scrolls well back
   * into the video zone.
   */
  videoComplete: boolean;
};

export function Hero() {
  const container = useRef<HTMLDivElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const timecode = useRef<HTMLDivElement>(null);
  const blanket = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const [videoErrored, setVideoErrored] = useState(false);

  // Persistent state shared between ScrollTrigger onUpdate and the
  // per-frame video ticker. Stored in a ref so we don't trigger
  // re-renders on every scroll tick.
  const state = useRef<HeroState>({
    duration: FALLBACK_DURATION,
    scrollProgress: 0,
    lastScrollMoveAt: 0,
    hasInteracted: false,
    lastDirection: 1,
    speedMultiplier: BASELINE_MULTIPLIER,
    playhead: 0,
    videoComplete: false,
  });

  useGSAP(
    () => {
      const c = container.current;
      const p = pinned.current;
      const v = video.current;
      if (!c || !p) return;

      if (prefersReduced) {
        if (v) v.currentTime = 0;
        return;
      }

      const buildTimeline = (duration: number) => {
        state.current.duration = duration;

        // The timeline is kept intentionally minimal — it only drives the
        // pin and the scroll hint. All animated transitions (chrome fade,
        // field zoom, welcome text) are handled by the videoTicker state
        // machine so they respect the phase hierarchy:
        //
        //   Phase 1 "video"  (entire clip must finish first)
        //   Phase 2 "zoom"   (field zoom + orange text, scroll-driven)
        //
        // The zoom NEVER starts until the video is at its last frame.
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: c,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
            pin: p,
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const s = state.current;
              const cur = self.progress;
              const delta = cur - s.scrollProgress;

              if (Math.abs(delta) > 1e-5) {
                s.lastScrollMoveAt = performance.now();
                s.hasInteracted = true;
                s.lastDirection = delta > 0 ? 1 : -1;
              }

              s.scrollProgress = cur;
            },
          },
        });

        // Scroll hint fades immediately on first scroll.
        if (hint.current) {
          tl.to(hint.current, { opacity: 0, duration: 0.05 }, 0);
        }
      };

      // ===== Broadcast-handoff entrance ================================
      //
      // PageIntro dispatches `court-intro-complete` at t=1.2 of its exit
      // timeline — 0.1 s before the curtain fully lifts (t=1.3). The hero
      // is pre-set to scale 1.04 / opacity 0.85 so when the event fires:
      //
      //   • Video:    scale 1.04 → 1.0, opacity 0.85 → 1.0  (0.9 s)
      //   • Brackets: opacity/scale in with stagger           (0.55 s)
      //   • HUD:      hint + timecode strip slide up          (0.6 s)
      //
      // The curtain clears when the animation is 0.1 s in (scale ~1.032).
      // The user watches the remaining ~0.8 s of zoom-out live — fully
      // visible, cinematic, no blink.
      //
      // The "darker and greener" tint comes from BroadcastGlass (z-40)
      // which also listens for this event — no extra overlay needed here.
      gsap.set(v, {
        opacity: 0.85,
        scale: 1.04,
        transformOrigin: "center center",
      });
      gsap.set(
        [hint.current, timecode.current].filter(Boolean),
        { opacity: 0, y: 14 },
      );
      gsap.set("[data-hero-bracket]", { opacity: 0, scale: 0.7 });

      const introReveal = () => {
        const tlReveal = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Video zooms out + brightens — the main cinematic beat.
        if (v) {
          tlReveal.to(
            v,
            { opacity: 1, scale: 1, duration: 0.9, ease: "power2.out" },
            0,
          );
        }

        // Corner brackets snap in.
        tlReveal.to(
          "[data-hero-bracket]",
          { opacity: 1, scale: 1, duration: 0.55, stagger: 0.06, ease: "expo.out" },
          0.15,
        );

        // Bottom HUD strip + scroll hint settle in.
        tlReveal.to(
          [hint.current, timecode.current].filter(Boolean),
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "expo.out" },
          0.25,
        );
      };
      window.addEventListener("court-intro-complete", introReveal, {
        once: true,
      });

      // Subtle parallax on the vignette layer.
      const ambient = gsap.to("[data-hero-vignette]", {
        scale: 1.05,
        ease: "none",
        scrollTrigger: {
          trigger: c,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      // Hint arrow breathing.
      const hintBob = gsap.to(".hint-arrow", {
        y: 6,
        repeat: -1,
        yoyo: true,
        duration: 1.1,
        ease: "sine.inOut",
      });

      // ===== Video ticker — pure-functional 6-band animation ===========
      //
      // All visual outputs are computed directly from scrollProgress every
      // frame so forward AND backward scroll work without a state machine.
      //
      // Bands (progress values defined as constants above):
      //   0.000 → ZOOM_START   : video scrub (lerp-chased playhead)
      //   ZOOM_START → WHITE_START  : field zoom + brightness over-expose
      //   WHITE_START → WELCOME_START : white breathing room (no text)
      //   WELCOME_START → HOLD_START  : WELCOME fog emergence
      //   HOLD_START → BLANKET_START  : WELCOME fully shown, user breathes
      //   BLANKET_START → 1.000       : blanket rises, WELCOME fades first

      let chromeFaded = false;
      let beyondVideo = false; // tracks whether zoom-visuals are currently active
      const TAU_CHASE = 0.25;
      let lastTickAt = performance.now();

      const videoTicker = () => {
        const vv = video.current;
        if (!vv) return;
        const s = state.current;

        const now = performance.now();
        const dt = Math.min(0.1, Math.max(0, (now - lastTickAt) / 1000));
        lastTickAt = now;

        if (!s.hasInteracted) {
          s.playhead = 0;
          s.speedMultiplier = BASELINE_MULTIPLIER;
          return;
        }

        // Speed multiplier (boost while scrolling, cinematic decay when idle)
        const isActive = (now - s.lastScrollMoveAt) < ACTIVE_WINDOW_MS;
        const targetMul = isActive ? BOOST_MULTIPLIER : BASELINE_MULTIPLIER;
        const tau = isActive ? ATTACK_TAU_S : DECAY_TAU_S;
        s.speedMultiplier += (targetMul - s.speedMultiplier) * (1 - Math.exp(-dt / tau));

        // One-way gate: unlock zoom once the clip has truly finished.
        if (!s.videoComplete && s.scrollProgress >= ZOOM_START && s.playhead >= s.duration * 0.999)
          s.videoComplete = true;
        // Reset if user scrolls well back into the video zone.
        if (s.videoComplete && s.scrollProgress < ZOOM_START * 0.70)
          s.videoComplete = false;

        // Effective progress: holds at ZOOM_START border until video is done.
        const sp = s.videoComplete
          ? s.scrollProgress
          : Math.min(s.scrollProgress, ZOOM_START * 0.998);

        // Helper: clamp to [0, 1]
        const cl01 = (x: number) => Math.max(0, Math.min(1, x));

        // ── ZONE A: Video scrub ──────────────────────────────────────────
        if (sp < ZOOM_START) {
          // Scrolled back into video zone — remove the blur from pinned div.
          if (beyondVideo) {
            beyondVideo = false;
            if (p) p.style.filter = "";
            if (blanket.current) blanket.current.style.opacity = "0";
          }

          // Exponential lerp: playhead chases scroll-derived target smoothly.
          const targetTime = cl01(sp / ZOOM_START) * s.duration;
          const diff = targetTime - s.playhead;
          const alpha = 1 - Math.exp((-s.speedMultiplier * dt) / TAU_CHASE);
          s.playhead += diff * alpha;
          if (Math.abs(diff) < 0.003) s.playhead = targetTime;
          s.playhead = Math.max(0, Math.min(s.duration, s.playhead));

          // Chrome (timecode + brackets) fades near the clip end.
          const nearEnd = s.playhead > s.duration * 0.85;
          if (nearEnd && !chromeFaded) {
            chromeFaded = true;
            if (timecode.current) gsap.to(timecode.current, { opacity: 0, y: 8, duration: 0.4 });
            gsap.to("[data-hero-bracket]", { opacity: 0, scale: 0.85, duration: 0.3, stagger: 0.03 });
          } else if (!nearEnd && chromeFaded && s.playhead < s.duration * 0.72) {
            chromeFaded = false;
            if (timecode.current) gsap.to(timecode.current, { opacity: 1, y: 0, duration: 0.4 });
            gsap.to("[data-hero-bracket]", { opacity: 1, scale: 1, duration: 0.3 });
          }

          // Progress filament.
          if (progress.current && s.duration > 0)
            progress.current.style.transform = `scaleX(${cl01(s.playhead / s.duration)})`;

          // Write to video element.
          if (Math.abs(vv.currentTime - s.playhead) > 0.008)
            vv.currentTime = s.playhead;

          return;
        }

        // ── ZONE B: Post-video — pinned on last frame ─────────────────────
        beyondVideo = true;

        // Pin video to its absolute last frame.
        if (Math.abs(vv.currentTime - s.duration) > 0.008) vv.currentTime = s.duration;

        // Suppress scroll hint + pin progress at 100 %.
        if (hint.current) hint.current.style.opacity = "0";
        if (progress.current) progress.current.style.transform = "scaleX(1)";

        // ── Blur the hero as WhoWeAre rises over it ────────────────────────
        // WhoWeAre (positioned immediately after the 600 vh container in the DOM)
        // enters the viewport bottom at progress 0.833 (= 500/600 vh) and reaches
        // the top at progress 1.0. This is pure natural scroll — no animation needed.
        // When 70 % of that 100 vh is covered (blT = 0.70), the portion of the
        // hero still visible begins to blur, creating a depth-of-field wipe.
        const BLANKET_ENTRY = (600 - 100) / 600; // ≈ 0.8333
        const blT = cl01((sp - BLANKET_ENTRY) / (1 - BLANKET_ENTRY));
        const blurPx = blT > 0.7 ? ((blT - 0.7) / 0.3) * 22 : 0;
        if (p) {
          p.style.filter = blurPx > 0 ? `blur(${blurPx.toFixed(1)}px)` : "";
        }
        // Solid ink blanket — kills the court before WhoWeAre takes over.
        if (blanket.current) {
          blanket.current.style.opacity = String(Math.min(1, blT * 1.35));
        }
      };

      gsap.ticker.add(videoTicker);

      // ===== Wait for video duration to be known, then build timeline ==
      let cleanupListener: (() => void) | undefined;
      if (v && v.readyState >= 1 && v.duration && isFinite(v.duration)) {
        buildTimeline(v.duration);
      } else if (v) {
        const onMeta = () =>
          buildTimeline(v.duration || FALLBACK_DURATION);
        v.addEventListener("loadedmetadata", onMeta, { once: true });
        cleanupListener = () =>
          v.removeEventListener("loadedmetadata", onMeta);
        const safety = window.setTimeout(() => {
          if (!v.duration || !isFinite(v.duration)) {
            buildTimeline(FALLBACK_DURATION);
          }
        }, 3000);
        const previous = cleanupListener;
        cleanupListener = () => {
          previous?.();
          window.clearTimeout(safety);
        };
      } else {
        buildTimeline(FALLBACK_DURATION);
      }

      return () => {
        cleanupListener?.();
        ambient.scrollTrigger?.kill();
        hintBob.kill();
        gsap.ticker.remove(videoTicker);
        window.removeEventListener("court-intro-complete", introReveal);
        ScrollTrigger.getAll().forEach((t) => {
          if (t.trigger === c) t.kill();
        });
      };
    },
    { dependencies: [prefersReduced] },
  );

  return (
    <div
      ref={container}
      className="relative"
      style={{ height: "600vh" }}
      data-hero-root
    >
      <div
        ref={pinned}
        className="relative h-screen w-full overflow-hidden bg-ink"
      >
        {/* ----- z-0  Procedural court fallback ------------------------- */}
        <CourtFallback />

        {/* ----- z-10 Video — the cinematic centrepiece ----------------- */}
        {!videoErrored && (
          <video
            ref={video}
            data-hero-video
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            onError={() => setVideoErrored(true)}
            className="absolute inset-0 z-10 h-full w-full object-cover object-center"
            style={{ transformOrigin: "50% 52%", willChange: "transform, opacity, filter" }}
            aria-label="Drone descent across a Dubai padel court at night"
          >
            <source
              src="/videos/hero-court-loop-mobile.mp4?v=7"
              type="video/mp4"
              media="(max-width: 768px)"
            />
            <source src="/videos/hero-court-loop.mp4?v=7" type="video/mp4" />
          </video>
        )}

        {/* ----- z-20 Cinematic vignette + parallax depth --------------- */}
        <div
          data-hero-vignette
          className="absolute inset-0 z-20 will-change-transform"
          style={{
            opacity: 0.9,
            transformOrigin: "center",
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(14,14,12,0.55) 100%), linear-gradient(to top, rgba(14,14,12,0.7), transparent 45%)",
          }}
          aria-hidden
        />

        {/* ----- z-25 Sporty corner brackets — film slate accents ------ */}
        <CornerBrackets />

        {/* ----- z-36 Ink blanket — fades in as WhoWeAre rises --------- */}
        <div
          ref={blanket}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[36] bg-[#080a0e]"
          style={{ opacity: 0 }}
        />

        {/* ----- z-30 Film grain texture ------------------------------- */}
        <div
          className="pointer-events-none absolute inset-0 z-30 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
          aria-hidden
        />

        {/* ----- z-40 Scroll hint --------------------------------------- */}
        <div
          ref={hint}
          className="pointer-events-none absolute bottom-24 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/80 sm:bottom-28"
          style={{ willChange: "opacity" }}
        >
          <span>Scroll to record</span>
          <span className="hint-arrow inline-block">↓</span>
        </div>

        {/* ----- z-40 Timecode header + progress filament --------------- */}
        <div
          ref={timecode}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex flex-col gap-3 px-8 pb-6 sm:px-12 sm:pb-8"
          style={{ willChange: "opacity, transform" }}
        >
          <div className="flex items-end justify-between text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">
            <span className="flex items-center gap-2">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-fire opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-fire" />
              </span>
              Live · Court Hub Arena · Dubai
            </span>
            <span className="tabular-nums">N 25.0780° / E 55.1403°</span>
          </div>
          <div className="relative h-px w-full bg-white/15">
            <div
              ref={progress}
              className="absolute inset-y-0 left-0 h-full w-full origin-left bg-lime"
              style={{
                transform: "scaleX(0)",
                willChange: "transform",
                boxShadow: "0 0 6px 1px rgba(200,255,61,0.55)",
              }}
            />
          </div>
        </div>


      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  CornerBrackets — sporty 4-corner film-slate frame accents.                */
/* -------------------------------------------------------------------------- */

function CornerBrackets() {
  const bracket =
    "absolute h-6 w-6 border-lime/70 sm:h-8 sm:w-8";
  return (
    <div
      className="pointer-events-none absolute inset-6 z-[25] sm:inset-10"
      aria-hidden
    >
      <div
        data-hero-bracket
        className={`${bracket} left-0 top-0 border-l-2 border-t-2`}
      />
      <div
        data-hero-bracket
        className={`${bracket} right-0 top-0 border-r-2 border-t-2`}
      />
      <div
        data-hero-bracket
        className={`${bracket} bottom-0 left-0 border-b-2 border-l-2`}
      />
      <div
        data-hero-bracket
        className={`${bracket} bottom-0 right-0 border-b-2 border-r-2`}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  CourtFallback — procedural night-court rendered in pure CSS.              */
/* -------------------------------------------------------------------------- */

function CourtFallback() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #0A1230 0%, #0A1230 38%, #0E2360 55%, #1E5AE8 75%, #1E5AE8 100%)",
        }}
      />
      <div
        className="absolute left-0 right-0 top-[40%] h-[18%]"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55), transparent), repeating-linear-gradient(90deg, rgba(0,0,0,0.85) 0 12px, transparent 12px 28px, rgba(0,0,0,0.6) 28px 36px, transparent 36px 56px)",
          maskImage: "linear-gradient(to top, black 30%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 30%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[55%]"
        style={{
          background:
            "linear-gradient(to top, #1E5AE8 0%, #1E5AE8 60%, transparent 100%)",
          clipPath: "polygon(8% 100%, 92% 100%, 70% 0%, 30% 0%)",
        }}
      />
      <div
        className="absolute left-1/2 bottom-0 w-[2px] -translate-x-1/2"
        style={{
          height: "55%",
          background:
            "linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0))",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 25% 10%, rgba(255,255,255,0.18), transparent 30%), radial-gradient(ellipse at 75% 10%, rgba(255,255,255,0.18), transparent 30%)",
        }}
      />
    </div>
  );
}
