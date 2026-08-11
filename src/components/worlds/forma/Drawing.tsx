"use client";

import { useId, useMemo } from "react";
import type { ModeId, Volume, Work } from "./data";
import styles from "./Forma.module.css";

/**
 * One projection, four drawings.
 *
 * The office does not keep a plan file and a section file. It keeps a set-out —
 * volumes in metres — and every view is that set-out seen from somewhere:
 *
 *     rotate about z by the azimuth, tilt about x by the elevation
 *     sy = y′·sin(el) − z·cos(el)
 *
 * At 90° of elevation that is a plan. At 0° it is a section. Anywhere between,
 * it is an axonometric. So the elevation slider is not a gimmick: dragging it
 * folds the plan up off the sheet into the axonometric, and you can watch which
 * walls in plan become which walls in the volume. That is the one thing a
 * drawing set cannot show you on paper.
 *
 * Everything else on the panel is downstream of the same geometry. Poché is only
 * drawn where the projection actually cuts (near plan or near section), because
 * hatching an axonometric would be a lie about what hatch means. Levels come
 * from the volumes, so isolating a floor and exploding the stack are the same
 * data read two ways. Daylight rotates a real light vector against real face
 * normals. The dimension strings are measured off the volumes in millimetres.
 */

export interface ViewState {
  mode: ModeId;
  az: number;
  el: number;
  /** 0…1. Lifts each storey clear of the one under it. */
  explode: number;
  /** null = the whole building; otherwise only that storey is drawn solid. */
  level: number | null;
  grid: boolean;
  dims: boolean;
  annos: boolean;
  structure: boolean;
  /** Sun azimuth in degrees. */
  sun: number;
  heavy: boolean;
}

const W = 480;
const H = 300;
const PAD = 54;

type P = [number, number];

function project(
  x: number,
  y: number,
  z: number,
  az: number,
  el: number,
): P {
  const a = (az * Math.PI) / 180;
  const e = (el * Math.PI) / 180;
  const x1 = x * Math.cos(a) + y * Math.sin(a);
  const y1 = -x * Math.sin(a) + y * Math.cos(a);
  return [x1, y1 * Math.sin(e) - z * Math.cos(e)];
}

/** The six corners of a box, projected. */
function corners(v: Volume, az: number, el: number, lift: number) {
  const z0 = v.z + lift;
  const z1 = v.z + v.h + lift;
  const pts: Record<string, P> = {};
  for (const [key, x, y, z] of [
    ["a", v.x, v.y, z0],
    ["b", v.x + v.w, v.y, z0],
    ["c", v.x + v.w, v.y + v.d, z0],
    ["d", v.x, v.y + v.d, z0],
    ["e", v.x, v.y, z1],
    ["f", v.x + v.w, v.y, z1],
    ["g", v.x + v.w, v.y + v.d, z1],
    ["h", v.x, v.y + v.d, z1],
  ] as const) {
    pts[key] = project(x, y, z, az, el);
  }
  return pts;
}

/** Shade from a real light vector against the face's real normal. */
function shade(normal: [number, number, number], sun: number): number {
  const a = (sun * Math.PI) / 180;
  const light: [number, number, number] = [
    Math.sin(a) * 0.62,
    -Math.cos(a) * 0.62,
    0.48,
  ];
  const dot =
    normal[0] * light[0] + normal[1] * light[1] + normal[2] * light[2];
  return Math.max(0, Math.min(1, 0.28 + dot * 0.9));
}

