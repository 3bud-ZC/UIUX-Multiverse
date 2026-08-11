import { alphaOf, seeded, type FieldRenderer } from "./types";

/** A real pattern, not noise: kick on 1/5/9/13, off-beats accented. */
const PATTERNS: readonly number[][] = [
  // 0 — floor. Four to the floor with accented off-beats.
  [1, 0, 0.3, 0, 0.55, 0, 0.3, 0.45, 1, 0, 0.3, 0, 0.65, 0.35, 0.45, 0.75],
  // 1 — archive. A slow wahda: one heavy dum, two light taks, and space.
  [1, 0, 0, 0.4, 0, 0, 0.5, 0, 0.7, 0, 0, 0.35, 0, 0.45, 0, 0.25],
  // 2 — session. Sparse, brushed, almost nothing on the grid.
  [0.7, 0, 0, 0, 0.3, 0, 0.22, 0, 0.5, 0, 0, 0.18, 0.3, 0, 0.2, 0],
];
const STEPS = 16;

/**
 * PULSE — the surface is a screen print, and the press runs at the record's tempo.
 *
 * Pulse's whole atmosphere is one halftone lattice. The dot radii ride a slow
 * travelling wave so the field reads as printed tone rather than as particles,
 * and the sequencer only ever does two things to it: it swells the dots on a
 * hit, and on every downbeat it knocks the accent screen out of register by a
 * couple of pixels — the misprint a real four-colour press makes when the
 * cylinder slips. Both are timed from `params.bpm`, which is the tempo of
 * whatever is playing, so changing the record changes the speed of the page.
 *
 * `params.mode` selects the rhythm of the active house: floor, archive, session.
 */
export function halftoneBeat(): FieldRenderer {
  let cols = 0;
  let rows = 0;
  let gap = 34;
  let width = 0;
  let height = 0;
  /** Per-dot phase offset, seeded so the tone is stable across renders. */
  let phase: Float32Array = new Float32Array(0);
  /** Two ink washes, so the ground is never a dead rectangle. */
  let washes: { x: number; y: number; r: number; drift: number }[] = [];

  return {
    layout(w, h) {
      width = w;
      height = h;
      gap = w < 620 ? 26 : 34;
      cols = Math.ceil(w / gap) + 1;
      rows = Math.ceil(h / gap) + 1;
      const random = seeded(0x51de);
      phase = new Float32Array(cols * rows);
      for (let i = 0; i < phase.length; i++) phase[i] = random() * Math.PI * 2;
      washes = [
        { x: w * 0.18, y: h * 0.28, r: Math.max(w, h) * 0.42, drift: 0 },
        { x: w * 0.82, y: h * 0.74, r: Math.max(w, h) * 0.34, drift: Math.PI },
      ];
    },

    draw({ ctx, t, px, py, colors, params, alpha, reduced }) {
      const bpm = params.bpm && params.bpm > 20 ? params.bpm : 112;
      const beat = 60 / bpm;
      const pattern = PATTERNS[Math.round(params.mode ?? 0)] ?? PATTERNS[0]!;

      ctx.globalAlpha = alpha;

      /* Ink washes. Two soft plates of colour, drifting a quarter of a dot
         spacing per beat, so the ground has a light source rather than a glow. */
      for (const wash of washes) {
        const swing = reduced ? 0 : Math.sin(t * 0.11 + wash.drift) * 26;
        const cx = wash.x + swing + px * 46;
        const cy = wash.y + Math.cos(t * 0.09 + wash.drift) * 18 + py * 34;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, wash.r);
        grad.addColorStop(0, alphaOf(wash.drift === 0 ? colors.accent : colors.accentAlt, 0.1));
        grad.addColorStop(0.55, alphaOf(wash.drift === 0 ? colors.accent : colors.accentAlt, 0.03));
        grad.addColorStop(1, alphaOf(colors.base, 0));
        ctx.fillStyle = grad;
        ctx.fillRect(cx - wash.r, cy - wash.r, wash.r * 2, wash.r * 2);
      }

      const step = reduced ? 0 : Math.floor(t / (beat / 4)) % STEPS;
      const intoStep = reduced ? 0.35 : (t % (beat / 4)) / (beat / 4);
      const hit = (pattern[step] ?? 0) * (1 - intoStep * 0.8);
      const onDownbeat = step % 4 === 0;

      /* The lattice. One path per screen; the accent screen is offset on the
         downbeat, which is the only moment the two plates disagree. */
      const inkPath = new Path2D();
      const hotPath = new Path2D();
      const wave = reduced ? 0.42 : 0.5 + hit * 0.5;
      const slip = !reduced && onDownbeat ? 2.4 * (1 - intoStep) : 0;

      for (let row = 0; row < rows; row++) {
        const y = row * gap;
        // Every other row is offset half a spacing: a 60° halftone screen, not a
        // square grid, which is what stops it reading as a table of dots.
        const stagger = (row % 2) * gap * 0.5;
        for (let col = 0; col < cols; col++) {
          const x = col * gap + stagger;
          const i = row * cols + col;
          const travel = reduced
            ? 0
            : Math.sin((x + y) * 0.0042 - t * 1.9 + (phase[i] ?? 0) * 0.35);
          // Tone falls off toward the middle of the frame so type stays readable.
          const centre =
            1 - Math.max(0, 1 - Math.abs(y / height - 0.5) * 2.6) * Math.min(1, width / 900);
          const r = (1.05 + travel * 0.85 + wave * 1.35) * 0.55 * Math.max(0.25, centre);
          if (r < 0.2) continue;
          if ((col + row) % 3 === 0) {
            hotPath.moveTo(x + slip + r, y);
            hotPath.arc(x + slip, y, r, 0, Math.PI * 2);
          } else {
            inkPath.moveTo(x + r, y);
            inkPath.arc(x, y, r, 0, Math.PI * 2);
          }
        }
      }

      ctx.fillStyle = alphaOf(colors.dim, 0.3);
      ctx.fill(inkPath);
      ctx.fillStyle = alphaOf(colors.accent, 0.42);
      ctx.fill(hotPath);

      /* The kick, read off the floor: one arc leaving the bottom edge per bar.
         Anchored below the frame so it never reads as a circle drawn on the page. */
      if (!reduced) {
        const bar = beat * 4;
        const intoBar = (t % bar) / bar;
        const ring = intoBar * Math.max(width, height) * 0.9;
        if (ring > 8) {
          ctx.strokeStyle = alphaOf(colors.accentAlt, 0.13 * (1 - intoBar));
          ctx.lineWidth = 1 + (1 - intoBar) * 4;
          ctx.beginPath();
          ctx.arc(width * 0.5, height * 1.06, ring, Math.PI, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
    },
  };
}
