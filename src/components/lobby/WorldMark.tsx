import type { World, WorldId } from "@/lib/worlds";
import styles from "./WorldMark.module.css";

/**
 * Ten drawings, one per world.
 *
 * Not thumbnails and not abstract decoration: each is a *diagram of the idea*
 * the world is about — a reasoning graph, a verse on ruled paper, a sleeve grid,
 * a position table, a sector map, a massing study, a phone, a burst, a tuner, a
 * shelf. A visitor scanning the wall should be able to name the category before
 * reading a word of it.
 *
 * This is the one place in the project where ten worlds share a stylesheet, and
 * it is deliberate: these are the lobby's drawings *of* ten sites, made by the
 * lobby, in one hand. Nothing here is imported by a world.
 *
 * The drawing does not choose its own colours. It reads `--m-*` from the tile,
 * which holds neutral silver until the world is held and its real palette after
 * — so the wall goes from a set of monochrome plates to one world in colour,
 * and the change can be tweened rather than swapped.
 */
export function WorldMark({ world, live }: { world: World; live: boolean }) {
  return (
    <svg
      className={styles.mark}
      viewBox={`0 0 200 ${HEIGHTS[world.id] ?? 140}`}
      data-live={live ? "" : undefined}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      {MARKS[world.id]}
    </svg>
  );
}

/**
 * Each drawing is composed for the proportion of the plate it hangs in: the
 * three portrait plates along the bottom, the two tall bookends, and the
 * landscape band everywhere else. A drawing letterboxed inside its own tile is
 * what makes a wall of portals look like a wall of placeholders.
 */
const HEIGHTS: Partial<Record<WorldId, number>> = {
  object: 200,
  signal: 200,
  mercato: 200,
  nova: 190,
  vault: 190,
};

