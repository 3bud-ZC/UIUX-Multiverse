/**
 * Type loading.
 *
 * Twenty-four families, and not one of them belongs to the shell. The lobby is
 * set entirely in a mono (instrumentation) and a neutral sans (running text);
 * every display face here is the property of exactly one world, and no two
 * worlds share a display + body pairing.
 *
 * Three worlds are Arabic-first and are set in Arabic faces chosen the way an
 * Arabic designer would choose them, not by transliterating a Latin pairing:
 * a ruqaa display over a naskh text face for the poetry world, a fat display
 * naskh over a rounded body for the children's app, a modern kufi over a
 * geometric sans for the radio archive.
 *
 * Only the lobby's own two faces preload. The world faces are requested when a
 * world name is actually set — which, in the lobby index, is immediately, and
 * on a world route, is only that world's pair.
 */
import {
  Almarai,
  Amiri,
  Aref_Ruqaa,
  Barlow,
  Big_Shoulders,
  Chakra_Petch,
  El_Messiri,
  Fraunces,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Instrument_Sans,
  Inter_Tight,
  JetBrains_Mono,
  Karla,
  Lalezar,
  Marhey,
  Martian_Mono,
  Newsreader,
  Outfit,
  Plus_Jakarta_Sans,
  Qahiri,
  Reem_Kufi,
  Schibsted_Grotesk,
  Space_Mono,
  Spline_Sans_Mono,
  Syne,
  Tajawal,
  Unbounded,
} from "next/font/google";

/* ── Lobby ─────────────────────────────────────────────────────────────── */

export const martianMono = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-mono",
});

export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-sans",
});

/* ── 01 Nova — an instrument's grotesque, set in sentence case ─────────── */

// Nova's display face was Archivo Expanded in caps, which is the exact silhouette
// every AI product on the internet currently wears. Schibsted Grotesk is a
// narrower, editorially-drawn grotesque with a tall x-height and unusually
// even numerals — it holds up at 300 as easily as at 800, which is what lets
// Nova's headline carry two weights inside one sentence instead of shouting a
// whole line in caps. The variable weight axis is the hierarchy.
export const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-schibsted",
});

export const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-inter-tight",
});

export const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-jetbrains",
});

/* ── 02 Atelier — Arabic: ruqaa display, naskh text, kufi labels ────────── */

// Aref Ruqaa carries the verse. It is a calligraphic ruqaa, so it is set large,
// sparse and never as running text — exactly how the hand it imitates is used.
export const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  variable: "--font-ruqaa",
});

// Amiri is the naskh that Arabic book typography actually reads in.
export const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  variable: "--font-amiri",
});

// Geometric kufi for the instrumentation, so labels sit at right angles to the
// calligraphy instead of imitating it.
export const reemKufi = Reem_Kufi({
  subsets: ["arabic", "latin"],
  display: "swap",
  preload: false,
  variable: "--font-reem",
});

/* ── 03 Pulse — condensed poster, grotesque body, mono data ────────────── */

// Google publishes no metric overrides for Big Shoulders, so the automatic
// fallback adjustment is turned off and a condensed system face is named
// explicitly — otherwise the swap would reflow Pulse's display lines.
export const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "Haettenschweiler", "sans-serif"],
  variable: "--font-shoulders",
});

export const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
  variable: "--font-barlow",
});

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  variable: "--font-space-mono",
});

// Pulse's catalogue includes an archive of Arabic tarab recordings, and that
// half of the site is set right to left in Arabic faces rather than in the
// label's Latin pairing. Qahiri is a revival of the display kufi that Egyptian
// record sleeves and cinema posters were lettered in through the 1950s and 60s,
// which is exactly the period the archive claims; Almarai carries the running
// Arabic underneath it. Neither is any other world's voice.
export const qahiri = Qahiri({
  subsets: ["arabic", "latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
  variable: "--font-qahiri",
});

export const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  display: "swap",
  preload: false,
  variable: "--font-almarai",
});

/* ── 04 Vault — one family, two widths, tabular everywhere ─────────────── */

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
  variable: "--font-plex-mono",
});

export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
  variable: "--font-plex-sans",
});

/* ── 05 Orbit — wide display, squared technical body ───────────────────── */

export const unbounded = Unbounded({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-unbounded",
});

export const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-chakra",
});

/* ── 06 Forma — structural display, publication serif, drafting mono ───── */

export const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-syne",
});

export const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-newsreader",
});

export const splineSansMono = Spline_Sans_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-spline-mono",
});

/* ── 07 Luma — rounded geometric, humanist app text ────────────────────── */

export const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-outfit",
});

export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-jakarta",
});

/* ── 08 Signal — Arabic: fat display naskh, rounded body ───────────────── */

// Lalezar is a single-weight poster naskh with round, inflated counters — the
// closest Arabic equivalent of a cartoon logotype.
export const lalezar = Lalezar({
  subsets: ["arabic", "latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
  variable: "--font-lalezar",
});

export const marhey = Marhey({
  subsets: ["arabic", "latin"],
  display: "swap",
  preload: false,
  variable: "--font-marhey",
});

/* ── 09 Object — Arabic: modern kufi display, geometric body ───────────── */

export const elMessiri = El_Messiri({
  subsets: ["arabic", "latin"],
  display: "swap",
  preload: false,
  variable: "--font-messiri",
});

export const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
  preload: false,
  variable: "--font-tajawal",
});

/* ── 10 Mercato — soft high-contrast serif, grotesque shop text ────────── */

export const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
  preload: false,
  variable: "--font-fraunces",
});

export const karla = Karla({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-karla",
});

export const fontClassNames = [
  martianMono.variable,
  instrumentSans.variable,
  schibsted.variable,
  interTight.variable,
  jetBrainsMono.variable,
  arefRuqaa.variable,
  amiri.variable,
  reemKufi.variable,
  bigShoulders.variable,
  barlow.variable,
  spaceMono.variable,
  qahiri.variable,
  almarai.variable,
  plexMono.variable,
  plexSans.variable,
  unbounded.variable,
  chakraPetch.variable,
  syne.variable,
  newsreader.variable,
  splineSansMono.variable,
  outfit.variable,
  plusJakarta.variable,
  lalezar.variable,
  marhey.variable,
  elMessiri.variable,
  tajawal.variable,
  fraunces.variable,
  karla.variable,
].join(" ");
