/**
 * Forma — the work, as geometry.
 *
 * The office's whole claim is that its drawings come out of one set-out rather
 * than being four illustrations of the same building. So there is no per-view
 * artwork here: each project is a list of volumes in metres, a structural bay, a
 * roof type and a site, and the plan, the section, the axonometric and the
 * massing are all *projections of that*. Change a project and every drawing
 * changes, because there is nothing else for them to be drawn from.
 */

export type VolumeKind = "solid" | "void" | "roof";

export interface Volume {
  /** West edge, in metres. +x is east. */
  x: number;
  /** South edge, in metres. +y is north. */
  y: number;
  /** Underside, in metres above the site datum. */
  z: number;
  w: number;
  d: number;
  h: number;
  kind: VolumeKind;
  /** Storey, so a floor can be isolated and the set can be exploded. */
  level: number;
  /** What the room is called on the plan. */
  name?: string;
}

export type RoofKind = "flat" | "pitch" | "monitor" | "vault";

export interface Work {
  no: string;
  name: string;
  program: string;
  place: string;
  year: string;
  status: string;
  area: string;
  structure: string;
  /** The structural system, named so the structure overlay can say what it is. */
  system: string;
  note: string;
  /** Structural bay in metres. The overlay sets columns out on this. */
  bay: number;
  roof: RoofKind;
  /** Fall across the site, as a ratio. Drawn in section. */
  slope: number;
  /** Where the sun is worth having. Drives the initial daylight direction. */
  sun: number;
  volumes: readonly Volume[];
}

