/**
 * Pulse — the catalogue.
 *
 * Pulse is one listening service with three houses, and the houses are the
 * reason the site changes shape rather than merely changing colour:
 *
 *   floor    new releases from the label's own roster, set left to right
 *   archive  an archive of Arabic tarab recordings, set right to left on paper
 *   room     live sessions, recorded in one take, set as a timecoded document
 *
 * Everything a house needs to repaint the page is data: its rhythm, its pair of
 * inks, its tempo. Nothing about the look is hard-coded in the component.
 *
 * On rights: every artist, ensemble, recording and catalogue number below is
 * invented for this exercise. The archive is written in the idiom of mid-century
 * Egyptian and Levantine broadcast recording, but no real performer is named,
 * pictured or implied, and no recording is sampled. The maqam names, the metres
 * and the instruments are the genuine musical vocabulary of that tradition —
 * those are facts, not anyone's property. The portraits are drawn here from
 * nothing; see `art.tsx`.
 */

/* ── Houses ─────────────────────────────────────────────────────────────── */

export type HouseId = "floor" | "archive" | "room";

export interface House {
  id: HouseId;
  /** How the tape reads it. Arabic houses are named in Arabic. */
  label: string;
  latin: string;
  /** One line, said the way someone who works there would say it. */
  line: string;
  /** Which rhythm the halftone press runs: floor, archive, session. */
  mode: 0 | 1 | 2;
  rtl?: boolean;
}

export const HOUSES: readonly House[] = [
  {
    id: "floor",
    label: "The Floor",
    latin: "The Floor",
    line: "Twelve-inches and albums from the roster. Loud rooms, small labels.",
    mode: 0,
  },
  {
    id: "archive",
    label: "الأرشيف",
    latin: "The Archive",
    line: "وصلات وتقاسيم من زمن الإذاعة. تسجيلات طويلة، مقام واحد، ليلة كاملة.",
    mode: 1,
    rtl: true,
  },
  {
    id: "room",
    label: "The Room",
    latin: "The Room",
    line: "One take, one microphone position, no fixes afterwards.",
    mode: 2,
  },
];

/* ── Artists ────────────────────────────────────────────────────────────── */

/** Which drawn portrait an artist wears. See `art.tsx` for the plates. */
export interface PortraitSpec {
  face: 0 | 1 | 2 | 3;
  hair: "crop" | "long" | "shaved" | "locs" | "scarf" | "updo" | "tarbush" | "shawl";
  eyes: 0 | 1;
  mouth: 0 | 1 | 2;
  garment: 0 | 1 | 2;
  extra?: "glasses" | "earring" | "pearl" | "moustache" | "kohl";
  /** Rotation of the backdrop plate, in degrees. Keeps the series from marching. */
  plate: number;
  flip?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  /** Set instead of `name` in the archive, which is Arabic-first. */
  arName?: string;
  house: HouseId;
  /** Where they work, and on what. Two facts, no adjectives. */
  base: string;
  instrument: string;
  bio: string;
  portrait: PortraitSpec;
}

