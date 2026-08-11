/**
 * The world index.
 *
 * Ten independent websites, one lobby. This file is deliberately *not* a design
 * system: it carries only what the lobby, the switcher and the escape control
 * need to describe a world from the outside — its name, its category, its
 * voice, its ground colour and its route. Everything below the route belongs to
 * the world itself and lives in its own component and its own stylesheet.
 *
 * If a shared component ever needs to special-case a world, add a field here
 * instead. If a *world* needs something, it does not belong here at all.
 */

export type WorldId =
  | "nova"
  | "atelier"
  | "pulse"
  | "vault"
  | "orbit"
  | "forma"
  | "luma"
  | "signal"
  | "object"
  | "mercato";

/** Tonal weight of a world — drives the escape control and `color-scheme`. */
export type Luminance = "dark" | "light";

export interface WorldPalette {
  /** Page ground. Also painted on the document element while a world is open. */
  base: string;
  /** Primary text. */
  ink: string;
  /** Secondary text — held at >= 4.5:1 on `base`. */
  dim: string;
  /** Hairlines and rules. */
  line: string;
  accent: string;
  accentAlt: string;
}

/** How the world's name is set in the lobby index — its own voice, not the shell's. */
export interface WorldVoice {
  /** CSS custom property holding the display family, set by next/font. */
  var: string;
  label: string;
  weight: number;
  tracking: string;
  transform: "uppercase" | "none";
  /** Multiplier on the lobby's name size. Condensed faces need more. */
  scale: number;
  axes?: string;
}

/** One line each, shown when a lobby row opens. Real content, not decoration. */
export interface WorldSystem {
  layout: string;
  type: string;
  motion: string;
  /** 1 (airy) … 5 (information dense). */
  density: 1 | 2 | 3 | 4 | 5;
}

export interface World {
  id: WorldId;
  /** 1-based. The lobby genuinely is an index, so the ordinal is content. */
  ordinal: number;
  name: string;
  /**
   * The name in the world's own script, where that is not Latin. The lobby sets
   * this as the tile's wordmark and demotes `name` to a caption, because a world
   * that reads right-to-left should announce itself that way from the lobby on.
   */
  altName?: string;
  /** True for the Arabic-first worlds. Drives `dir` on the lobby tile. */
  rtl?: boolean;
  /** Short client-facing signal: AI SOFTWARE, POETRY, FINTECH … */
  category: string;
  /** The fictional product this world is a website for. */
  product: string;
  /** One line. What the site is, said the way that industry would say it. */
  concept: string;
  /**
   * The one moment this world is remembered by. The lobby prints it, so it has
   * to name something the visitor can actually go and do — not an adjective.
   */
  signature: string;
  luminance: Luminance;
  palette: WorldPalette;
  voice: WorldVoice;
  system: WorldSystem;
  route: string;
}

