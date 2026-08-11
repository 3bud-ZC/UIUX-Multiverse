import type { CSSProperties } from "react";
import styles from "./Mercato.module.css";

/**
 * The goods, drawn.
 *
 * A shop is judged on how the things look, and nine tonal rectangles with
 * captions under them is a shop that has not photographed its stock. Each item
 * below is a still-life: its own silhouette, its own glaze, a label, a
 * highlight and a shadow on the shelf — so a catalogue row reads as an object
 * before it reads as a price.
 */
export function ProductArt({ id, className }: { id: string; className?: string }) {
  const art = ART[id] ?? ART.default;
  return (
    <svg
      className={`${styles.art} ${className ?? ""}`}
      viewBox="0 0 200 230"
      style={{ "--g1": art.g1, "--g2": art.g2, "--g3": art.g3 } as CSSProperties}
      aria-hidden="true"
      focusable="false"
    >
      <ellipse className={styles.artShadow} cx="100" cy="206" rx="62" ry="9" />
      {art.body}
      <path className={styles.artGleam} d={art.gleam} />
    </svg>
  );
}

interface Art {
  g1: string;
  g2: string;
  g3: string;
  body: React.ReactNode;
  gleam: string;
}

const label = (x: number, y: number, w: number, h: number) => (
  <>
    <rect className={styles.artLabel} x={x} y={y} width={w} height={h} rx="2" />
    <path className={styles.artLabelRule} d={`M${x + 7} ${y + h * 0.38} h${w - 14}`} />
    <path className={styles.artLabelRule} d={`M${x + 7} ${y + h * 0.62} h${(w - 14) * 0.6}`} />
  </>
);