export const ARTISTS: readonly Artist[] = [
  {
    id: "kova",
    name: "Kova",
    house: "floor",
    base: "Berlin",
    instrument: "Drum machine, bass",
    bio: "Makes records in a basement with 2.1 metres of headroom and refuses to fix the room out of them.",
    portrait: { face: 1, hair: "crop", eyes: 0, mouth: 0, garment: 0, plate: -8 },
  },
  {
    id: "dune",
    name: "Marta Dune",
    house: "floor",
    base: "Rotterdam",
    instrument: "Voice, Juno-6",
    bio: "Wrote an album across eleven months of night work. Every track on it starts at ten past.",
    portrait: { face: 2, hair: "long", eyes: 1, mouth: 1, garment: 1, plate: 6 },
  },
  {
    id: "ekko",
    name: "Ekko",
    house: "floor",
    base: "Tallinn",
    instrument: "Modular, no overdubs",
    bio: "One signal chain, cut straight to lacquer. What you hear is what happened in the room.",
    portrait: { face: 0, hair: "shaved", eyes: 0, mouth: 0, garment: 2, extra: "glasses", plate: 12 },
  },
  {
    id: "nadir",
    name: "Nadir Ba",
    house: "floor",
    base: "Dakar / Paris",
    instrument: "Cassette four-track",
    bio: "Four years of tape sketches, transferred once at the right speed and then left alone.",
    portrait: { face: 3, hair: "locs", eyes: 0, mouth: 1, garment: 0, plate: -14 },
  },
  {
    id: "suheyla",
    name: "Suheyla Kart",
    house: "floor",
    base: "Istanbul",
    instrument: "Bağlama, TR-707",
    bio: "Plays a long-necked saz through a drum machine and lets the two argue about the beat.",
    portrait: { face: 2, hair: "scarf", eyes: 1, mouth: 1, garment: 1, extra: "earring", plate: 9 },
  },
  {
    id: "najat",
    name: "Najat al-Furat",
    arName: "نجاة الفرات",
    house: "archive",
    base: "القاهرة",
    instrument: "غناء",
    bio: "سيّدة الوصلة الطويلة. تسجيلاتها الحيّة بين ١٩٥٤ و١٩٧١ تُقاس بالليالي لا بالدقائق.",
    portrait: { face: 2, hair: "updo", eyes: 1, mouth: 2, garment: 1, extra: "kohl", plate: -5 },
  },
  {
    id: "farid",
    name: "Farid Simʿan",
    arName: "فريد سمعان",
    house: "archive",
    base: "بيروت",
    instrument: "عود",
    bio: "عوّاد التخت الإذاعي. تقاسيمه تبدأ من الراست ولا تعود إليه قبل الدقيقة الحادية عشرة.",
    portrait: { face: 1, hair: "tarbush", eyes: 0, mouth: 0, garment: 2, extra: "moustache", plate: 4 },
  },
  {
    id: "zahra",
    name: "Zahra al-Qaysi",
    arName: "زهرة القيسي",
    house: "archive",
    base: "تونس",
    instrument: "غناء، موشحات",
    bio: "حفظت الموشح الأندلسي عن جدّتها، ثم سجّلته للإذاعة قبل أن تُغلق الأسطوانة على الرقصة.",
    portrait: { face: 3, hair: "shawl", eyes: 1, mouth: 2, garment: 1, extra: "pearl", plate: 11 },
  },
];

const ARTIST_BY_ID = new Map(ARTISTS.map((a) => [a.id, a]));

export function getArtist(id: string): Artist {
  const artist = ARTIST_BY_ID.get(id);
  if (!artist) throw new Error(`Unknown Pulse artist: ${id}`);
  return artist;
}

/* ── Releases ───────────────────────────────────────────────────────────── */

export interface Track {
  n: string;
  title: string;
  /** Seconds. The archive's are genuinely long; that is what a وصلة is. */
  len: number;
  /** Only the archive names one, and it names a real maqam. */
  maqam?: string;
}

/** Which drawn cover this release wears. See `art.tsx`. */
export type CoverKind =
  | "ceiling"
  | "shift"
  | "transmitter"
  | "tapes"
  | "moonlight"
  | "medallion"
  | "lattice"
  | "cartouche"
  | "roomplan"
  | "twomics";

export interface Release {
  /** Catalogue number. The house owns the prefix. */
  cat: string;
  artistId: string;
  title: string;
  /** The archive's records are titled in Arabic. */
  arTitle?: string;
  year: string;
  format: string;
  house: HouseId;
  /** The two inks the page is printed in while this is playing. */
  hot: string;
  alt: string;
  /** The tempo of the record, and therefore of the whole page. */
  bpm: number;
  /** What a listener would call the key. Maqam in the archive. */
  key: string;
  /** Root of the synthesised preview, as a MIDI note. */
  root: number;
  /** Scale in cents from the root — the archive's are not twelve-tone. */
  cents: readonly number[];
  /** Sleeve note, written the way a label writes one. Never marketing. */
  note: string;
  cover: CoverKind;
  tracks: readonly Track[];
}

