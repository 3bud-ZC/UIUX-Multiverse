import { axonometric } from "./axonometric";
import { halftoneBeat } from "./halftoneBeat";
import { inkBloom } from "./inkBloom";
import { lightColumns } from "./lightColumns";
import { paperRules } from "./paperRules";
import { tickMatrix } from "./tickMatrix";
import type { FieldRenderer } from "./types";
import { vectorFlow } from "./vectorFlow";

/**
 * The renderers, by name. Each belongs to exactly one surface — a world that
 * mounts it, or `light-columns` to the lobby, which is a room rather than a site
 * and so is allowed an atmosphere of its own.
 *
 * Orbit is deliberately absent: its hero is a rendered mesh with its own camera,
 * so it draws its sky inside that same frame loop rather than mounting a second
 * canvas behind it.
 */
export type FieldKind =
  | "vector-flow"
  | "paper-rules"
  | "halftone-beat"
  | "tick-matrix"
  | "axonometric"
  | "ink-bloom"
  | "light-columns";

const FACTORIES: Record<FieldKind, () => FieldRenderer> = {
  "vector-flow": vectorFlow,
  "paper-rules": paperRules,
  "halftone-beat": halftoneBeat,
  "tick-matrix": tickMatrix,
  axonometric,
  "ink-bloom": inkBloom,
  "light-columns": lightColumns,
};

export function createField(kind: FieldKind): FieldRenderer {
  return FACTORIES[kind]();
}

export type { FieldColors, FieldFrame, FieldRenderer } from "./types";
