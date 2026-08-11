/**
 * The Salvager — modelled, not drawn.
 *
 * The previous hero was a flat arrangement of rounded rectangles, and no amount
 * of polish makes that read as a spacecraft: a ship is convincing because of
 * silhouette, perspective and how light falls across its plating, none of which
 * a 2D vector shape has. So this file is a mesh — vertices and polygons in a
 * right-handed frame — and `ShipCanvas` rasterises it with real projection and
 * flat shading.
 *
 * No dependency is needed for that. A renderer of this size is a few hundred
 * lines, it draws exactly what this world needs (hard-edged flat facets, ember
 * plumes, a technical wireframe read) and it costs nothing to ship, where a 3D
 * library would be several hundred kilobytes for a fraction of its surface.
 *
 * Frame:  +X toward the bow      +Y up      +Z to starboard
 * Scale:  one unit ≈ 0.4 m, so the hull is about 45 m from nozzle to claw.
 *
 * The loadout is *in the mesh*. Fitting the tether builds the boom and claw;
 * the screen builds a lattice arc across the bow; the scanner raises a mast and
 * a dish; armour adds real plating with real thickness; the burst drive bolts on
 * two more nozzles. The ship is rebuilt, not recoloured.
 */

export type MatKey =
  | "hull"
  | "hullDark"
  | "trim"
  | "crate"
  | "glass"
  | "armour"
  | "radiator"
  | "boom"
  | "claw"
  | "dish"
  | "nozzle"
  | "emit"
  | "emitAlt";

export interface Face {
  /** Vertex indices, wound counter-clockwise seen from outside. */
  idx: number[];
  mat: MatKey;
}

export interface Mesh {
  /** Flat xyz triples. */
  pos: Float32Array;
  faces: Face[];
  /** Where plumes come from, in model space, with a radius. */
  nozzles: { x: number; y: number; z: number; r: number; main: boolean }[];
  /** Running lights: position and which of the two colours. */
  lights: { x: number; y: number; z: number; alt: boolean }[];
}

class Builder {
  pos: number[] = [];
  faces: Face[] = [];
  nozzles: Mesh["nozzles"] = [];
  lights: Mesh["lights"] = [];

  v(x: number, y: number, z: number): number {
    this.pos.push(x, y, z);
    return this.pos.length / 3 - 1;
  }

  f(mat: MatKey, ...idx: number[]): void {
    this.faces.push({ idx, mat });
  }

  /** Axis-aligned box. `sx/sy/sz` are full extents. */
  box(
    cx: number,
    cy: number,
    cz: number,
    sx: number,
    sy: number,
    sz: number,
    mat: MatKey,
    top: MatKey = mat,
  ): void {
    const x0 = cx - sx / 2;
    const x1 = cx + sx / 2;
    const y0 = cy - sy / 2;
    const y1 = cy + sy / 2;
    const z0 = cz - sz / 2;
    const z1 = cz + sz / 2;
    const a = this.v(x0, y0, z0);
    const b = this.v(x1, y0, z0);
    const c = this.v(x1, y0, z1);
    const d = this.v(x0, y0, z1);
    const e = this.v(x0, y1, z0);
    const g = this.v(x1, y1, z0);
    const h = this.v(x1, y1, z1);
    const i = this.v(x0, y1, z1);
    this.f(top, e, g, h, i); // +Y
    this.f(mat, a, d, c, b); // -Y
    this.f(mat, b, c, h, g); // +X
    this.f(mat, a, e, i, d); // -X
    this.f(mat, d, i, h, c); // +Z
    this.f(mat, a, b, g, e); // -Z
  }

  /**
   * Tube along X: a ring of `seg` sides, radius interpolated end to end. Used
   * for the reactor drum, the pressure hull and every nacelle, which is why the
   * ship's masses all agree with each other.
   */
  tube(
    x0: number,
    x1: number,
    r0: number,
    r1: number,
    seg: number,
    mat: MatKey,
    opts: { capA?: MatKey; capB?: MatKey; squashY?: number; cy?: number; cz?: number } = {},
  ): { ringA: number[]; ringB: number[] } {
    const squash = opts.squashY ?? 1;
    const cy = opts.cy ?? 0;
    const cz = opts.cz ?? 0;
    const ringA: number[] = [];
    const ringB: number[] = [];
    // Half-step phase so a hexagon presents a flat facet to the camera rather
    // than an edge — the difference between reading as plating and as a pipe.
    const phase = Math.PI / seg;
    for (let i = 0; i < seg; i++) {
      const a = phase + (i / seg) * Math.PI * 2;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      ringA.push(this.v(x0, cy + sin * r0 * squash, cz + cos * r0));
      ringB.push(this.v(x1, cy + sin * r1 * squash, cz + cos * r1));
    }
    for (let i = 0; i < seg; i++) {
      const j = (i + 1) % seg;
      this.f(mat, ringA[i]!, ringA[j]!, ringB[j]!, ringB[i]!);
    }
    if (opts.capB) this.f(opts.capB, ...ringB);
    if (opts.capA) this.f(opts.capA, ...[...ringA].reverse());
    return { ringA, ringB };
  }