const MINOR = [0, 200, 300, 500, 700, 800, 1000] as const;
const DORIAN = [0, 200, 300, 500, 700, 900, 1000] as const;
const PHRYGIAN = [0, 100, 300, 500, 700, 800, 1000] as const;
/** Rast and Bayati both sit a quarter-tone off the piano. That is the point. */
const RAST = [0, 200, 350, 500, 700, 900, 1050] as const;
const BAYATI = [0, 150, 300, 500, 700, 800, 1000] as const;
const HIJAZ = [0, 100, 400, 500, 700, 800, 1000] as const;

export const RELEASES: readonly Release[] = [
  {
    cat: "PLS-041",
    artistId: "kova",
    title: "Low Ceiling",
    year: "2026",
    format: '12" + digital',
    house: "floor",
    hot: "#ff2e7e",
    alt: "#f5ff3d",
    bpm: 128,
    key: "F minor",
    root: 41,
    cents: MINOR,
    note: "Cut in a basement with 2.1 metres of headroom. You can hear the room refusing.",
    cover: "ceiling",
    tracks: [
      { n: "A1", title: "Low Ceiling", len: 212 },
      { n: "A2", title: "Hydrant", len: 268 },
      { n: "B1", title: "Nightbus", len: 341 },
      { n: "B2", title: "Salt", len: 196 },
    ],
  },
  {
    cat: "PLS-039",
    artistId: "dune",
    title: "Second Shift",
    year: "2025",
    format: "LP",
    house: "floor",
    hot: "#f5ff3d",
    alt: "#00e5c7",
    bpm: 104,
    key: "C dorian",
    root: 48,
    cents: DORIAN,
    note: "Eleven months of night work. Every track begins at ten past the hour, because that is when she got in.",
    cover: "shift",
    tracks: [
      { n: "A1", title: "Ten Past", len: 244 },
      { n: "A2", title: "Loading Bay", len: 302 },
      { n: "B1", title: "Second Shift", len: 388 },
      { n: "B2", title: "Sodium", len: 221 },
    ],
  },
  {
    cat: "PLS-036",
    artistId: "ekko",
    title: "Transmitter",
    year: "2025",
    format: '12"',
    house: "floor",
    hot: "#7b5cff",
    alt: "#ff2e7e",
    bpm: 140,
    key: "E phrygian",
    root: 40,
    cents: PHRYGIAN,
    note: "One patch, one pass, no overdubs. The tape hiss is the only thing that was added.",
    cover: "transmitter",
    tracks: [
      { n: "A1", title: "Mast", len: 226 },
      { n: "A2", title: "Carrier", len: 291 },
      { n: "B1", title: "Dead Air", len: 355 },
    ],
  },
  {
    cat: "PLS-033",
    artistId: "nadir",
    title: "Cold Room Tapes",
    year: "2024",
    format: "Cassette",
    house: "floor",
    hot: "#00e5c7",
    alt: "#f5ff3d",
    bpm: 92,
    key: "A minor",
    root: 45,
    cents: MINOR,
    note: "Transferred once, at the speed the deck actually ran at, and never corrected.",
    cover: "tapes",
    tracks: [
      { n: "A1", title: "Cold Room", len: 188 },
      { n: "A2", title: "Meltwater", len: 254 },
      { n: "B1", title: "Transfer", len: 312 },
    ],
  },
  {
    cat: "PLS-044",
    artistId: "suheyla",
    title: "Yakamoz",
    year: "2026",
    format: '12"',
    house: "floor",
    hot: "#ff7a1a",
    alt: "#ffd400",
    bpm: 116,
    key: "D hijaz",
    root: 50,
    cents: HIJAZ,
    note: "A saz tuned down two steps against a 707 that will not swing. Neither of them gives in.",
    cover: "moonlight",
    tracks: [
      { n: "A1", title: "Yakamoz", len: 276 },
      { n: "A2", title: "Kadıköy 04:00", len: 318 },
      { n: "B1", title: "Uzun Yol", len: 402 },
    ],
  },
  {
    cat: "ARŠ-112",
    artistId: "najat",
    title: "The Cairo Wasla, 1958",
    arTitle: "وصلة القاهرة ١٩٥٨",
    year: "١٩٥٨",
    format: "تسجيل حي · أسطوانتان",
    house: "archive",
    hot: "#e2a13a",
    alt: "#b8452c",
    bpm: 62,
    key: "مقام راست",
    root: 43,
    cents: RAST,
    note: "ليلة واحدة في مسرح الأزبكية. القصيدة تسع عشرة دقيقة، والجمهور يعرف اللزمة قبل التخت.",
    cover: "medallion",
    tracks: [
      { n: "١", title: "دور: يا ليلة الوصل", len: 1142, maqam: "راست" },
      { n: "٢", title: "تقسيم قانون", len: 386, maqam: "راست" },
      { n: "٣", title: "قصيدة: أراك عصيّ الدمع", len: 1408, maqam: "راست / نهاوند" },
    ],
  },
  {
    cat: "ARŠ-088",
    artistId: "farid",
    title: "Taqasim on the Oud",
    arTitle: "تقاسيم على العود",
    year: "١٩٦٣",
    format: "أسطوانة ٣٣ لفة",
    house: "archive",
    hot: "#d3922c",
    alt: "#7d6a3a",
    bpm: 54,
    key: "مقام بياتي",
    root: 38,
    cents: BAYATI,
    note: "عود واحد وميكروفون واحد في استوديو الإذاعة. لا إيقاع، لا تخت، ولا محاولة ثانية.",
    cover: "cartouche",
    tracks: [
      { n: "١", title: "تقسيم بياتي", len: 764, maqam: "بياتي" },
      { n: "٢", title: "سماعي ثقيل", len: 592, maqam: "بياتي" },
      { n: "٣", title: "تقسيم حجاز كار", len: 681, maqam: "حجاز كار" },
    ],
  },
  {
    cat: "ARŠ-064",
    artistId: "zahra",
    title: "Andalusi Muwashshahat",
    arTitle: "موشحات أندلسية",
    year: "١٩٦٦",
    format: "تسجيل إذاعي",
    house: "archive",
    hot: "#dba75c",
    alt: "#2f7a6b",
    bpm: 72,
    key: "مقام حجاز",
    root: 45,
    cents: HIJAZ,
    note: "موشحات محفوظة بالسماع لا بالنوتة. سُجّلت في جلسة واحدة قبل أن يُغلق الأرشيف أبوابه للترميم.",
    cover: "lattice",
    tracks: [
      { n: "١", title: "لما بدا يتثنى", len: 412, maqam: "حجاز" },
      { n: "٢", title: "جادك الغيث", len: 508, maqam: "حجاز" },
      { n: "٣", title: "يا غزال", len: 366, maqam: "بياتي" },
    ],
  },
  {
    cat: "ROOM-05",
    artistId: "kova",
    title: "Funkhaus, Saal 3",
    year: "2026",
    format: "Session · one take",
    house: "room",
    hot: "#e8e5ea",
    alt: "#ff2e7e",
    bpm: 122,
    key: "F minor",
    root: 41,
    cents: MINOR,
    note: "Two microphones, forty metres of parquet, and a room that answers a beat and a half late.",
    cover: "roomplan",
    tracks: [
      { n: "01", title: "Low Ceiling — live", len: 289 },
      { n: "02", title: "Parquet", len: 372 },
    ],
  },
  {
    cat: "ROOM-03",
    artistId: "nadir",
    title: "Two Rooms",
    year: "2025",
    format: "Session · one take",
    house: "room",
    hot: "#d8dee6",
    alt: "#00e5c7",
    bpm: 88,
    key: "A minor",
    root: 45,
    cents: MINOR,
    note: "Recorded in two rooms at once, with the door between them open. Neither mix was corrected.",
    cover: "twomics",
    tracks: [
      { n: "01", title: "Door Open", len: 331 },
      { n: "02", title: "Transfer — live", len: 264 },
      { n: "03", title: "Meltwater — live", len: 297 },
    ],
  },
];