export const WORKS: readonly Work[] = [
  {
    no: "24.03",
    name: "House at Kissamos",
    program: "Dwelling",
    place: "Crete, GR",
    year: "2024",
    status: "Built",
    area: "184 m²",
    structure: "Load-bearing masonry, timber roof",
    system: "Masonry cross-walls at 3.2 m, timber rafters spanning short",
    note: "Two volumes set against the slope, holding a courtyard between them. The stair is outside, so the house is entered twice.",
    bay: 3.2,
    roof: "pitch",
    slope: 0.09,
    sun: 205,
    volumes: [
      { x: -10.4, y: -7, z: 0, w: 8, d: 14, h: 6.4, kind: "solid", level: 0, name: "LIVING" },
      { x: 2.4, y: -5, z: 0, w: 7, d: 10, h: 5.2, kind: "solid", level: 0, name: "SLEEPING" },
      { x: -2.4, y: -5, z: 0, w: 4.8, d: 10, h: 0.3, kind: "void", level: 0, name: "COURT" },
    ],
  },
  {
    no: "25.01",
    name: "Workshop for a bookbinder",
    program: "Workspace",
    place: "Ghent, BE",
    year: "2025",
    status: "Built",
    area: "96 m²",
    structure: "Steel frame, brick infill",
    system: "Steel portal at 2.4 m, brick infill carrying nothing",
    note: "One long room with north light and a wall of drying racks. Everything else is storage under the bench.",
    bay: 2.4,
    roof: "monitor",
    slope: 0,
    sun: 20,
    volumes: [
      { x: -14, y: -3.6, z: 0, w: 28, d: 7.2, h: 4.6, kind: "solid", level: 0, name: "WORKSHOP" },
      { x: -14, y: -3.6, z: 4.6, w: 12, d: 3.4, h: 1.9, kind: "roof", level: 1, name: "NORTH LIGHT" },
    ],
  },
  {
    no: "25.07",
    name: "Archive extension",
    program: "Civic",
    place: "Aarhus, DK",
    year: "2025",
    status: "On site",
    area: "1,240 m²",
    structure: "In-situ concrete, precast slabs",
    system: "Concrete frame at 6.0 m, 200 mm hollowcore spanning one way",
    note: "Stacked storage over a reading room, with the plant pushed to the north edge so the section stays legible.",
    bay: 6,
    roof: "flat",
    slope: 0.02,
    sun: 180,
    volumes: [
      { x: -15, y: -10, z: 0, w: 30, d: 20, h: 5.4, kind: "solid", level: 0, name: "READING ROOM" },
      { x: -14, y: -9, z: 5.4, w: 28, d: 18, h: 3.4, kind: "solid", level: 1, name: "STORE 01" },
      { x: -12, y: -8, z: 8.8, w: 24, d: 16, h: 3.4, kind: "solid", level: 2, name: "STORE 02" },
      { x: -10, y: -7, z: 12.2, w: 20, d: 14, h: 3.4, kind: "solid", level: 3, name: "STORE 03" },
      { x: 10.4, y: 4, z: 15.6, w: 4.6, d: 6, h: 2.4, kind: "roof", level: 4, name: "PLANT" },
    ],
  },
  {
    no: "26.02",
    name: "Six houses at Elverum",
    program: "Housing",
    place: "Elverum, NO",
    year: "2026",
    status: "In design",
    area: "720 m²",
    structure: "CLT panels, timber cladding",
    system: "CLT cross-walls on the party line, one span, no columns",
    note: "A single repeated section, mirrored in pairs, sharing three party walls and a run of ground.",
    bay: 4.8,
    roof: "pitch",
    slope: 0.05,
    sun: 190,
    volumes: [
      { x: -19.2, y: -4.8, z: 0, w: 6.2, d: 9.6, h: 6.4, kind: "solid", level: 0, name: "A1" },
      { x: -12.8, y: -4.8, z: 0, w: 6.2, d: 9.6, h: 6.4, kind: "solid", level: 0, name: "A2" },
      { x: -3.2, y: -4.8, z: 0, w: 6.2, d: 9.6, h: 6.4, kind: "solid", level: 0, name: "B1" },
      { x: 3.2, y: -4.8, z: 0, w: 6.2, d: 9.6, h: 6.4, kind: "solid", level: 0, name: "B2" },
      { x: 12.8, y: -4.8, z: 0, w: 6.2, d: 9.6, h: 6.4, kind: "solid", level: 0, name: "C1" },
      { x: 19.2, y: -4.8, z: 0, w: 6.2, d: 9.6, h: 6.4, kind: "solid", level: 0, name: "C2" },
    ],
  },
  {
    no: "26.05",
    name: "Chapel of the Quarry",
    program: "Civic",
    place: "Alentejo, PT",
    year: "2026",
    status: "In design",
    area: "210 m²",
    structure: "Rammed earth, steel lintels",
    system: "Rammed-earth walls 700 thick, one steel lintel over the slot",
    note: "Cut into the quarry face, lit from a single slot and finished in the material that was removed to make it.",
    bay: 2,
    roof: "vault",
    slope: 0.22,
    sun: 150,
    volumes: [
      { x: -4, y: -15, z: 0, w: 8, d: 30, h: 7.6, kind: "solid", level: 0, name: "NAVE" },
      { x: -1, y: 9, z: 0, w: 2, d: 6, h: 7.6, kind: "void", level: 0, name: "SLOT" },
      { x: -6.4, y: -15, z: 0, w: 2.4, d: 8, h: 3.2, kind: "solid", level: 0, name: "VESTRY" },
    ],
  },
];

export const MATERIALS = [
  { m: "In-situ concrete", q: "412 m³", n: "C30/37, board-marked to the reading room" },
  { m: "Precast slab", q: "980 m²", n: "200 mm hollowcore, exposed soffit" },
  { m: "Oak", q: "38 m³", n: "Untreated, quarter-sawn, shelving and doors" },
  { m: "Glazing", q: "146 m²", n: "Triple, timber frame, 0.9 W/m²K" },
];

/**
 * The four standing views.
 *
 * They are presets on the same projection, not four drawings: plan is the
 * projection at 90° of elevation, section is the same projection at 0°, and the
 * axonometric is anywhere in between. Which is why the elevation slider is worth
 * having — dragging it folds a plan up into an axonometric in front of you.
 */
export const MODES = [
  { id: "plan", label: "Plan", az: 0, el: 90, note: "Cut 1 200 above floor" },
  { id: "section", label: "Section", az: 0, el: 0, note: "Cut on A–A, looking north" },
  { id: "axon", label: "Axonometric", az: 45, el: 32, note: "45° / 32°, from the set-out" },
  { id: "mass", label: "Massing", az: 30, el: 26, note: "Volume only, on the site line" },
] as const;

export type ModeId = (typeof MODES)[number]["id"];
