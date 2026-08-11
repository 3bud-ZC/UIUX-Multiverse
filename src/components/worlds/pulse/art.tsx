"use client";

import { useId } from "react";
import type { CoverKind, PortraitSpec } from "./data";

/**
 * Pulse — the drawn assets.
 *
 * A label's art direction is its product, so Pulse could not be built out of
 * tonal rectangles with captions under them. Everything visual here is drawn
 * from nothing, in one house style: a two-colour screen print with a visible
 * halftone screen and the accent plate deliberately knocked a little out of
 * register, the way a cheap four-colour press actually behaves.
 *
 * That style is the reason the imagery can be *portraits*. No photograph of a
 * real performer could be used — the archive's singers are invented, and any
 * real one would be someone's likeness and someone's copyright — but a drawn
 * plate can carry a face, and a face is what a music page needs.
 *
 * Colour comes in from the outside: every plate paints in `--p-paper`,
 * `--p-ink`, `--p-hot` and `--p-alt`, so a portrait re-inks itself when the
 * house or the record changes. Nothing here knows what those colours are.
 */

/* ── Portraits ──────────────────────────────────────────────────────────── */

const FACE: readonly string[] = [
  // 0 — oval, even.
  "M160 56 C128 56 106 82 106 120 C106 146 110 172 118 194 C127 220 143 246 160 246 C177 246 193 220 202 194 C210 172 214 146 214 120 C214 82 192 56 160 56 Z",
  // 1 — cut with a knife: flat planes, heavy jaw.
  "M160 54 L114 70 L104 124 L112 178 L132 226 L160 248 L188 226 L208 178 L216 124 L206 70 Z",
  // 2 — long and narrow.
  "M160 54 C132 54 114 80 114 118 C114 148 116 176 124 200 C132 226 146 252 160 252 C174 252 188 226 196 200 C204 176 206 148 206 118 C206 80 188 54 160 54 Z",
  // 3 — round, soft jaw.
  "M160 60 C124 60 102 88 102 126 C102 176 126 240 160 240 C194 240 218 176 218 126 C218 88 196 60 160 60 Z",
];

const SHOULDERS =
  "M22 420 L34 350 C66 328 118 312 160 312 C202 312 254 328 286 350 L298 420 Z";

/** Hair is drawn in two passes: the mass behind the face, the edge in front. */
interface HairPlates {
  back?: React.ReactNode;
  front?: React.ReactNode;
}

const LOCS = [
  { x: 98, h: 196, r: -7 },
  { x: 111, h: 232, r: -5 },
  { x: 124, h: 210, r: -3 },
  { x: 137, h: 246, r: -1 },
  { x: 150, h: 218, r: 1 },
  { x: 163, h: 250, r: 2 },
  { x: 176, h: 214, r: 4 },
  { x: 189, h: 240, r: 6 },
  { x: 202, h: 200, r: 8 },
];

