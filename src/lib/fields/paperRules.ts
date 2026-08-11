import { alphaOf, seeded, type FieldRenderer } from "./types";

const COLUMNS = 6;
const GRAIN_TILE = 220;

/**
 * ATELIER — almost nothing, executed precisely.
 *
 * A six-column measure drawn as hairlines, three rules drifting at unrelated
 * speeds, and a grain tile baked once at layout. The restraint is the point:
 * this field is the quietest in the multiverse and must never compete with the
 * type sitting on top of it.
 */
export function paperRules(): FieldRenderer {
  let grain: HTMLCanvasElement | null = null;
  let grainPattern: CanvasPattern | null = null;
  let grainAttempted = false;
  const rules = [
    { y: 0.27, speed: 0.014, width: 0.42 },
    { y: 0.55, speed: -0.009, width: 0.66 },
    { y: 0.81, speed: 0.02, width: 0.3 },
  ];

  function bakeGrain(ink: string) {
    const tile = document.createElement("canvas");
    tile.width = GRAIN_TILE;
    tile.height = GRAIN_TILE;
    const g = tile.getContext("2d");
    if (!g) return null;
    const rand = seeded(0x5eed);
    g.fillStyle = alphaOf(ink, 0.05);
    for (let i = 0; i < 2600; i++) {
      g.fillRect(rand() * GRAIN_TILE, rand() * GRAIN_TILE, 1, 1);
    }
    return tile;
  }

  return {
    layout() {
      // Rebuilt lazily on the next draw, where colours are known.
      grain = null;
      grainPattern = null;
      grainAttempted = false;
    },

    draw({ ctx, w, h, t, px, colors, alpha, reduced }) {
      ctx.globalAlpha = alpha;

      // Column measure.
      ctx.strokeStyle = alphaOf(colors.line, 0.85);
      ctx.lineWidth = 1;
      ctx.beginPath();
      const margin = Math.min(w * 0.08, 132);
      const inner = w - margin * 2;
      for (let i = 0; i <= COLUMNS; i++) {
        const x = Math.round(margin + (inner / COLUMNS) * i) + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      ctx.stroke();

      // Drifting rules. The pointer nudges them a few pixels — no more.
      const drift = reduced ? 0 : t;
      for (const rule of rules) {
        const y = Math.round(rule.y * h + Math.sin(drift * rule.speed * 6) * 14) + 0.5;
        const span = rule.width * w;
        const x0 = ((drift * rule.speed * 90 + rule.y * 400) % (w + span)) - span + px * 26;
        const grad = ctx.createLinearGradient(x0, 0, x0 + span, 0);
        grad.addColorStop(0, alphaOf(colors.ink, 0));
        grad.addColorStop(0.5, alphaOf(colors.ink, 0.24));
        grad.addColorStop(1, alphaOf(colors.ink, 0));
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x0 + span, y);
        ctx.stroke();
      }

      // Baked once and the pattern cached with it. `grainAttempted` separates
      // "not built yet" from "cannot be built", so a failed bake degrades to a
      // plain surface instead of retrying every frame.
      if (!grainAttempted) {
        grainAttempted = true;
        grain = bakeGrain(colors.ink);
        grainPattern = grain ? ctx.createPattern(grain, "repeat") : null;
      }
      if (grainPattern) {
        ctx.fillStyle = grainPattern;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.globalAlpha = 1;
    },
  };
}
