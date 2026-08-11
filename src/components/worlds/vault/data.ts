/**
 * Vault — the book.
 *
 * Every row here carries the two things that make the left-hand tree and the
 * entity switcher into real controls rather than decoration: which legal entity
 * holds it, and which asset class it is. Without those two fields a treasury
 * system can only pretend to have views.
 */

export type EntityId = "grp" | "de" | "us";
export type AssetClass = "BILL" | "MMF" | "DEPO" | "FX";

export interface Entity {
  id: EntityId;
  name: string;
  note: string;
  /** Reporting currency, which is what the consolidated figures are shown in. */
  ccy: string;
}

export const ENTITIES: readonly Entity[] = [
  { id: "grp", name: "Helix Industrial NV", note: "Group treasury · Amsterdam", ccy: "EUR" },
  { id: "de", name: "Helix Antriebstechnik GmbH", note: "Subsidiary · Stuttgart", ccy: "EUR" },
  { id: "us", name: "Helix Motion Inc", note: "Subsidiary · Chicago", ccy: "USD" },
];

/** What the tree selects. The scope is what makes a node click mean something. */
export type Scope =
  | { kind: "cash"; ccy: string }
  | { kind: "class"; klass: AssetClass }
  | { kind: "payments" }
  | { kind: "fx" };

export interface TreeItem {
  id: string;
  label: string;
  scope: Scope;
}

export const TREE: readonly { group: string; items: readonly TreeItem[] }[] = [
  {
    group: "Cash",
    items: [
      { id: "eur", label: "EUR operating", scope: { kind: "cash", ccy: "EUR" } },
      { id: "usd", label: "USD operating", scope: { kind: "cash", ccy: "USD" } },
      { id: "gbp", label: "GBP reserve", scope: { kind: "cash", ccy: "GBP" } },
    ],
  },
  {
    group: "Instruments",
    items: [
      { id: "mmf", label: "Money market", scope: { kind: "class", klass: "MMF" } },
      { id: "tbill", label: "Treasury bills", scope: { kind: "class", klass: "BILL" } },
      { id: "depo", label: "Term deposits", scope: { kind: "class", klass: "DEPO" } },
    ],
  },
  {
    group: "Obligations",
    items: [
      { id: "ap", label: "Payment queue", scope: { kind: "payments" } },
      { id: "fx", label: "FX forwards", scope: { kind: "fx" } },
    ],
  },
];

export interface Position {
  id: string;
  entity: EntityId;
  klass: AssetClass;
  instrument: string;
  ccy: string;
  notional: number;
  yieldPct: number;
  maturity: string;
  days: number;
  /** Original tenor, so rolling extends by the right amount. */
  tenor: number;
  counterparty: string;
  rating: string;
  state: "Settled" | "Pending" | "Rolling";
}

export const POSITIONS: readonly Position[] = [
  { id: "TB-2291", entity: "de", klass: "BILL", instrument: "DE T-Bill 03/27", ccy: "EUR", notional: 12_400_000, yieldPct: 3.18, maturity: "2027-03-14", days: 214, tenor: 182, counterparty: "Bundesbank", rating: "AAA", state: "Settled" },
  { id: "MM-0184", entity: "grp", klass: "MMF", instrument: "Aurum Prime MMF", ccy: "EUR", notional: 8_150_000, yieldPct: 3.42, maturity: "Open", days: 1, tenor: 1, counterparty: "Aurum AM", rating: "AAAm", state: "Settled" },
  { id: "TD-7741", entity: "us", klass: "DEPO", instrument: "Term deposit 91d", ccy: "USD", notional: 6_000_000, yieldPct: 4.81, maturity: "2026-11-02", days: 84, tenor: 91, counterparty: "Northgate Bank", rating: "A+", state: "Rolling" },
  { id: "TB-2308", entity: "us", klass: "BILL", instrument: "US T-Bill 12/26", ccy: "USD", notional: 5_250_000, yieldPct: 4.64, maturity: "2026-12-18", days: 130, tenor: 182, counterparty: "US Treasury", rating: "AA+", state: "Settled" },
  { id: "MM-0192", entity: "grp", klass: "MMF", instrument: "Halden Liquidity", ccy: "GBP", notional: 3_900_000, yieldPct: 4.12, maturity: "Open", days: 1, tenor: 1, counterparty: "Halden AM", rating: "AAAm", state: "Pending" },
  { id: "TD-7802", entity: "de", klass: "DEPO", instrument: "Term deposit 180d", ccy: "EUR", notional: 3_500_000, yieldPct: 3.55, maturity: "2027-02-09", days: 181, tenor: 180, counterparty: "Banca Sella", rating: "A−", state: "Settled" },
  { id: "FX-0451", entity: "us", klass: "FX", instrument: "EURUSD forward", ccy: "USD", notional: 2_750_000, yieldPct: 0, maturity: "2026-09-30", days: 51, tenor: 90, counterparty: "Northgate Bank", rating: "A+", state: "Pending" },
  { id: "TB-2315", entity: "grp", klass: "BILL", instrument: "FR OAT strip 06/27", ccy: "EUR", notional: 2_100_000, yieldPct: 3.02, maturity: "2027-06-25", days: 317, tenor: 364, counterparty: "AFT", rating: "AA−", state: "Settled" },
  { id: "FX-0455", entity: "de", klass: "FX", instrument: "EURGBP forward", ccy: "GBP", notional: 1_450_000, yieldPct: 0, maturity: "2026-10-15", days: 66, tenor: 90, counterparty: "Halden AM", rating: "AAAm", state: "Settled" },
  { id: "TD-7815", entity: "grp", klass: "DEPO", instrument: "Term deposit 30d", ccy: "EUR", notional: 4_800_000, yieldPct: 3.11, maturity: "2026-09-09", days: 30, tenor: 30, counterparty: "Northgate Bank", rating: "A+", state: "Settled" },
];