  /** One free polygon from explicit points — struts, plates, lattice. */
  poly(mat: MatKey, points: [number, number, number][]): void {
    this.f(mat, ...points.map((p) => this.v(p[0], p[1], p[2])));
  }

  /** A thin slab between two outlines: gives a plate real thickness. */
  slab(
    mat: MatKey,
    outline: [number, number, number][],
    nx: number,
    ny: number,
    nz: number,
    thickness: number,
  ): void {
    const front = outline.map((p) => this.v(p[0], p[1], p[2]));
    const back = outline.map((p) =>
      this.v(p[0] - nx * thickness, p[1] - ny * thickness, p[2] - nz * thickness),
    );
    this.f(mat, ...front);
    this.f(mat, ...[...back].reverse());
    for (let i = 0; i < front.length; i++) {
      const j = (i + 1) % front.length;
      this.f(mat, front[i]!, front[j]!, back[j]!, back[i]!);
    }
  }

  build(): Mesh {
    return {
      pos: new Float32Array(this.pos),
      faces: this.faces,
      nozzles: this.nozzles,
      lights: this.lights,
    };
  }
}

/**
 * Assembles the ship for a given loadout.
 *
 * Called once per loadout change, never per frame.
 */
export function buildSalvager(fitted: readonly string[]): Mesh {
  const b = new Builder();
  const has = (id: string) => fitted.includes(id);

  /* ── Spine truss ────────────────────────────────────────────────────────
     A working tug is mostly structure. Four longerons and a run of ring frames
     read as a truss from any angle, which is what stops the middle of the ship
     looking like a solid brick. */
  for (const [dy, dz] of [
    [5, 5],
    [5, -5],
    [-5, 5],
    [-5, -5],
  ] as const) {
    b.box(-4, dy, dz, 66, 1.6, 1.6, "trim");
  }
  for (let i = 0; i <= 7; i++) {
    const x = -36 + i * 9;
    b.box(x, 0, 5.4, 1.4, 11.6, 1.2, "trim");
    b.box(x, 0, -5.4, 1.4, 11.6, 1.2, "trim");
    b.box(x, 5.4, 0, 1.4, 1.2, 11.6, "trim");
    b.box(x, -5.4, 0, 1.4, 1.2, 11.6, "trim");
  }
  // Diagonal bracing on the port and starboard faces only — enough to read.
  for (let i = 0; i < 7; i++) {
    const x = -36 + i * 9;
    for (const z of [5.4, -5.4]) {
      b.poly("trim", [
        [x, -5, z],
        [x + 9, 5, z],
        [x + 9, 3.6, z],
        [x, -6.4, z],
      ]);
    }
  }

  /* ── Aft: reactor drum, engine block, nozzles ──────────────────────────── */
  b.tube(-30, -16, 8.6, 8.6, 10, "hullDark", { capB: "hullDark" });
  // Cooling bands. Detail at this scale is what sells the read as machinery.
  for (const x of [-27.5, -23, -18.5]) b.tube(x, x + 1.6, 9.4, 9.4, 10, "trim");

  b.box(-42, 0, 0, 16, 15, 17, "hull", "hullDark");
  b.box(-42, 9, 0, 12, 3.4, 12, "trim");

  for (const z of [-5.2, 5.2]) {
    b.tube(-52, -44, 4.4, 5.6, 8, "hullDark", { capA: "nozzle", cz: z });
    b.nozzles.push({ x: -52.6, y: 0, z, r: 4.6, main: true });
  }

  /* ── Burst drive: two more nozzles, and the pumps that feed them ───────── */
  if (has("drive")) {
    for (const y of [-8.4, 8.4]) {
      b.box(-44, y, 0, 11, 5.4, 7.4, "hull");
      b.tube(-52, -47, 2.5, 3.4, 6, "hullDark", { capA: "nozzle", cy: y });
      b.nozzles.push({ x: -52.4, y, z: 0, r: 2.8, main: false });
    }
  }

  /* ── Radiators ──────────────────────────────────────────────────────────
     Two big panels swept back off the spine. They give the ship a silhouette
     wider than its hull, which is what makes it read at small sizes. */
  for (const z of [1, -1]) {
    b.slab(
      "radiator",
      [
        [-30, 2, 6 * z],
        [-8, 2, 6 * z],
        [-12, 15, 27 * z],
        [-31, 15, 27 * z],
      ],
      0,
      1,
      0,
      0.7,
    );
    b.box(-20, 8, 16 * z, 1.8, 1.8, 22, "trim");
  }

  /* ── Cargo cradles and their containers ─────────────────────────────────
     The ship is a hauler. It is carrying something, and that is the story. */
  for (const x of [-6, 8]) {
    b.box(x, -6.6, 0, 8, 1.6, 15, "trim");
    b.box(x, -12.2, 7, 8, 12, 1.6, "trim");
    b.box(x, -12.2, -7, 8, 12, 1.6, "trim");
  }
  b.box(1, -13, 0, 22, 11, 13, "crate", "crate");
  b.box(1, -13, 0, 22.4, 3, 13.4, "trim");
  b.box(-13, -11.5, 0, 7, 8, 9, "crate", "crate");

  /* ── Bow: pressure hull, bridge and canopy ──────────────────────────────
     Hexagonal in section and tapered, so the bow catches the key light on one
     broad facet and falls away on the others. */
  b.tube(14, 40, 12.4, 9, 6, "hull", { capB: "hullDark" });
  b.tube(40, 46, 9, 4.6, 6, "hullDark", { capB: "hullDark" });
  b.box(26, 11.5, 0, 16, 6, 13, "hull", "hullDark");
  // The canopy: two raked panes over the bridge box.
  b.poly("glass", [
    [34, 14.6, 5.6],
    [34, 14.6, -5.6],
    [24, 15.4, -6],
    [24, 15.4, 6],
  ]);
  b.poly("glass", [
    [34, 14.6, 5.6],
    [39.4, 10.4, 3.4],
    [39.4, 10.4, -3.4],
    [34, 14.6, -5.6],
  ]);
  b.box(20, 15.6, 0, 3, 1.6, 13.4, "trim");

  // Docking collar and hard points.
  b.tube(11, 14, 13.4, 13.4, 6, "trim");
  for (const z of [-11, 11]) b.box(30, 2, z, 12, 4, 2.4, "trim");

  b.lights.push({ x: 41, y: 11, z: 0, alt: false });
  b.lights.push({ x: 24, y: -1, z: 12, alt: true });
  b.lights.push({ x: 24, y: -1, z: -12, alt: false });
  b.lights.push({ x: -40, y: 10.8, z: 0, alt: true });

  /* ── Armour: real plating with real thickness, bolted to the bow ───────── */
  if (has("hull")) {
    // Three plates a side with real gaps between them: a single broad slab hides
    // the hull it is protecting and reads as a box, where panels read as armour.
    for (const z of [1, -1]) {
      b.slab(
        "armour",
        [
          [46, 2.6, 3.2 * z],
          [41, 9.4, 8 * z],
          [33, 10.6, 11.4 * z],
          [33, 1.4, 11.4 * z],
          [41, 0.4, 8 * z],
        ],
        0,
        0,
        z,
        1.6,
      );
      b.slab(
        "armour",
        [
          [46, -0.4, 3.2 * z],
          [41, -0.8, 8 * z],
          [33, 0.2, 11.4 * z],
          [33, -6.6, 11.4 * z],
          [41, -7.2, 8 * z],
        ],
        0,
        0,
        z,
        1.6,
      );
      b.slab(
        "armour",
        [
          [31.4, 11, 12 * z],
          [22, 12.2, 13.8 * z],
          [22, -6.4, 13.8 * z],
          [31.4, -6.8, 12 * z],
        ],
        0,
        0,
        z,
        1.6,
      );
      // Bolt strip along the seam, so the plates are attached to something.
      b.box(37, 1.2, 10 * z, 20, 1.4, 1.4, "trim");
    }
    b.slab(
      "armour",
      [
        [45, 3.6, 3],
        [45, 3.6, -3],
        [23, 13.6, -7.4],
        [23, 13.6, 7.4],
      ],
      0,
      1,
      0,
      1.3,
    );
  }

  /* ── Salvage tether: boom, wrist and a three-finger claw ───────────────── */
  if (has("tether")) {
    b.box(58, -2, 0, 26, 4.6, 4.6, "boom");
    b.box(52, -2, 0, 6, 6.4, 6.4, "trim");
    b.box(71.5, -2, 0, 6, 7.4, 7.4, "boom");
    // Three fingers, each two solid segments — a grapple has to look like it
    // could take nine tonnes, which two strokes never will.
    for (const a of [0, 2.094, 4.188]) {
      const sy = Math.sin(a);
      const sz = Math.cos(a);
      b.tube(74, 81, 2.2, 1.7, 4, "claw", {
        cy: -2 + sy * 5.4,
        cz: sz * 5.4,
      });
      b.tube(81, 87, 1.7, 1.1, 4, "claw", {
        capB: "claw",
        cy: -2 + sy * 8.6,
        cz: sz * 8.6,
      });
      b.box(74, -2 + sy * 4, sz * 4, 2, 3, 3, "trim");
    }
  }

  /* ── Deep scanner: mast, dish and its feed ─────────────────────────────── */
  if (has("scanner")) {
    b.box(-2, 14, 0, 3, 18, 3, "trim");
    // A shallow paraboloid as two stacked rings — enough to catch light.
    b.tube(-3.2, -1.4, 3, 12, 14, "dish", { cy: 24, capA: "dish" });
    b.tube(-1.4, 0.4, 12, 13.4, 14, "dish", { cy: 24 });
    b.box(1.6, 24, 0, 5, 1.4, 1.4, "trim");
    b.box(4.4, 24, 0, 2.4, 2.4, 2.4, "claw");
  }

  /* ── Debris screen: a lattice arc thrown across the bow ────────────────── */
  if (has("shield")) {
    const R = 21;
    const segs = 11;
    for (let i = 0; i < segs; i++) {
      const a0 = -1.15 + (i / segs) * 2.3;
      const a1 = -1.15 + ((i + 1) / segs) * 2.3;
      const rib: [number, number, number][] = [
        [50 + Math.cos(a0) * 5, Math.sin(a0) * R, 0],
        [50 + Math.cos(a1) * 5, Math.sin(a1) * R, 0],
        [50 + Math.cos(a1) * 5, Math.sin(a1) * R, 0],
        [50 + Math.cos(a0) * 5, Math.sin(a0) * R, 0],
      ];
      // Two rings of ribs, port and starboard, plus the spars between them.
      for (const z of [-13, 13]) {
        b.box(
          50 + Math.cos((a0 + a1) / 2) * 5,
          (Math.sin(a0) * R + Math.sin(a1) * R) / 2,
          z,
          2.2,
          (R * 2.3) / segs + 1,
          2.2,
          "dish",
        );
      }
      void rib;
    }
    for (const y of [-18, -9, 0, 9, 18]) {
      b.box(50 + Math.cos(y / R) * 5, y, 0, 1.8, 1.8, 27, "dish");
    }
    b.box(48, 0, 0, 4, 4, 4, "trim");
  }

  return b.build();
}