function hairPlates(kind: PortraitSpec["hair"]): HairPlates {
  switch (kind) {
    case "crop":
      return {
        front: (
          <>
            <path d="M104 126 C100 78 126 48 160 48 C194 48 220 78 216 126 C209 106 200 88 180 81 C164 75 146 79 133 89 C118 101 110 111 104 126 Z" />
            <path d="M104 126 L101 168 L112 166 L110 130 Z" />
            <path d="M216 126 L219 168 L208 166 L210 130 Z" />
          </>
        ),
      };

    case "long":
      return {
        back: (
          <path d="M106 122 C100 68 128 40 160 40 C192 40 220 68 214 122 L226 336 L196 336 L206 150 C204 110 186 82 160 82 C134 82 116 110 114 150 L124 336 L94 336 Z" />
        ),
        front: (
          <path d="M108 118 C106 76 130 52 160 52 C186 52 206 70 212 100 C196 84 174 78 152 86 C130 94 116 104 108 118 Z" />
        ),
      };

    case "shaved":
      return {
        front: (
          <path
            d="M124 84 C136 70 152 64 168 66"
            fill="none"
            stroke="var(--p-paper)"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.5"
          />
        ),
      };

    case "locs":
      return {
        back: (
          <>
            {LOCS.map((l) => (
              <rect
                key={l.x}
                x={l.x}
                y={44}
                width="11"
                height={l.h}
                rx="5.5"
                transform={`rotate(${l.r} ${l.x + 5.5} 60)`}
              />
            ))}
          </>
        ),
        front: (
          <path d="M102 116 C100 70 128 42 160 42 C192 42 220 70 218 116 C206 92 186 78 160 78 C134 78 114 92 102 116 Z" />
        ),
      };

    case "scarf":
      return {
        back: (
          <path d="M160 36 C112 36 92 76 96 122 L84 214 C80 254 66 288 52 336 L118 336 L134 244 L188 244 L204 336 L270 336 C254 288 240 254 236 214 L224 122 C228 76 208 36 160 36 Z" />
        ),
        front: (
          <>
            <path d="M100 128 C96 78 124 50 160 50 C196 50 224 78 220 128 C214 106 210 92 196 84 C180 75 140 75 124 84 C110 92 106 106 100 128 Z" />
            {/* The knot. A wrap has to be tied somewhere. */}
            <path d="M196 84 C210 76 224 82 228 96 C218 92 208 90 198 94 Z" />
          </>
        ),
      };

    case "updo":
      return {
        back: (
          <>
            <ellipse cx="160" cy="70" rx="70" ry="46" />
            <ellipse cx="212" cy="46" rx="26" ry="22" />
          </>
        ),
        front: (
          <>
            <path d="M100 122 C96 74 124 46 160 46 C196 46 226 72 220 118 C206 92 186 92 162 100 C138 108 114 106 100 122 Z" />
            {/* A veil: one thin arc in the second plate, not a haze. */}
            <path
              d="M92 116 C104 62 200 46 236 92"
              fill="none"
              stroke="var(--p-alt)"
              strokeWidth="3"
              opacity="0.75"
            />
          </>
        ),
      };

    case "tarbush":
      return {
        front: (
          <>
            <path d="M118 76 L124 26 L200 26 L206 76 Z" />
            <rect x="112" y="72" width="100" height="12" rx="3" />
            <circle cx="196" cy="26" r="7" fill="var(--p-hot)" />
            <path
              d="M196 26 C204 44 206 62 200 78"
              fill="none"
              stroke="var(--p-hot)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </>
        ),
      };

    case "shawl":
      return {
        back: (
          <path d="M160 32 C108 32 84 78 90 128 L70 336 L120 336 L136 232 L186 232 L202 336 L252 336 L230 128 C236 78 212 32 160 32 Z" />
        ),
        front: (
          <>
            <path d="M96 134 C90 80 122 48 160 48 C198 48 230 80 224 134 C214 108 206 96 192 90 C168 80 152 80 128 90 C114 96 106 108 96 134 Z" />
            <path
              d="M96 134 C118 150 202 150 224 134"
              fill="none"
              stroke="var(--p-hot)"
              strokeWidth="3.5"
              opacity="0.8"
            />
          </>
        ),
      };
  }
}

