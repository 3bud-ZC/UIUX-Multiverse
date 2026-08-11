import { alphaOf, seeded, type FieldRenderer } from "./types";

const TICK = 19;
const SCAN_MS = 190;
const SERIES_MS = 260;
const SERIES_POINTS = 56;

/**
 * VAULT — a reading surface, not a background.
 *
 * The static tick matrix is baked to an offscreen layer once per layout, so the
 * live cost is only the stepping scan column and four series. Time advances in
 * discrete steps here; nothing in this world interpolates.
 */
export function tickMatrix(): FieldRenderer {
  let matrix: HTMLCanvasElement | null = null;
  let matrixAttempted = false;
  let cols = 0;
  let width = 0;
  let height = 0;
  let lastSeries = -1;
  const series: number[][] = [];

  function bake(line: string, dim: string) {
    const layer = document.createElement("canvas");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    layer.width = Math.max(1, Math.floor(width * dpr));
    layer.height = Math.max(1, Math.floor(height * dpr));
    const g = layer.getContext("2d");
    if (!g) return null;
    g.scale(dpr, dpr);

    // The grid is the world's identity, so it is drawn to be read, not sensed.
    for (let x = 0; x < width; x += TICK) {
      const major = Math.round(x / TICK) % 6 === 0;
      if (major) {
        g.fillStyle = alphaOf(line, 0.75);
        g.fillRect(Math.round(x), 0, 1, height);
      }
      g.fillStyle = alphaOf(dim, major ? 0.5 : 0.26);
      for (let y = 0; y < height; y += TICK) {
        g.fillRect(Math.round(x), Math.round(y), 1, major ? 5 : 2);
      }
    }
    return layer;
  }

  function seedSeries() {
    series.length = 0;
    const rand = seeded(0x7a17);
    for (let s = 0; s < 4; s++) {
      const points: number[] = [];
      let v = 0.5;
      for (let i = 0; i < SERIES_POINTS; i++) {
        v = Math.min(0.95, Math.max(0.05, v + (rand() - 0.5) * 0.22));
        points.push(v);
      }
      series.push(points);
    }
  }

  return {
    layout(w, h) {
      width = w;
      height = h;
      cols = Math.ceil(w / TICK);
      matrix = null;
      matrixAttempted = false;
      if (series.length === 0) seedSeries();
    },

    draw({ ctx, w, h, t, colors, alpha, reduced }) {
      ctx.globalAlpha = alpha;

      // `matrixAttempted` separates "not baked yet" from "bake failed" — using
      // the cache itself as the retry flag would re-allocate a full-size
      // offscreen canvas on every frame if the context were ever unavailable.
      if (!matrixAttempted) {
        matrixAttempted = true;
        matrix = bake(colors.line, colors.dim);
      }
      if (matrix) ctx.drawImage(matrix, 0, 0, w, h);

      // Stepping scan column.
      if (!reduced) {
        const scanCol = Math.floor((t * 1000) / SCAN_MS) % Math.max(cols, 1);
        const x = scanCol * TICK;
        ctx.fillStyle = alphaOf(colors.accent, 0.1);
        ctx.fillRect(x - TICK * 1.5, 0, TICK * 3, h);
        ctx.fillStyle = alphaOf(colors.accent, 0.7);
        ctx.fillRect(x, 0, 1, h);
      }

      // Four stepped series pinned to horizontal bands.
      const tick = Math.floor((t * 1000) / SERIES_MS);
      if (!reduced && tick !== lastSeries) {
        lastSeries = tick;
        for (const points of series) {
          const head = points.shift();
          if (head === undefined) continue;
          const tail = points[points.length - 1] ?? 0.5;
          const drift = Math.sin(tick * 0.37 + tail * 9) * 0.16;
          points.push(Math.min(0.95, Math.max(0.05, tail + drift)));
        }
      }

      ctx.lineWidth = 1;
      ctx.lineJoin = "miter";
      series.forEach((points, index) => {
        const bandTop = h * (0.14 + index * 0.21);
        const bandHeight = h * 0.12;
        ctx.beginPath();
        ctx.strokeStyle = alphaOf(
          index === 1 ? colors.accent : colors.accentAlt,
          index === 1 ? 0.5 : 0.28,
        );
        points.forEach((value, i) => {
          const x = (i / (SERIES_POINTS - 1)) * w;
          const y = bandTop + bandHeight * (1 - value);
          if (i === 0) ctx.moveTo(x, y);
          else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
    },
  };
}
