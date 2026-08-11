/** Nova's content. Fictional, but written the way this product would write. */

export interface Step {
  at: string;
  agent: string;
  text: string;
  confidence: number;
  source?: string;
}

export interface Scenario {
  id: string;
  label: string;
  question: string;
  steps: Step[];
  recommendation: string;
  detail: string;
  impact: string;
  risk: "Low" | "Moderate" | "Elevated";
}

export const SCENARIOS: Scenario[] = [
  {
    id: "supply",
    label: "Supply",
    question: "Should we re-route the Rotterdam container backlog?",
    recommendation: "Re-route 6 of 11 containers through Antwerp",
    detail:
      "Antwerp clears the backlog 4 days earlier at 11% higher freight. The remaining five hold at Rotterdam — their SKUs have 21 days of cover.",
    impact: "€184k held margin",
    risk: "Moderate",
    steps: [
      {
        at: "00.04",
        agent: "retrieve",
        text: "Pulled 11 open containers, 3 carrier contracts, 42 days of port dwell time.",
        confidence: 0.99,
        source: "erp.shipments",
      },
      {
        at: "00.31",
        agent: "model",
        text: "Rotterdam dwell is 6.2 days and rising — 2.4σ above the trailing quarter.",
        confidence: 0.94,
        source: "port.feed",
      },
      {
        at: "01.08",
        agent: "model",
        text: "Antwerp has slot capacity on the 14th and the 16th. Inland haulage adds €310/container.",
        confidence: 0.88,
        source: "carrier.api",
      },
      {
        at: "01.44",
        agent: "check",
        text: "Six SKUs fall below safety stock before the 19th if we hold. Five do not.",
        confidence: 0.91,
        source: "wms.cover",
      },
      {
        at: "02.02",
        agent: "decide",
        text: "Split the shipment. Expedite only the six at risk; holding the rest avoids the surcharge.",
        confidence: 0.86,
      },
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    question: "Where is the annual plan leaving money on the table?",
    recommendation: "Raise the mid tier to €58, hold the entry tier",
    detail:
      "Elasticity in the mid cohort is flat to €61. The entry tier is the acquisition path and moves 3.1% per euro — leave it alone.",
    impact: "€2.1m ARR, 14 months",
    risk: "Low",
    steps: [
      {
        at: "00.03",
        agent: "retrieve",
        text: "Loaded 26 months of invoices, 9 pricing experiments, 4 competitor list prices.",
        confidence: 0.99,
        source: "billing.invoices",
      },
      {
        at: "00.27",
        agent: "model",
        text: "Mid-tier churn is insensitive between €49 and €61; the curve breaks at €62.",
        confidence: 0.83,
        source: "experiments.7",
      },
      {
        at: "00.58",
        agent: "model",
        text: "Entry tier drives 71% of expansion into mid within two quarters.",
        confidence: 0.9,
        source: "cohorts.q3",
      },
      {
        at: "01.19",
        agent: "check",
        text: "Two enterprise contracts are indexed to list price. Both renew after the change date.",
        confidence: 0.97,
        source: "contracts.msa",
      },
      {
        at: "01.37",
        agent: "decide",
        text: "Move mid to €58 — inside the flat band, short of the break, above the index threshold.",
        confidence: 0.81,
      },
    ],
  },
  {
    id: "risk",
    label: "Exposure",
    question: "Which counterparties need attention before quarter end?",
    recommendation: "Flag Meridian Freight, reduce line to €400k",
    detail:
      "Meridian has stretched payment terms three months running while its filings show a widening working-capital gap. The other 27 counterparties are inside tolerance.",
    impact: "€1.4m exposure reduced",
    risk: "Elevated",
    steps: [
      {
        at: "00.05",
        agent: "retrieve",
        text: "Scanned 28 counterparties, 1,204 invoices, 6 public filings.",
        confidence: 0.99,
        source: "ledger.ar",
      },
      {
        at: "00.34",
        agent: "model",
        text: "Meridian days-to-pay moved 31 → 44 → 58. No dispute is recorded against any invoice.",
        confidence: 0.96,
        source: "ledger.ar",
      },
      {
        at: "01.02",
        agent: "model",
        text: "Their filed current ratio fell from 1.4 to 1.05 over two reporting periods.",
        confidence: 0.79,
        source: "filings.eu",
      },
      {
        at: "01.28",
        agent: "check",
        text: "No other counterparty exceeds two standard deviations on either signal.",
        confidence: 0.93,
      },
      {
        at: "01.51",
        agent: "decide",
        text: "Halve the credit line and require prepayment above €50k until terms normalise.",
        confidence: 0.74,
      },
    ],
  },
];

export const AGENTS = [
  { id: "retrieve", name: "Retriever", note: "Pulls and grounds source records", calls: "1.2k/hr" },
  { id: "model", name: "Analyst", note: "Fits, simulates, compares", calls: "410/hr" },
  { id: "check", name: "Auditor", note: "Tests the claim against policy", calls: "410/hr" },
  { id: "decide", name: "Operator", note: "Writes the action and its rollback", calls: "88/hr" },
];

export const SIGNALS = [
  { label: "Runs today", value: "1,284", delta: "+6.2%", up: true },
  { label: "Accepted", value: "81.4%", delta: "+2.1pt", up: true },
  { label: "Median latency", value: "2.14s", delta: "−340ms", up: true },
  { label: "Escalated", value: "37", delta: "+9", up: false },
  { label: "Grounding hit rate", value: "97.1%", delta: "+0.4pt", up: true },
];

export const RUNS = [
  {
    id: "RUN-8841",
    at: "09:14:02",
    scope: "Supply · EU",
    outcome: "Accepted",
    ms: 2140,
    by: "Auto",
    note: "Split shipment; six containers re-routed via Antwerp.",
  },
  {
    id: "RUN-8840",
    at: "09:02:47",
    scope: "Pricing · Self-serve",
    outcome: "Accepted",
    ms: 1880,
    by: "K. Osei",
    note: "Mid tier moved to €58 in staging; live change queued for the 4th.",
  },
  {
    id: "RUN-8839",
    at: "08:51:19",
    scope: "Exposure · AR",
    outcome: "Escalated",
    ms: 3620,
    by: "Auto",
    note: "Confidence 0.74 sits below the 0.80 policy floor for credit changes.",
  },
  {
    id: "RUN-8838",
    at: "08:44:03",
    scope: "Supply · APAC",
    outcome: "Rejected",
    ms: 1420,
    by: "M. Haddad",
    note: "Carrier quote expired before commit; rerun scheduled with fresh rates.",
  },
];

export const INTEGRATIONS = [
  "SAP S/4HANA",
  "NetSuite",
  "Snowflake",
  "Databricks",
  "Kafka",
  "Salesforce",
  "Stripe Billing",
  "Slack",
  "PagerDuty",
  "S3",
];