function garmentPlate(garment: PortraitSpec["garment"]): React.ReactNode {
  switch (garment) {
    case 0:
      return <path d="M130 316 C142 336 178 336 190 316 Z" fill="var(--p-paper)" />;
    case 1:
      return <path d="M130 314 L160 380 L190 314 Z" fill="var(--p-paper)" />;
    case 2:
      return (
        <>
          <path d="M124 316 L160 370 L196 316 L210 328 L160 398 L110 328 Z" fill="var(--p-paper)" />
          <path
            d="M160 372 L160 420"
            stroke="var(--p-hot)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
  }
}

function eyePlates(variant: PortraitSpec["eyes"], kohl: boolean): React.ReactNode {
  /* Deliberately not outlined all the way round: a closed dark ring around a
     white almond reads as a spectacle lens at small sizes, which is exactly what
     happened to the archive's singers before this was split into a lid and a
     lash. The weight lives in the upper lid, where it does on a face. */
  const almond = (
    <>
      <path
        d="M122 148 C131 136 149 136 156 148 C149 160 131 160 122 148 Z"
        fill="var(--p-paper)"
      />
      <path
        d="M164 148 C171 136 189 136 198 148 C189 160 171 160 164 148 Z"
        fill="var(--p-paper)"
      />
      <circle cx="139" cy="149" r="5.5" fill="var(--p-ink)" />
      <circle cx="181" cy="149" r="5.5" fill="var(--p-ink)" />
      <path
        d="M122 148 C131 136 149 136 156 148"
        fill="none"
        stroke="var(--p-ink)"
        strokeWidth={variant === 1 ? 5 : 3.4}
        strokeLinecap="round"
      />
      <path
        d="M164 148 C171 136 189 136 198 148"
        fill="none"
        stroke="var(--p-ink)"
        strokeWidth={variant === 1 ? 5 : 3.4}
        strokeLinecap="round"
      />
      <path
        d="M124 152 C132 158 148 158 155 152"
        fill="none"
        stroke="var(--p-ink)"
        strokeWidth="1.6"
        opacity="0.7"
      />
      <path
        d="M165 152 C172 158 188 158 196 152"
        fill="none"
        stroke="var(--p-ink)"
        strokeWidth="1.6"
        opacity="0.7"
      />
    </>
  );

  return (
    <>
      {almond}
      {kohl && (
        // Kohl, not spectacles: a thin flick up from the outer corner only.
        <>
          <path
            d="M123 145 C116 143 110 139 105 134"
            fill="none"
            stroke="var(--p-ink)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M197 145 C204 143 210 139 215 134"
            fill="none"
            stroke="var(--p-ink)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
    </>
  );
}

function mouthPlate(variant: PortraitSpec["mouth"]): React.ReactNode {
  switch (variant) {
    case 0:
      return (
        <path
          d="M140 207 C150 202 170 202 180 207 C170 214 150 214 140 207 Z"
          fill="var(--p-ink)"
        />
      );
    case 1:
      return (
        <>
          <path
            d="M138 204 C150 214 170 214 182 204"
            fill="none"
            stroke="var(--p-ink)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M146 214 C153 219 167 219 174 214"
            fill="none"
            stroke="var(--p-ink)"
            strokeWidth="2.5"
            opacity="0.6"
          />
        </>
      );
    case 2:
      // Mid-note. The archive's singers are drawn while they are singing.
      return (
        <>
          <path
            d="M142 200 C150 193 170 193 178 200 C176 218 168 228 160 228 C152 228 144 218 142 200 Z"
            fill="var(--p-ink)"
          />
          <path d="M150 214 C154 210 166 210 170 214 C166 222 154 222 150 214 Z" fill="var(--p-hot)" />
        </>
      );
  }
}

/**
 * One artist, printed. 320 × 420, cropped at the shoulders.
 */
export function Portrait({
  spec,
  className,
  alt,
  plain = false,
}: {
  spec: PortraitSpec;
  className?: string;
  /** Portraits are content, so they get a name — not `aria-hidden`. */
  alt?: string;
  /** Drops the backdrop plate and the screen — for use inside a sleeve medallion. */
  plain?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const face = FACE[spec.face] ?? FACE[0]!;
  const hair = hairPlates(spec.hair);
  const plateShape = spec.face % 2 === 0;

  return (
    <svg
      viewBox="0 0 320 420"
      className={className}
      role={alt ? "img" : "presentation"}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
    >
      <defs>
        <pattern id={`${uid}dots`} width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="1.9" fill="var(--p-ink)" />
          <circle cx="7.5" cy="7.5" r="1.9" fill="var(--p-ink)" />
        </pattern>
        <clipPath id={`${uid}face`}>
          <path d={face} />
        </clipPath>
      </defs>

      <rect width="320" height="420" fill="var(--p-paper)" />

      {/* The accent plate. Rotated per artist so the series never marches. */}
      {!plain && (
        <>
          <g transform={`rotate(${spec.plate} 160 170)`}>
            {plateShape ? (
              <circle cx="160" cy="164" r="126" fill="var(--p-hot)" />
            ) : (
              <rect x="34" y="42" width="252" height="248" rx="8" fill="var(--p-hot)" />
            )}
          </g>
          {/* The halftone screen, over the lower two thirds only. */}
          <rect y="196" width="320" height="224" fill={`url(#${uid}dots)`} opacity="0.22" />
        </>
      )}

      <g transform={spec.flip ? "translate(320 0) scale(-1 1)" : undefined}>
        {/* Out of register: the second plate, printed a hair low and left. */}
        <g fill="var(--p-alt)" opacity="0.65" transform="translate(-4 5)">
          {hair.back}
          <path d={SHOULDERS} />
          <path d={face} />
        </g>

        <g fill="var(--p-ink)">{hair.back}</g>

        <path d={SHOULDERS} fill="var(--p-ink)" />
        {garmentPlate(spec.garment)}
        {/* Neck. Drawn after the garment so the collar sits in front of nothing. */}
        <path d="M140 224 L140 318 L180 318 L180 224 Z" fill="var(--p-paper)" />
        <path d="M140 250 C148 268 172 268 180 250 L180 224 L140 224 Z" fill="var(--p-ink)" opacity="0.18" />

        <path d={face} fill="var(--p-paper)" stroke="var(--p-ink)" strokeWidth="3.5" />
        {/* Modelling: one printed shadow down the left plane, clipped to the face. */}
        <g clipPath={`url(#${uid}face)`}>
          <path d="M106 40 L146 40 L128 260 L96 260 Z" fill="var(--p-ink)" opacity="0.14" />
          <path d="M206 40 L226 40 L226 260 L196 260 Z" fill="var(--p-hot)" opacity="0.3" />
        </g>

        <g fill="var(--p-ink)">{hair.front}</g>

        {/* Brows, eyes, nose, mouth. */}
        <path
          d={spec.eyes === 1 ? "M118 126 C130 116 150 116 158 122" : "M118 130 C130 121 150 121 158 128"}
          fill="none"
          stroke="var(--p-ink)"
          strokeWidth={spec.eyes === 1 ? 4 : 5.5}
          strokeLinecap="round"
        />
        <path
          d={spec.eyes === 1 ? "M202 126 C190 116 170 116 162 122" : "M202 130 C190 121 170 121 162 128"}
          fill="none"
          stroke="var(--p-ink)"
          strokeWidth={spec.eyes === 1 ? 4 : 5.5}
          strokeLinecap="round"
        />
        {eyePlates(spec.eyes, spec.extra === "kohl")}
        <path
          d="M157 152 L152 184 C152 190 161 193 168 189"
          fill="none"
          stroke="var(--p-ink)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {mouthPlate(spec.mouth)}

        {spec.extra === "moustache" && (
          <path
            d="M132 196 C144 188 153 193 160 198 C167 193 176 188 188 196 C178 206 166 203 160 200 C154 203 142 206 132 196 Z"
            fill="var(--p-ink)"
          />
        )}
        {spec.extra === "glasses" && (
          <g fill="none" stroke="var(--p-ink)" strokeWidth="4.5">
            <rect x="112" y="130" width="52" height="38" rx="9" fill="var(--p-paper)" opacity="0.35" />
            <rect x="158" y="130" width="52" height="38" rx="9" fill="var(--p-paper)" opacity="0.35" />
            <path d="M164 145 L158 145" />
            <path d="M112 142 L98 136" />
            <path d="M210 142 L224 136" />
          </g>
        )}
        {spec.extra === "earring" && (
          <>
            <circle cx="207" cy="188" r="8" fill="none" stroke="var(--p-hot)" strokeWidth="4.5" />
            <circle cx="207" cy="204" r="4" fill="var(--p-hot)" />
          </>
        )}
        {spec.extra === "pearl" && (
          <g fill="var(--p-paper)" stroke="var(--p-ink)" strokeWidth="1.6">
            {[130, 142, 154, 166, 178, 190].map((x, i) => (
              <circle key={x} cx={x} cy={318 + Math.abs(2.5 - i) * -4 + 12} r="6" />
            ))}
            <circle cx="160" cy="344" r="9" fill="var(--p-hot)" />
          </g>
        )}
      </g>
    </svg>
  );
}

/* ── Covers ─────────────────────────────────────────────────────────────── */

/**
 * Sleeves, per house grammar.
 *
 * The floor prints hard-edge geometry, the archive prints an ornamented frame
 * around a portrait medallion, and the room prints a plan of the space it was
 * recorded in. Three grammars, so a sleeve says which house it came from before
 * you read the catalogue number.
 */
function CeilingCover() {
  const bars = [10, 26, 41, 55, 68, 80, 91, 101, 110, 118, 125, 131, 136, 140];
  return (
    <>
      {bars.map((y, i) => (
        <rect key={y} y={y} width="240" height={1.4 + i * 0.5} fill="var(--c-ink)" />
      ))}
      <ellipse cx="120" cy="190" rx="80" ry="32" fill="var(--c-hot)" />
      <ellipse cx="120" cy="190" rx="25" ry="9" fill="var(--c-paper)" />
      <rect y="228" width="240" height="12" fill="var(--c-alt)" />
    </>
  );
}

function ShiftCover() {
  return (
    <>
      <path d="M0 0 H240 V94 L0 166 Z" fill="var(--c-hot)" />
      <path d="M0 182 L240 110 V240 H0 Z" fill="var(--c-alt)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={26 + i * 39}
          y={30 + i * 7}
          width="17"
          height={46 - i * 5}
          fill="var(--c-ink)"
        />
      ))}
    </>
  );
}

function TransmitterCover() {
  return (
    <>
      {[40, 72, 104, 136, 168, 200].map((r, i) => (
        <circle
          key={r}
          cx="36"
          cy="212"
          r={r}
          fill="none"
          stroke={i % 2 ? "var(--c-alt)" : "var(--c-hot)"}
          strokeWidth="3"
        />
      ))}
      <path d="M31 212 L36 52 L41 212 Z" fill="var(--c-ink)" />
      <circle cx="36" cy="52" r="11" fill="var(--c-hot)" />
      <rect y="212" width="240" height="28" fill="var(--c-ink)" />
    </>
  );
}

function TapesCover() {
  return (
    <>
      <rect x="20" y="70" width="200" height="100" rx="7" fill="var(--c-hot)" />
      <circle cx="80" cy="120" r="32" fill="var(--c-paper)" />
      <circle cx="160" cy="120" r="32" fill="var(--c-paper)" />
      <circle cx="80" cy="120" r="15" fill="none" stroke="var(--c-ink)" strokeWidth="3" />
      <circle cx="160" cy="120" r="15" fill="none" stroke="var(--c-ink)" strokeWidth="3" />
      <rect x="80" y="111" width="80" height="18" fill="var(--c-ink)" />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={22 + i * 15} y="182" width="7" height="22" fill="var(--c-alt)" />
      ))}
    </>
  );
}

