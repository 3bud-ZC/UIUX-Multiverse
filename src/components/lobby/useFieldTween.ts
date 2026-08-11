"use client";

import { useEffect, useRef } from "react";
import type { FieldColors } from "@/lib/fields";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

type Rgb = [number, number, number];

const KEYS = ["base", "raise", "ink", "dim", "line", "accent", "accentAlt"] as const;

function toRgb(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: Rgb): string {
  return `#${((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b))
    .toString(16)
    .slice(1)}`;
}

/**
 * Eases one palette into another *outside* React.
 *
 * The lobby's atmosphere has to change colour when a world is held, and it has
 * to do it on the same curve as the CSS takeover — a hard swap reads as a bug.
 * Tweening in state would re-render the whole wall sixty times a second, so the
 * returned object is stable and **mutated in place**: `FieldCanvas` re-reads it
 * inside its own frame loop, and nothing above it renders at all.
 */
export function useFieldTween(target: FieldColors, ms = 620): FieldColors {
  const live = useRef<FieldColors>({ ...target });
  const from = useRef<Record<string, Rgb>>({});
  const to = useRef<Record<string, Rgb>>({});
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      Object.assign(live.current, target);
      return;
    }

    for (const key of KEYS) {
      from.current[key] = toRgb(live.current[key]);
      to.current[key] = toRgb(target[key]);
    }

    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      // Same curve the CSS takeover uses, so light and ground arrive together.
      const e = 1 - Math.pow(1 - p, 3);
      for (const key of KEYS) {
        const a = from.current[key];
        const b = to.current[key];
        live.current[key] = toHex([
          a[0] + (b[0] - a[0]) * e,
          a[1] + (b[1] - a[1]) * e,
          a[2] + (b[2] - a[2]) * e,
        ]);
      }
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, reduced]);

  return live.current;
}
