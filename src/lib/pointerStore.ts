/**
 * Pointer position as a mutable module singleton.
 *
 * Deliberately outside React: pointer movement fires far more often than the UI
 * needs to re-render, so the two consumers (the atmosphere canvas and the
 * custom pointer) read this object inside their own animation frames instead of
 * pushing state updates on every move.
 */

export type PointerIntent = "idle" | "world" | "action" | "text";

interface PointerStore {
  /** Viewport coordinates in CSS pixels. */
  x: number;
  y: number;
  /** Normalised to 0…1 across the viewport. */
  nx: number;
  ny: number;
  /** False until the pointer has actually moved, and after it leaves. */
  present: boolean;
  down: boolean;
  intent: PointerIntent;
  /** Short label the pointer renders — e.g. the world about to be entered. */
  label: string | null;
}

export const pointerStore: PointerStore = {
  x: 0,
  y: 0,
  nx: 0.5,
  ny: 0.5,
  present: false,
  down: false,
  intent: "idle",
  label: null,
};

let listeners = 0;
let detach: (() => void) | null = null;
/**
 * Woken when intent changes without a pointer event behind it — an overlay
 * opening over a hovered control, for instance. The custom pointer parks its
 * frame loop when nothing is moving, so it needs telling.
 */
const watchers = new Set<() => void>();
// Cached so the move handler never reads layout. `pointermove` is not throttled
// and can fire thousands of times a second on a high-poll-rate mouse.
let viewportW = 1;
let viewportH = 1;

function measureViewport() {
  viewportW = window.innerWidth || 1;
  viewportH = window.innerHeight || 1;
}

function handleMove(event: PointerEvent) {
  pointerStore.x = event.clientX;
  pointerStore.y = event.clientY;
  pointerStore.nx = event.clientX / viewportW;
  pointerStore.ny = event.clientY / viewportH;
  pointerStore.present = true;
}

function handleLeave() {
  pointerStore.present = false;
  pointerStore.intent = "idle";
  pointerStore.label = null;
  // Without this a press that ends outside the window leaves the pointer stuck
  // in its down state for the rest of the session.
  pointerStore.down = false;
  for (const watcher of watchers) watcher();
}

function handleDown() {
  pointerStore.down = true;
}

function handleUp() {
  pointerStore.down = false;
}

/** Ref-counted so several components can subscribe without duplicate listeners. */
export function trackPointer(): () => void {
  listeners += 1;
  if (listeners === 1) {
    measureViewport();
    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerdown", handleDown, { passive: true });
    window.addEventListener("pointerup", handleUp, { passive: true });
    window.addEventListener("pointercancel", handleUp, { passive: true });
    window.addEventListener("blur", handleLeave);
    window.addEventListener("resize", measureViewport, { passive: true });
    document.addEventListener("pointerleave", handleLeave);
    detach = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
      window.removeEventListener("blur", handleLeave);
      window.removeEventListener("resize", measureViewport);
      document.removeEventListener("pointerleave", handleLeave);
    };
  }

  // Guarded against a double release: an unbalanced decrement would drive the
  // count negative, and the next subscriber would then never attach anything.
  let released = false;
  return () => {
    if (released) return;
    released = true;
    listeners -= 1;
    if (listeners <= 0) {
      listeners = 0;
      detach?.();
      detach = null;
      handleLeave();
    }
  };
}

export function setPointerIntent(intent: PointerIntent, label: string | null = null): void {
  if (pointerStore.intent === intent && pointerStore.label === label) return;
  pointerStore.intent = intent;
  pointerStore.label = label;
  for (const watcher of watchers) watcher();
}

/** Subscribes to intent changes. Returns an unsubscribe. */
export function watchPointerIntent(onChange: () => void): () => void {
  watchers.add(onChange);
  return () => {
    watchers.delete(onChange);
  };
}
