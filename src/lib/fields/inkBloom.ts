import { alphaOf, seeded, type FieldFrame, type FieldRenderer } from "./types";

/**
 * Atelier's atmosphere: ink spreading into damp paper, and gold dust over it.
 *
 * Belongs to the poetry world and to nothing else. The blooms drift right to
 * left at reading pace, because that is the direction the page is read in, and
 * they never fully settle — the point is that the ink is still wet.
 */
export function inkBloom(): FieldRenderer {
  const BLOOMS = 7;
  const MOTES = 46;

  let grain: HTMLCanvasElement | null = null;

  let blooms: { u: number; v: number; r: number; phase: number; speed: number; gold: boolean }[] = [];
  let motes: { u: number; v: number; r: number; phase: number; drift: number }[] = [];

  const build = () => {
    const rand = seeded(0x0a7e1);
    blooms = Array.from({ length: BLOOMS }, () => ({
      u: rand(),
      v: rand(),
      r: 0.18 + rand() * 0.34,
      phase: rand() * Math.PI * 2,
      speed: 0.014 + rand() * 0.026,
      gold: rand() > 0.68,
    }));
    motes = Array.from({ length: MOTES }, () => ({
      u: rand(),
      v: rand(),
      r: 0.5 + rand() * 1.5,
      phase: rand() * Math.PI * 2,
      drift: 0.004 + rand() * 0.012,
    }));
  };

  /** Paper tooth, baked once. Without it the blooms read as CSS gradients. */
  const bakeGrain = () => {
    const c = document.createElement("canvas");
    c.width = 96;
    c.height = 96;
    const g = c.getContext("2d");
    if (!g) return;
    const img = g.createImageData(96, 96);
    const rand = seeded(0x51ee7);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = rand();
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
      img.data[i + 3] = n > 0.86 ? 10 : 0;
    }
    g.putImageData(img, 0, 0);
    grain = c;
  };

  return {
    layout() {
      if (blooms.length === 0) build();
      if (!grain) bakeGrain();
    },

    draw({ ctx, w, h, t, px, py, colors, reduced }: FieldFrame) {
      const time = reduced ? 12 : t;
      const span = Math.max(w, h);

      for (const b of blooms) {
        // Right to left, at the pace a line is read rather than at animation pace.
        const x = ((b.u - time * b.speed) % 1.25 + 1.25) % 1.25;
        const cx = (x - 0.12) * w + px * 26;
        const cy = b.v * h + Math.sin(time * b.speed * 2.4 + b.phase) * h * 0.05 + py * 18;
        const r = b.r * span * (0.9 + 0.1 * Math.sin(time * 0.2 + b.phase));

        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        const hue = b.gold ? colors.accent : colors.accentAlt;
        g.addColorStop(0, alphaOf(hue, b.gold ? 0.085 : 0.07));
        g.addColorStop(0.5, alphaOf(hue, 0.028));
        g.addColorStop(1, alphaOf(hue, 0));
        ctx.fillStyle = g;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }

      // Gold dust: motionless under reduced motion, still composed.
      ctx.fillStyle = alphaOf(colors.accent, 0.34);
      for (const m of motes) {
        const y = ((m.v - time * m.drift) % 1.1 + 1.1) % 1.1;
        const cx = m.u * w + Math.sin(time * 0.28 + m.phase) * 14 + px * 40;
        const cy = (y - 0.05) * h;
        ctx.globalAlpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(time * 0.7 + m.phase));
        ctx.beginPath();
        ctx.arc(cx, cy, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (grain) {
        const pattern = ctx.createPattern(grain, "repeat");
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, w, h);
        }
      }
    },
  };
}
