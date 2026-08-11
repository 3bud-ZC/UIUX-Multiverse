export interface FieldColors {
  base: string;
  raise: string;
  ink: string;
  dim: string;
  line: string;
  accent: string;
  accentAlt: string;
}

export interface FieldFrame {
  ctx: CanvasRenderingContext2D;
  /** Logical (CSS px) size — the context is already DPR-scaled. */
  w: number;
  h: number;
  /** Seconds since the field started. */
  t: number;
  /** Seconds since the previous frame, clamped to avoid tab-switch jumps. */
  dt: number;
  /** Eased pointer position in -0.5…0.5, settling to 0 when the pointer idles. */
  px: number;
  py: number;
  colors: FieldColors;
  /**
   * Numeric parameters the mounting world feeds its own renderer — a tempo, a
   * depth, a sector index. Shared plumbing, world-specific meaning: a renderer
   * names the keys it reads and supplies its own defaults, and no other world's
   * renderer is affected by what one world sends.
   */
  params: Readonly<Record<string, number>>;
  /** Cross-fade weight while two fields overlap during a world change. */
  alpha: number;
  reduced: boolean;
}

export interface FieldRenderer {
  /**
   * Called on mount and whenever the logical canvas size changes. Renderers
   * that bake an offscreen layer invalidate it here.
   *
   * Note the contract on colours: a renderer instance belongs to exactly one
   * world for its whole life — `AtmosphereCanvas` constructs a new one on every
   * world change — so `frame.colors` is constant across a renderer's frames and
   * may safely be baked into a cached layer.
   */
  layout(w: number, h: number): void;
  draw(frame: FieldFrame): void;
}

/**
 * Deterministic pseudo-random source. Fields must never call `Math.random`:
 * a fixed seed keeps the composition identical across renders, which is also
 * what keeps the server and client markup in agreement.
 */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Cheap layered-sine field. Smooth, periodic, and far cheaper than simplex.
 *
 * The frequencies are low on purpose: neighbouring samples have to agree
 * closely enough that a grid of probes reads as one flow, not as scatter.
 */
export function swirl(x: number, y: number, t: number): number {
  return (
    Math.sin(x * 0.0021 + t * 0.19) * 1.5 +
    Math.cos(y * 0.0029 - t * 0.14) * 1.2 +
    Math.sin((x - y) * 0.0013 + t * 0.08) * 0.9
  );
}

/** Converts `#rrggbb` to `rgba(...)` at the given alpha. */
export function alphaOf(hex: string, a: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
