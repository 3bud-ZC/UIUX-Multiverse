import { alphaOf, seeded, type FieldFrame, type FieldRenderer } from "./types";

/**
 * The lobby's atmosphere, and the only field that does not belong to a world.
 *
 * A colonnade of vertical light columns breathing out of phase, over a baked
 * scan texture. It is deliberately meaningless — the lobby is a room, not a
 * site, so its ambience has to be sculptural rather than representational.
 *
 * The one idea it carries is that the lobby has **no hue of its own**. Idle, it
 * is given greys and reads as machined glass; the instant a world is held it is
 * given that world's ink and accent and the whole room changes colour without
 * anything moving. Colour in this project belongs to the worlds, and the lobby
 * borrows it only while you are holding one.
 */
export function lightColumns(): FieldRenderer {
  const COLUMNS = 26;

  let width = 0;
  let height = 0;
  let scan: HTMLCanvasElement | null = null;

  /** Per-column constants — fixed for the life of the field, so the colonnade
   *  keeps its rhythm rather than shimmering randomly. */
  let bars: { u: number; w: number; phase: number; speed: number; depth: number; hot: boolean }[] =
    [];

  // One gradient serves every column: the colour is baked in, the *weight* is
  // globalAlpha. Rebuilt only when the palette or the height actually changes.
  let key = "";
  let inkGrad: CanvasGradient | null = null;
  let hotGrad: CanvasGradient | null = null;

  const buildBars = () => {
    const rand = seeded(0x10bb7);
    bars = Array.from({ length: COLUMNS }, (_, i) => {
      const jitter = (rand() - 0.5) * 0.6;
      return {
        u: (i + 0.5 + jitter) / COLUMNS,
        w: 0.16 + rand() * 0.85,
        phase: rand() * Math.PI * 2,
        speed: 0.11 + rand() * 0.22,
        depth: rand(),
        // A minority of columns take the accent. Under greys they are invisible
        // as a group; under a world they are what makes the room read as tinted.
        hot: rand() > 0.72,
      };
    });
  };

  const bakeScan = () => {
    if (width < 1 || height < 1) return;
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 6;
    const g = c.getContext("2d");
    if (!g) return;
    g.fillStyle = "rgba(255, 255, 255, 0.028)";
    g.fillRect(0, 0, 4, 1);
    scan = c;
  };

  return {
    layout(w, h) {
      width = w;
      height = h;
      key = "";
      if (bars.length === 0) buildBars();
      bakeScan();
    },

    draw({ ctx, w, h, t, px, py, colors, reduced }: FieldFrame) {
      const nextKey = `${colors.ink}|${colors.accent}|${Math.round(h)}`;
      if (nextKey !== key) {
        key = nextKey;
        const make = (hex: string, peak: number) => {
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, alphaOf(hex, 0));
          g.addColorStop(0.22, alphaOf(hex, peak * 0.5));
          g.addColorStop(0.55, alphaOf(hex, peak));
          g.addColorStop(0.86, alphaOf(hex, peak * 0.34));
          g.addColorStop(1, alphaOf(hex, 0));
          return g;
        };
        inkGrad = make(colors.ink, 0.2);
        hotGrad = make(colors.accent, 0.32);
      }

      // The colonnade. Deep columns drift less than near ones, so the pointer
      // reads as parallax through a space rather than as a slide.
      const time = reduced ? 4.2 : t;
      for (const bar of bars) {
        const swing = Math.sin(time * bar.speed + bar.phase);
        const breathe = 0.34 + 0.66 * (0.5 + 0.5 * Math.sin(time * bar.speed * 1.7 + bar.phase));
        const drift = px * (18 + bar.depth * 96);
        const x = bar.u * w + drift;
        const bw = bar.w * (w / COLUMNS) * (0.7 + 0.5 * bar.depth);
        const lift = py * (10 + bar.depth * 40) + swing * 8;

        ctx.globalAlpha = breathe * (0.35 + bar.depth * 0.65);
        ctx.fillStyle = (bar.hot ? hotGrad : inkGrad) ?? colors.ink;
        ctx.fillRect(x - bw / 2, lift - h * 0.06, bw, h * 1.12);
      }
      ctx.globalAlpha = 1;

      // One soft bloom under the pointer, so the room has a light source.
      const bx = w * (0.5 + px * 0.9);
      const by = h * (0.5 + py * 0.7);
      const r = Math.max(w, h) * 0.52;
      const bloom = ctx.createRadialGradient(bx, by, 0, bx, by, r);
      bloom.addColorStop(0, alphaOf(colors.accent, 0.13));
      bloom.addColorStop(0.45, alphaOf(colors.accentAlt, 0.05));
      bloom.addColorStop(1, alphaOf(colors.accentAlt, 0));
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);

      if (scan) {
        const pattern = ctx.createPattern(scan, "repeat");
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, w, h);
        }
      }
    },
  };
}
