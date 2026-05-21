"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SectionHeadline } from "@/components/ui/SectionHeadline";
import { Button } from "@/components/ui/Button";
import { Countdown } from "@/components/tournaments/Countdown";
import { EventCard } from "@/components/tournaments/EventCard";
import { ScrollReveal3D } from "@/components/ScrollReveal3D";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  pastEvents,
  upcomingEvent,
  formatEventDate,
} from "@/lib/events";

export function Tournaments() {
  const prefersReduced = useReducedMotion();
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="tournaments"
      className="relative overflow-hidden bg-ink py-32 sm:py-40 lg:py-48"
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-fire)/15%,transparent_60%)]"
        animate={
          prefersReduced
            ? undefined
            : { opacity: [0.6, 1, 0.6] }
        }
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <Container className="relative">
        <ScrollReveal3D>
          <div className="flex flex-col gap-8">
            <SectionLabel accent="fire">Tournaments</SectionLabel>
            <SectionHeadline className="font-display max-w-4xl text-[10vw] leading-[0.95] tracking-tight sm:text-[7vw] lg:text-[5vw]">
              The biggest padel night{" "}
              <span className="text-fire">in the Gulf.</span>
            </SectionHeadline>
          </div>
        </ScrollReveal3D>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1] as const,
            }}
            className="rounded-3xl border border-fire/25 bg-gradient-to-br from-fire/15 via-ink to-ink p-8 sm:p-10"
          >
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-fire">
                Next up · {formatEventDate(upcomingEvent.date)}
              </span>
              <h3 className="font-display text-4xl leading-tight sm:text-5xl">
                {upcomingEvent.name}
              </h3>
              <p className="text-sm text-white/60">{upcomingEvent.location}</p>
            </div>
            <div className="mt-10">
              <Countdown targetIso={upcomingEvent.date} />
            </div>
            <div className="mt-10">
              <Button variant="lime" size="lg">
                Register your team
              </Button>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{
              duration: 0.7,
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-base text-white/60 sm:text-lg"
          >
            We stage the events that matter — pro circuit qualifiers, amateur
            ladders, and once-a-year showpieces. Floodlit. Streamed. Stadium
            energy from first serve to match point.
          </motion.p>
        </div>

        <div className="mt-24">
          <motion.h4
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40"
          >
            Past finals · drag to explore
          </motion.h4>

          <div
            ref={carouselRef}
            className="mt-6 cursor-grab overflow-hidden active:cursor-grabbing"
          >
            <motion.div
              ref={trackRef}
              drag={prefersReduced ? false : "x"}
              dragConstraints={carouselRef}
              dragElastic={0.08}
              className="flex gap-5 pb-6 sm:gap-6"
            >
              {pastEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
