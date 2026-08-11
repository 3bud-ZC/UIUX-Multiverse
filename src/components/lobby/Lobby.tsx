"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { FieldCanvas } from "@/components/common/FieldCanvas";
import type { FieldColors } from "@/lib/fields";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { pad2, WORLDS, type World, type WorldId } from "@/lib/worlds";
import { useFieldTween } from "./useFieldTween";
import { WorldMark } from "./WorldMark";
import styles from "./Lobby.module.css";

/**
 * The lobby — an atlas of ten worlds, not a list of them.
 *
 * The whole room is built on one idea: **the lobby has no colour of its own.**
 * Idle, it is a greyscale colonnade behind ten glass panels; the moment a world
 * is held, that world's ground, ink, accent, display face and atmosphere flood
 * the entire screen — the light between the panels, the headline, the legend,
 * the seams. Nothing is previewed off to the side, because the wall *is* the
 * preview: you are holding a world and the room is turning into it.
 *
 * Desktop is a mosaic of ten unequal portals sharing one screen. Phone is not
 * that mosaic reflowed — it is ten full-bleed doors on a snapping track, and
 * the takeover follows the scroll instead of the pointer.
 */

/** The room with nothing held: machined, achromatic, deliberately meaningless. */
/**
 * The four landscape plates in the mosaic. They run their drawing and their
 * wordmark side by side instead of stacked — a wide, short box stacks into a
 * letterboxed drawing and a stranded name, which is exactly how a portal wall
 * starts looking like a placeholder wall.
 */
const WIDE = new Set<WorldId>(["atelier", "pulse", "orbit", "luma"]);

const NEUTRAL: FieldColors = {
  base: "#08090c",
  raise: "#121419",
  ink: "#a2a7b4",
  dim: "#5b6070",
  line: "#20222a",
  accent: "#8b91a1",
  accentAlt: "#4e525f",
};

export function Lobby() {
  const [held, setHeld] = useState<WorldId | null>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const world = useMemo(() => WORLDS.find((w) => w.id === held) ?? null, [held]);

  const target = useMemo<FieldColors>(() => {
    if (!world) return NEUTRAL;
    const p = world.palette;
    return {
      base: p.base,
      raise: p.line,
      ink: p.ink,
      dim: p.dim,
      line: p.line,
      accent: p.accent,
      accentAlt: p.accentAlt,
    };
  }, [world]);

  const fieldColors = useFieldTween(target);

  // Phone takes the world from the scroll position rather than the pointer:
  // the door filling the screen is the one you are holding.
  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;
    if (!window.matchMedia("(max-width: 900px)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio < 0.55) continue;
          const id = (entry.target as HTMLElement).dataset.tile as WorldId | undefined;
          if (id) setHeld(id);
        }
      },
      { threshold: [0.55, 0.8] },
    );
    for (const el of wall.querySelectorAll<HTMLElement>("[data-tile]")) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
    if (!keys.includes(event.key)) return;
    const links = Array.from(
      wallRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-tile]") ?? [],
    );
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (index < 0) return;
    event.preventDefault();
    const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
    links[(index + (forward ? 1 : links.length - 1)) % links.length]?.focus();
  }, []);

  const vars = {
    "--w-base": world?.palette.base ?? NEUTRAL.base,
    "--w-ink": world?.palette.ink ?? NEUTRAL.ink,
    "--w-dim": world?.palette.dim ?? NEUTRAL.dim,
    "--w-line": world?.palette.line ?? NEUTRAL.line,
    "--w-accent": world?.palette.accent ?? NEUTRAL.accent,
    "--w-alt": world?.palette.accentAlt ?? NEUTRAL.accentAlt,
    "--w-voice": world?.voice.var ?? "var(--font-sans-stack)",
    "--w-voice-weight": world?.voice.weight ?? 600,
    "--w-voice-axes": world?.voice.axes ?? "normal",
  } as CSSProperties;

  return (
    <div className={styles.lobby} data-held={world ? "" : undefined} style={vars}>
      <FieldCanvas kind="light-columns" colors={fieldColors} className={styles.field} follow={2.6} />
      <div className={styles.wash} aria-hidden="true" />

      <header className={styles.top}>
        <p className={styles.brand}>
          <span className={styles.mark}>ABUD</span>
          <span className={styles.role}>Product &amp; interface design</span>
        </p>

        <div className={styles.claims}>
          <p className={styles.claimIdle} aria-hidden={world ? "true" : undefined}>
            Ten finished websites. One hand. Nothing shared but the author.
          </p>

          {world && (
            <p className={styles.claimWorld} key={world.id}>
              {world.signature}
            </p>
          )}
        </div>
      </header>

      <main className={styles.wall} id="main" ref={wallRef} onKeyDown={onKeyDown}>
        {WORLDS.map((w) => (
          <Tile
            key={w.id}
            world={w}
            held={held === w.id}
            muted={held !== null && held !== w.id}
            reduced={reduced}
            onHold={() => setHeld(w.id)}
            onRelease={() => setHeld((c) => (c === w.id ? null : c))}
          />
        ))}
      </main>

      <footer className={styles.legend}>
        {world ? (
          <>
            <span className={styles.legendName}>
              {pad2(world.ordinal)} · {world.name}
              {world.altName ? ` · ${world.altName}` : ""}
            </span>
            <span className={styles.legendConcept}>{world.concept}</span>
            <span className={styles.legendSpec}>
              <b>{world.system.layout}</b>
              <b>{world.system.type}</b>
              <b>{world.system.motion}</b>
              <span className={styles.density} aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <i key={i} data-on={i < world.system.density ? "" : undefined} />
                ))}
              </span>
              <span className="sr-only">Density {world.system.density} of 5</span>
            </span>
          </>
        ) : (
          <>
            <span className={styles.legendName}>The atlas</span>
            <span className={styles.legendConcept}>
              Hold a world to turn the room into it. Open one to leave for good.
            </span>
            <span className={styles.legendSpec}>
              <b>Next.js · CSS Modules · canvas</b>
            </span>
          </>
        )}
      </footer>
    </div>
  );
}

