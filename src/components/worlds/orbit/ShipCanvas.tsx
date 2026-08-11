"use client";

import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { pointerStore, trackPointer } from "@/lib/pointerStore";
import { buildSalvager, MATERIALS, type Mesh } from "./ship";

/**
 * Orbit's hero, rendered.
 *
 * This is the only animation frame loop on the route. It owns everything that
 * moves in the scene — the star field, the wrecks drifting past, the ship, its
 * plumes, and the two parallax variables the HUD and the title read — because a
 * cinematic hero that runs three separate loops is three chances to drop a frame
 * in the one place this world cannot afford to.
 *
 * The renderer is a painter's-algorithm rasteriser: model-space normals are lit
 * by a fixed key and rim, faces are sorted back to front and filled as flat
 * facets, and nothing is culled — every solid in the mesh is closed, so its own
 * near faces paint over its far ones. Two-sided shading (`|N·L|`) keeps that
 * honest without requiring every polygon in the ship to be wound perfectly.
 *
 * The camera is a real orbit: it drifts on a slow figure, answers the pointer,
 * pushes in through the countdown and falls away behind the ship on launch.
 */

/** Where the star is. Fixed in world space, so orbiting reads as orbiting. */
const KEY = normalise(-0.52, 0.62, 0.58);
const RIM = normalise(0.74, -0.2, -0.62);
/** The mesh runs from the nozzles at −52 to the claw at +86; centre it. */
const MODEL_CX = 14;

function normalise(x: number, y: number, z: number): [number, number, number] {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
}

export interface SceneEnv {
  /** Two nebula inks for this sector. */
  nebA: string;
  nebB: string;
  star: string;
  /** 0…1 — how much junk is in this sector's sky. */
  debris: number;
}

export type LaunchPhase = "idle" | "counting" | "ignition" | "away";

interface Prepared {
  mesh: Mesh;
  /** Model-space face normals, and centroids for depth sorting. */
  nx: Float32Array;
  ny: Float32Array;
  nz: Float32Array;
  cx: Float32Array;
  cy: Float32Array;
  cz: Float32Array;
}

function prepare(mesh: Mesh): Prepared {
  const n = mesh.faces.length;
  const nx = new Float32Array(n);
  const ny = new Float32Array(n);
  const nz = new Float32Array(n);
  const cx = new Float32Array(n);
  const cy = new Float32Array(n);
  const cz = new Float32Array(n);
  const pos = mesh.pos;

  for (let f = 0; f < n; f++) {
    const idx = mesh.faces[f]!.idx;
    const a = idx[0]! * 3;
    const b = idx[1]! * 3;
    const c = idx[2]! * 3;
    const [ux, uy, uz] = normalise(
      (pos[b + 1]! - pos[a + 1]!) * (pos[c + 2]! - pos[a + 2]!) -
        (pos[b + 2]! - pos[a + 2]!) * (pos[c + 1]! - pos[a + 1]!),
      (pos[b + 2]! - pos[a + 2]!) * (pos[c]! - pos[a]!) -
        (pos[b]! - pos[a]!) * (pos[c + 2]! - pos[a + 2]!),
      (pos[b]! - pos[a]!) * (pos[c + 1]! - pos[a + 1]!) -
        (pos[b + 1]! - pos[a + 1]!) * (pos[c]! - pos[a]!),
    );
    nx[f] = ux;
    ny[f] = uy;
    nz[f] = uz;

    let sx = 0;
    let sy = 0;
    let sz = 0;
    for (const i of idx) {
      sx += pos[i * 3]!;
      sy += pos[i * 3 + 1]!;
      sz += pos[i * 3 + 2]!;
    }
    cx[f] = sx / idx.length;
    cy[f] = sy / idx.length;
    cz[f] = sz / idx.length;
  }

  return { mesh, nx, ny, nz, cx, cy, cz };
}

/** Wrecks in the middle distance. The sector is a graveyard; say so. */
const HULKS = [
  { x: 0.14, y: 0.28, s: 66, spin: 0.02, seed: 3 },
  { x: 0.74, y: 0.14, s: 34, spin: -0.031, seed: 9 },
  { x: 0.88, y: 0.76, s: 104, spin: 0.014, seed: 17 },
  { x: 0.34, y: 0.84, s: 26, spin: -0.045, seed: 23 },
];

