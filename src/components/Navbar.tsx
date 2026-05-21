"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollTrigger } from "@/lib/gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type NavLink = { label: string; href: string; id: string };

const links: NavLink[] = [
  { label: "Shop", href: "#shop", id: "shop" },
  { label: "Courts", href: "#build-a-court", id: "build-a-court" },
  { label: "Tournaments", href: "#tournaments", id: "tournaments" },
];

/**
 * Navbar — floating pill nav.
 *
 * Design decisions (per Court Hub brand brief):
 *   - NOT full-width. A floating pill, centered at the top, glassy.
 *     Edge of the pill never touches the viewport edges so the
 *     hero video has visual breathing room on all sides.
 *   - The pill is darker when scrolled, near-transparent over the hero,
 *     so the first viewport feels uninterrupted.
 *   - Hover state plays with brand colours:
 *       links → text shifts to lime, soft lime backlight underline
 *       CTA   → fire halo, slight scale
 *   - The active link has a sliding lime underline that springs
 *     between targets (Framer's layoutId).
 *   - Mobile burger lives inside its own matching pill on the right,
 *     never disturbing the centered pill.
 *
 * Stack split:
 *   GSAP ScrollTrigger handles scroll-driven state.
 *   Framer Motion handles UI micro-state (mobile menu, layoutId).
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const prefersReduced = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      ScrollTrigger.create({
        start: () => `${Math.min(window.innerHeight * 0.6, 600)} top`,
        end: "max",
        onEnter: () => setScrolled(true),
        onLeaveBack: () => setScrolled(false),
      });

      const sectionTriggers = links
        .map((link) => {
          const el = document.getElementById(link.id);
          if (!el) return null;
          return ScrollTrigger.create({
            trigger: el,
            start: "top 40%",
            end: "bottom 40%",
            onEnter: () => setActive(link.id),
            onEnterBack: () => setActive(link.id),
            onLeave: () => setActive((cur) => (cur === link.id ? null : cur)),
            onLeaveBack: () =>
              setActive((cur) => (cur === link.id ? null : cur)),
          });
        })
        .filter(Boolean) as ScrollTrigger[];

      return () => {
        sectionTriggers.forEach((t) => t.kill());
      };
    },
    {},
  );

  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const pillBaseShell = scrolled
    ? "bg-ink/75 border-white/10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]"
    : "bg-ink/35 border-white/[0.08] shadow-[0_6px_30px_-12px_rgba(0,0,0,0.5)]";

  return (
    <header
      ref={headerRef}
      className="pointer-events-none fixed inset-x-0 top-6 z-50 flex items-start justify-center px-4 sm:top-10"
    >
      {/* ----- Floating centered pill -------------------------------------- */}
      <nav
        aria-label="Primary"
        className={`pointer-events-auto hidden items-stretch overflow-hidden rounded-full border backdrop-blur-2xl transition-[background,border-color,box-shadow] duration-500 lg:inline-flex ${pillBaseShell}`}
      >
        {/* Wordmark slot */}
        <Link
          href="#top"
          className="group flex items-center gap-2 pl-5 pr-5 text-base leading-none tracking-tight"
          aria-label="Court Hub — home"
        >
          <span className="font-display text-white/90 transition-all duration-300 group-hover:text-white group-hover:tracking-wider">
            COURT
          </span>
          <span className="font-display text-lime transition-all duration-300 group-hover:tracking-wider group-hover:[text-shadow:0_0_14px_rgba(184,255,46,0.7)]">
            HUB
          </span>
        </Link>

        {/* Divider */}
        <span aria-hidden className="my-2 w-px bg-white/10" />

        {/* Desktop links */}
        <ul className="flex items-stretch px-2">
          {links.map((l) => {
            const isActive = active === l.id;
            return (
              <li key={l.id} className="relative flex items-stretch">
                <a
                  href={l.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`group relative inline-flex items-center gap-1 px-4 py-3 text-[13px] font-medium tracking-wide transition-all duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {/* Hover background glow */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full bg-white/0 transition-colors duration-300 group-hover:bg-white/[0.06]"
                  />
                  <span className="relative transition-transform duration-300 group-hover:-translate-y-px">
                    {l.label}
                    {/* Lime underline — expands on hover */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -bottom-1 left-0 right-0 h-px origin-left scale-x-0 bg-lime/70 transition-transform duration-300 group-hover:scale-x-100"
                    />
                  </span>
                  {isActive && !prefersReduced && (
                    <motion.span
                      aria-hidden
                      layoutId="nav-pill"
                      className="absolute inset-x-3 bottom-1.5 h-px bg-lime"
                      transition={{
                        type: "spring",
                        stiffness: 360,
                        damping: 30,
                      }}
                    />
                  )}
                  {isActive && prefersReduced && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 bottom-1.5 h-px bg-lime"
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <span aria-hidden className="my-2 w-px bg-white/10" />

        {/* CTA inside the pill */}
        <a
          href="#build-a-court"
          className="group relative my-2 mr-2 inline-flex items-center rounded-full bg-lime px-5 text-[13px] font-semibold text-ink transition-[transform,box-shadow,background-color,letter-spacing] duration-300 hover:scale-[1.03] hover:bg-lime hover:shadow-[0_0_28px_-2px_rgba(184,255,46,0.7),0_0_8px_0px_rgba(184,255,46,0.4)] hover:tracking-wide active:scale-[0.97]"
        >
          <span className="relative flex items-center gap-2">
            Build a court
            <span
              aria-hidden
              className="inline-block translate-x-0 transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </a>
      </nav>

      {/* ----- Mobile pill — logo on left, burger on right (in its own pill) */}
      <nav
        aria-label="Primary (mobile)"
        className={`pointer-events-auto flex w-full max-w-md items-center justify-between rounded-full border px-4 py-2 backdrop-blur-2xl transition-[background,border-color,box-shadow] duration-500 lg:hidden ${pillBaseShell}`}
      >
        <Link
          href="#top"
          className="font-display flex items-center gap-2 text-base leading-none tracking-tight"
          aria-label="Court Hub — home"
        >
          <span className="text-white">COURT</span>
          <span className="text-lime">HUB</span>
        </Link>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10"
        >
          <span className="relative block h-3 w-4">
            <motion.span
              animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-0 block h-px w-full bg-white"
            />
            <motion.span
              animate={open ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-1/2 block h-px w-full -translate-y-1/2 bg-white"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-0 left-0 block h-px w-full bg-white"
            />
          </span>
        </button>
      </nav>

      {/* ----- Mobile drawer ----------------------------------------------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto fixed inset-0 top-0 z-40 bg-ink/95 backdrop-blur-xl lg:hidden"
          >
            <motion.ul
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: {
                  transition: { staggerChildren: 0.04, staggerDirection: -1 },
                },
                show: {
                  transition: { staggerChildren: 0.06, delayChildren: 0.15 },
                },
              }}
              className="flex h-full flex-col gap-2 px-6 pt-24 pb-10"
            >
              {links.map((l) => {
                const isActive = active === l.id;
                return (
                  <motion.li
                    key={l.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                      },
                    }}
                  >
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={`font-display flex items-baseline justify-between border-b border-white/10 py-6 text-5xl leading-none tracking-tight transition-colors ${
                        isActive ? "text-lime" : "text-white"
                      }`}
                    >
                      <span>{l.label}</span>
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
                        0{links.indexOf(l) + 1}
                      </span>
                    </a>
                  </motion.li>
                );
              })}
              <motion.li
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="mt-10"
              >
                <a
                  href="#build-a-court"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-14 min-h-[44px] w-full items-center justify-center rounded-full bg-lime px-6 text-base font-semibold text-ink transition-all hover:bg-lime/90 active:scale-[0.98]"
                >
                  Build a court
                </a>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