const MARKS: Record<WorldId, React.ReactNode> = {
  /* 01 — a decision resolving downward: sources, checks, verdict. */
  nova: (
    <g className={styles.nova}>
      <path className={styles.wire} d="M36 44 C36 68 66 62 66 84 M100 44 C100 66 70 64 68 84" />
      <path className={styles.wire} d="M164 44 C164 68 134 62 134 84 M100 44 C100 66 130 64 132 84" />
      <path className={styles.wire} d="M66 110 C66 130 100 126 100 146 M134 110 C134 130 100 126 100 146" />
      {[36, 100, 164].map((x, i) => (
        <g key={x}>
          <rect className={styles.node} x={x - 28} y="14" width="56" height="28" rx="3" />
          <rect className={styles.fill} x={x - 22} y="22" width={[36, 26, 42][i]} height="4" rx="2" />
          <rect className={styles.fill} x={x - 22} y="31" width={[22, 38, 18][i]} height="4" rx="2" opacity="0.55" />
        </g>
      ))}
      <circle className={styles.check} cx="66" cy="97" r="14" />
      <circle className={styles.check} cx="134" cy="97" r="14" />
      <path className={styles.tick} d="M59 97.5 l5 5.4 9 -11" />
      <path className={styles.tick} d="M127 97.5 l5 5.4 9 -11" />
      <rect className={styles.verdict} x="44" y="146" width="112" height="40" rx="4" />
      <rect className={styles.bar} x="56" y="172" width="88" height="4" rx="2" />
      <rect className={styles.barFill} x="56" y="172" width="66" height="4" rx="2" />
      <text className={styles.stamp} x="100" y="165">
        DECISION · GO
      </text>
    </g>
  ),

  /* 02 — a verse being written: ruled paper, one ruqaa swash, an illumination. */
  atelier: (
    <g className={styles.atelier}>
      <rect className={styles.frame} x="16" y="14" width="168" height="112" />
      <rect className={styles.frameIn} x="21" y="19" width="158" height="102" />
      <g className={styles.rules}>
        <path d="M150 46 H62" />
        <path d="M150 66 H44" />
        <path d="M150 86 H78" />
        <path d="M150 106 H96" />
      </g>
      <path
        className={styles.swash}
        d="M158 40 C132 26 104 40 100 58 C96 76 122 82 132 70 C142 58 122 46 100 56 C72 69 60 94 38 96"
      />
      <path className={styles.swashTail} d="M38 96 C30 96 26 90 30 84" />
      <circle className={styles.gold} cx="164" cy="34" r="5" />
      <circle className={styles.goldRing} cx="164" cy="34" r="9" />
      <circle className={styles.dot} cx="46" cy="112" r="2.2" />
      <circle className={styles.dot} cx="53" cy="112" r="2.2" />
    </g>
  ),

  /* 03 — what you are listening to: four sleeves and the waveform under them. */
  pulse: (
    <g className={styles.pulse}>
      <rect className={styles.sleeve} x="16" y="16" width="44" height="44" />
      <circle className={styles.sleeveArt} cx="38" cy="38" r="13" />
      <rect className={styles.sleeve} x="64" y="16" width="44" height="44" />
      <path className={styles.sleeveArt2} d="M70 54 L86 22 L102 54 Z" />
      <rect className={styles.sleeve} x="16" y="64" width="44" height="44" />
      <path className={styles.sleeveArt2} d="M22 102 h32 M22 92 h32 M22 82 h20" />
      <rect className={styles.sleeveHot} x="64" y="64" width="44" height="44" />
      <path className={styles.play} d="M80 76 l16 10 -16 10 Z" />
      <g className={styles.meter}>
        {[46, 78, 30, 96, 62, 88, 38, 72, 54, 92, 26, 68].map((v, i) => (
          <rect
            key={i}
            x={120 + i * 6}
            y={104 - v * 0.72}
            width="3.4"
            height={v * 0.72}
            style={{ animationDelay: `${(i % 6) * 90}ms` }}
          />
        ))}
      </g>
      <rect className={styles.scrub} x="120" y="112" width="66" height="2.5" rx="1.25" />
      <rect className={styles.scrubFill} x="120" y="112" width="28" height="2.5" rx="1.25" />
    </g>
  ),

  /* 04 — the balance sheet: a header, the positions, then the series. */
  vault: (
    <g className={styles.vault}>
      <rect className={styles.pane} x="10" y="10" width="180" height="170" rx="2" />
      <path className={styles.split} d="M10 34 H190 M10 118 H190 M100 34 V118" />
      <rect className={styles.chip} x="148" y="16" width="34" height="12" rx="2" />
      <text className={styles.chipText} x="165" y="25">
        +2.4%
      </text>
      <rect className={styles.fillBar} x="18" y="18" width="46" height="5" rx="2" />
      <rect className={styles.fillBar} x="70" y="18" width="26" height="5" rx="2" opacity="0.5" />
      <g className={styles.rows}>
        {[46, 60, 74, 88, 102].map((y, i) => (
          <g key={y}>
            <rect x="18" y={y - 4} width={[52, 38, 60, 32, 46][i]} height="5" rx="1.5" />
            <rect
              className={styles.num}
              x={182 - [30, 42, 22, 38, 26][i]}
              y={y - 4}
              width={[30, 42, 22, 38, 26][i]}
              height="5"
              rx="1.5"
            />
          </g>
        ))}
      </g>
      <g className={styles.candles}>
        {[
          [26, 156, 172, 10],
          [46, 142, 168, 18],
          [66, 148, 170, 14],
          [86, 128, 160, 22],
          [106, 136, 164, 16],
          [126, 118, 152, 26],
          [146, 126, 158, 20],
          [166, 106, 146, 30],
        ].map(([x, top, bottom, body], i) => (
          <g key={i} data-up={i % 3 !== 1 ? "" : undefined}>
            <path d={`M${x} ${top} V${bottom}`} />
            <rect x={x - 4.5} y={top + 4} width="9" height={body} rx="1" />
          </g>
        ))}
      </g>
      <rect className={styles.cursorRow} x="14" y="82" width="172" height="14" rx="1.5" />
    </g>
  ),

  /* 05 — the sector you are flying into, and the ship on its approach. */
  orbit: (
    <g className={styles.orbit}>
      <ellipse className={styles.ring} cx="100" cy="72" rx="80" ry="34" />
      <ellipse className={styles.ring} cx="100" cy="72" rx="54" ry="22" />
      <ellipse className={styles.ringHot} cx="100" cy="72" rx="27" ry="11" />
      <circle className={styles.core} cx="100" cy="72" r="7" />
      <path className={styles.trajectory} d="M18 108 C58 96 74 46 122 34 C150 27 168 34 182 46" />
      <g className={styles.ship} transform="translate(122 34)">
        <path d="M0 -7 L7 5 L0 2 L-7 5 Z" />
      </g>
      <g className={styles.hud}>
        <path d="M18 20 h16 M18 20 v12" />
        <path d="M182 20 h-16 M182 20 v12" />
        <path d="M18 122 h16 M18 122 v-12" />
        <path d="M182 122 h-16 M182 122 v-12" />
      </g>
      <path className={styles.lock} d="M112 24 h20 M132 24 v10" />
      <text className={styles.mono} x="136" y="22">
        SECTOR 7
      </text>
    </g>
  ),

  /* 06 — the same building held four ways: mass, plan, section, dimension. */
  forma: (
    <g className={styles.forma}>
      <g className={styles.sheet}>
        <path d="M14 108 H186" />
        <path d="M14 26 H186" />
      </g>
      <g className={styles.mass}>
        <path d="M52 96 L94 74 L94 42 L52 64 Z" />
        <path className={styles.massTop} d="M52 64 L94 42 L136 62 L94 84 Z" />
        <path className={styles.massSide} d="M94 84 L136 62 L136 94 L94 116 Z" />
      </g>
      <g className={styles.mass} opacity="0.85">
        <path d="M94 42 L118 30 L118 14 L94 26 Z" />
        <path className={styles.massTop} d="M94 26 L118 14 L138 24 L114 36 Z" />
        <path className={styles.massSide} d="M114 36 L138 24 L138 40 L114 52 Z" />
      </g>
      <path className={styles.cut} d="M30 34 L176 100" />
      <g className={styles.dims}>
        <path d="M22 64 V116 M18 64 h8 M18 116 h8" />
        <path d="M52 124 H136 M52 120 v8 M136 120 v8" />
      </g>
      <text className={styles.tick} x="34" y="94">
        18.4
      </text>
    </g>
  ),

  /* 07 — the phone, and the screens coming off it. */
  luma: (
    <g className={styles.luma}>
      <circle className={styles.halo} cx="56" cy="66" r="52" />
      <circle className={styles.haloIn} cx="56" cy="60" r="32" />
      <rect className={styles.phone} x="24" y="10" width="64" height="122" rx="14" />
      <rect className={styles.screen} x="29" y="15" width="54" height="112" rx="10" />
      <path className={styles.arc} d="M38 62 A18 18 0 0 1 72 62" />
      <circle className={styles.knob} cx="67" cy="51" r="4.5" />
      <rect className={styles.card} x="37" y="78" width="38" height="16" rx="5" />
      <rect className={styles.cardLine} x="42" y="84" width="20" height="3.5" rx="1.75" />
      <g className={styles.tabs}>
        <circle cx="44" cy="117" r="3.2" />
        <circle className={styles.tabOn} cx="56" cy="117" r="3.8" />
        <circle cx="68" cy="117" r="3.2" />
      </g>
      <rect className={styles.notch} x="46" y="19" width="20" height="3.5" rx="1.75" />

      {/* Two screens lifted off the device — the app is the object, so the
          drawing shows it in more than one state. */}
      <g className={styles.plate} transform="rotate(-4 148 44)">
        <rect x="104" y="18" width="88" height="52" rx="8" />
        <path className={styles.wave} d="M114 54 q11 -22 22 -4 t22 -14 q11 -8 22 6" />
        <rect className={styles.plateLine} x="114" y="28" width="30" height="4" rx="2" />
      </g>
      <g className={styles.plate} transform="rotate(3 148 106)">
        <rect x="104" y="80" width="88" height="50" rx="8" />
        <rect className={styles.plateLine} x="114" y="90" width="40" height="4" rx="2" />
        <rect className={styles.plateBar} x="114" y="104" width="68" height="8" rx="4" />
        <rect className={styles.plateFill} x="114" y="104" width="42" height="8" rx="4" />
        <circle className={styles.knob} cx="156" cy="108" r="6" />
      </g>
    </g>
  ),

  /* 08 — a character coming out of the phone, which is the whole idea. */
  signal: (
    <g className={styles.signal}>
      <path
        className={styles.burst}
        d="M100 4 l12 30 30 -18 -11 33 33 4 -25 22 25 22 -33 4 11 33 -30 -18 -12 30 -12 -30 -30 18 11 -33 -33 -4 25 -22 -25 -22 33 -4 -11 -33 30 18 Z"
        transform="translate(0 74)"
      />
      <rect className={styles.device} x="60" y="72" width="80" height="122" rx="16" />
      <rect className={styles.deviceIn} x="67" y="79" width="66" height="108" rx="11" />
      <g className={styles.appRow}>
        <rect x="76" y="150" width="20" height="20" rx="6" />
        <rect x="104" y="150" width="20" height="20" rx="6" />
        <rect x="76" y="176" width="48" height="6" rx="3" />
      </g>
      <g className={styles.hero} transform="translate(100 62)">
        <path className={styles.tuft} d="M-6 -30 l7 -18 6 18 9 -14 -2 17 Z" />
        <circle className={styles.head} cx="0" cy="-4" r="26" />
        <circle className={styles.eye} cx="-9" cy="-8" r="4.8" />
        <circle className={styles.eye} cx="9" cy="-8" r="4.8" />
        <circle className={styles.glint} cx="-7.2" cy="-10.2" r="1.7" />
        <circle className={styles.glint} cx="10.8" cy="-10.2" r="1.7" />
        <path className={styles.smile} d="M-11 5 q11 11 22 0" />
        <circle className={styles.blush} cx="-18" cy="4" r="4.6" />
        <circle className={styles.blush} cx="18" cy="4" r="4.6" />
        <path className={styles.arm} d="M-24 12 q-16 -2 -22 -16" />
        <path className={styles.arm} d="M24 12 q16 -2 22 -16" />
      </g>
      <g className={styles.bubble}>
        <path d="M136 16 h44 a7 7 0 0 1 7 7 v22 a7 7 0 0 1 -7 7 h-26 l-13 12 v-12 h-5 a7 7 0 0 1 -7 -7 v-22 a7 7 0 0 1 7 -7 Z" />
      </g>
      <text className={styles.bubbleText} x="161" y="40">
        يلا!
      </text>
      <g className={styles.sparks}>
        <circle cx="26" cy="44" r="5" />
        <circle cx="18" cy="104" r="3.4" />
        <circle cx="176" cy="96" r="4.2" />
        <circle cx="34" cy="164" r="3.2" />
        <circle cx="170" cy="160" r="4.6" />
      </g>
    </g>
  ),

  /* 09 — the instrument, stood upright: scale, needle, grille, dial. */
  object: (
    <g className={styles.object}>
      <rect className={styles.cabinet} x="10" y="12" width="180" height="176" rx="12" />
      <rect className={styles.dialFace} x="24" y="26" width="152" height="76" rx="4" />
      <g className={styles.scale}>
        {Array.from({ length: 25 }, (_, i) => (
          <path key={i} d={`M${32 + i * 5.7} 36 V${i % 6 === 0 ? 54 : 46}`} />
        ))}
      </g>
      <g className={styles.scaleText}>
        <text x="36" y="70">٥٥</text>
        <text x="100" y="70">٨٨</text>
        <text x="164" y="70">١٠٨</text>
      </g>
      <path className={styles.bandLine} d="M32 82 H168" />
      <text className={styles.band} x="100" y="95">
        الموجة المتوسطة
      </text>
      <path className={styles.needle} d="M104 30 V98" />
      <circle className={styles.needleHead} cx="104" cy="30" r="4.4" />

      <g className={styles.grille}>
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M28 ${120 + i * 10} H118`} />
        ))}
      </g>

      <g className={styles.knob}>
        <circle cx="152" cy="146" r="26" />
        <circle className={styles.knobIn} cx="152" cy="146" r="17" />
        <path className={styles.knobMark} d="M152 129 V137" />
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2;
          return (
            <path
              key={i}
              className={styles.grip}
              d={`M${152 + Math.cos(a) * 21} ${146 + Math.sin(a) * 21} L${152 + Math.cos(a) * 25} ${146 + Math.sin(a) * 25}`}
            />
          );
        })}
      </g>

      <g className={styles.waves}>
        <path d="M28 180 q8 -10 16 0 t16 0" />
        <path d="M64 180 q8 -10 16 0 t16 0" />
      </g>
    </g>
  ),

  /* 10 — the goods themselves, arranged the way a shop window arranges them. */
  mercato: (
    <g className={styles.mercato}>
      <path className={styles.shelf} d="M10 176 H190" />
      <ellipse className={styles.shade} cx="56" cy="176" rx="30" ry="5" />
      <ellipse className={styles.shade} cx="112" cy="176" rx="34" ry="5" />
      <ellipse className={styles.shade} cx="164" cy="176" rx="24" ry="4.5" />

      <g className={styles.bottle}>
        <path d="M42 176 V78 q0 -12 6 -18 V44 h14 V60 q6 6 6 18 V176 Z" />
        <rect className={styles.cap} x="46" y="28" width="18" height="17" rx="3" />
        <rect className={styles.label} x="38" y="102" width="36" height="40" rx="2" />
        <path className={styles.gleam} d="M50 92 V158" />
        <path className={styles.labelMark} d="M46 118 h20 M46 126 h13" />
      </g>

      <g className={styles.jar}>
        <path d="M84 176 V102 q0 -10 9 -13 h38 q9 3 9 13 V176 Z" />
        <rect className={styles.cap} x="88" y="84" width="48" height="19" rx="4" />
        <rect className={styles.label} x="88" y="124" width="48" height="30" rx="2" />
        <path className={styles.gleam} d="M94 112 V166" />
        <path
          className={styles.produce}
          d="M99 166 a7 7 0 1 0 0.01 0 M116 170 a8.5 8.5 0 1 0 0.01 0 M131 164 a6 6 0 1 0 0.01 0"
        />
        <path className={styles.labelMark} d="M96 136 h32 M96 145 h20" />
      </g>

      <g className={styles.tin}>
        <path d="M146 176 V128 h40 v48 Z" />
        <ellipse className={styles.tinTop} cx="166" cy="128" rx="20" ry="7" />
        <path className={styles.gleam} d="M153 140 V168" />
        <rect className={styles.label} x="150" y="142" width="32" height="22" rx="2" />
      </g>

      <g className={styles.priceTag}>
        <path d="M136 18 h44 a4 4 0 0 1 4 4 v20 a4 4 0 0 1 -4 4 h-44 l-11 -14 Z" />
        <circle cx="139" cy="32" r="2.8" />
      </g>
      <text className={styles.price} x="160" y="38">
        £14
      </text>
      <path className={styles.sprig} d="M22 176 C22 146 10 134 13 116 C31 126 34 150 31 176" />
      <path className={styles.sprig} d="M13 116 C22 122 26 134 27 148" />
    </g>
  ),
};