function Tile({
  world,
  held,
  muted,
  reduced,
  onHold,
  onRelease,
}: {
  world: World;
  held: boolean;
  muted: boolean;
  reduced: boolean;
  onHold: () => void;
  onRelease: () => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  // The enter affordance tracks the hand inside the panel. Written straight to
  // the element: pointer movement must never cost a React render.
  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLAnchorElement>) => {
      if (reduced || event.pointerType !== "mouse") return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--px", `${event.clientX - rect.left}px`);
      el.style.setProperty("--py", `${event.clientY - rect.top}px`);
    },
    [reduced],
  );

  const vars = {
    "--t-base": world.palette.base,
    "--t-ink": world.palette.ink,
    "--t-dim": world.palette.dim,
    "--t-line": world.palette.line,
    "--t-accent": world.palette.accent,
    "--t-alt": world.palette.accentAlt,
    "--t-voice": world.voice.var,
    "--t-weight": world.voice.weight,
    "--t-tracking": world.voice.tracking,
    "--t-transform": world.voice.transform,
    "--t-axes": world.voice.axes ?? "normal",
    "--t-scale": world.voice.scale,
  } as CSSProperties;

  const wide = WIDE.has(world.id);

  return (
    <Link
      ref={ref}
      href={world.route}
      className={`${styles.tile} ${styles[world.id]} ${wide ? styles.wide : ""}`}
      style={vars}
      data-tile={world.id}
      data-held={held ? "" : undefined}
      data-muted={muted ? "" : undefined}
      data-rtl={world.rtl ? "" : undefined}
      onMouseEnter={onHold}
      onMouseLeave={onRelease}
      onFocus={onHold}
      onBlur={onRelease}
      onPointerMove={onPointerMove}
      aria-label={`${world.name} — ${world.category}. ${world.concept}`}
    >
      <span className={styles.tileHead}>
        <span className={styles.ordinal}>{pad2(world.ordinal)}</span>
        <span className={styles.category}>{world.category}</span>
      </span>

      <span className={styles.art}>
        <WorldMark world={world} live={held} />
      </span>

      {/* The wordmark is the only run of Arabic here; the caption and the
          concept line are English, so each carries its own direction rather
          than inheriting one and reordering its punctuation. */}
      <span className={styles.tileFoot}>
        <span className={styles.name} dir={world.rtl ? "rtl" : undefined} lang={world.rtl ? "ar" : undefined}>
          {world.altName ?? world.name}
        </span>
        {world.altName && (
          <span className={styles.latin} dir="ltr">
            {world.name}
          </span>
        )}
        {/* Shown in the landscape plates, which have room for it, and on every
            phone door, where a whole screen is given to one world. */}
        <span className={styles.blurb} dir="ltr">
          {world.concept}
        </span>
      </span>

      <span className={styles.enter} aria-hidden="true">
        Enter
        <svg viewBox="0 0 24 24" width="11" height="11">
          <path d="M5 19L19 5M19 5H9M19 5v10" fill="none" stroke="currentColor" strokeWidth="2.4" />
        </svg>
      </span>

      <span className={styles.rim} aria-hidden="true" />
    </Link>
  );
}
