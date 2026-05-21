"use client";

import { useSyncExternalStore } from "react";

const MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(MEDIA_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(MEDIA_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Returns true when the user prefers reduced motion. Backed by
 * useSyncExternalStore so React 19 doesn't flag synchronous setState
 * inside an effect — and so the value is correct on first paint without
 * an extra render cycle.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
