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
  {
    no: "26.06",
    name: "Lake House",
    program: "Dwelling",
    place: "Como, IT",
    year: "2026",
    status: "In design",
    area: "320 m²",
    structure: "Concrete, timber",
    system: "Concrete base, timber frame at 4.0 m",
    note: "Perched on the lake edge.",
    bay: 4,
    roof: "pitch",
    slope: 0.1,
    sun: 160,
    volumes: [
      { x: -5, y: -5, z: 0, w: 10, d: 10, h: 6, kind: "solid", level: 0, name: "LIVING" },
      { x: -5, y: -5, z: 6, w: 10, d: 10, h: 2, kind: "roof", level: 1, name: "ROOF" }
    ],
  },
  {
    no: "27.01",
    name: "Gallery in the Woods",
    program: "Civic",
    place: "Oslo, NO",
    year: "2027",
    status: "Concept",
    area: "450 m²",
    structure: "CLT panels",
    system: "CLT walls and slabs",
    note: "A gallery space that weaves between the trees.",
    bay: 5,
    roof: "flat",
    slope: 0.05,
    sun: 180,
    volumes: [
      { x: -10, y: -8, z: 0, w: 20, d: 16, h: 4, kind: "solid", level: 0, name: "EXHIBITION" },
      { x: -2, y: -2, z: 0, w: 4, d: 4, h: 4, kind: "void", level: 0, name: "COURT" }
    ],
  },
  {
    no: "27.02",
    name: "Urban Infill",
    program: "Housing",
    place: "London, UK",
    year: "2027",
    status: "Concept",
    area: "180 m²",
    structure: "Steel frame",
    system: "Steel frame at 3.0 m",
    note: "Squeezed into a tight urban plot.",
    bay: 3,
    roof: "pitch",
    slope: 0,
    sun: 220,
    volumes: [
      { x: -3, y: -6, z: 0, w: 6, d: 12, h: 3, kind: "solid", level: 0, name: "GROUND" },
      { x: -3, y: -6, z: 3, w: 6, d: 12, h: 3, kind: "solid", level: 1, name: "UPPER" }
    ],
  },
  {
    no: "27.03",
    name: "Desert Pavilion",
    program: "Civic",
    place: "Marfa, TX",
    year: "2027",
    status: "Concept",
    area: "120 m²",
    structure: "Rammed earth",
    system: "Rammed earth walls",
    note: "A shaded retreat in the high desert.",
    bay: 4,
    roof: "vault",
    slope: 0,
    sun: 140,
    volumes: [
      { x: -6, y: -6, z: 0, w: 12, d: 12, h: 4, kind: "solid", level: 0, name: "PAVILION" }
    ],
  },
  {
    no: "27.04",
    name: "Alpine Hut",
    program: "Dwelling",
    place: "Zermatt, CH",
    year: "2027",
    status: "Concept",
    area: "40 m²",
    structure: "Timber log",
    system: "Log cabin",
    note: "A remote shelter for hikers.",
    bay: 2,
    roof: "pitch",
    slope: 0.3,
    sun: 200,
    volumes: [
      { x: -2.5, y: -3, z: 0, w: 5, d: 6, h: 3, kind: "solid", level: 0, name: "SHELTER" }
    ],
  },
  {
    no: "27.05",
    name: "Seaside Sauna",
    program: "Civic",
    place: "Helsinki, FI",
    year: "2027",
    status: "Concept",
    area: "60 m²",
    structure: "Timber frame",
    system: "Timber frame on concrete piers",
    note: "A public sauna floating above the rocks.",
    bay: 3,
    roof: "flat",
    slope: 0.15,
    sun: 170,
    volumes: [
      { x: -4, y: -4, z: 1, w: 8, d: 8, h: 3, kind: "solid", level: 0, name: "SAUNA" },
      { x: -4, y: 4, z: 1, w: 8, d: 4, h: 0.2, kind: "void", level: 0, name: "DECK" }
    ],
  },
  {
    no: "27.06",
    name: "Artist Studio",
    program: "Workspace",
    place: "Berlin, DE",
    year: "2027",
    status: "Concept",
    area: "90 m²",
    structure: "Masonry",
    system: "Brick walls, steel trusses",
    note: "A tall, north-lit room for painting.",
    bay: 4,
    roof: "monitor",
    slope: 0,
    sun: 30,
    volumes: [
      { x: -4.5, y: -5, z: 0, w: 9, d: 10, h: 5, kind: "solid", level: 0, name: "STUDIO" }
    ],
  },
  {
    no: "28.01",
    name: "Vineyard Winery",
    program: "Workspace",
    place: "Bordeaux, FR",
    year: "2028",
    status: "Concept",
    area: "850 m²",
    structure: "Concrete",
    system: "Concrete frame and vaults",
    note: "A large production hall embedded in the hill.",
    bay: 6,
    roof: "vault",
    slope: 0.08,
    sun: 210,
    volumes: [
      { x: -12, y: -18, z: 0, w: 24, d: 36, h: 6, kind: "solid", level: 0, name: "HALL" }
    ],
  },
  {
    no: "28.02",
    name: "Island Retreat",
    program: "Dwelling",
    place: "Gotland, SE",
    year: "2028",
    status: "Concept",
    area: "140 m²",
    structure: "Limestone, timber",
    system: "Limestone walls, timber roof",
    note: "A low courtyard house sheltered from the wind.",
    bay: 4,
    roof: "pitch",
    slope: 0.02,
    sun: 190,
    volumes: [
      { x: -8, y: -8, z: 0, w: 16, d: 16, h: 3, kind: "solid", level: 0, name: "HOUSE" },
      { x: -4, y: -4, z: 0, w: 8, d: 8, h: 3, kind: "void", level: 0, name: "COURT" }
    ],
  },
  {
    no: "28.03",
    name: "Library Annexe",
    program: "Civic",
    place: "Oxford, UK",
    year: "2028",
    status: "Concept",
    area: "340 m²",
    structure: "Stone, steel",
    system: "Ashlar stone piers, steel beams",
    note: "A quiet reading room appended to an existing library.",
    bay: 5,
    roof: "flat",
    slope: 0,
    sun: 160,
    volumes: [
      { x: -7.5, y: -10, z: 0, w: 15, d: 20, h: 5, kind: "solid", level: 0, name: "READING" }
    ],
  }
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