export function Drawing({ work, view }: { work: Work; view: ViewState }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { az, el, explode, level, grid, dims, annos, structure, sun, heavy } = view;

  /* Fit. The scale is measured off the geometry and then reported honestly,
     which is why a 96 m² workshop and a 1 240 m² archive do not claim the same
     scale on the same sheet. */
  const fit = useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    const probe = (x: number, y: number, z: number) => {
      const [px, py] = project(x, y, z, az, el);
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    };
    for (const v of work.volumes) {
      const lift = explode * v.level * 4.5;
      for (const dx of [0, v.w]) {
        for (const dy of [0, v.d]) {
          probe(v.x + dx, v.y + dy, v.z + lift);
          probe(v.x + dx, v.y + dy, v.z + v.h + lift);
        }
      }
    }
    const spanX = Math.max(1, maxX - minX);
    const spanY = Math.max(1, maxY - minY);
    const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2 - 22) / spanY);
    return {
      scale,
      ox: PAD + (W - PAD * 2 - spanX * scale) / 2 - minX * scale,
      oy: PAD + (H - PAD * 2 - 22 - spanY * scale) / 2 - minY * scale,
      spanX,
    };
  }, [work.volumes, az, el, explode]);

  const to = (p: P): P => [fit.ox + p[0] * fit.scale, fit.oy + p[1] * fit.scale];
  const at = (x: number, y: number, z: number) => to(project(x, y, z, az, el));
  const poly = (pts: P[]) => pts.map((p) => p.join(",")).join(" ");

  /* Poché belongs to a cut. Near plan and near section the projection is a cut,
     and anywhere else it is not — so the hatch appears and disappears with the
     elevation slider rather than being switched on by a mode. */
  const cutting = el > 78 ? "plan" : el < 12 ? "section" : null;

  /** Nominal architectural scale, chosen from the fit rather than asserted. */
  const nominal = useMemo(() => {
    const mmPerUnit = 1000 / fit.scale;
    for (const s of [50, 100, 200, 500, 1000]) if (mmPerUnit <= s) return s;
    return 1000;
  }, [fit.scale]);

  const ordered = useMemo(
    () =>
      [...work.volumes]
        .map((v, i) => ({ v, i }))
        .sort((a, b) => {
          const ka = project(a.v.x + a.v.w / 2, a.v.y + a.v.d / 2, a.v.z, az, el);
          const kb = project(b.v.x + b.v.w / 2, b.v.y + b.v.d / 2, b.v.z, az, el);
          return a.v.z - b.v.z || ka[1] - kb[1];
        }),
    [work.volumes, az, el],
  );

  const lw = heavy ? 1.9 : 1;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={styles.drawing}
      role="img"
      aria-label={`${work.name} — ${view.mode} at ${Math.round(az)} degrees azimuth and ${Math.round(el)} degrees elevation`}
      data-weight={heavy ? "heavy" : "fine"}
      style={{ "--lw": lw } as React.CSSProperties}
    >
      <defs>
        <pattern
          id={`${uid}h`}
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
        </pattern>
      </defs>

      {/* ── The sheet: site grid, set out on the project's structural bay ─── */}
      {grid && (
        <g className={styles.grid}>
          {(() => {
            const lines: React.ReactNode[] = [];
            const reach = Math.ceil(fit.spanX / fit.scale);
            const steps = Math.min(18, Math.ceil(reach / work.bay) + 4);
            for (let i = -steps; i <= steps; i++) {
              const g = i * work.bay;
              const a = at(g, -steps * work.bay, 0);
              const b = at(g, steps * work.bay, 0);
              lines.push(<line key={`v${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />);
              const c = at(-steps * work.bay, g, 0);
              const d = at(steps * work.bay, g, 0);
              lines.push(<line key={`h${i}`} x1={c[0]} y1={c[1]} x2={d[0]} y2={d[1]} />);
            }
            return lines;
          })()}
        </g>
      )}

      {/* Ground, with the site's actual fall across it. */}
      {cutting === "section" && (
        <g>
          {(() => {
            const left = at(-40, 0, -40 * work.slope);
            const right = at(40, 0, 40 * work.slope);
            return (
              <>
                <path className={styles.ground} d={`M${left[0]} ${left[1]} L${right[0]} ${right[1]}`} />
                <path
                  className={styles.earth}
                  fill={`url(#${uid}h)`}
                  d={`M${left[0]} ${left[1]} L${right[0]} ${right[1]} L${right[0]} ${H - 18} L${left[0]} ${H - 18} Z`}
                />
              </>
            );
          })()}
        </g>
      )}

      {/* ── The volumes ────────────────────────────────────────────────────── */}
      {ordered.map(({ v, i }) => {
        const lift = explode * v.level * 4.5;
        const c = corners(v, az, el, lift);
        const ghost = level !== null && v.level !== level;
        const isVoid = v.kind === "void";
        const roofish = v.kind === "roof";

        const top = poly([to(c.e!), to(c.f!), to(c.g!), to(c.h!)]);
        const south = poly([to(c.a!), to(c.b!), to(c.f!), to(c.e!)]);
        const east = poly([to(c.b!), to(c.c!), to(c.g!), to(c.f!)]);
        const north = poly([to(c.d!), to(c.c!), to(c.g!), to(c.h!)]);
        const west = poly([to(c.a!), to(c.d!), to(c.h!), to(c.e!)]);

        // Only the faces the sun can see are worth shading; the two hidden ones
        // are behind the box in every orientation this projection allows.
        const faces: { pts: string; n: [number, number, number] }[] = [
          { pts: top, n: [0, 0, 1] },
          { pts: south, n: [0, -1, 0] },
          { pts: east, n: [1, 0, 0] },
          { pts: north, n: [0, 1, 0] },
          { pts: west, n: [-1, 0, 0] },
        ];

        const footprint = poly([to(c.a!), to(c.b!), to(c.c!), to(c.d!)]);

        return (
          <g key={i} className={styles.vol} data-ghost={ghost ? "" : undefined} data-void={isVoid ? "" : undefined}>
            {/* A cast shadow on the site, from the same sun. */}
            {view.mode === "mass" && !isVoid && el > 8 && (
              <polygon
                className={styles.shadow}
                points={poly(
                  [c.a!, c.b!, c.c!, c.d!].map((_, k) => {
                    const src = [
                      [v.x, v.y],
                      [v.x + v.w, v.y],
                      [v.x + v.w, v.y + v.d],
                      [v.x, v.y + v.d],
                    ][k]!;
                    const drop = (v.z + v.h) * 0.75;
                    const a = ((sun + 180) * Math.PI) / 180;
                    return at(src[0]! + Math.sin(a) * drop, src[1]! - Math.cos(a) * drop, 0);
                  }),
                )}
              />
            )}

            {cutting && !isVoid ? (
              /* Cut: poché. In plan the footprint is hatched; in section the
                 elevation of the mass is. */
              <polygon
                className={roofish ? styles.roofCut : styles.solid}
                points={cutting === "plan" ? footprint : south}
                fill={`url(#${uid}h)`}
              />
            ) : (
              faces.map((f, k) => (
                <polygon
                  key={k}
                  className={isVoid ? styles.voidFace : styles.face}
                  points={f.pts}
                  style={
                    isVoid
                      ? undefined
                      : ({ "--sh": shade(f.n, sun).toFixed(3) } as React.CSSProperties)
                  }
                />
              ))
            )}

            {isVoid && cutting === "plan" && <polygon className={styles.voidFace} points={footprint} />}

            {/* The room's name, where the room is. */}
            {annos && v.name && cutting === "plan" && (
              <text
                className={styles.label}
                x={at(v.x + v.w / 2, v.y + v.d / 2, 0)[0]}
                y={at(v.x + v.w / 2, v.y + v.d / 2, 0)[1]}
                textAnchor="middle"
              >
                {v.name}
              </text>
            )}
          </g>
        );
      })}

      {/* ── The roof, which is a different shape on every project ─────────── */}
      {cutting === "section" && <RoofProfile work={work} at={at} />}

      {/* ── Structure: columns on the bay, and what carries what ──────────── */}
      {structure && (
        <g className={styles.structure}>
          {(() => {
            const marks: React.ReactNode[] = [];
            const base = work.volumes[0]!;
            const cols = Math.max(1, Math.round(base.w / work.bay));
            const rows = Math.max(1, Math.round(base.d / work.bay));
            for (let i = 0; i <= cols; i++) {
              for (let j = 0; j <= rows; j++) {
                const x = base.x + (i / cols) * base.w;
                const y = base.y + (j / rows) * base.d;
                const foot = at(x, y, 0);
                const head = at(x, y, base.h);
                marks.push(
                  <path key={`c${i}-${j}`} d={`M${foot[0]} ${foot[1]} L${head[0]} ${head[1]}`} />,
                );
                marks.push(<circle key={`n${i}-${j}`} cx={foot[0]} cy={foot[1]} r={2.2} />);
              }
            }
            return marks;
          })()}
        </g>
      )}

      {/* ── Dimensions, measured off the geometry in millimetres ──────────── */}
      {dims && cutting && (
        <g className={styles.dimGroup}>
          {(() => {
            const v = work.volumes[0]!;
            const isPlan = cutting === "plan";
            // Offset far enough off the wall to read as a dimension, close
            // enough to stay inside the sheet the fit measured.
            const off = 1.6;
            const a = isPlan ? at(v.x, v.y - off, 0) : at(v.x, v.y, 0);
            const b = isPlan ? at(v.x + v.w, v.y - off, 0) : at(v.x + v.w, v.y, 0);
            const value = Math.round(v.w * 1000);
            const vert = isPlan
              ? [at(v.x - off, v.y, 0), at(v.x - off, v.y + v.d, 0), Math.round(v.d * 1000)]
              : [at(v.x - off, v.y, 0), at(v.x - off, v.y, v.h), Math.round(v.h * 1000)];
            return (
              <>
                <path className={styles.dimLine} d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} />
                <text
                  className={styles.dimText}
                  x={(a[0] + b[0]) / 2}
                  y={(a[1] + b[1]) / 2 - 5}
                  textAnchor="middle"
                >
                  {value.toLocaleString("en-GB").replace(/,/g, " ")}
                </text>
                <path
                  className={styles.dimLine}
                  d={`M${(vert[0] as P)[0]} ${(vert[0] as P)[1]} L${(vert[1] as P)[0]} ${(vert[1] as P)[1]}`}
                />
                <text
                  className={styles.dimText}
                  x={((vert[0] as P)[0] + (vert[1] as P)[0]) / 2 - 6}
                  y={((vert[0] as P)[1] + (vert[1] as P)[1]) / 2}
                  textAnchor="end"
                >
                  {(vert[2] as number).toLocaleString("en-GB").replace(/,/g, " ")}
                </text>
              </>
            );
          })()}
        </g>
      )}

      {/* A figure. A section without one is a diagram of nothing. */}
      {cutting === "section" && (
        <g className={styles.figure}>
          {(() => {
            const f = at(work.volumes[0]!.x + work.volumes[0]!.w + 2.4, 0, 0);
            const s = fit.scale;
            return (
              <>
                <circle cx={f[0]} cy={f[1] - 1.66 * s} r={0.14 * s} />
                <path
                  d={`M${f[0]} ${f[1] - 1.5 * s} V${f[1] - 0.82 * s} M${f[0]} ${f[1] - 0.82 * s} L${f[0] - 0.2 * s} ${f[1]} M${f[0]} ${f[1] - 0.82 * s} L${f[0] + 0.2 * s} ${f[1]}`}
                />
                <path d={`M${f[0] - 0.28 * s} ${f[1] - 1.32 * s} H${f[0] + 0.28 * s}`} />
              </>
            );
          })()}
        </g>
      )}

      {/* ── The sheet's own notes ─────────────────────────────────────────── */}
      <text x="40" y={H - 16} className={styles.label}>
        {cutting === "plan"
          ? `PLAN · SCALE 1:${nominal} · DIMENSIONS IN MM`
          : cutting === "section"
            ? `SECTION A–A · SCALE 1:${nominal} · FALL 1:${Math.round(1 / Math.max(0.005, work.slope))}`
            : `AXONOMETRIC · ${Math.round(az)}° / ${Math.round(el)}° · NOT TO SCALE`}
      </text>
      {cutting && (
        <g className={styles.scaleBar}>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={330 + i * 25}
              y={H - 26}
              width="25"
              height="5"
              className={i % 2 ? styles.scaleAlt : undefined}
            />
          ))}
        </g>
      )}

      {/* The sun, drawn where it actually is. */}
      {!cutting && (
        <g className={styles.sunMark}>
          {(() => {
            const r = 30;
            const a = (sun * Math.PI) / 180;
            const cx = W - 44;
            const cy = 40;
            return (
              <>
                <circle cx={cx} cy={cy} r={r * 0.62} />
                <path
                  d={`M${cx} ${cy} L${cx + Math.sin(a) * r} ${cy - Math.cos(a) * r * 0.6}`}
                  markerEnd=""
                />
                <text x={cx} y={cy + r * 0.62 + 10} textAnchor="middle" className={styles.label}>
                  {Math.round(sun)}°
                </text>
              </>
            );
          })()}
        </g>
      )}
    </svg>
  );
}

