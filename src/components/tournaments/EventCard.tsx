"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { TournamentEvent } from "@/lib/events";
import { formatEventDate } from "@/lib/events";

type Props = { event: TournamentEvent };

export function EventCard({ event }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex h-[400px] w-[300px] flex-shrink-0 flex-col justify-end overflow-hidden rounded-3xl bg-ink sm:h-[460px] sm:w-[340px]"
    >
      {event.image && (
        <Image
          src={event.image}
          alt=""
          fill
          sizes="340px"
          className="object-cover opacity-70 transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-transparent" />
      <div className="relative flex flex-col gap-2 p-7">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-fire">
          {formatEventDate(event.date)} · {event.location}
        </span>
        <h3 className="font-display text-2xl leading-tight sm:text-3xl">
          {event.name}
        </h3>
        {event.winner && (
          <p className="mt-1 text-sm text-white/60">
            Winners · <span className="text-white">{event.winner}</span>
          </p>
        )}
      </div>
    </motion.article>
  );
}
