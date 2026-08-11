"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

/**
 * Marks a subtree's `[data-reveal]` elements with `data-in` once they enter the
 * viewport, so a world can choreograph its own entrance in CSS.
 *
 * A technical primitive only: it decides *when*, never *what*. Atelier fades
 * over 1.2s, Signal snaps in 380ms, Object slides on a scroll-linked curve —
 * all from the same signal. Under reduced motion every element is marked
 * immediately, which leaves the still composition complete.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");

    if (reduced) {
      for (const el of targets) el.dataset.in = "";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = "";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return ref;
}
