import type { SceneEnv } from "./ShipCanvas";

/**
 * Deep Field — the game's content.
 *
 * Four sectors, six contracts and five modules. The sector is the outer choice
 * and it genuinely changes the world: it repaints the sky the hero is rendered
 * against, changes how much wreckage is drifting in it, and swaps the whole
 * contract board. The contract is the inner choice, and the loadout is the one
 * that rebuilds the ship.
 */

export interface Sector {
  id: string;
  code: string;
  name: string;
  /** What a salvager would tell you about it in one line. */
  note: string;
  /** How far out, in days at cruise. Cost of going there. */
  transit: string;
  /** Drives the rendered sky. */
  env: SceneEnv;
}

export const SECTORS: readonly Sector[] = [
  {
    id: "ceres",
    code: "S-07",
    name: "Ceres shear",
    note: "The old freight lane. Everything that broke up here broke up in traffic.",
    transit: "4 days",
    env: { nebA: "rgba(84,54,168,0.5)", nebB: "rgba(196,74,140,0.24)", star: "#c9b6ff", debris: 0.7 },
  },
  {
    id: "tethys",
    code: "S-12",
    name: "Tethys ring",
    note: "Ice, and refineries that were built to run without anyone aboard.",
    transit: "9 days",
    env: { nebA: "rgba(38,132,168,0.46)", nebB: "rgba(96,214,196,0.2)", star: "#b8f2ff", debris: 0.4 },
  },
  {
    id: "foundry",
    code: "S-19",
    name: "The Foundry",
    note: "A yard that cut ships up for forty years and then stopped mid-cut.",
    transit: "6 days",
    env: { nebA: "rgba(176,74,26,0.44)", nebB: "rgba(226,150,44,0.2)", star: "#ffd9a8", debris: 1 },
  },
  {
    id: "outer",
    code: "S-03",
    name: "Outer dark",
    note: "No lane, no beacon, no recovery. Whatever is out here is still out here.",
    transit: "21 days",
    env: { nebA: "rgba(34,30,86,0.5)", nebB: "rgba(58,44,120,0.18)", star: "#9aa2ff", debris: 0.18 },
  },
];

export interface Contract {
  id: string;
  sector: string;
  name: string;
  hazard: 1 | 2 | 3 | 4 | 5;
  payout: string;
  duration: string;
  brief: string;
  hazards: readonly string[];
  /** The module the briefing tells you to bring. Advice, not a requirement. */
  advises: string;
}

export const CONTRACTS: readonly Contract[] = [
  {
    id: "DF-114",
    sector: "ceres",
    name: "The Kestrel Fragment",
    hazard: 3,
    payout: "142,000",
    duration: "18 min",
    brief:
      "A hauler broke apart on the shear line eleven years ago. The bow section still holds pressure, and whatever is inside it has been holding pressure too.",
    hazards: ["Rotating debris", "No comms window", "Structural decay"],
    advises: "shield",
  },
  {
    id: "DF-118",
    sector: "ceres",
    name: "Manifest 4419",
    hazard: 2,
    payout: "96,400",
    duration: "12 min",
    brief:
      "Nine containers logged against a company that stopped filing returns. Eight are accounted for. The ninth is the contract.",
    hazards: ["Tumbling cargo", "Contested claim"],
    advises: "tether",
  },
  {
    id: "DF-121",
    sector: "tethys",
    name: "Quiet Refinery",
    hazard: 2,
    payout: "88,500",
    duration: "11 min",
    brief:
      "An automated refinery that stopped answering. Its reactor is warm, its lights are on and its manifest says it is empty.",
    hazards: ["Reactor drift", "Automated defences"],
    advises: "scanner",
  },
  {
    id: "DF-126",
    sector: "foundry",
    name: "Half a Frigate",
    hazard: 4,
    payout: "228,000",
    duration: "22 min",
    brief:
      "The yard was cutting a frigate lengthways when the power went. Both halves are still on the cradle, still under tension.",
    hazards: ["Stored tension", "Cutting gear live", "Sightline blocked"],
    advises: "hull",
  },
  {
    id: "DF-128",
    sector: "foundry",
    name: "The Long Shed",
    hazard: 3,
    payout: "134,500",
    duration: "15 min",
    brief:
      "Four hundred metres of shed with the lights still on a timer. Something in there answers the timer.",
    hazards: ["Unlit interior", "Moving machinery"],
    advises: "scanner",
  },
  {
    id: "DF-130",
    sector: "outer",
    name: "Long Shadow",
    hazard: 5,
    payout: "310,000",
    duration: "26 min",
    brief:
      "Nothing has come back from the outer dark this year. The contract pays on retrieval, and it pays in full to your estate.",
    hazards: ["Zero navigation", "Hull stress", "Unknown contact", "No extraction"],
    advises: "drive",
  },
];

export interface Module {
  id: string;
  name: string;
  power: number;
  mass: number;
  note: string;
  /** What it physically adds to the hull, so the bay says what you will see. */
  fits: string;
}

export const MODULES: readonly Module[] = [
  {
    id: "hull",
    name: "Reinforced hull",
    power: 18,
    mass: 34,
    note: "Survives a 40 m/s contact",
    fits: "Bolts armour plate across the bow",
  },
  {
    id: "tether",
    name: "Salvage tether",
    power: 22,
    mass: 12,
    note: "Recovers mass up to 9 t",
    fits: "Builds the boom and the three-finger claw",
  },
  {
    id: "scanner",
    name: "Deep scanner",
    power: 26,
    mass: 8,
    note: "Reads through 4 m of plating",
    fits: "Raises the mast and opens the dish",
  },
  {
    id: "shield",
    name: "Debris screen",
    power: 31,
    mass: 21,
    note: "Deflects fragments under 200 kg",
    fits: "Throws a lattice arc across the bow",
  },
  {
    id: "drive",
    name: "Burst drive",
    power: 24,
    mass: 17,
    note: "One escape burn, no recharge",
    fits: "Adds two nozzles and their pumps",
  },
];

export const POWER_BUDGET = 72;
