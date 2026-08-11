import { alphaOf, type FieldRenderer } from "./types";

const SPACING = 58;
const ISO = Math.PI / 6; // 30°, the drafting standard this world is built on
const CYCLE = 7.2;

interface Block {
  u: number;
  v: number;
  size: number;
  height: number;
  travel: number;
}

/** Quart in-out — FORMA's own curve, reused here so the field moves in step. */
function quartInOut(p: number): number {
  return p < 0.5 ? 8 * p * p * p * p : 1 - Math.pow(-2 * p + 2, 4) / 2;
}

/**
 * FORMA — a drawing board.
 *
 * Two 30° line families plus a vertical family give a true axonometric grid.
 * Four masses sit on it and relocate on a slow quart in-out cycle, so the world
 * appears to be redrawn rather than animated.
 */
export function axonometric(): FieldRenderer {
  const blocks: Block[] = [
    { u: -3.5, v: -1, size: 2, height: 2.4, travel: 2 },
    { u: 2.5, v: 1.5, size: 1.5, height: 1.4, travel: -1.5 },
    { u: -0.5, v: 2.5, size: 1, height: 3.2, travel: 1 },
    { u: 4, v: -2, size: 1.25, height: 1, travel: -2.5 },
  ];
  let cx = 0;
  let cy = 0;
  let reach = 0;

  return {
    layout(w, h) {
      cx = w * 0.5;
      cy = h * 0.52;
      reach = Math.hypot(w, h);
    },

    draw({ ctx, w, h, t, px, py, colors, alpha, reduced }) {
      ctx.globalAlpha = alpha;

      const shiftX = px * 22;
      const shiftY = py * 16;
      const crawl = reduced ? 0 : (t * 4) % SPACING;

      ctx.lineWidth = 1;
      ctx.strokeStyle = alphaOf(colors.line, 0.9);

      // Two 30° families.
      for (const dir of [ISO, -ISO]) {
        const nx = -Math.sin(dir);
        const ny = Math.cos(dir);
        const dx = Math.cos(dir) * reach;
        const dy = Math.sin(dir) * reach;
        ctx.beginPath();
        const steps = Math.ceil(reach / SPACING);
        for (let i = -steps; i <= steps; i++) {
          const offset = i * SPACING + crawl;
          const ox = cx + nx * offset + shiftX;
          const oy = cy + ny * offset + shiftY;
          ctx.moveTo(ox - dx, oy - dy);
          ctx.lineTo(ox + dx, oy + dy);
        }
        ctx.stroke();
      }

      // Vertical family, lighter — the third axis.
      ctx.beginPath();
      ctx.strokeStyle = alphaOf(colors.line, 0.45);
      for (let x = -SPACING; x < w + SPACING; x += SPACING) {
        const vx = Math.round(x + shiftX) + 0.5;
        ctx.moveTo(vx, 0);
        ctx.lineTo(vx, h);
      }
      ctx.stroke();

      // Masses.
      const phase = reduced ? 0 : quartInOut((Math.sin((t / CYCLE) * Math.PI * 2) + 1) / 2);
      const unit = SPACING;
      for (const block of blocks) {
        const u = block.u + block.travel * phase;
        const ox = cx + (u - block.v) * Math.cos(ISO) * unit + shiftX;
        const oy = cy + (u + block.v) * Math.sin(ISO) * unit + shiftY;
        const sx = block.size * Math.cos(ISO) * unit;
        const sy = block.size * Math.sin(ISO) * unit;
        const hz = block.height * unit * 0.5;

        const top: [number, number][] = [
          [ox, oy - hz],
          [ox + sx, oy + sy - hz],
          [ox, oy + sy * 2 - hz],
          [ox - sx, oy + sy - hz],
        ];

        ctx.beginPath();
        top.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
        ctx.closePath();
        ctx.fillStyle = alphaOf(colors.accent, 0.14);
        ctx.fill();
        ctx.strokeStyle = alphaOf(colors.ink, 0.5);
        ctx.stroke();

        // Left and right faces, drawn as the extrusion below the top plane.
        ctx.beginPath();
        ctx.moveTo(ox - sx, oy + sy - hz);
        ctx.lineTo(ox, oy + sy * 2 - hz);
        ctx.lineTo(ox, oy + sy * 2 + hz);
        ctx.lineTo(ox - sx, oy + sy + hz);
        ctx.closePath();
        ctx.fillStyle = alphaOf(colors.ink, 0.09);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ox + sx, oy + sy - hz);
        ctx.lineTo(ox, oy + sy * 2 - hz);
        ctx.lineTo(ox, oy + sy * 2 + hz);
        ctx.lineTo(ox + sx, oy + sy + hz);
        ctx.closePath();
        ctx.fillStyle = alphaOf(colors.ink, 0.04);
        ctx.fill();
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    },
  };
}
