"use client";

/**
 * The waveform is Pulse's seek control, and every track has its own.
 *
 * Two things make it worth drawing rather than reaching for a progress bar. It
 * is derived from the track — same title, same shape, every time — so it works
 * as an identifier: the tracklist prints ten different silhouettes rather than
 * ten identical rules. And it is the scrub target, so the one graphic that
 * identifies a track is also the control that moves through it.
 *
 * The envelope is deliberate. Real music has an intro, a middle and an end, so
 * the peaks are shaped by a curve rather than left as noise — noise reads as
 * decoration, a shape reads as a recording.
 */

/** Small deterministic hash of a title, so the shape survives a re-render. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Triangle wave in 0…1, period 1.
 *
 * Deliberately not `Math.sin`. Transcendental functions are only specified to
 * within an implementation's own precision, so Node and Chrome disagree in the
 * last bit — and a shape built from them renders `height="4.541352266456047"` on
 * the server against `4.541352266456048` in the browser, which React reports as
 * a hydration mismatch. Everything below is multiplication, addition and
 * `Math.floor`, all of which are exact in IEEE-754 and therefore identical
 * everywhere.
 */
function tri(x: number): number {
  const f = x - Math.floor(x);
  return f < 0.5 ? f * 2 : 2 - f * 2;
}

function peaks(seed: string, count: number): number[] {
  let s = hash(seed);
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };

  /* Structure first. A track is not a smooth hump — it has an intro, a couple of
     verses, a chorus that is louder than both, and a breakdown where almost
     nothing happens. Eight sections with their own levels, crossfaded into each
     other, is what makes the silhouette read as an arrangement. */
  const SECTIONS = 8;
  const levels: number[] = [];
  for (let i = 0; i < SECTIONS; i++) levels.push(0.22 + next() * 0.78);
  // One section is always the loudest and one always the quietest, so every
  // record has a peak and a drop rather than eight middling blocks.
  levels[Math.floor(next() * SECTIONS)] = 1;
  levels[Math.floor(next() * SECTIONS)] = 0.16;

  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const p = i / (count - 1);

    const at = p * SECTIONS;
    const s = Math.min(SECTIONS - 1, Math.floor(at));
    const into = at - s;
    const here = levels[s] ?? 0.5;
    const nextLevel = levels[Math.min(SECTIONS - 1, s + 1)] ?? here;
    // Sections hand over across the last fifth of their length.
    const section = into < 0.8 ? here : here + (nextLevel - here) * ((into - 0.8) / 0.2);

    const rise = p < 0.04 ? p * 25 : 1;
    const fall = p > 0.94 ? 1 - (p - 0.94) / 0.06 : 1;
    // Two bands of detail: neighbouring bars agree, so it reads as sound.
    const body = 0.68 + 0.2 * (tri(p * 9.5) * 2 - 1) + 0.12 * (tri(p * 23.3 + 0.37) * 2 - 1);
    const v = rise * fall * section * body * (0.74 + next() * 0.5);
    out.push(Math.round(Math.max(0.04, Math.min(1, v)) * 1000) / 1000);
  }
  return out;
}

export function Waveform({
  seed,
  bars = 96,
  progress = 0,
  className,
  /** Small glyph mode: thinner bars, no played/unplayed split. */
  glyph = false,
}: {
  seed: string;
  bars?: number;
  /** 0…1. Everything left of it is painted as played. */
  progress?: number;
  className?: string;
  glyph?: boolean;
}) {
  const values = peaks(seed, bars);
  const step = 100 / bars;
  const width = step * (glyph ? 0.5 : 0.62);
  const played = Math.round(progress * bars);

  return (
    <svg viewBox="0 0 100 40" className={className} preserveAspectRatio="none" aria-hidden="true">
      {values.map((v, i) => {
        const h = Math.max(0.8, v * 38);
        return (
          <rect
            key={i}
            x={i * step + (step - width) / 2}
            y={20 - h / 2}
            width={width}
            height={h}
            data-played={!glyph && i < played ? "" : undefined}
          />
        );
      })}
    </svg>
  );
}
