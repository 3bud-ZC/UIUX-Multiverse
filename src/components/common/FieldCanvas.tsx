"use client";

import { useEffect, useRef } from "react";
import { createField, type FieldColors, type FieldKind } from "@/lib/fields";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { pointerStore, trackPointer } from "@/lib/pointerStore";

const MAX_DPR = 2;
const MAX_FRAME = 1 / 30;

/**
 * A canvas that hosts exactly one field renderer.
 *
 * This is a shared *technical* primitive — one DPR-correct context, one
 * animation frame loop, parked when the tab is hidden or when motion is
 * reduced — and nothing more. It contributes no visual language: the renderer,
 * the colours and the element's placement all belong to the world that mounts
 * it. That is the line this project draws between shared engineering and a
 * shared look.
 */
const NO_PARAMS: Readonly<Record<string, number>> = {};

export function FieldCanvas({
  kind,
  colors,
  className,
  /** Damping for the eased pointer. Higher settles faster. */
  follow = 4.5,
  /**
   * Numeric parameters for this renderer. Read through a ref inside the frame
   * loop, so a world can change a tempo or a depth without tearing down the
   * canvas or re-rendering per frame.
   */
  params = NO_PARAMS,
}: {
  kind: FieldKind;
  colors: FieldColors;
  className?: string;
  follow?: number;
  params?: Readonly<Record<string, number>>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const colorRef = useRef(colors);
  colorRef.current = colors;
  const paramRef = useRef(params);
  paramRef.current = params;

  useEffect(() => trackPointer(), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const renderer = createField(kind);
    const ease = { x: 0.5, y: 0.5 };
    const size = { w: 0, h: 0 };
    let raf = 0;
    let start = performance.now();
    let previous = start;
    let running = true;
    let redraw = true;

    const applySize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (w === size.w && h === size.h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size.w = w;
      size.h = h;
      renderer.layout(w, h);
      redraw = true;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const t = (now - start) / 1000;
      const dt = Math.min((now - previous) / 1000, MAX_FRAME);
      previous = now;

      // Reduced motion draws one composed still frame, then parks the loop.
      const mustDraw = redraw;
      redraw = false;
      if (reduced && !mustDraw) {
        cancelAnimationFrame(raf);
        running = false;
        return;
      }

      const targetX = pointerStore.present ? pointerStore.nx : 0.5;
      const targetY = pointerStore.present ? pointerStore.ny : 0.5;
      const k = 1 - Math.exp(-dt * follow);
      ease.x += (targetX - ease.x) * k;
      ease.y += (targetY - ease.y) * k;

      ctx.clearRect(0, 0, size.w, size.h);
      ctx.save();
      renderer.draw({
        ctx,
        w: size.w,
        h: size.h,
        t,
        dt,
        px: reduced ? 0 : ease.x - 0.5,
        py: reduced ? 0 : ease.y - 0.5,
        colors: colorRef.current,
        params: paramRef.current,
        alpha: 1,
        reduced,
      });
      ctx.restore();
    };

    const restart = () => {
      if (running) return;
      running = true;
      previous = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const observer = new ResizeObserver(() => {
      applySize();
      restart();
    });
    observer.observe(canvas);
    applySize();

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        running = false;
      } else {
        start = performance.now() - (previous - start);
        redraw = true;
        restart();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [kind, reduced, follow]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