/** Moonlight broken on water: one column of light, cut into its own reflection. */
function MoonlightCover() {
  const rows = Array.from({ length: 15 }, (_, i) => i);
  return (
    <>
      <rect width="240" height="240" fill="var(--c-hot)" opacity="0.16" />
      <circle cx="120" cy="52" r="34" fill="var(--c-hot)" />
      <circle cx="136" cy="44" r="30" fill="var(--c-paper)" />
      {rows.map((i) => {
        const y = 104 + i * 9;
        const spread = 10 + i * 5.6;
        return (
          <rect
            key={i}
            x={120 - spread / 2 + (i % 2 ? 7 : -7)}
            y={y}
            width={spread}
            height={i % 3 === 0 ? 5 : 3}
            rx="1.5"
            fill={i % 4 === 0 ? "var(--c-alt)" : "var(--c-hot)"}
          />
        );
      })}
      <rect y="232" width="240" height="8" fill="var(--c-ink)" />
    </>
  );
}

/** The archive's frame: a ruled border, corner rosettes, and a portrait medallion. */
function ArchiveFrame({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <rect width="240" height="240" fill="var(--c-hot)" opacity="0.2" />
      <rect x="8" y="8" width="224" height="224" fill="none" stroke="var(--c-ink)" strokeWidth="2" />
      <rect
        x="16"
        y="16"
        width="208"
        height="208"
        fill="none"
        stroke="var(--c-alt)"
        strokeWidth="4"
      />
      {[
        [26, 26, 0],
        [214, 26, 90],
        [214, 214, 180],
        [26, 214, 270],
      ].map(([x, y, r]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path
            d="M0 0 C14 0 20 6 20 18 M0 0 C0 14 6 20 18 20"
            fill="none"
            stroke="var(--c-ink)"
            strokeWidth="2.5"
          />
          <circle cx="7" cy="7" r="3" fill="var(--c-ink)" />
        </g>
      ))}
      {children}
    </>
  );
}