const RELEASE_INDEX = new Map(RELEASES.map((r, i) => [r.cat, i]));

export function releaseIndex(cat: string): number {
  const i = RELEASE_INDEX.get(cat);
  if (i === undefined) throw new Error(`Unknown Pulse release: ${cat}`);
  return i;
}

/** Every track in the catalogue, flattened, so the transport can run past a side. */
export interface QueueEntry extends Track {
  release: number;
  index: number;
}

export const ALL_TRACKS: readonly QueueEntry[] = RELEASES.flatMap((r, ri) =>
  r.tracks.map((t, ti) => ({ ...t, release: ri, index: ti })),
);

/** Offset of a release's first track in `ALL_TRACKS`. */
export function firstTrackOf(releaseIdx: number): number {
  return ALL_TRACKS.findIndex((t) => t.release === releaseIdx);
}

export function queuePosition(releaseIdx: number, trackIdx: number): number {
  return ALL_TRACKS.findIndex((t) => t.release === releaseIdx && t.index === trackIdx);
}

/* ── Tonight — the editorial shelf ──────────────────────────────────────── */

export interface Playlist {
  id: string;
  title: string;
  arTitle?: string;
  /** Who made it, and on what grounds. A playlist has an author here. */
  by: string;
  line: string;
  hot: string;
  alt: string;
  /** Catalogue numbers, in play order. */
  picks: readonly string[];
  /** Deliberate: a typographic cover, not another drawn object. */
  shape: "stack" | "band" | "column" | "arch" | "grid";
}