export interface Balance {
  id: string;
  entity: EntityId;
  ccy: string;
  account: string;
  iban: string;
  value: number;
  change: number;
  /** Same-day sweep target, which is what makes the sweep action honest. */
  sweepTo?: string;
}

export const BALANCES: readonly Balance[] = [
  { id: "b1", entity: "de", ccy: "EUR", account: "Operating · Frankfurt", iban: "DE44 5001 0517 0648 4573 90", value: 18_402_119, change: 1.4, sweepTo: "b2" },
  { id: "b2", entity: "grp", ccy: "EUR", account: "Collections · Amsterdam", iban: "NL91 ABNA 0417 1643 00", value: 4_118_902, change: -0.6 },
  { id: "b3", entity: "us", ccy: "USD", account: "Operating · New York", iban: "US64 SVBK 0000 0000 0012 34", value: 11_240_886, change: 2.2, sweepTo: "b2" },
  { id: "b4", entity: "grp", ccy: "GBP", account: "Reserve · London", iban: "GB33 BUKB 2020 1555 5555 55", value: 6_902_441, change: 0.1 },
];

export interface Payment {
  run: string;
  entity: EntityId;
  to: string;
  value: string;
  amount: number;
  ccy: string;
  rail: string;
  /** Approvals collected, out of two. */
  approvals: number;
  flag: "Clear" | "Limit" | "Review";
}

export const PAYMENTS: readonly Payment[] = [
  { run: "PR-2294", entity: "de", to: "Vestra Components GmbH", value: "2026-08-11", amount: 412_880, ccy: "EUR", rail: "SEPA", approvals: 1, flag: "Clear" },
  { run: "PR-2295", entity: "us", to: "Okuda Precision KK", value: "2026-08-12", amount: 1_204_000, ccy: "USD", rail: "SWIFT", approvals: 0, flag: "Limit" },
  { run: "PR-2296", entity: "grp", to: "Halden Logistics Ltd", value: "2026-08-12", amount: 96_450, ccy: "GBP", rail: "Faster", approvals: 2, flag: "Clear" },
  { run: "PR-2297", entity: "de", to: "Meridian Freight BV", value: "2026-08-14", amount: 288_100, ccy: "EUR", rail: "SEPA", approvals: 1, flag: "Review" },
];

export interface ActivityEntry {
  at: string;
  who: string;
  what: string;
  entity: EntityId | "all";
  /** Which scopes this entry belongs to, so the log narrows with the tree. */
  tags: readonly string[];
}

export const ACTIVITY: readonly ActivityEntry[] = [
  { at: "09:41:12", who: "system", what: "Reconciled 412 statement lines against the ledger. 3 unmatched.", entity: "all", tags: ["cash"] },
  { at: "09:22:04", who: "n.arden", what: "Approved payment run PR-2291 — €1,840,220 to 14 beneficiaries.", entity: "de", tags: ["payments"] },
  { at: "08:58:30", who: "system", what: "TD-7741 rolled at 4.81% for 91 days. Rate confirmation attached.", entity: "us", tags: ["DEPO"] },
  { at: "08:31:57", who: "l.moreau", what: "Raised counterparty limit for Banca Sella to €5.0m until 2026-12-31.", entity: "de", tags: ["DEPO"] },
  { at: "08:12:40", who: "system", what: "MM-0192 subscription pending settlement at the 12:00 cut-off.", entity: "grp", tags: ["MMF"] },
  { at: "08:04:11", who: "system", what: "FX rate snapshot taken. EURUSD 1.0842, GBPEUR 1.1903.", entity: "all", tags: ["fx", "cash"] },
];

/**
 * Scenarios.
 *
 * The point of a treasury system is not that it shows you the balance — it is
 * that it tells you what happens to the balance if something goes wrong. Each
 * shock is a real lever with a real consequence, and they compose: fitting two
 * applies both, and every panel answers at once.
 */
export const SHOCKS = [
  {
    id: "fx",
    label: "EUR/USD −6%",
    note: "Dollar and sterling receipts retranslate lower.",
    /** Multiplier on non-EUR balances, positions and ladder buckets alike. */
    fx: { USD: 0.94, GBP: 0.985 } as Record<string, number>,
    cash: 0,
    days: -4,
    /** Mark-down applied to buckets beyond 90 days. */
    longMark: 0,
  },
  {
    id: "rate",
    label: "Policy +75 bp",
    note: "The ladder marks down; roll yield improves from the 6-month bucket out.",
    fx: {},
    cash: -1_284_000,
    days: -3,
    longMark: 0.028,
  },
  {
    id: "late",
    label: "Largest receivable +30d",
    note: "€3.18m leaves the 30-day window and the Amsterdam account carries it.",
    fx: {},
    cash: -3_180_000,
    days: -11,
    longMark: 0,
  },
] as const;

/** Reporting rates into EUR. The FX shock moves these, so the ladder moves too. */
export const TO_EUR: Record<string, number> = { EUR: 1, USD: 0.92, GBP: 1.19 };

export const BUCKETS = [
  { bucket: "0–7d", max: 7 },
  { bucket: "8–30d", max: 30 },
  { bucket: "31–90d", max: 90 },
  { bucket: "91–180d", max: 180 },
  { bucket: "181–365d", max: 365 },
  { bucket: "> 1y", max: Number.POSITIVE_INFINITY },
];

export const BASE_RUNWAY = 46;
/** Below this, a payment run cannot be released the same day. */
export const RELEASE_FLOOR = 34_000_000;
/** Policy: this share of the book must mature inside 90 days. */
export const SHORT_POLICY = 0.4;
