"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { Container } from "@/components/ui/Container";
import { BRAND } from "@/lib/constants";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const linkCol = [
  {
    heading: "Shop",
    links: [
      { label: "HEAD", href: "#shop" },
      { label: "Wilson", href: "#shop" },
      { label: "Pre-Owned", href: "#shop" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Build a court", href: "#build-a-court" },
      { label: "Tournaments", href: "#tournaments" },
      { label: "About us", href: "#who-we-are" },
    ],
  },
  {
    heading: "Contact",
    links: [
      { label: "WhatsApp", href: BRAND.whatsapp },
      { label: "Email", href: `mailto:${BRAND.email}` },
      { label: "Instagram", href: BRAND.instagram },
      { label: "LinkedIn", href: BRAND.linkedin },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (!wordmarkRef.current) return;
      const h = wordmarkRef.current.querySelector<HTMLHeadingElement>("h2");
      if (!h) return;

      if (prefersReduced) {
        gsap.set(h, { opacity: 1, scale: 1, letterSpacing: "0em" });
        return;
      }

      // Closing wordmark — slow scroll-scrubbed reveal that breathes wider
      // and brightens as it approaches the bottom of the page. Feels like
      // end-credits typography.
      const trigger = ScrollTrigger.create({
        trigger: wordmarkRef.current,
        start: "top 90%",
        end: "bottom bottom",
        scrub: 0.8,
        animation: gsap.fromTo(
          h,
          { opacity: 0.05, scale: 0.94, letterSpacing: "-0.05em" },
          { opacity: 1, scale: 1, letterSpacing: "0em", ease: "none" },
        ),
      });

      return () => trigger.kill();
    },
    { dependencies: [prefersReduced] },
  );

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink pt-20 text-white">
      <Container>
        {/* Closing wordmark — film logo card, scrub-revealed via GSAP */}
        <div
          ref={wordmarkRef}
          className="pointer-events-none mb-16 select-none text-center"
          aria-hidden
        >
          <h2
            className="font-display leading-[0.85] tracking-tight"
            style={{
              fontSize: "clamp(5rem, 22vw, 22rem)",
              color: "transparent",
              WebkitTextStroke: "1px rgba(200,255,61,0.35)",
              willChange: "transform, opacity, letter-spacing",
            }}
          >
            COURT HUB
          </h2>
        </div>

        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-col gap-6"
          >
            <div className="font-display text-3xl leading-none">
              <span className="text-white">COURT</span>{" "}
              <span className="text-lime">HUB</span>
            </div>
            <p className="max-w-sm text-sm text-white/50">
              UAE&apos;s premium padel platform. Equipment, courts, and
              tournaments — all in one place.
            </p>
            <a
              href={BRAND.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-padel px-5 text-sm font-semibold text-ink transition-colors hover:bg-padel/90 min-h-[44px]"
              aria-label="Chat with us on WhatsApp"
            >
              <svg
                aria-hidden
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.825 9.825 0 016.991 2.901 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.889 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </motion.div>

          {linkCol.map((col, i) => (
            <motion.div
              key={col.heading}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                duration: 0.6,
                delay: 0.08 * (i + 1),
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col gap-4"
            >
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-lime">
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 py-8 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Court Hub Group. All rights reserved.</span>
          <span>
            Dubai, UAE · <span className="text-white/60">courthub.ae</span>
          </span>
        </div>
      </Container>
    </footer>
  );
}
