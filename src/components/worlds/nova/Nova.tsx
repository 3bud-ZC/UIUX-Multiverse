"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FieldCanvas } from "@/components/common/FieldCanvas";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useWorldGround } from "@/lib/hooks/useWorldGround";
import { getWorld } from "@/lib/worlds";
import { AGENTS, INTEGRATIONS, RUNS, SCENARIOS, SIGNALS } from "./data";
import styles from "./Nova.module.css";

const WORLD = getWorld("nova");

/**
 * The record.
 *
 * Nova's identity is a filing habit rather than a typeface: every section is a
 * numbered entry, the rail navigates by those numbers, and the section heading
 * prints its own reference. The ordinals are content — they are how you cite a
 * part of the run to somebody else — which is the only reason numbering is
 * allowed anywhere in this project.
 */
const NAV = [
  { id: "thesis", ref: "01", label: "Overview" },
  { id: "console", ref: "02", label: "Console" },
  { id: "agents", ref: "03", label: "Agents" },
  { id: "signals", ref: "04", label: "Signals" },
  { id: "runs", ref: "05", label: "Runs" },
  { id: "surface", ref: "06", label: "Surface" },
];

/**
 * Three claims from the last run, each with the record it came from.
 *
 * The hero's argument is "the reasoning comes out with it", and a paragraph
 * saying so proves nothing. This is the artefact: real claims, real record ids,
 * real confidence against a marked floor. The field behind it converges on this
 * panel, so the atmosphere is the argument rather than a texture.
 */
const GROUNDING = [
  {
    claim: "Rotterdam has 6 days of cover at the current draw rate.",
    from: "WMS · stock_on_hand",
    at: "08:41:02",
    confidence: 0.94,
  },
  {
    claim: "The 14-day lane average is 4.2 days, not the 3 in the contract.",
    from: "TMS · lane_history",
    at: "08:41:04",
    confidence: 0.88,
  },
  {
    claim: "Expediting clears the gap but breaches the margin floor in Q3.",
    from: "ERP · gl_margin",
    at: "08:41:07",
    confidence: 0.72,
  },
];

/**
 * The five phases a decision passes through, in order.
 *
 * This is the product in one line, and it is the reason the run is legible: the
 * strip above the stream lights each phase as the run reaches it, so a visitor
 * who reads nothing else still sees a problem turn into sources, then into
 * reasoning, then into checks, then into a decision.
 */
const PHASES = [
  { id: "ask", label: "Problem", ms: 0, note: "A real question, in the operator's words" },
  { id: "retrieve", label: "Sources", ms: 412, note: "Systems of record, pulled and cited" },
  { id: "model", label: "Reasoning", ms: 1080, note: "Scenarios run against actual history" },
  { id: "check", label: "Checks", ms: 386, note: "Policy floor, cover, and the counter-case" },
  { id: "decide", label: "Decision", ms: 262, note: "One action, with its rollback attached" },
] as const;

/** Which phase a given step belongs to. Steps carry their agent, not a phase. */
const PHASE_OF: Record<string, number> = { retrieve: 1, model: 2, check: 3, decide: 4 };

/**
 * Nova — an AI decision surface.
 *
 * Not a landing page for software: the software. The whole first screen is a
 * working console — choose a decision, watch the run resolve step by step with
 * its sources and confidence, then accept, hold or escalate it. Everything
 * below is the rest of that application: the agent chain, today's signals, the
 * run log and the surface it connects to.
 */
