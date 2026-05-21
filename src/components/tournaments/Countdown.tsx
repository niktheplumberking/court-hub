"use client";

import { useMemo, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

const SERVER_SNAPSHOT = "0|0|0|0";

function partsFor(targetMs: number): Parts {
  const now = Date.now();
  const delta = Math.max(0, targetMs - now);
  const days = Math.floor(delta / 86_400_000);
  const hours = Math.floor((delta % 86_400_000) / 3_600_000);
  const minutes = Math.floor((delta % 3_600_000) / 60_000);
  const seconds = Math.floor((delta % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

function snapshotFor(targetMs: number): string {
  const p = partsFor(targetMs);
  return `${p.days}|${p.hours}|${p.minutes}|${p.seconds}`;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const id = window.setInterval(callback, 1000);
  return () => window.clearInterval(id);
}

const pad = (n: number) => n.toString().padStart(2, "0");

type Props = { targetIso: string };

/**
 * Countdown — flip-style timer driven by useSyncExternalStore so React 19
 * can hydrate cleanly without synchronous setState inside an effect.
 *
 * SSR returns SERVER_SNAPSHOT ("0|0|0|0") so the markup matches between
 * server and client. After hydration, useSyncExternalStore swaps to the
 * live snapshot and the timer ticks once per second.
 */
export function Countdown({ targetIso }: Props) {
  const targetMs = useMemo(
    () => new Date(targetIso).getTime(),
    [targetIso],
  );

  const snapshot = useSyncExternalStore(
    subscribe,
    () => snapshotFor(targetMs),
    () => SERVER_SNAPSHOT,
  );

  const [days, hours, minutes, seconds] = snapshot.split("|").map(Number);

  return (
    <div
      className="flex gap-4 tabular-nums sm:gap-6"
      role="timer"
      aria-live="off"
    >
      <Cell value={days.toString()} label="DAYS" />
      <Cell value={pad(hours)} label="HRS" />
      <Cell value={pad(minutes)} label="MIN" />
      <Cell value={pad(seconds)} label="SEC" />
    </div>
  );
}

function Cell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-[1em] overflow-hidden font-display text-5xl leading-none text-white sm:text-7xl">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={value}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {value}
          </motion.div>
        </AnimatePresence>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-fire">
        {label}
      </span>
    </div>
  );
}
