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

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.in = "";
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    function observe(targets: Iterable<Element>) {
      for (const el of targets) {
        if (reduced) {
          (el as HTMLElement).dataset.in = "";
        } else {
          io.observe(el);
        }
      }
    }

    // Initial pass
    observe(root.querySelectorAll("[data-reveal]:not([data-in])"));

    // Catch anything mounted later
    const mo = new MutationObserver((mutations) => {
      for (const mut of mutations) {
        for (const node of mut.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const el = node as HTMLElement;
          if (el.matches("[data-reveal]:not([data-in])")) observe([el]);
          observe(el.querySelectorAll("[data-reveal]:not([data-in])"));
        }
      }
    });

    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [reduced]);

  return ref;
}