function MedallionCover({ portrait }: { portrait?: PortraitSpec }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <ArchiveFrame>
      <defs>
        <clipPath id={`${uid}med`}>
          <circle cx="120" cy="112" r="76" />
        </clipPath>
      </defs>
      <circle cx="120" cy="112" r="82" fill="var(--c-alt)" />
      <circle cx="120" cy="112" r="76" fill="var(--c-paper)" />
      {portrait && (
        <g clipPath={`url(#${uid}med)`}>
          {/* The medallion prints the singer in the sleeve's own two inks. */}
          <g
            transform="translate(120 116) scale(0.8) translate(-160 -150)"
            style={
              {
                "--p-paper": "var(--c-paper)",
                "--p-ink": "var(--c-ink)",
                "--p-hot": "var(--c-hot)",
                "--p-alt": "var(--c-alt)",
              } as React.CSSProperties
            }
          >
            <Portrait spec={portrait} plain />
          </g>
        </g>
      )}
      <circle cx="120" cy="112" r="76" fill="none" stroke="var(--c-ink)" strokeWidth="3" />
      <rect x="44" y="200" width="152" height="4" fill="var(--c-ink)" />
    </ArchiveFrame>
  );
}

/** An eight-point girih lattice — the Andalusi record's own geometry. */
function LatticeCover() {
  const cells = [0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3].map((c) => ({ r, c })));
  return (
    <ArchiveFrame>
      <g stroke="var(--c-ink)" strokeWidth="1.8" fill="none">
        {cells.map(({ r, c }) => {
          const x = 32 + c * 47;
          const y = 32 + r * 47;
          return (
            <g key={`${r}-${c}`} transform={`translate(${x} ${y})`}>
              <rect x="-17" y="-17" width="34" height="34" />
              <rect x="-17" y="-17" width="34" height="34" transform="rotate(45)" />
              <circle r="6" fill="var(--c-alt)" stroke="none" />
            </g>
          );
        })}
      </g>
      <rect x="16" y="184" width="208" height="40" fill="var(--c-ink)" opacity="0.9" />
    </ArchiveFrame>
  );
}