/* ── Materials ────────────────────────────────────────────────────────────
   Base colour, plus how much the facet takes from the key light and whether it
   is lit at all. Emissive surfaces skip shading entirely, which is what makes a
   nozzle read as a light source rather than a bright panel. */

export interface Material {
  rgb: [number, number, number];
  /** 0 = ignores the key light (emissive), 1 = fully lit. */
  lit: number;
  /** Edge colour weight. Higher draws a more technical, drafted read. */
  edge: number;
  alpha?: number;
  emissive?: boolean;
}

export const MATERIALS: Record<MatKey, Material> = {
  hull: { rgb: [64, 57, 106], lit: 1, edge: 0.5 },
  hullDark: { rgb: [34, 30, 62], lit: 1, edge: 0.45 },
  trim: { rgb: [96, 88, 148], lit: 0.9, edge: 0.7 },
  crate: { rgb: [70, 58, 40], lit: 1, edge: 0.6 },
  glass: { rgb: [118, 156, 226], lit: 0.3, edge: 1, alpha: 0.52 },
  armour: { rgb: [60, 54, 106], lit: 1, edge: 0.95 },
  radiator: { rgb: [26, 24, 44], lit: 0.75, edge: 0.8 },
  boom: { rgb: [110, 100, 160], lit: 0.95, edge: 0.7 },
  claw: { rgb: [176, 80, 42], lit: 0.95, edge: 0.8 },
  dish: { rgb: [120, 112, 178], lit: 0.85, edge: 0.75 },
  nozzle: { rgb: [18, 16, 30], lit: 0.4, edge: 0.6 },
  emit: { rgb: [190, 170, 255], lit: 0, edge: 0, emissive: true },
  emitAlt: { rgb: [255, 130, 70], lit: 0, edge: 0, emissive: true },
};