export function ShipCanvas({
  fitted,
  phase,
  env,
  className,
  /** The element the parallax variables are written to. */
  parallaxTarget,
}: {
  fitted: readonly string[];
  phase: LaunchPhase;
  env: SceneEnv;
  className?: string;
  parallaxTarget?: React.RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  // The mesh is rebuilt only when the loadout changes, never per frame.
  const prepared = useMemo(() => prepare(buildSalvager(fitted)), [fitted]);
  const preparedRef = useRef(prepared);
  preparedRef.current = prepared;
  const envRef = useRef(env);
  const phaseRef = useRef<LaunchPhase>(phase);
  phaseRef.current = phase;
  /** Set by the loop; called when something off-frame changes. */
  const wakeRef = useRef<((rebake: boolean) => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const release = trackPointer();

    let w = 0;
    let h = 0;
    let dpr = 1;
    let sky: HTMLCanvasElement | null = null;
    let raf = 0;
    let running = true;
    const start = performance.now();
    let previous = start;

    /* Per-frame scratch, sized to the mesh rather than allocated every frame. */
    let sxArr = new Float32Array(0);
    let syArr = new Float32Array(0);
    let depth = new Float32Array(0);
    let order: number[] = [];
    let sizedFor: Mesh | null = null;

    /* Camera state, eased every frame toward where the scene wants it. */
    const cam = { yaw: 0.62, pitch: -0.16, dist: 300, shift: 0, plume: 0.18, roll: 0 };

    /** Deterministic star field and nebula, baked once per size and sector. */
    const bakeSky = () => {
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.floor(w * dpr));
      c.height = Math.max(1, Math.floor(h * dpr));
      const g = c.getContext("2d");
      if (!g) return null;
      g.scale(dpr, dpr);

      const { nebA, nebB, star } = envRef.current;
      for (const [colour, ax, ay, ar] of [
        [nebA, 0.24, 0.32, 0.82],
        [nebB, 0.8, 0.68, 0.62],
      ] as const) {
        const grad = g.createRadialGradient(w * ax, h * ay, 0, w * ax, h * ay, Math.max(w, h) * ar);
        grad.addColorStop(0, colour);
        grad.addColorStop(1, "rgba(6,6,9,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, w, h);
      }

      // Three parallax depths of stars. Nearer stars are larger and brighter.
      let seed = 0x2f6a1b;
      const rnd = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      for (let layer = 0; layer < 3; layer++) {
        const count = Math.round((w * h) / (layer === 0 ? 5200 : layer === 1 ? 9000 : 18000));
        for (let i = 0; i < count; i++) {
          const x = rnd() * w;
          const y = rnd() * h;
          const r = 0.35 + layer * 0.45 + rnd() * 0.5;
          g.globalAlpha = 0.2 + layer * 0.26 + rnd() * 0.24;
          g.fillStyle = rnd() > 0.9 ? star : "#e8e6ff";
          g.beginPath();
          g.arc(x, y, r, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.globalAlpha = 1;
      return c;
    };

    const resize = (force = false) => {
      const rect = canvas.getBoundingClientRect();
      const nw = Math.max(1, Math.round(rect.width));
      const nh = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (nw === w && nh === h && !force) return;
      w = nw;
      h = nh;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sky = bakeSky();
    };

    const drawHulk = (
      hx: number,
      hy: number,
      size: number,
      angle: number,
      seed: number,
      alpha: number,
    ) => {
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(angle);
      let s = (seed * 2654435761) >>> 0;
      const rnd = () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
      };
      ctx.beginPath();
      const points = 9;
      for (let i = 0; i < points; i++) {
        const a = (i / points) * Math.PI * 2;
        const r = size * (0.55 + rnd() * 0.5);
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r * 0.72;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      // Lit across the same axis as the ship's key light, with a terminator, so
      // a wreck reads as a rock catching the star rather than as a hole.
      const shade = ctx.createLinearGradient(-size, -size * 0.7, size * 0.7, size * 0.6);
      shade.addColorStop(0, `rgba(74,66,118,${alpha})`);
      shade.addColorStop(0.42, `rgba(34,30,60,${alpha})`);
      shade.addColorStop(1, `rgba(10,9,18,${alpha})`);
      ctx.fillStyle = shade;
      ctx.fill();
      ctx.strokeStyle = `rgba(140,116,255,${alpha * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const t = (now - start) / 1000;
      const dt = Math.min((now - previous) / 1000, 1 / 30);
      previous = now;
      resize();
      if (!sky) return;

      const active = phaseRef.current;
      const px = pointerStore.present && !reduced ? pointerStore.nx - 0.5 : 0;
      const py = pointerStore.present && !reduced ? pointerStore.ny - 0.5 : 0;

      /* Where the camera wants to be. The countdown pushes in and rolls a
         little; the launch drops the ship away down the lens. */
      const drift = reduced ? 0 : 1;
      const wantYaw = 0.62 + Math.sin(t * 0.055) * 0.13 * drift + px * 0.42;
      const wantPitch = -0.16 + Math.sin(t * 0.041) * 0.05 * drift + py * 0.26;
      const wantDist =
        active === "away" ? 780 : active === "ignition" ? 230 : active === "counting" ? 262 : 300;
      const wantShift = active === "away" ? 260 : 0;
      const wantPlume =
        active === "away" ? 1 : active === "ignition" ? 0.9 : active === "counting" ? 0.44 : 0.18;
      const wantRoll = active === "counting" || active === "ignition" ? 0.04 : 0;

      const k = reduced ? 1 : 1 - Math.exp(-dt * 2.4);
      cam.yaw += (wantYaw - cam.yaw) * k;
      cam.pitch += (wantPitch - cam.pitch) * k;
      cam.dist += (wantDist - cam.dist) * (reduced ? 1 : 1 - Math.exp(-dt * 1.4));
      cam.shift += (wantShift - cam.shift) * (reduced ? 1 : 1 - Math.exp(-dt * 1.05));
      cam.plume += (wantPlume - cam.plume) * k;
      cam.roll += (wantRoll - cam.roll) * k;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(sky, -px * 26, -py * 16, w, h);

      const spin = reduced ? 0 : t;
      for (const hulk of HULKS) {
        drawHulk(
          hulk.x * w - px * 60,
          hulk.y * h - py * 34,
          hulk.s * (0.7 + envRef.current.debris * 0.6),
          spin * hulk.spin,
          hulk.seed,
          0.45 + envRef.current.debris * 0.4,
        );
      }

      /* ── The ship ───────────────────────────────────────────────────── */
      const { mesh, nx, ny, nz, cx, cy, cz } = preparedRef.current;
      const faces = mesh.faces;
      const pos = mesh.pos;
      const count = faces.length;

      if (sizedFor !== mesh) {
        sizedFor = mesh;
        sxArr = new Float32Array(pos.length / 3);
        syArr = new Float32Array(pos.length / 3);
        depth = new Float32Array(count);
        order = Array.from({ length: count }, (_, i) => i);
      }

      const sinY = Math.sin(cam.yaw);
      const cosY = Math.cos(cam.yaw);
      const sinP = Math.sin(cam.pitch);
      const cosP = Math.cos(cam.pitch);
      const sinR = Math.sin(cam.roll);
      const cosR = Math.cos(cam.roll);
      const focal = Math.min(w, h) * 1.55;
      // The ship sits right of centre and a little high, so the title keeps the
      // left third of the frame to itself.
      const wide = w > 900;
      const ox = w * (wide ? 0.64 : 0.5);
      const oy = h * (wide ? 0.44 : 0.3);

      let vx = 0;
      let vy = 0;
      let vz = 0;
      const view = (x: number, y: number, z: number) => {
        const mx = x - MODEL_CX + cam.shift;
        const x1 = mx * cosY + z * sinY;
        const z1 = -mx * sinY + z * cosY;
        const y2 = y * cosP - z1 * sinP;
        vz = y * sinP + z1 * cosP + cam.dist;
        vx = x1 * cosR - y2 * sinR;
        vy = x1 * sinR + y2 * cosR;
      };

      for (let i = 0, p = 0; p < pos.length; i++, p += 3) {
        view(pos[p]!, pos[p + 1]!, pos[p + 2]!);
        const zc = Math.max(20, vz);
        sxArr[i] = ox + (vx * focal) / zc;
        syArr[i] = oy - (vy * focal) / zc;
      }
      for (let f = 0; f < count; f++) {
        view(cx[f]!, cy[f]!, cz[f]!);
        depth[f] = vz;
      }
      order.sort((a, b) => depth[b]! - depth[a]!);

      ctx.lineJoin = "round";
      for (const f of order) {
        const face = faces[f]!;
        const mat = MATERIALS[face.mat];
        const idx = face.idx;

        // Two-sided lighting: the sign of the normal does not matter, only how
        // steeply the facet leans away from the star.
        const key = Math.abs(nx[f]! * KEY[0] + ny[f]! * KEY[1] + nz[f]! * KEY[2]);
        const rim = Math.abs(nx[f]! * RIM[0] + ny[f]! * RIM[1] + nz[f]! * RIM[2]);
        const lit = mat.emissive
          ? 1
          : 0.13 + mat.lit * (1.02 * Math.pow(key, 1.15) + 0.34 * Math.pow(rim, 4));
        // Depth haze: the far end of a forty-metre hull should fall off.
        const haze = Math.min(1, Math.max(0, (depth[f]! - cam.dist + 70) / 300));
        const shade = (v: number) => Math.round(Math.min(255, v * lit * (1 - haze * 0.4)));
        const [r, g, bl] = mat.rgb;

        ctx.beginPath();
        ctx.moveTo(sxArr[idx[0]!]!, syArr[idx[0]!]!);
        for (let i = 1; i < idx.length; i++) ctx.lineTo(sxArr[idx[i]!]!, syArr[idx[i]!]!);
        ctx.closePath();

        ctx.globalAlpha = mat.alpha ?? 1;
        ctx.fillStyle = `rgb(${shade(r)},${shade(g)},${shade(bl)})`;
        ctx.fill();

        if (mat.edge > 0) {
          ctx.strokeStyle = `rgba(${Math.min(255, r + 90)},${Math.min(255, g + 86)},255,${(
            mat.edge *
            0.38 *
            (1 - haze * 0.6)
          ).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      /* ── Plumes and running lights, added rather than painted ───────── */
      view(0, 0, 0);
      const o0x = ox + (vx * focal) / Math.max(20, vz);
      const o0y = oy - (vy * focal) / Math.max(20, vz);
      view(-30, 0, 0);
      const o1x = ox + (vx * focal) / Math.max(20, vz);
      const o1y = oy - (vy * focal) / Math.max(20, vz);
      let dirx = o1x - o0x;
      let diry = o1y - o0y;
      const dl = Math.hypot(dirx, diry) || 1;
      dirx /= dl;
      diry /= dl;

      ctx.globalCompositeOperation = "lighter";
      for (const noz of mesh.nozzles) {
        view(noz.x, noz.y, noz.z);
        if (vz < 24) continue;
        const zc = Math.max(20, vz);
        const sx = ox + (vx * focal) / zc;
        const sy = oy - (vy * focal) / zc;
        const scale = focal / zc;
        const len = noz.r * scale * (2.2 + cam.plume * 15);
        const half = noz.r * scale * (0.85 + cam.plume * 0.5);
        // A flicker that reads as combustion rather than as a CSS pulse.
        const flick = reduced ? 1 : 0.86 + Math.sin(t * 41 + noz.z) * 0.07 + Math.sin(t * 27) * 0.07;

        const ex = sx + dirx * len;
        const ey = sy + diry * len;
        const grad = ctx.createLinearGradient(sx, sy, ex, ey);
        grad.addColorStop(0, `rgba(255,236,214,${(0.85 * cam.plume * flick).toFixed(3)})`);
        grad.addColorStop(0.25, `rgba(255,142,72,${(0.55 * cam.plume * flick).toFixed(3)})`);
        grad.addColorStop(1, "rgba(124,92,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(sx - diry * half, sy + dirx * half);
        ctx.lineTo(sx + diry * half, sy - dirx * half);
        ctx.lineTo(ex + diry * half * 0.22, ey - dirx * half * 0.22);
        ctx.lineTo(ex - diry * half * 0.22, ey + dirx * half * 0.22);
        ctx.closePath();
        ctx.fill();

        const core = ctx.createRadialGradient(sx, sy, 0, sx, sy, half * 1.7);
        core.addColorStop(0, `rgba(255,246,232,${(0.9 * cam.plume).toFixed(3)})`);
        core.addColorStop(1, "rgba(255,120,60,0)");
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(sx, sy, half * 1.7, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const light of mesh.lights) {
        view(light.x, light.y, light.z);
        if (vz < 24) continue;
        const zc = Math.max(20, vz);
        const sx = ox + (vx * focal) / zc;
        const sy = oy - (vy * focal) / zc;
        const blink = reduced ? 0.6 : 0.32 + 0.5 * Math.abs(Math.sin(t * (light.alt ? 1.7 : 2.3)));
        // A navigation light is a point, not a bloom: scaled by distance but
        // held to a few pixels, or it washes the plating it is bolted to.
        const r = Math.min(4.2, Math.max(1.6, (focal / zc) * 0.55));
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 3);
        grad.addColorStop(
          0,
          light.alt ? `rgba(255,150,90,${blink.toFixed(3)})` : `rgba(196,206,255,${blink.toFixed(3)})`,
        );
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      /* The rest of the scene reads the same pointer through two variables, so
         the HUD and the title move with the camera without any React state. */
      const target = parallaxTarget?.current;
      if (target) {
        target.style.setProperty("--px", px.toFixed(4));
        target.style.setProperty("--py", py.toFixed(4));
      }

      // Reduced motion: one composed frame, then park the loop.
      if (reduced) {
        cancelAnimationFrame(raf);
        running = false;
      }
    };

    const restart = (rebake: boolean) => {
      if (rebake) resize(true);
      if (running) return;
      running = true;
      previous = performance.now();
      raf = requestAnimationFrame(frame);
    };
    wakeRef.current = restart;

    const observer = new ResizeObserver(() => restart(false));
    observer.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        running = false;
      } else {
        restart(false);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      wakeRef.current = null;
      release();
    };
  }, [reduced, parallaxTarget]);

  /* A loadout change, a launch step or a new sector has to redraw — and if the
     reduced-motion loop has parked after its single frame, wake it first. */
  useEffect(() => {
    const rebake = envRef.current !== env;
    envRef.current = env;
    wakeRef.current?.(rebake);
  }, [prepared, phase, env]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="The Salvager, fitted for this contract, drifting in the sector"
    />
  );
}