export function Nova() {
  useWorldGround(WORLD);
  const reduced = useReducedMotion();
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [revealed, setRevealed] = useState(0);
  const [verdict, setVerdict] = useState<"open" | "accepted" | "held">("open");
  const [agent, setAgent] = useState(AGENTS[0].id);
  const [openRun, setOpenRun] = useState<string | null>(RUNS[0].id);
  const [query, setQuery] = useState("");
  const [here, setHere] = useState("thesis");
  const askRef = useRef<HTMLInputElement>(null);

  /* The command surface is a real control: it matches against the decisions
     Nova can actually run, and Enter opens the best match. A search box that
     searches nothing is the thing this project rejects on sight. */
  const match = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return (
      SCENARIOS.find((sc) => `${sc.label} ${sc.question}`.toLowerCase().includes(q)) ?? null
    );
  }, [query]);

  /* Which entry of the record you are reading. One observer, no frame loop. */
  useEffect(() => {
    const sections = NAV.map((n) => document.getElementById(n.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setHere(top.target.id);
      },
      { rootMargin: "-20% 0px -68% 0px", threshold: 0 },
    );
    for (const el of sections) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ⌘/ focuses the command surface, the way the product would. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "/") {
        event.preventDefault();
        askRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
  const total = scenario.steps.length;

  // The run replays whenever a different decision is selected. Reduced motion
  // gets the finished run immediately — the content is the point, not the
  // typing.
  useEffect(() => {
    setVerdict("open");
    if (reduced) {
      setRevealed(total);
      return;
    }
    setRevealed(0);
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      setRevealed(step);
      if (step >= total) clearInterval(timer);
    }, 620);
    return () => clearInterval(timer);
  }, [scenarioId, total, reduced]);

  const done = revealed >= total;

  // Phase 0 is the question itself, which is on screen from the start.
  const phase = revealed === 0 ? 0 : (PHASE_OF[scenario.steps[revealed - 1]?.agent] ?? 0);

  return (
    <div className={styles.app}>
      <aside className={styles.rail}>
        <a className={styles.mark} href="#console">
          <span className={styles.markGlyph} aria-hidden="true" />
          Nova
        </a>
        <nav className={styles.nav} aria-label="Workspace">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={styles.navItem}
              data-here={here === item.id ? "" : undefined}
              aria-current={here === item.id ? "true" : undefined}
            >
              <span className={styles.railNum}>{item.ref}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className={styles.railFoot}>
          <p className={styles.railOrg}>Kestrel Logistics</p>
          <p className={styles.railEnv}>prod · eu-central-1</p>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.bar}>
          <form
            className={styles.askForm}
            onSubmit={(event) => {
              event.preventDefault();
              if (match) {
                setScenarioId(match.id);
                setQuery("");
                document.getElementById("console")?.scrollIntoView({ block: "start" });
              }
            }}
          >
            <span className={styles.askKey} aria-hidden="true">
              ⌘
            </span>
            <input
              ref={askRef}
              className={styles.askInput}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask Nova about a decision — cover, lane, price"
              aria-label="Find a decision to run"
              autoComplete="off"
            />
            <span className={styles.askHint} data-hit={match ? "" : undefined}>
              {query.trim() === ""
                ? "⌘/"
                : match
                  ? `↵ run ${match.label}`
                  : "no decision matches"}
            </span>
          </form>
          <dl className={styles.status}>
            <div>
              <dt>Model</dt>
              <dd>nova-4 · reasoning</dd>
            </div>
            <div>
              <dt>p50</dt>
              <dd>2.14s</dd>
            </div>
            <div>
              <dt>Policy</dt>
              <dd data-ok="">floor 0.80</dd>
            </div>
          </dl>
        </header>

        {/* ── The thesis. What this product is, before any of it is used. ── */}
        <section className={styles.thesis} id="thesis" aria-labelledby="thesis-h">
          {/* The probes converge on the ledger at 78% / 62% of the frame — the
              field is resolving scattered signal into one grounded claim set,
              which is the sentence the headline is making. */}
          <FieldCanvas
            kind="vector-flow"
            colors={{ ...WORLD.palette, raise: "#0b1020" }}
            className={styles.field}
            params={{ converge: 0.72, cx: 0.78, cy: 0.62 }}
          />

          <div className={styles.thesisGrid}>
            <div className={styles.thesisClaim}>
              <p className={styles.kicker}>
                <b>§01</b> Decision intelligence · nova-4
              </p>
              <h1 className={styles.hero} id="thesis-h">
                A business decision goes in.{" "}
                <span className={styles.heroHot}>
                  The reasoning comes out <em>with it.</em>
                </span>
              </h1>
              <p className={styles.heroLede}>
                Nova reads the systems that hold the answer, runs the scenario against real history,
                argues the counter-case, and returns one action with its rollback attached.
              </p>
            </div>

            {/* Not an illustration of trust — the receipt for it. */}
            <aside className={styles.ledger} aria-label="Grounding for the last run">
              <p className={styles.ledgerHead}>
                <span>RUN-8842 · grounding</span>
                <b>3 claims</b>
              </p>
              {GROUNDING.map((row) => (
                <div key={row.at} className={styles.ledgerRow}>
                  <p className={styles.ledgerClaim}>{row.claim}</p>
                  <p className={styles.ledgerFrom}>
                    {row.from} <i>· {row.at}</i>
                  </p>
                  <span
                    className={styles.gauge}
                    data-under={row.confidence < 0.8 ? "" : undefined}
                  >
                    <span className={styles.gaugeValue}>{row.confidence.toFixed(2)}</span>
                    <span className={styles.gaugeTrack}>
                      <span style={{ "--v": row.confidence } as React.CSSProperties} />
                    </span>
                  </span>
                </div>
              ))}
              <p className={styles.ledgerFoot}>
                <span>Floor 0.80 · marked on every claim</span>
                <span>1 below</span>
              </p>
            </aside>
          </div>

          <ol className={styles.flow}>
            {PHASES.map((p, i) => (
              <li key={p.id} style={{ "--i": i } as React.CSSProperties}>
                <span className={styles.flowIndex} aria-hidden="true">
                  §01.{i + 1}
                </span>
                <span className={styles.flowLabel}>{p.label}</span>
                <span className={styles.flowNote}>{p.note}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.console} id="console" aria-labelledby="console-h">
          <div className={styles.consoleHead}>
            <p className={styles.kicker}>
              <b>§02</b> Decision console
            </p>
            <h2 className={styles.h1} id="console-h">
              Watch one resolve
            </h2>
            <p className={styles.blurb}>
              This is the product, not a picture of it. Pick a decision and the run replays: sources
              first, then the model, then the checks, then the action. Nothing commits below the
              policy floor.
            </p>

            <dl className={styles.policy}>
              <div>
                <dt>Grounding</dt>
                <dd>Every claim carries the record it came from</dd>
              </div>
              <div>
                <dt>Floor</dt>
                <dd>No commit under 0.80 confidence</dd>
              </div>
              <div>
                <dt>Rollback</dt>
                <dd>Written with the action, kept for 24 hours</dd>
              </div>
              <div>
                <dt>Residency</dt>
                <dd>eu-central-1, no training on your data</dd>
              </div>
            </dl>
          </div>

          <div className={styles.run}>
            <div className={styles.tabs} role="tablist" aria-label="Decision">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  role="tab"
                  type="button"
                  aria-selected={s.id === scenarioId}
                  className={styles.tab}
                  onClick={() => setScenarioId(s.id)}
                >
                  {s.label}
                </button>
              ))}
              <span className={styles.tabState} aria-live="polite">
                {done ? "resolved" : "running"}
              </span>
            </div>

            <p className={styles.question}>{scenario.question}</p>

            {/* The run's spine. Each phase lights as the stream reaches it, so
                the shape of the reasoning is readable at a glance even while
                the detail is still arriving. */}
            <ol className={styles.pipeline} aria-hidden="true">
              {PHASES.map((p, i) => (
                <li
                  key={p.id}
                  data-state={i < phase ? "done" : i === phase ? "live" : "waiting"}
                >
                  <span className={styles.pipeDot} />
                  <span className={styles.pipeLabel}>{p.label}</span>
                  <span className={styles.pipeMs}>{p.ms === 0 ? "—" : `${p.ms} ms`}</span>
                </li>
              ))}
            </ol>
            <p className="sr-only" aria-live="polite">
              {done
                ? `Run complete. ${scenario.recommendation}.`
                : `Running: ${PHASES[phase].label}.`}
            </p>

            <ol className={styles.stream}>
              {scenario.steps.map((step, i) => (
                <li key={step.at} className={styles.step} data-shown={i < revealed ? "" : undefined}>
                  <span className={styles.stepAt}>{step.at}</span>
                  <span className={styles.stepAgent} data-agent={step.agent}>
                    {step.agent}
                  </span>
                  <span className={styles.stepText}>
                    {step.text}
                    {step.source && <em className={styles.source}>{step.source}</em>}
                  </span>
                  <span
                    className={styles.conf}
                    data-under={step.confidence < 0.8 ? "" : undefined}
                  >
                    <span
                      className={styles.confBar}
                      style={{ "--v": step.confidence } as React.CSSProperties}
                    />
                    {step.confidence.toFixed(2)}
                  </span>
                </li>
              ))}
            </ol>

            <div className={styles.verdict} data-done={done ? "" : undefined}>
              <div className={styles.verdictBody}>
                <p className={styles.verdictLabel}>Recommendation</p>
                <p className={styles.verdictText}>{scenario.recommendation}</p>
                <p className={styles.verdictDetail}>{scenario.detail}</p>
              </div>
              <dl className={styles.verdictMeta}>
                <div>
                  <dt>Impact</dt>
                  <dd>{scenario.impact}</dd>
                </div>
                <div>
                  <dt>Risk</dt>
                  <dd data-risk={scenario.risk.toLowerCase()}>{scenario.risk}</dd>
                </div>
              </dl>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={!done}
                  onClick={() => setVerdict("accepted")}
                >
                  Accept and commit
                </button>
                <button
                  type="button"
                  className={styles.ghost}
                  disabled={!done}
                  onClick={() => setVerdict("held")}
                >
                  Hold for review
                </button>
                <p className={styles.receipt} role="status">
                  {verdict === "accepted" &&
                    "Committed. Rollback stays available for 24 hours from RUN-8842."}
                  {verdict === "held" && "Held. Queued for the 10:00 review with the full trace."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.agents} id="agents" aria-labelledby="agents-h">
          <div className={styles.sectionHead}>
            <p className={styles.kicker}>
              <b>§03</b> The chain
            </p>
            <h2 className={styles.h2} id="agents-h">
              Four agents, one contract
            </h2>
          </div>
          <div className={styles.chain}>
            {AGENTS.map((a, i) => (
              <button
                key={a.id}
                type="button"
                className={styles.node}
                data-on={agent === a.id ? "" : undefined}
                onMouseEnter={() => setAgent(a.id)}
                onFocus={() => setAgent(a.id)}
                onClick={() => setAgent(a.id)}
              >
                <span className={styles.nodeIndex}>{i + 1}</span>
                <span className={styles.nodeName}>{a.name}</span>
                <span className={styles.nodeNote}>{a.note}</span>
                <span className={styles.nodeCalls}>{a.calls}</span>
              </button>
            ))}
          </div>
          <p className={styles.chainNote}>
            {agent === "retrieve" &&
              "Every claim downstream carries the record id it came from. If the retriever cannot ground it, the run stops here."}
            {agent === "model" &&
              "Simulations are re-run against the last four quarters before a result is allowed to leave this stage."}
            {agent === "check" &&
              "The auditor holds the policy floor. Below 0.80 confidence, a decision can be proposed but never committed."}
            {agent === "decide" &&
              "The operator writes the action and its rollback together. An action with no rollback is not written."}
          </p>
        </section>

        <section className={styles.signals} id="signals" aria-labelledby="signals-h">
          <p className={styles.kicker}>
            <b>§04</b> Signals
          </p>
          <h2 className={styles.h2} id="signals-h">
            Today
          </h2>
          <dl className={styles.metrics}>
            {SIGNALS.map((s) => (
              <div key={s.label} className={styles.metric}>
                <dt>{s.label}</dt>
                <dd>
                  <span className={styles.metricValue}>{s.value}</span>
                  <span className={styles.metricDelta} data-up={s.up ? "" : undefined}>
                    {s.delta}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.runs} id="runs" aria-labelledby="runs-h">
          <div className={styles.sectionHead}>
            <p className={styles.kicker}>
              <b>§05</b> Run log
            </p>
            <h2 className={styles.h2} id="runs-h">
              What Nova did this morning
            </h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Run</th>
                <th scope="col">Time</th>
                <th scope="col">Scope</th>
                <th scope="col">Outcome</th>
                <th scope="col" className={styles.num}>
                  Duration
                </th>
                <th scope="col">Committed by</th>
              </tr>
            </thead>
            <tbody>
              {RUNS.map((r) => (
                <tr
                  key={r.id}
                  className={styles.tr}
                  data-open={openRun === r.id ? "" : undefined}
                  onClick={() => setOpenRun(openRun === r.id ? null : r.id)}
                >
                  <th scope="row">
                    <button type="button" className={styles.rowButton}>
                      {r.id}
                    </button>
                  </th>
                  <td>{r.at}</td>
                  <td>{r.scope}</td>
                  <td>
                    <span className={styles.pill} data-outcome={r.outcome.toLowerCase()}>
                      {r.outcome}
                    </span>
                  </td>
                  <td className={styles.num}>{r.ms.toLocaleString("en-GB")} ms</td>
                  <td>{r.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.rowNote}>
            {RUNS.find((r) => r.id === openRun)?.note ?? "Select a run to read its outcome."}
          </p>
        </section>

        <section className={styles.surface} id="surface" aria-labelledby="surface-h">
          <div>
            <p className={styles.kicker}>
              <b>§06</b> Surface
            </p>
            <h2 className={styles.h2} id="surface-h">
              Reads your systems.
              <br />
              Writes back only what you approved.
            </h2>
            <p className={styles.blurb}>
              Ten connectors, one grounding index, and a rollback for every write. Nova never holds
              the only copy of anything.
            </p>
          </div>
          <ul className={styles.connectors}>
            {INTEGRATIONS.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </section>

        <footer className={styles.foot}>
          <p>Nova — decision intelligence · fictional product, built as a design exercise</p>
          <p>ABUD · UI/UX Multiverse 01</p>
        </footer>
      </main>
    </div>
  );
}