export const WORLDS: readonly World[] = [
  {
    id: "nova",
    ordinal: 1,
    name: "Nova",
    category: "AI software",
    product: "Nova — decision intelligence",
    concept: "A decision operating system: every recommendation shows its reasoning.",
    signature: "Send a real decision through it and watch the reasoning resolve.",
    luminance: "dark",
    palette: {
      base: "#05070e",
      ink: "#e9edfa",
      dim: "#8f9bc4",
      line: "#1c2440",
      accent: "#7fe7f5",
      accentAlt: "#3b5bff",
    },
    voice: {
      var: "var(--font-schibsted)",
      label: "Schibsted Grotesk 800",
      weight: 800,
      tracking: "-0.045em",
      transform: "none",
      scale: 1.04,
    },
    system: {
      layout: "Rail + numbered record",
      type: "Schibsted / Inter Tight / JetBrains Mono",
      motion: "Predictive · 240ms",
      density: 4,
    },
    route: "/worlds/nova",
  },
  {
    id: "atelier",
    ordinal: 2,
    name: "Atelier",
    altName: "مِجاز",
    rtl: true,
    category: "Arabic poetry",
    product: "مِجاز — ديوان ومعرض للشِّعر العربي",
    concept: "An Arabic poetry house: verse, poets and a reading room, set right to left.",
    signature: "A verse writes itself across the page, stroke after stroke.",
    luminance: "dark",
    palette: {
      base: "#0d1420",
      ink: "#f2e9d8",
      dim: "#a99a80",
      line: "#26344b",
      accent: "#d9a441",
      accentAlt: "#7e9fd6",
    },
    voice: {
      var: "var(--font-ruqaa)",
      label: "Aref Ruqaa 700",
      weight: 700,
      tracking: "0",
      transform: "none",
      scale: 1.12,
    },
    system: {
      layout: "RTL spread · verse column",
      type: "Aref Ruqaa / Amiri / Reem Kufi",
      motion: "Ink · 1400ms",
      density: 2,
    },
    route: "/worlds/atelier",
  },
  {
    id: "pulse",
    ordinal: 3,
    name: "Pulse",
    category: "Music",
    product: "Pulse — listening, label and archive",
    concept: "A listening service with three houses: the floor, the archive, the room.",
    signature: "Put on a 1958 wasla and the page turns to paper, right to left, at 62 BPM.",
    luminance: "dark",
    palette: {
      base: "#0b0a0c",
      ink: "#fbf7ff",
      dim: "#a79ab4",
      line: "#2c2533",
      accent: "#ff2e7e",
      accentAlt: "#f5ff3d",
    },
    voice: {
      var: "var(--font-shoulders)",
      label: "Big Shoulders 72pt",
      weight: 800,
      tracking: "0.005em",
      transform: "uppercase",
      scale: 1.42,
      axes: '"opsz" 72',
    },
    system: {
      layout: "Console · three houses",
      type: "Big Shoulders / Barlow / Qahiri",
      motion: "On the record's own beat",
      density: 3,
    },
    route: "/worlds/pulse",
  },
  {
    id: "vault",
    ordinal: 4,
    name: "Vault",
    category: "Fintech",
    product: "Vault — treasury operating system",
    concept: "Dense positions, settled cash and no ambiguity about the balance.",
    signature: "Run a scenario; every panel in the system answers at once.",
    luminance: "dark",
    palette: {
      base: "#0e1216",
      ink: "#e4ebf2",
      dim: "#8ea0b0",
      line: "#243039",
      accent: "#e8b44a",
      accentAlt: "#5c8fbf",
    },
    voice: {
      var: "var(--font-plex-mono)",
      label: "IBM Plex Mono 600",
      weight: 600,
      tracking: "-0.05em",
      transform: "uppercase",
      scale: 0.92,
    },
    system: {
      layout: "Application shell · 4pt",
      type: "IBM Plex Mono / IBM Plex Sans",
      motion: "State-driven · 160ms",
      density: 5,
    },
    route: "/worlds/vault",
  },
  {
    id: "orbit",
    ordinal: 5,
    name: "Orbit",
    category: "Games",
    product: "Orbit — Deep Field",
    concept: "A salvage sim: take a contract, fit the ship, launch into the dark.",
    signature: "Take a contract and the hangar rebuilds the ship around it.",
    luminance: "dark",
    palette: {
      base: "#060609",
      ink: "#eae7fb",
      dim: "#948eb8",
      line: "#211f36",
      accent: "#7c5cff",
      accentAlt: "#ff6b35",
    },
    voice: {
      var: "var(--font-unbounded)",
      label: "Unbounded 600",
      weight: 600,
      tracking: "-0.045em",
      transform: "uppercase",
      scale: 0.86,
    },
    system: {
      layout: "Cinematic · z-layers",
      type: "Unbounded / Chakra Petch",
      motion: "Spatial · 1100ms",
      density: 2,
    },
    route: "/worlds/orbit",
  },
  {
    id: "forma",
    ordinal: 6,
    name: "Forma",
    category: "Architecture",
    product: "Forma — architecture and research",
    concept: "A studio that publishes drawings rather than renders.",
    signature: "Turn one building through plan, section, axonometric and mass.",
    luminance: "light",
    palette: {
      base: "#c8c6bf",
      ink: "#191917",
      dim: "#464641",
      line: "#9d9b93",
      accent: "#2b4b8c",
      accentAlt: "#7a2f1d",
    },
    voice: {
      var: "var(--font-syne)",
      label: "Syne 800",
      weight: 800,
      tracking: "-0.035em",
      transform: "uppercase",
      scale: 0.96,
    },
    system: {
      layout: "Drafting sheet · 9 col",
      type: "Syne / Newsreader / Spline Sans Mono",
      motion: "Structural · 700ms",
      density: 3,
    },
    route: "/worlds/forma",
  },
  {
    id: "luma",
    ordinal: 7,
    name: "Luma",
    category: "Mobile app",
    product: "Luma — light, sleep and daily rhythm",
    concept: "A consumer app shown as an app: real screens, real gestures.",
    signature: "The phone drops into the page and plays the product itself.",
    luminance: "light",
    palette: {
      base: "#fdf1ea",
      ink: "#241a2e",
      dim: "#655471",
      line: "#eddbd2",
      accent: "#5b3df5",
      accentAlt: "#e2653a",
    },
    voice: {
      var: "var(--font-outfit)",
      label: "Outfit 600",
      weight: 600,
      tracking: "-0.03em",
      transform: "none",
      scale: 1.02,
    },
    system: {
      layout: "Device-forward · phone first",
      type: "Outfit / Plus Jakarta Sans",
      motion: "Springy · 480ms",
      density: 2,
    },
    route: "/worlds/luma",
  },
  {
    id: "signal",
    ordinal: 8,
    name: "Signal",
    altName: "شَرارة",
    rtl: true,
    category: "Kids app",
    product: "شَرارة — تطبيق مغامرات تعليمي للأطفال",
    concept: "An Arabic learning game for children, drawn and animated like a cartoon.",
    signature: "Shrara bursts out of the phone and drags the page along behind her.",
    luminance: "light",
    palette: {
      base: "#25d0c4",
      ink: "#06231f",
      dim: "#0a4a44",
      line: "#5ce0d6",
      accent: "#ff4f74",
      accentAlt: "#ffd23f",
    },
    voice: {
      var: "var(--font-lalezar)",
      label: "Lalezar 400",
      weight: 400,
      tracking: "0",
      transform: "none",
      scale: 1.16,
    },
    system: {
      layout: "Comic panels · RTL",
      type: "Lalezar / Marhey",
      motion: "Cartoon · squash 300ms",
      density: 3,
    },
    route: "/worlds/signal",
  },
  {
    id: "object",
    ordinal: 9,
    name: "Object",
    altName: "أثير",
    rtl: true,
    category: "Audio archive",
    product: "أثير — أرشيف الإذاعة والطرب القديم",
    concept: "A retro Arabic radio: turn the dial, land on a decade, listen.",
    signature: "Turning the dial changes the decade — sound, light and all.",
    luminance: "light",
    palette: {
      base: "#e5d3a3",
      ink: "#241a10",
      dim: "#5c4728",
      line: "#c6ae78",
      accent: "#a8321c",
      accentAlt: "#1f6b5e",
    },
    voice: {
      var: "var(--font-messiri)",
      label: "El Messiri 700",
      weight: 700,
      tracking: "0",
      transform: "none",
      scale: 1.06,
    },
    system: {
      layout: "Instrument · dial-led RTL",
      type: "El Messiri / Tajawal",
      motion: "Mechanical · 900ms ease",
      density: 2,
    },
    route: "/worlds/object",
  },
  {
    id: "mercato",
    ordinal: 10,
    name: "Mercato",
    category: "E-commerce",
    product: "Mercato — provisions and table goods",
    concept: "A shop that behaves like a shop: browse, filter, add, check out.",
    signature: "Add something and the jar itself flies into the basket.",
    luminance: "light",
    palette: {
      base: "#ece8dc",
      ink: "#1c1b17",
      dim: "#57544a",
      line: "#d2cdbe",
      accent: "#2f5d3f",
      accentAlt: "#9a4a24",
    },
    voice: {
      var: "var(--font-fraunces)",
      label: "Fraunces 96pt",
      weight: 500,
      tracking: "-0.03em",
      transform: "none",
      scale: 1.04,
      axes: '"opsz" 96, "SOFT" 30',
    },
    system: {
      layout: "Catalogue · 12 col + drawer",
      type: "Fraunces / Karla",
      motion: "Practical · 180ms",
      density: 4,
    },
    route: "/worlds/mercato",
  },
] as const;

const WORLD_BY_ID = new Map<WorldId, World>(WORLDS.map((w) => [w.id, w]));

export function getWorld(id: WorldId): World {
  const world = WORLD_BY_ID.get(id);
  if (!world) throw new Error(`Unknown world: ${id}`);
  return world;
}

/** Resolves a pathname such as `/worlds/nova` to its world, or null. */
export function worldFromPath(pathname: string): World | null {
  const id = pathname.split("/").filter(Boolean)[1];
  return id ? (WORLD_BY_ID.get(id as WorldId) ?? null) : null;
}

/** Formats an ordinal the way the index displays it: 01 … 10. */
export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}
