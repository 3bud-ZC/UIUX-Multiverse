import { alphaOf, swirl, type FieldRenderer } from "./types";

const CELL = 34;
const POINTER_RADIUS = 300;
const AMBIENT_RADIUS = 380;
/**
 * Lit probes are grouped into a handful of brightness steps so the whole lit
 * layer costs a few stroked paths instead of one path, one colour string and
 * one draw call per probe. At this cell size several hundred probes are lit at
 * once, which made the per-probe version the most expensive thing on the page.
 */
const LIT_BUCKETS = 5;

/**
 * NOVA — a vector field read by an instrument.
 *
 * Every cell holds a probe whose heading is sampled from a slow analytic field.
 * The pointer acts as an attractor: probes inside its radius swing toward it and
 * light up, so the atmosphere reads as a system responding to attention.
 *
 * The world can also name a **sink** — `params.cx`, `params.cy` in 0…1, with
 * `params.converge` for its strength. Probes near it turn to face it and go out
 * as they arrive, which is the field saying the one thing Nova's product says:
 * scattered signal is being resolved into a single decision. Nova points it at
 * the grounding ledger in the hero, so the background is not a texture behind
 * the claim — it is the claim.
 */
export function vectorFlow(): FieldRenderer {
  let cols = 0;
  let rows = 0;
  let offsetX = 0;
  let offsetY = 0;
  // Reused across frames: the loop allocates nothing.
  const buckets: Path2D[] = [];
  const scans = [
    { y: 0.18, speed: 0.055, phase: 0 },
    { y: 0.62, speed: 0.037, phase: 0.45 },
  ];

  return {
    layout(w, h) {
      cols = Math.ceil(w / CELL) + 1;
      rows = Math.ceil(h / CELL) + 1;
      offsetX = (w - (cols - 1) * CELL) / 2;
      offsetY = (h - (rows - 1) * CELL) / 2;
    },

    draw({ ctx, w, h, t, px, py, colors, params, alpha, reduced }) {
      const pointerX = (px + 0.5) * w;
      const pointerY = (py + 0.5) * h;
      const time = reduced ? 0 : t;

      /* The sink. Off by default, so every other consumer is unaffected. */
      const converge = params.converge ?? 0;
      const sinkX = (params.cx ?? 0.5) * w;
      const sinkY = (params.cy ?? 0.5) * h;
      const sinkRadius = Math.max(w, h) * 0.5;

      // A slow ambient focus keeps the field alive when nobody is pointing at
      // it, so the composition never reads as a static texture.
      const ambientX = w * (0.5 + Math.cos(time * 0.11) * 0.3);
      const ambientY = h * (0.42 + Math.sin(time * 0.083) * 0.26);

      ctx.globalAlpha = alpha;
      ctx.lineCap = "round";

      // Two passes so the whole quiet layer is a single stroke call.
      ctx.beginPath();
      ctx.strokeStyle = alphaOf(colors.line, 0.75);
      ctx.lineWidth = 1;

      buckets.length = 0;
      for (let i = 0; i < LIT_BUCKETS; i++) buckets.push(new Path2D());

      for (let r = 0; r < rows; r++) {
        const y = offsetY + r * CELL;
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * CELL;

          const ax = ambientX - x;
          const ay = ambientY - y;
          const ambientDist = Math.sqrt(ax * ax + ay * ay);
          const ambient =
            ambientDist < AMBIENT_RADIUS ? (1 - ambientDist / AMBIENT_RADIUS) * 0.55 : 0;

          const dx = pointerX - x;
          const dy = pointerY - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pointerPull = dist < POINTER_RADIUS ? 1 - dist / POINTER_RADIUS : 0;
          const pull = Math.max(ambient, pointerPull);

          let angle = swirl(x, y, time);
          if (pointerPull > 0) {
            const toPointer = Math.atan2(dy, dx);
            angle = angle * (1 - pointerPull) + toPointer * pointerPull;
          }

          /* Convergence. Probes turn to face the sink, lengthen on the way in,
             and are cut short as they arrive — the resolution happens *at* the
             ledger rather than behind it. */
          let arriving = 0;
          if (converge > 0) {
            const sx = sinkX - x;
            const sy = sinkY - y;
            const sd = Math.sqrt(sx * sx + sy * sy);
            if (sd < sinkRadius) {
              const grip = (1 - sd / sinkRadius) * converge;
              angle = angle * (1 - grip) + Math.atan2(sy, sx) * grip;
              arriving = Math.max(0, 1 - sd / (sinkRadius * 0.34));
            }
          }

          const len = (12 + pull * 14 + converge * 6) * (1 - arriving * 0.85);
          if (len < 1.5) continue;
          const hx = Math.cos(angle) * len * 0.5;
          const hy = Math.sin(angle) * len * 0.5;

          if (pull > 0.06) {
            const bucket =
              buckets[Math.min(LIT_BUCKETS - 1, Math.floor(pull * LIT_BUCKETS))];
            bucket?.moveTo(x - hx, y - hy);
            bucket?.lineTo(x + hx, y + hy);
            continue;
          }
          ctx.moveTo(x - hx, y - hy);
          ctx.lineTo(x + hx, y + hy);
        }
      }
      ctx.stroke();

      // Lit probes: brighter, thicker, drawn over the quiet layer — one stroke
      // per brightness step rather than one per probe.
      ctx.lineWidth = 1.4;
      buckets.forEach((path, index) => {
        ctx.strokeStyle = alphaOf(colors.accent, 0.1 + ((index + 0.5) / LIT_BUCKETS) * 0.8);
        ctx.stroke(path);
      });

      // Horizontal scan bands — the instrument taking a reading.
      if (!reduced) {
        for (const scan of scans) {
          const y = (((scan.y + t * scan.speed + scan.phase) % 1.25) - 0.125) * h;
          const grad = ctx.createLinearGradient(0, y - 130, 0, y + 130);
          grad.addColorStop(0, alphaOf(colors.accentAlt, 0));
          grad.addColorStop(0.5, alphaOf(colors.accentAlt, 0.22));
          grad.addColorStop(1, alphaOf(colors.accentAlt, 0));
          ctx.fillStyle = grad;
          ctx.fillRect(0, y - 130, w, 260);

          ctx.fillStyle = alphaOf(colors.accent, 0.28);
          ctx.fillRect(0, y, w, 1);
        }
      }

      ctx.globalAlpha = 1;
    },
  };
}