const ART: Record<string, Art> = {
  /* Tall pressed-oil bottle, dark green glass, long neck. */
  "oil-01": {
    g1: "#8fa03f",
    g2: "#46561f",
    g3: "#2a3311",
    body: (
      <>
        <path
          className={styles.artBody}
          d="M78 200 V96 q0 -16 8 -24 V44 h28 V72 q8 8 8 24 V200 Z"
        />
        <rect className={styles.artCap} x="84" y="26" width="32" height="20" rx="3" />
        <path className={styles.artCollar} d="M84 62 h32" />
        {label(72, 120, 56, 46)}
      </>
    ),
    gleam: "M88 90 V186",
  },

  /* Squat honey jar, hexagonal shoulder, wide lid. */
  "hon-02": {
    g1: "#e0a446",
    g2: "#9a5c17",
    g3: "#5c3410",
    body: (
      <>
        <path className={styles.artBody} d="M66 200 V116 l10 -18 h48 l10 18 V200 Z" />
        <rect className={styles.artCap} x="70" y="86" width="60" height="20" rx="4" />
        <path className={styles.artCollar} d="M74 84 h52" />
        {label(74, 138, 52, 40)}
      </>
    ),
    gleam: "M76 122 V188",
  },

  /* Salt cellar: open dish with a heap in it. */
  "sal-03": {
    g1: "#f4f2e9",
    g2: "#cbc6b4",
    g3: "#8f8a79",
    body: (
      <>
        <path className={styles.artBody} d="M56 148 q0 52 44 52 t44 -52 Z" />
        <ellipse className={styles.artRim} cx="100" cy="148" rx="44" ry="12" />
        <path className={styles.artHeap} d="M74 146 q12 -30 26 -30 t26 30 Z" />
        <path className={styles.artFlake} d="M92 132 l6 -6 6 6 -6 6 Z M108 140 l5 -5 5 5 -5 5 Z" />
      </>
    ),
    gleam: "M70 158 q6 26 22 32",
  },

  /* Vinegar: narrow, very dark, wax-sealed. */
  "vin-04": {
    g1: "#8a5030",
    g2: "#3d1e0f",
    g3: "#1d0d06",
    body: (
      <>
        <path
          className={styles.artBody}
          d="M84 200 V110 q0 -20 6 -30 V50 h20 V80 q6 10 6 30 V200 Z"
        />
        <path className={styles.artWax} d="M88 26 h24 l4 26 h-32 Z" />
        {label(78, 132, 44, 44)}
      </>
    ),
    gleam: "M92 108 V186",
  },

  /* Stoneware bowl, thrown, seen three-quarter. */
  "cer-05": {
    g1: "#ded4c5",
    g2: "#a4947c",
    g3: "#70634f",
    body: (
      <>
        <path className={styles.artBody} d="M46 132 q4 68 54 68 t54 -68 Z" />
        <ellipse className={styles.artRim} cx="100" cy="132" rx="54" ry="15" />
        <ellipse className={styles.artWell} cx="100" cy="134" rx="44" ry="11" />
        <path className={styles.artThrow} d="M56 150 q44 16 88 0 M62 168 q38 13 76 0" />
      </>
    ),
    gleam: "M60 146 q8 34 28 44",
  },

  /* Platter: wide, shallow, unglazed foot. */
  "cer-06": {
    g1: "#d2c6b0",
    g2: "#9a8b73",
    g3: "#6a5d4a",
    body: (
      <>
        <path className={styles.artBody} d="M28 150 q6 40 72 40 t72 -40 Z" />
        <ellipse className={styles.artRim} cx="100" cy="150" rx="72" ry="19" />
        <ellipse className={styles.artWell} cx="100" cy="152" rx="56" ry="13" />
        <path className={styles.artThrow} d="M40 162 q60 20 120 0" />
      </>
    ),
    gleam: "M46 156 q10 22 30 30",
  },

  /* Linen: folded cloth, stacked, with a selvedge. */
  "lin-07": {
    g1: "#c2cbc4",
    g2: "#7f8d85",
    g3: "#54615a",
    body: (
      <>
        <path className={styles.artBody} d="M44 200 V148 q56 -14 112 0 V200 Z" />
        <path className={styles.artFold} d="M44 172 q56 -14 112 0" />
        <path className={styles.artBodyAlt} d="M52 148 V112 q48 -12 96 0 V148" />
        <path className={styles.artFold} d="M52 128 q48 -12 96 0" />
        <path className={styles.artStitch} d="M60 190 h80 M60 160 h80" />
      </>
    ),
    gleam: "M62 118 V196",
  },

  /* Coffee: a soft bag with a rolled top and a valve. */
  "cof-08": {
    g1: "#8a5730",
    g2: "#4a2a14",
    g3: "#2b160b",
    body: (
      <>
        <path className={styles.artBody} d="M62 200 V80 q38 -10 76 0 V200 Z" />
        <path className={styles.artRoll} d="M60 80 q40 -20 80 0 l-6 14 q-34 -16 -68 0 Z" />
        <circle className={styles.artValve} cx="100" cy="112" r="7" />
        {label(72, 130, 56, 46)}
      </>
    ),
    gleam: "M72 96 V190",
  },

  /* Moka pot: the octagonal silhouette everybody knows. */
  "cof-09": {
    g1: "#c3c7cb",
    g2: "#7d8288",
    g3: "#40444a",
    body: (
      <>
        <path className={styles.artBody} d="M66 200 L58 148 h84 l-8 52 Z" />
        <path className={styles.artBodyAlt} d="M64 148 L74 92 h52 l10 56 Z" />
        <path className={styles.artSpout} d="M126 100 l22 -12 4 10 -20 12 Z" />
        <path className={styles.artHandle} d="M74 104 q-30 6 -26 34 q2 16 18 18" />
        <ellipse className={styles.artRim} cx="100" cy="92" rx="26" ry="7" />
        <circle className={styles.artValve} cx="100" cy="86" r="5" />
        <path className={styles.artThrow} d="M74 118 h52 M70 136 h60" />
      </>
    ),
    gleam: "M78 106 V190",
  },

  default: {
    g1: "#d6cdbb",
    g2: "#9d907a",
    g3: "#6b6151",
    body: <rect className={styles.artBody} x="60" y="90" width="80" height="110" rx="6" />,
    gleam: "M70 104 V186",
  },
};