/** An oud in silhouette inside a cartouche. */
function CartoucheCover() {
  return (
    <ArchiveFrame>
      <path
        d="M120 62 C150 62 176 92 176 132 C176 172 150 198 120 198 C90 198 64 172 64 132 C64 92 90 62 120 62 Z"
        fill="var(--c-ink)"
      />
      <circle cx="120" cy="146" r="22" fill="var(--c-paper)" />
      <path d="M112 62 L104 24 L136 24 L128 62 Z" fill="var(--c-ink)" />
      <path d="M104 24 C96 14 112 8 120 16" fill="none" stroke="var(--c-alt)" strokeWidth="4" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M${108 + i * 5} 70 L${108 + i * 5} 190`}
          stroke="var(--c-paper)"
          strokeWidth="1"
          opacity="0.5"
        />
      ))}
      <path d="M64 132 C88 118 152 118 176 132" fill="none" stroke="var(--c-hot)" strokeWidth="3" />
    </ArchiveFrame>
  );
}

/** The room, in plan: two microphone positions and the reflections between them. */
function RoomPlanCover() {
  return (
    <>
      <rect x="24" y="24" width="192" height="192" fill="none" stroke="var(--c-ink)" strokeWidth="2" />
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d={`M24 ${34 + i * 22} H216`}
          stroke="var(--c-ink)"
          strokeWidth="0.7"
          opacity="0.4"
        />
      ))}
      {[46, 92, 138, 184].map((r) => (
        <circle
          key={r}
          cx="76"
          cy="164"
          r={r}
          fill="none"
          stroke="var(--c-alt)"
          strokeWidth="1.6"
          opacity="0.8"
        />
      ))}
      <circle cx="76" cy="164" r="9" fill="var(--c-hot)" />
      <circle cx="176" cy="76" r="9" fill="var(--c-hot)" />
      <path d="M76 164 L176 76" stroke="var(--c-ink)" strokeWidth="2" strokeDasharray="6 5" />
      <path d="M176 60 L176 30" stroke="var(--c-ink)" strokeWidth="2" />
      <rect x="24" y="24" width="192" height="10" fill="var(--c-ink)" />
    </>
  );
}

/** Two rooms, one open door. */
function TwoMicsCover() {
  return (
    <>
      <rect x="18" y="40" width="94" height="160" fill="none" stroke="var(--c-ink)" strokeWidth="2" />
      <rect x="128" y="40" width="94" height="160" fill="none" stroke="var(--c-ink)" strokeWidth="2" />
      <path d="M112 104 H128" stroke="var(--c-paper)" strokeWidth="8" />
      <path d="M112 104 A28 28 0 0 1 132 130" fill="none" stroke="var(--c-alt)" strokeWidth="2" />
      {[0, 1].map((s) => (
        <g key={s} transform={`translate(${s ? 175 : 65} 120)`}>
          <rect x="-4" y="-6" width="8" height="56" fill="var(--c-ink)" />
          <ellipse cy="-20" rx="14" ry="20" fill="var(--c-hot)" />
          <path d="M-14 -20 H14" stroke="var(--c-ink)" strokeWidth="2" />
          <path d="M-14 -12 H14" stroke="var(--c-ink)" strokeWidth="2" />
          <path d="M-14 -28 H14" stroke="var(--c-ink)" strokeWidth="2" />
          <path d="M-16 50 H16" stroke="var(--c-ink)" strokeWidth="4" />
        </g>
      ))}
      <rect y="216" width="240" height="24" fill="var(--c-alt)" />
    </>
  );
}

/**
 * The maqam, ruled.
 *
 * The archive's whole claim is that it is not playing in twelve-tone
 * temperament, and a sleeve cannot show that. So the archive prints its scale:
 * the piano's twelve semitones as faint ticks, the maqam's seven degrees over
 * them, and the degrees that sit between two keys called out in cents. It is the
 * one graphic on the page that teaches rather than identifies.
 */
export function MaqamRule({ cents, className }: { cents: readonly number[]; className?: string }) {
  const x = (c: number) => 12 + (c / 1200) * 176;
  return (
    <svg viewBox="0 0 200 88" className={className} aria-hidden="true">
      {/* The piano, for reference. */}
      {Array.from({ length: 13 }, (_, i) => (
        <line
          key={i}
          x1={x(i * 100)}
          y1={48}
          x2={x(i * 100)}
          y2={58}
          stroke="var(--m-line)"
          strokeWidth="1"
        />
      ))}
      <line x1="12" y1="58" x2="188" y2="58" stroke="var(--m-line)" strokeWidth="1.4" />

      {[...cents, 1200].map((c, i) => {
        const between = c % 100 !== 0;
        return (
          <g key={`${c}-${i}`}>
            <line
              x1={x(c)}
              y1={22}
              x2={x(c)}
              y2={58}
              stroke={between ? "var(--m-hot)" : "var(--m-ink)"}
              strokeWidth={between ? 2.4 : 1.8}
            />
            <circle
              cx={x(c)}
              cy={20}
              r={between ? 4 : 2.6}
              fill={between ? "var(--m-hot)" : "var(--m-ink)"}
            />
            {between && (
              <text
                x={x(c)}
                y={12}
                textAnchor="middle"
                fontSize="7"
                fill="var(--m-hot)"
                fontFamily="var(--font-space-mono), monospace"
              >
                {c}
              </text>
            )}
            <text
              x={x(c)}
              y={72}
              textAnchor="middle"
              fontSize="8"
              fill="var(--m-ink)"
              fontFamily="var(--font-space-mono), monospace"
            >
              {i + 1}
            </text>
          </g>
        );
      })}
      <text
        x="12"
        y="84"
        fontSize="7"
        fill="var(--m-line)"
        fontFamily="var(--font-space-mono), monospace"
      >
        0
      </text>
      <text
        x="188"
        y="84"
        textAnchor="end"
        fontSize="7"
        fill="var(--m-line)"
        fontFamily="var(--font-space-mono), monospace"
      >
        1200 cents
      </text>
    </svg>
  );
}

export function Cover({
  kind,
  portrait,
  className,
}: {
  kind: CoverKind;
  /** Archive sleeves print the performer in the medallion. */
  portrait?: PortraitSpec;
  className?: string;
}) {
  const body = (() => {
    switch (kind) {
      case "ceiling":
        return <CeilingCover />;
      case "shift":
        return <ShiftCover />;
      case "transmitter":
        return <TransmitterCover />;
      case "tapes":
        return <TapesCover />;
      case "moonlight":
        return <MoonlightCover />;
      case "medallion":
        return <MedallionCover portrait={portrait} />;
      case "lattice":
        return <LatticeCover />;
      case "cartouche":
        return <CartoucheCover />;
      case "roomplan":
        return <RoomPlanCover />;
      case "twomics":
        return <TwoMicsCover />;
    }
  })();

  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <rect width="240" height="240" fill="var(--c-paper)" />
      {body}
    </svg>
  );
}