export const PLAYLISTS: readonly Playlist[] = [
  {
    id: "last-train",
    title: "After the last train",
    by: "Edited by Marta Dune",
    line: "Forty minutes for the walk home once the U8 has stopped running.",
    hot: "#4da3ff",
    alt: "#f5ff3d",
    picks: ["PLS-033", "PLS-039", "ROOM-03"],
    shape: "column",
  },
  {
    id: "warehouse",
    title: "Warehouse, 3am",
    by: "Edited by the label",
    line: "Everything on the roster that is faster than 124 and unbothered about it.",
    hot: "#ff2e7e",
    alt: "#7b5cff",
    picks: ["PLS-041", "PLS-036", "PLS-044"],
    shape: "band",
  },
  {
    id: "wasla",
    title: "The long wasla",
    arTitle: "الوصلة الطويلة",
    by: "اختيار قسم الأرشيف",
    line: "ثلاث ليالٍ كاملة. لا تُقطع الوصلة، ولا تُختصر القصيدة.",
    hot: "#e2a13a",
    alt: "#b8452c",
    picks: ["ARŠ-112", "ARŠ-088", "ARŠ-064"],
    shape: "arch",
  },
  {
    id: "one-take",
    title: "One take, no fixes",
    by: "Edited by the engineers",
    line: "Sessions where the first pass was the only pass. Mistakes included.",
    hot: "#e8e5ea",
    alt: "#00e5c7",
    picks: ["ROOM-05", "ROOM-03"],
    shape: "grid",
  },
  {
    id: "sampler",
    title: "Yellow tape",
    by: "Label sampler · free",
    line: "One track from each record we pressed this year, in the order we pressed them.",
    hot: "#f5ff3d",
    alt: "#0b0a0c",
    picks: ["PLS-044", "PLS-041", "ROOM-05", "PLS-039"],
    shape: "stack",
  },
];

/* ── Sessions — the room, documented ────────────────────────────────────── */

export interface Session {
  cat: string;
  where: string;
  when: string;
  /** The technical facts an engineer would actually write on the box. */
  chain: string;
  runtime: string;
  artistId: string;
}

export const SESSIONS: readonly Session[] = [
  {
    cat: "ROOM-05",
    where: "Funkhaus Berlin · Saal 3",
    when: "14 Feb 2026 · 21:40–23:05",
    chain: "2 × ribbon, 40 m apart · valve pre · quarter-inch at 15 ips",
    runtime: "11:01",
    artistId: "kova",
  },
  {
    cat: "ROOM-03",
    where: "Studio Ba · two rooms, door open",
    when: "03 Nov 2025 · 16:10–17:30",
    chain: "Small diaphragm pair · cassette four-track · no compression",
    runtime: "14:52",
    artistId: "nadir",
  },
];

/* ── Radio ──────────────────────────────────────────────────────────────── */

export const RADIO = {
  title: "Two hours, no talking, every Friday",
  line: "Broadcast from the back room in Neukölln at 22:00 CET. Archived the next morning; the first fifty shows are still up.",
  next: "Show 51 · this Friday · Suheyla Kart plays the archive",
};