/** The roof, which is the one thing that is genuinely different per project. */
function RoofProfile({
  work,
  at,
}: {
  work: Work;
  at: (x: number, y: number, z: number) => P;
}) {
  const v = work.volumes[0]!;
  const l = v.x;
  const r = v.x + v.w;
  const mid = v.x + v.w / 2;
  const top = v.z + v.h;

  if (work.roof === "pitch") {
    const a = at(l - 0.5, v.y, top);
    const p = at(mid, v.y, top + v.w * 0.28);
    const b = at(r + 0.5, v.y, top);
    return (
      <path
        className={styles.thick}
        d={`M${a[0]} ${a[1]} L${p[0]} ${p[1]} L${b[0]} ${b[1]}`}
      />
    );
  }

  if (work.roof === "monitor") {
    const monitor = work.volumes.find((x) => x.kind === "roof") ?? v;
    const a = at(l, v.y, top);
    const b = at(monitor.x, v.y, top);
    const c = at(monitor.x, v.y, monitor.z + monitor.h);
    const d = at(monitor.x + monitor.w, v.y, monitor.z + monitor.h);
    const e = at(monitor.x + monitor.w, v.y, top);
    const f = at(r, v.y, top);
    return (
      <>
        <path
          className={styles.thick}
          d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]} L${d[0]} ${d[1]} L${e[0]} ${e[1]} L${f[0]} ${f[1]}`}
        />
        {/* The glazed face, which is the whole reason for the monitor. */}
        <path className={styles.thin} d={`M${c[0]} ${c[1]} L${e[0]} ${e[1]}`} />
      </>
    );
  }

  if (work.roof === "vault") {
    const a = at(l, v.y, top - v.w * 0.34);
    const p = at(mid, v.y, top + v.w * 0.1);
    const b = at(r, v.y, top - v.w * 0.34);
    return (
      <path
        className={styles.thick}
        fill="none"
        d={`M${a[0]} ${a[1]} Q${p[0]} ${p[1]} ${b[0]} ${b[1]}`}
      />
    );
  }

  const a = at(l - 0.8, v.y, top);
  const b = at(r + 0.8, v.y, top);
  return <path className={styles.thick} d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} />;
}
