"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * SmoothScroll — site-wide Lenis smooth scrolling, wired through gsap.ticker
 * so every ScrollTrigger pin, scrub, and onUpdate stays perfectly in sync
 * with the smoothed scroll position.
 *
 * Wiring (the official GreenSock pattern):
 *
 *   1. lenis.on("scroll", ScrollTrigger.update)
 *        Every time Lenis emits a new (smoothed) scroll value, give
 *        ScrollTrigger a chance to recompute pins, scrubs, progress, etc.
 *
 *   2. gsap.ticker.add(time => lenis.raf(time * 1000))
 *        Run Lenis's RAF on the same clock as GSAP. One ticker, one
 *        truth — no double-frame jitter.
 *
 *   3. gsap.ticker.lagSmoothing(0)
 *        Disable GSAP's catch-up logic; with scroll-driven scrubs, lag
 *        smoothing causes the playhead to jump after a tab regains
 *        focus / off-screen pauses.
 *
 * Honours prefers-reduced-motion (Lenis runs in "instant" mode).
 *
 * Sits ABOVE Hero in the tree but does NOT render any DOM — it is purely
 * a side-effect provider on the window scroller.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Lenis tuning. These are the values that give the Court Hub site
    // that "weighted glide" feel without overshooting or feeling laggy.
    //
    //   duration       Seconds Lenis takes to ease into a new target.
    //                  ~1.05–1.2 reads as luxe; <0.8 feels brittle.
    //   easing         Custom cubic — long tail, slow settle. Matches the
    //                  hero's "drone glide" cadence.
    //   wheelMultiplier  Slightly above 1 so a normal trackpad swipe still
    //                  covers ground; below 1 makes the page feel sticky.
    //   touchMultiplier Higher on mobile because finger swipes are short.
    //   smoothWheel    true → wheel events are smoothed (the whole point).
    //   syncTouch      true → touch swipes also flow through Lenis (no
    //                  native bounce-snap on iOS), keeping the experience
    //                  cohesive across input devices.
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      wheelMultiplier: 1.05,
      touchMultiplier: 1.6,
      smoothWheel: !reduce,
      syncTouch: !reduce,
    });

    // Bridge Lenis → ScrollTrigger.
    lenis.on("scroll", ScrollTrigger.update);

    // Bridge Lenis → gsap.ticker (one shared RAF).
    const tickerCb = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    // Some browsers restore native scroll on load; Lenis owns it now.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // After the wiring is in place, recompute every ScrollTrigger so its
    // start/end positions are measured against the Lenis-smoothed scroller.
    ScrollTrigger.refresh();

    // Expose for debug + cross-component scrollTo (e.g. nav links).
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return null;
}
