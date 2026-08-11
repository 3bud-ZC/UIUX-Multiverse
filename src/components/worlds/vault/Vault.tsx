"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FieldCanvas } from "@/components/common/FieldCanvas";
import { useWorldGround } from "@/lib/hooks/useWorldGround";
import { getWorld } from "@/lib/worlds";
import {
  ACTIVITY,
  BALANCES,
  BASE_RUNWAY,
  BUCKETS,
  ENTITIES,
  PAYMENTS,
  POSITIONS,
  RELEASE_FLOOR,
  SHOCKS,
  SHORT_POLICY,
  TO_EUR,
  TREE,
  type ActivityEntry,
  type Balance,
  type EntityId,
  type Payment,
  type Position,
  type Scope,
} from "./data";
import styles from "./Vault.module.css";

const WORLD = getWorld("vault");

const TABS = ["Overview", "Positions", "Ladder", "Activity"] as const;
type Tab = (typeof TABS)[number];
type SortKey = "notional" | "yieldPct" | "days";

/** What the inspector is looking at. A treasury inspector inspects everything. */
type Inspect =
  | { kind: "position"; id: string }
  | { kind: "account"; id: string }
  | { kind: "payment"; run: string }
  | { kind: "bucket"; bucket: string }
  | null;

const money = (n: number, ccy = "EUR") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: ccy,
    maximumFractionDigits: 0,
  }).format(n);

/**
 * A synthetic clock.
 *
 * Actions have to be stamped, and `Date.now()` in a server-rendered tree is a
 * hydration mismatch waiting to happen. So the session starts at a fixed time
 * and every write advances it — deterministic on the server, and it still reads
 * like a system log.
 */
const CLOCK_BASE = 9 * 3600 + 41 * 60 + 12;
function stamp(ticks: number): string {
  const t = CLOCK_BASE + ticks * 37;
  const h = Math.floor(t / 3600) % 24;
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return [h, m, s].map((n) => n.toString().padStart(2, "0")).join(":");
}

function inScope(position: Position, scope: Scope): boolean {
  switch (scope.kind) {
    case "cash":
      return position.ccy === scope.ccy;
    case "class":
      return position.klass === scope.klass;
    case "fx":
      return position.klass === "FX";
    case "payments":
      return true;
  }
}

/**
 * Vault — a treasury operating system.
 *
 * The rule this world is built on: **nothing on screen is a label for a feature
 * that does not exist.** The entity switcher changes whose book you are reading.
 * The tree narrows every panel — positions, balances, the ladder and the log all
 * answer to it. The four views are computed from the same filtered book rather
 * than being four static pictures. The inspector inspects whatever you clicked —
 * a position, an account, a payment run or a maturity bucket — and its actions
 * write: rolling a deposit moves it out along the ladder and appends to the log,
 * approving a run collects a signature, sweeping an account moves the money.
 *
 * And one derivation feeds all of it, which is why applying a shock makes the
 * whole workspace answer in the same frame.
 */
export function Vault() {
  useWorldGround(WORLD);

  const [entity, setEntity] = useState<EntityId>("grp");
  const [entityOpen, setEntityOpen] = useState(false);
  const [node, setNode] = useState("eur");
  const [tab, setTab] = useState<Tab>("Overview");
  const [sort, setSort] = useState<SortKey>("notional");
  const [inspect, setInspect] = useState<Inspect>({ kind: "position", id: "TB-2291" });
  const [shocks, setShocks] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  /* The book is state, because the inspector writes to it. */
  const [positions, setPositions] = useState<Position[]>(() => POSITIONS.map((p) => ({ ...p })));
  const [balances, setBalances] = useState<Balance[]>(() => BALANCES.map((b) => ({ ...b })));
  const [payments, setPayments] = useState<Payment[]>(() => PAYMENTS.map((p) => ({ ...p })));
  const [log, setLog] = useState<ActivityEntry[]>(() => ACTIVITY.map((a) => ({ ...a })));
  const [ticks, setTicks] = useState(0);
  const ticksRef = useRef(0);

  const activeEntity = ENTITIES.find((e) => e.id === entity) ?? ENTITIES[0]!;
  const treeItem = TREE.flatMap((g) => g.items).find((i) => i.id === node) ?? TREE[0]!.items[0]!;
  const scope = treeItem.scope;

  /* The clock advances in a ref, not inside an updater. A setState updater that
     schedules another setState runs twice under StrictMode, which appended every
     log line twice — the stamp has to be computed before either call. */
  const write = useCallback((who: string, what: string, tags: readonly string[]) => {
    ticksRef.current += 1;
    const at = stamp(ticksRef.current);
    setTicks(ticksRef.current);
    // Tagged `session` as well as by scope: whatever you just did is always
    // relevant to the log you are looking at, even if it was a term deposit and
    // the tree is showing euro cash.
    setLog((entries) => [{ at, who, what, entity: "all", tags: [...tags, "session"] }, ...entries]);
  }, []);

  /* ── Scope ──────────────────────────────────────────────────────────────
     Entity first, then the tree, then the search box. Every table below reads
     these, so a click on the left genuinely narrows the workspace. */
  const q = query.trim().toLowerCase();

  const bookPositions = useMemo(
    () => positions.filter((p) => entity === "grp" || p.entity === entity),
    [positions, entity],
  );

  const scopedPositions = useMemo(
    () =>
      bookPositions
        .filter((p) => inScope(p, scope))
        .filter((p) =>
          q === ""
            ? true
            : `${p.id} ${p.instrument} ${p.counterparty} ${p.ccy}`.toLowerCase().includes(q),
        ),
    [bookPositions, scope, q],
  );

  const scopedBalances = useMemo(
    () =>
      balances
        .filter((b) => entity === "grp" || b.entity === entity)
        .filter((b) => (scope.kind === "cash" ? b.ccy === scope.ccy : true)),
    [balances, entity, scope],
  );

  const scopedPayments = useMemo(
    () =>
      payments
        .filter((p) => entity === "grp" || p.entity === entity)
        .filter((p) =>
          q === "" ? true : `${p.run} ${p.to} ${p.rail}`.toLowerCase().includes(q),
        ),
    [payments, entity, q],
  );

  const scopedLog = useMemo(
    () =>
      log
        .filter((a) => a.entity === "all" || entity === "grp" || a.entity === entity)
        .filter((a) => {
          if (a.tags.includes("session")) return true;
          if (scope.kind === "cash") return a.tags.includes("cash");
          if (scope.kind === "class") return a.tags.includes(scope.klass);
          if (scope.kind === "fx") return a.tags.includes("fx");
          return a.tags.includes("payments");
        }),
    [log, entity, scope],
  );

  const rows = useMemo(
    () =>
      [...scopedPositions].sort((a, b) =>
        sort === "days" ? a[sort] - b[sort] : b[sort] - a[sort],
      ),
    [scopedPositions, sort],
  );

  /* ── One derivation ─────────────────────────────────────────────────────
     Balances, liquidity, runway, the release floor and the ladder all come out
     of here, so a shock cannot move one panel and leave another stale. */
  const sim = useMemo(() => {
    const on = SHOCKS.filter((s) => shocks.includes(s.id));
    const fx: Record<string, number> = {};
    let cash = 0;
    let days = 0;
    let longMark = 0;
    for (const s of on) {
      for (const [ccy, m] of Object.entries(s.fx)) fx[ccy] = (fx[ccy] ?? 1) * m;
      cash += s.cash;
      days += s.days;
      longMark += s.longMark;
    }

    let drawnFromEur = cash;
    const shocked = scopedBalances.map((b) => {
      let value = b.value * (fx[b.ccy] ?? 1);
      // Cash shortfalls land on the euro collections account first, the way a
      // real sweep would take them.
      if (drawnFromEur < 0 && b.account.startsWith("Collections")) {
        const applied = Math.max(drawnFromEur, -value);
        value += applied;
        drawnFromEur -= applied;
      }
      return { ...b, value, moved: value !== b.value };
    });
    if (drawnFromEur < 0) {
      const op = shocked.find((b) => b.account.startsWith("Operating"));
      if (op) {
        op.value += drawnFromEur;
        op.moved = true;
      }
    }

    const liquidity = shocked.reduce((sum, b) => sum + b.value * (TO_EUR[b.ccy] ?? 1), 0);
    const base = scopedBalances.reduce((sum, b) => sum + b.value * (TO_EUR[b.ccy] ?? 1), 0);

    /* The ladder is derived, not tabulated: it is these positions, bucketed by
       days to maturity and translated at the shocked rate. Which is why it moves
       when you roll a deposit, change entity, or apply a shock. */
    const ladder = BUCKETS.map((b, i) => {
      const floor = i === 0 ? 0 : BUCKETS[i - 1]!.max;
      const inBucket = scopedPositions.filter((p) => p.days > floor && p.days <= b.max);
      const eur = inBucket.reduce(
        (sum, p) => sum + p.notional * (TO_EUR[p.ccy] ?? 1) * (fx[p.ccy] ?? 1),
        0,
      );
      const marked = b.max > 90 ? eur * (1 - longMark) : eur;
      return { bucket: b.bucket, value: marked / 1_000_000, count: inBucket.length };
    });
    const ladderTotal = ladder.reduce((sum, b) => sum + b.value, 0);
    const shortShare =
      ladderTotal === 0
        ? 0
        : ladder.slice(0, 3).reduce((sum, b) => sum + b.value, 0) / ladderTotal;

    const notionalEur = scopedPositions.reduce(
      (sum, p) => sum + p.notional * (TO_EUR[p.ccy] ?? 1),
      0,
    );
    const weightedYield =
      notionalEur === 0
        ? 0
        : scopedPositions.reduce(
            (sum, p) => sum + p.yieldPct * p.notional * (TO_EUR[p.ccy] ?? 1),
            0,
          ) / notionalEur;
    const weightedDays =
      notionalEur === 0
        ? 0
        : scopedPositions.reduce(
            (sum, p) => sum + p.days * p.notional * (TO_EUR[p.ccy] ?? 1),
            0,
          ) / notionalEur;

    return {
      on,
      balances: shocked,
      liquidity,
      delta: liquidity - base,
      runway: BASE_RUNWAY + days,
      held: liquidity < RELEASE_FLOOR,
      ladder,
      ladderTotal,
      shortShare,
      notionalEur,
      weightedYield,
      weightedDays,
    };
  }, [shocks, scopedBalances, scopedPositions]);

  /* Keyboard: the four views on 1–4, the way a desk user would expect. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const i = Number(event.key);
      if (i >= 1 && i <= TABS.length) setTab(TABS[i - 1]!);
      if (event.key === "Escape") {
        setEntityOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ── The inspector's writes ─────────────────────────────────────────── */

  const rollPosition = (id: string) => {
    const position = positions.find((p) => p.id === id);
    if (!position) return;
    setPositions((list) =>
      list.map((p) =>
        p.id === id ? { ...p, state: "Rolling", days: p.days + p.tenor } : p,
      ),
    );
    write(
      "n.arden",
      `${id} set to roll at maturity for a further ${position.tenor} days at ${position.yieldPct.toFixed(2)}%.`,
      [position.klass],
    );
  };

  const approvePayment = (run: string) => {
    const payment = payments.find((p) => p.run === run);
    if (!payment || payment.approvals >= 2) return;
    const approvals = payment.approvals + 1;
    setPayments((list) =>
      list.map((p) =>
        p.run === run
          ? { ...p, approvals, flag: approvals === 2 ? "Clear" : p.flag }
          : p,
      ),
    );
    write(
      "n.arden",
      approvals === 2
        ? `${run} released — ${money(payment.amount, payment.ccy)} to ${payment.to}.`
        : `${run} approved, 1 of 2. Awaiting a second signature.`,
      ["payments"],
    );
  };

  const sweepAccount = (id: string) => {
    const from = balances.find((b) => b.id === id);
    if (!from?.sweepTo) return;
    const amount = Math.round(from.value * 0.25);
    setBalances((list) =>
      list.map((b) => {
        if (b.id === id) return { ...b, value: b.value - amount };
        if (b.id === from.sweepTo) return { ...b, value: b.value + amount };
        return b;
      }),
    );
    write("n.arden", `Swept ${money(amount, from.ccy)} from ${from.account} to group collections.`, [
      "cash",
    ]);
  };

  const toggleShock = (id: string) =>
    setShocks((list) => (list.includes(id) ? list.filter((s) => s !== id) : [...list, id]));

  /* ── The inspector's subject ───────────────────────────────────────── */
  const subject = useMemo(() => {
    if (!inspect) return null;
    if (inspect.kind === "position") {
      const p = positions.find((x) => x.id === inspect.id);
      return p ? ({ kind: "position", p } as const) : null;
    }
    if (inspect.kind === "account") {
      const b = sim.balances.find((x) => x.id === inspect.id);
      return b ? ({ kind: "account", b } as const) : null;
    }
    if (inspect.kind === "payment") {
      const p = payments.find((x) => x.run === inspect.run);
      return p ? ({ kind: "payment", p } as const) : null;
    }
    const index = BUCKETS.findIndex((b) => b.bucket === inspect.bucket);
    if (index < 0) return null;
    const floor = index === 0 ? 0 : BUCKETS[index - 1]!.max;
    return {
      kind: "bucket",
      bucket: inspect.bucket,
      value: sim.ladder[index]?.value ?? 0,
      members: scopedPositions.filter(
        (p) => p.days > floor && p.days <= BUCKETS[index]!.max,
      ),
    } as const;
  }, [inspect, positions, payments, sim.balances, sim.ladder, scopedPositions]);

  const awaiting = scopedPayments.filter((p) => p.approvals < 2).length;
  const scopeLabel = treeItem.label;

  return (
    <div className={styles.app}>
      <header className={styles.top}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true" />
          Vault
        </div>

        {/* The entity switcher is the outermost control in the product, so it is
            the outermost control on screen — and it changes the whole book. */}
        <div className={styles.entityWrap}>
          <button
            type="button"
            className={styles.entity}
            onClick={() => setEntityOpen((v) => !v)}
            aria-expanded={entityOpen}
          >
            {activeEntity.name} <span aria-hidden="true">▾</span>
          </button>
          {entityOpen && (
            <ul className={styles.entityMenu}>
              {ENTITIES.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    className={styles.entityItem}
                    data-on={e.id === entity ? "" : undefined}
                    onClick={() => {
                      setEntity(e.id);
                      setEntityOpen(false);
                      setInspect(null);
                    }}
                  >
                    <span>{e.name}</span>
                    <span className={styles.entityNote}>{e.note}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <label className={styles.search}>
          <span className="sr-only">Search the workspace</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search positions, counterparties, payments"
          />
        </label>
        <div className={styles.topMeta}>
          {q !== "" && (
            <span data-count="">
              {scopedPositions.length + scopedPayments.length} match
              {scopedPositions.length + scopedPayments.length === 1 ? "" : "es"}
            </span>
          )}
          <span>Value date 2026-08-10</span>
          <span data-live="">Live · {stamp(ticks)} CET</span>
        </div>
      </header>

      <div className={styles.body}>
        <nav className={styles.tree} aria-label="Portfolio">
          {TREE.map((group) => (
            <div key={group.group} className={styles.treeGroup}>
              <p className={styles.treeLabel}>{group.group}</p>
              {group.items.map((item) => {
                const count =
                  item.scope.kind === "payments"
                    ? scopedPayments.length
                    : bookPositions.filter((p) => inScope(p, item.scope)).length ||
                      balances.filter(
                        (b) =>
                          item.scope.kind === "cash" &&
                          b.ccy === item.scope.ccy &&
                          (entity === "grp" || b.entity === entity),
                      ).length;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.treeItem}
                    data-on={node === item.id ? "" : undefined}
                    onClick={() => {
                      setNode(item.id);
                      setInspect(null);
                    }}
                  >
                    <span>{item.label}</span>
                    {/* The count is the point: the tree tells you what is in
                        there before you click, and it moves with the entity. */}
                    <span className={styles.treeMeta}>{count}</span>
                  </button>
                );
              })}
            </div>
          ))}

          <div className={styles.limit}>
            <p className={styles.limitLabel}>Counterparty headroom</p>
            {(() => {
              // Headroom for whichever counterparty the inspector is on, or the
              // largest exposure in scope when it is on something else.
              const name =
                subject?.kind === "position"
                  ? subject.p.counterparty
                  : (scopedPositions[0]?.counterparty ?? "—");
              const used = scopedPositions
                .filter((p) => p.counterparty === name)
                .reduce((sum, p) => sum + p.notional * (TO_EUR[p.ccy] ?? 1), 0);
              const cap = 20_000_000;
              return (
                <>
                  <div className={styles.limitBar}>
                    <span style={{ width: `${Math.min(100, (used / cap) * 100)}%` }} />
                  </div>
                  <p className={styles.limitValue}>
                    {name} · {money(used)} of {money(cap)}
                  </p>
                </>
              );
            })()}
          </div>
        </nav>

        <main className={styles.work} id="main">
          <div className={styles.workHead}>
            <div>
              <h1 className={styles.h1}>Treasury position</h1>
              <p className={styles.crumb}>
                {activeEntity.name} / {scopeLabel}
                {q !== "" && ` / “${query}”`}
              </p>
            </div>
            <div className={styles.tabs} role="tablist" aria-label="View">
              {TABS.map((t, i) => (
                <button
                  key={t}
                  role="tab"
                  type="button"
                  aria-selected={t === tab}
                  className={styles.tab}
                  onClick={() => setTab(t)}
                >
                  {t}
                  <span className={styles.tabKey} aria-hidden="true">
                    {i + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Every figure recomputes from the scope, so the header is never
              reporting the whole book while the table shows a slice of it. */}
          <dl className={styles.kpis}>
            <div>
              <dt>Notional in scope</dt>
              <dd>{money(sim.notionalEur)}</dd>
            </div>
            <div>
              <dt>Weighted yield</dt>
              <dd>{sim.weightedYield ? `${sim.weightedYield.toFixed(2)}%` : "—"}</dd>
            </div>
            <div>
              <dt>Weighted maturity</dt>
              <dd>{Math.round(sim.weightedDays)} days</dd>
            </div>
            <div>
              <dt>Awaiting approval</dt>
              <dd data-flag={awaiting > 0 ? "" : undefined}>{awaiting}</dd>
            </div>
            <div>
              <dt>Available liquidity</dt>
              <dd data-shift={sim.delta !== 0 ? "" : undefined}>{money(sim.liquidity)}</dd>
            </div>
            <div>
              <dt>Runway</dt>
              <dd data-flag={sim.runway < 34 ? "" : undefined}>{sim.runway} d</dd>
            </div>
          </dl>

          {tab === "Overview" && (
            <div className={styles.overview}>
              <section className={styles.wide} aria-labelledby="sim-h">
                <h2 className={styles.panelHead} id="sim-h">
                  Scenario · what breaks first
                </h2>
                <div className={styles.sim}>
                  <div className={styles.levers} role="group" aria-label="Shocks">
                    {SHOCKS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={styles.lever}
                        data-on={shocks.includes(s.id) ? "" : undefined}
                        onClick={() => toggleShock(s.id)}
                        aria-pressed={shocks.includes(s.id)}
                      >
                        <span className={styles.leverBox} aria-hidden="true" />
                        <span className={styles.leverLabel}>{s.label}</span>
                        <span className={styles.leverNote}>{s.note}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      className={styles.reset}
                      onClick={() => setShocks([])}
                      disabled={shocks.length === 0}
                    >
                      Reset to actuals
                    </button>
                  </div>

                  <dl className={styles.simOut}>
                    <div>
                      <dt>Liquidity after</dt>
                      <dd className={styles.simBig}>{money(sim.liquidity)}</dd>
                    </div>
                    <div>
                      <dt>Change</dt>
                      <dd data-down={sim.delta < 0 ? "" : undefined}>
                        {sim.delta === 0 ? "—" : `${sim.delta > 0 ? "+" : ""}${money(sim.delta)}`}
                      </dd>
                    </div>
                    <div>
                      <dt>Runway</dt>
                      <dd data-down={sim.runway < BASE_RUNWAY ? "" : undefined}>
                        {sim.runway} days
                      </dd>
                    </div>
                    <div>
                      <dt>Release floor</dt>
                      <dd data-down={sim.held ? "" : undefined}>{sim.held ? "Breached" : "Held"}</dd>
                    </div>
                  </dl>

                  <div className={styles.runway} aria-hidden="true">
                    <span
                      className={styles.runwayFill}
                      style={{ width: `${Math.max(4, (sim.runway / 60) * 100)}%` }}
                      data-low={sim.runway < 34 ? "" : undefined}
                    />
                    <span className={styles.runwayFloor} style={{ left: `${(34 / 60) * 100}%` }} />
                  </div>

                  <p className={styles.simNote} role="status">
                    {sim.on.length === 0
                      ? "No shock applied. Figures are this morning's actuals."
                      : sim.held
                        ? `${sim.on.length} shock${sim.on.length > 1 ? "s" : ""} applied. Liquidity falls under the release floor — the largest run in scope cannot go out today and moves to tomorrow's window.`
                        : `${sim.on.length} shock${sim.on.length > 1 ? "s" : ""} applied. Every run still clears, with ${money(sim.liquidity - RELEASE_FLOOR)} of headroom.`}
                  </p>
                </div>
              </section>

              <section className={styles.panel} aria-labelledby="bal-h">
                <h2 className={styles.panelHead} id="bal-h">
                  Balances by account
                </h2>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Ccy</th>
                      <th scope="col">Account</th>
                      <th scope="col" className={styles.num}>
                        Cleared
                      </th>
                      <th scope="col" className={styles.num}>
                        1d
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sim.balances.map((b) => (
                      <tr
                        key={b.id}
                        data-shift={b.moved ? "" : undefined}
                        data-on={
                          inspect?.kind === "account" && inspect.id === b.id ? "" : undefined
                        }
                        onClick={() => setInspect({ kind: "account", id: b.id })}
                      >
                        <td>{b.ccy}</td>
                        <td>{b.account}</td>
                        <td className={styles.num}>{money(b.value, b.ccy)}</td>
                        <td className={styles.num} data-up={b.change >= 0 ? "" : undefined}>
                          {b.change >= 0 ? "+" : ""}
                          {b.change.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                    {sim.balances.length === 0 && (
                      <tr>
                        <td colSpan={4}>No account in this scope for {activeEntity.name}.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>

              <section className={styles.panel} aria-labelledby="tape-h">
                <h2 className={styles.panelHead} id="tape-h">
                  Market tape · money market rates
                </h2>
                <div className={styles.tape}>
                  <FieldCanvas
                    kind="tick-matrix"
                    colors={{ ...WORLD.palette, raise: "#161c22" }}
                    className={styles.tapeCanvas}
                  />
                </div>
                <ul className={styles.rates}>
                  <li>
                    <span>€STR</span> 3.14% <em data-up="">+2bp</em>
                  </li>
                  <li>
                    <span>SOFR</span> {shocks.includes("rate") ? "5.33%" : "4.58%"}{" "}
                    <em data-up={shocks.includes("rate") ? "" : undefined}>
                      {shocks.includes("rate") ? "+75bp" : "−1bp"}
                    </em>
                  </li>
                  <li>
                    <span>SONIA</span> 4.09% <em data-up="">+3bp</em>
                  </li>
                </ul>
              </section>

              <section className={styles.wide} aria-labelledby="pay-h">
                <h2 className={styles.panelHead} id="pay-h">
                  Payment queue · {awaiting} awaiting approval
                </h2>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Run</th>
                      <th scope="col">Beneficiary</th>
                      <th scope="col">Value date</th>
                      <th scope="col" className={styles.num}>
                        Amount
                      </th>
                      <th scope="col">Rail</th>
                      <th scope="col">Approvals</th>
                      <th scope="col">Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopedPayments.map((p) => {
                      // The consequence lands here: under the floor, the largest
                      // run in scope is the one that cannot be released today.
                      const largest = [...scopedPayments].sort(
                        (a, b) =>
                          b.amount * (TO_EUR[b.ccy] ?? 1) - a.amount * (TO_EUR[a.ccy] ?? 1),
                      )[0];
                      const stopped = sim.held && p.run === largest?.run;
                      return (
                        <tr
                          key={p.run}
                          data-shift={stopped ? "" : undefined}
                          data-on={
                            inspect?.kind === "payment" && inspect.run === p.run ? "" : undefined
                          }
                          onClick={() => setInspect({ kind: "payment", run: p.run })}
                        >
                          <td className={styles.ref}>{p.run}</td>
                          <td>{p.to}</td>
                          <td>{p.value}</td>
                          <td className={styles.num}>{money(p.amount, p.ccy)}</td>
                          <td>{p.rail}</td>
                          <td>{p.approvals} of 2</td>
                          <td>
                            <span
                              className={styles.state}
                              data-state={
                                stopped
                                  ? "failed"
                                  : p.approvals === 2
                                    ? "settled"
                                    : "pending"
                              }
                            >
                              {stopped ? "Held — floor" : p.approvals === 2 ? "Released" : p.flag}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {scopedPayments.length === 0 && (
                      <tr>
                        <td colSpan={7}>Nothing in the queue for this entity.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            </div>
          )}

          {tab === "Positions" && (
            <section className={styles.positions} aria-labelledby="pos-h">
              <div className={styles.panelHeadRow}>
                <h2 className={styles.panelHead} id="pos-h">
                  Open positions · {scopeLabel}
                </h2>
                <div className={styles.sorter}>
                  <span>Sort</span>
                  {(
                    [
                      ["notional", "Notional"],
                      ["yieldPct", "Yield"],
                      ["days", "Maturity"],
                    ] as [SortKey, string][]
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      data-on={sort === key ? "" : undefined}
                      onClick={() => setSort(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Ref</th>
                      <th scope="col">Instrument</th>
                      <th scope="col">Ccy</th>
                      <th scope="col" className={styles.num}>
                        Notional
                      </th>
                      <th scope="col" className={styles.num}>
                        Yield
                      </th>
                      <th scope="col">Maturity</th>
                      <th scope="col">Counterparty</th>
                      <th scope="col">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p) => (
                      <tr
                        key={p.id}
                        data-on={
                          inspect?.kind === "position" && inspect.id === p.id ? "" : undefined
                        }
                        onClick={() => setInspect({ kind: "position", id: p.id })}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setInspect({ kind: "position", id: p.id });
                          }
                        }}
                      >
                        <td className={styles.ref}>{p.id}</td>
                        <td>{p.instrument}</td>
                        <td>{p.ccy}</td>
                        <td className={styles.num}>{money(p.notional, p.ccy)}</td>
                        <td className={styles.num}>
                          {p.yieldPct ? `${p.yieldPct.toFixed(2)}%` : "—"}
                        </td>
                        <td>{p.maturity}</td>
                        <td>{p.counterparty}</td>
                        <td>
                          <span className={styles.state} data-state={p.state.toLowerCase()}>
                            {p.state}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={8}>
                          Nothing open in {scopeLabel.toLowerCase()} for {activeEntity.name}
                          {q !== "" ? ` matching “${query}”` : ""}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "Ladder" && (
            <div className={styles.ladderGrid}>
            <section className={styles.panel} aria-labelledby="lad-h">
              <h2 className={styles.panelHead} id="lad-h">
                Maturity ladder · € million · {scopeLabel}
              </h2>
              <ul className={styles.ladder}>
                {sim.ladder.map((b) => {
                  const peak = Math.max(1, ...sim.ladder.map((x) => x.value));
                  return (
                    <li key={b.bucket}>
                      <button
                        type="button"
                        className={styles.ladderRow}
                        data-on={
                          inspect?.kind === "bucket" && inspect.bucket === b.bucket
                            ? ""
                            : undefined
                        }
                        onClick={() => setInspect({ kind: "bucket", bucket: b.bucket })}
                      >
                        <span className={styles.ladderLabel}>{b.bucket}</span>
                        <span className={styles.ladderBar}>
                          <i style={{ width: `${(b.value / peak) * 100}%` }} />
                        </span>
                        <span className={styles.ladderValue}>{b.value.toFixed(1)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {/* The policy test is computed, so it can actually fail. */}
              <p
                className={styles.ladderNote}
                data-breach={sim.shortShare < SHORT_POLICY ? "" : undefined}
              >
                Policy requires {(SHORT_POLICY * 100).toFixed(0)}% of the book inside 90 days.
                Currently {(sim.shortShare * 100).toFixed(1)}% —{" "}
                {sim.shortShare < SHORT_POLICY ? "non-compliant" : "compliant"}, with{" "}
                {sim.ladder.slice(0, 2).reduce((s, b) => s + b.value, 0).toFixed(1)}m rolling off in
                the next four weeks.
              </p>
            </section>

            {/* A chart on its own is not a view. What a treasurer opens the
                ladder for is the schedule and the concentration behind it. */}
            <div className={styles.ladderSide}>
              <section className={styles.panel} aria-labelledby="roll-h">
                <h2 className={styles.panelHead} id="roll-h">
                  Roll-off schedule
                </h2>
                <ol className={styles.rollList}>
                  {[...scopedPositions]
                    .sort((a, b) => a.days - b.days)
                    .slice(0, 6)
                    .map((p) => (
                      <li key={p.id}>
                        <span className={styles.rollDate}>
                          {p.maturity === "Open" ? "callable" : p.maturity.slice(5)}
                        </span>
                        <span>{p.instrument}</span>
                        <span className={styles.rollAmount}>{money(p.notional, p.ccy)}</span>
                      </li>
                    ))}
                  {scopedPositions.length === 0 && (
                    <li>
                      <span className={styles.rollDate}>—</span>
                      <span>Nothing matures in this scope.</span>
                      <span />
                    </li>
                  )}
                </ol>
              </section>

              <section className={styles.panel} aria-labelledby="conc-h">
                <h2 className={styles.panelHead} id="conc-h">
                  Concentration by counterparty
                </h2>
                <ul className={styles.concList}>
                  {(() => {
                    const byName = new Map<string, number>();
                    for (const p of scopedPositions) {
                      const eur = p.notional * (TO_EUR[p.ccy] ?? 1);
                      byName.set(p.counterparty, (byName.get(p.counterparty) ?? 0) + eur);
                    }
                    const cap = 20_000_000;
                    return [...byName.entries()]
                      .sort((a, b) => b[1] - a[1])
                      .map(([name, value]) => (
                        <li key={name} data-over={value > cap * 0.6 ? "" : undefined}>
                          <span>{name}</span>
                          <span className={styles.num}>{money(value)}</span>
                          <span className={styles.concBar} aria-hidden="true">
                            <i style={{ width: `${Math.min(100, (value / cap) * 100)}%` }} />
                          </span>
                        </li>
                      ));
                  })()}
                </ul>
                <p className={styles.ladderNote}>
                  Limit is €20.0m a name. Anything over 60% of a limit is flagged for the weekly
                  credit review.
                </p>
              </section>
            </div>
            </div>
          )}

          {tab === "Activity" && (
            <section className={styles.panel} aria-labelledby="act-h">
              <h2 className={styles.panelHead} id="act-h">
                Activity · {scopeLabel}
              </h2>
              <ol className={styles.activity}>
                {scopedLog.map((a, i) => (
                  <li key={`${a.at}-${i}`}>
                    <span className={styles.actAt}>{a.at}</span>
                    <span
                      className={styles.actWho}
                      data-system={a.who === "system" ? "" : undefined}
                    >
                      {a.who}
                    </span>
                    <span className={styles.actWhat}>{a.what}</span>
                  </li>
                ))}
                {scopedLog.length === 0 && (
                  <li>
                    <span className={styles.actWhat}>
                      Nothing logged against {scopeLabel.toLowerCase()} today.
                    </span>
                  </li>
                )}
              </ol>
            </section>
          )}
        </main>

        {/* ── The inspector ──────────────────────────────────────────────────
            One panel, four subjects, and every action on it writes to the book
            and to the log. */}
        <aside className={styles.drawer} aria-label="Inspector">
          {subject?.kind === "position" && (
            <>
              <div className={styles.drawerHead}>
                <p className={styles.drawerRef}>
                  {subject.p.id} <span className={styles.drawerKind}>position</span>
                </p>
                <p className={styles.drawerName}>{subject.p.instrument}</p>
              </div>
              <dl className={styles.detail}>
                <div>
                  <dt>Notional</dt>
                  <dd>{money(subject.p.notional, subject.p.ccy)}</dd>
                </div>
                <div>
                  <dt>Yield</dt>
                  <dd>{subject.p.yieldPct ? `${subject.p.yieldPct.toFixed(2)}%` : "—"}</dd>
                </div>
                <div>
                  <dt>Maturity</dt>
                  <dd>{subject.p.maturity}</dd>
                </div>
                <div>
                  <dt>Days</dt>
                  <dd>{subject.p.days}</dd>
                </div>
                <div>
                  <dt>Counterparty</dt>
                  <dd>{subject.p.counterparty}</dd>
                </div>
                <div>
                  <dt>Rating</dt>
                  <dd>{subject.p.rating}</dd>
                </div>
                <div>
                  <dt>State</dt>
                  <dd>{subject.p.state}</dd>
                </div>
                <div>
                  <dt>Entity</dt>
                  <dd>{ENTITIES.find((e) => e.id === subject.p.entity)?.name.split(" ")[1]}</dd>
                </div>
              </dl>
              <div className={styles.drawerActions}>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={subject.p.state === "Rolling" || subject.p.maturity === "Open"}
                  onClick={() => rollPosition(subject.p.id)}
                >
                  {subject.p.state === "Rolling" ? "Rolling" : "Roll at maturity"}
                </button>
                <button type="button" className={styles.secondary} disabled>
                  Export confirmation
                </button>
              </div>
              <p className={styles.drawerNote}>
                {subject.p.state === "Rolling"
                  ? `Set to roll. The ladder has moved this ${subject.p.tenor} days further out — check the 90-day policy weight.`
                  : "Rolling keeps the counterparty limit unchanged and extends the position by its original tenor. A change of counterparty needs a second approval."}
              </p>
            </>
          )}

          {subject?.kind === "account" && (
            <>
              <div className={styles.drawerHead}>
                <p className={styles.drawerRef}>
                  {subject.b.ccy} <span className={styles.drawerKind}>account</span>
                </p>
                <p className={styles.drawerName}>{subject.b.account}</p>
              </div>
              <dl className={styles.detail}>
                <div>
                  <dt>Cleared</dt>
                  <dd>{money(subject.b.value, subject.b.ccy)}</dd>
                </div>
                <div>
                  <dt>1 day</dt>
                  <dd>
                    {subject.b.change >= 0 ? "+" : ""}
                    {subject.b.change.toFixed(1)}%
                  </dd>
                </div>
                <div>
                  <dt>In EUR</dt>
                  <dd>{money(subject.b.value * (TO_EUR[subject.b.ccy] ?? 1))}</dd>
                </div>
                <div>
                  <dt>Under shock</dt>
                  <dd>{subject.b.moved ? "Restated" : "Unchanged"}</dd>
                </div>
              </dl>
              <p className={styles.drawerIban}>{subject.b.iban}</p>
              <div className={styles.drawerActions}>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={!subject.b.sweepTo}
                  onClick={() => sweepAccount(subject.b.id)}
                >
                  Sweep 25% to group
                </button>
              </div>
              <p className={styles.drawerNote}>
                {subject.b.sweepTo
                  ? "A sweep moves value between accounts on the same day and is logged against the operator who released it."
                  : "This is the group collections account. Sweeps arrive here; they do not leave from it."}
              </p>
            </>
          )}

          {subject?.kind === "payment" && (
            <>
              <div className={styles.drawerHead}>
                <p className={styles.drawerRef}>
                  {subject.p.run} <span className={styles.drawerKind}>payment run</span>
                </p>
                <p className={styles.drawerName}>{subject.p.to}</p>
              </div>
              <dl className={styles.detail}>
                <div>
                  <dt>Amount</dt>
                  <dd>{money(subject.p.amount, subject.p.ccy)}</dd>
                </div>
                <div>
                  <dt>Value date</dt>
                  <dd>{subject.p.value}</dd>
                </div>
                <div>
                  <dt>Rail</dt>
                  <dd>{subject.p.rail}</dd>
                </div>
                <div>
                  <dt>Approvals</dt>
                  <dd>{subject.p.approvals} of 2</dd>
                </div>
                <div>
                  <dt>Flag</dt>
                  <dd>{subject.p.approvals === 2 ? "Released" : subject.p.flag}</dd>
                </div>
                <div>
                  <dt>Floor</dt>
                  <dd>{sim.held ? "Breached" : "Held"}</dd>
                </div>
              </dl>
              <div className={styles.drawerActions}>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={subject.p.approvals >= 2 || sim.held}
                  onClick={() => approvePayment(subject.p.run)}
                >
                  {subject.p.approvals >= 2 ? "Released" : "Approve as n.arden"}
                </button>
              </div>
              <p className={styles.drawerNote}>
                {sim.held
                  ? "Liquidity is under the release floor. Approvals are frozen until the scenario is reset or cover is raised."
                  : "Two signatures release a run. The second cannot come from the operator who raised it."}
              </p>
            </>
          )}

          {subject?.kind === "bucket" && (
            <>
              <div className={styles.drawerHead}>
                <p className={styles.drawerRef}>
                  {subject.bucket} <span className={styles.drawerKind}>ladder bucket</span>
                </p>
                <p className={styles.drawerName}>{subject.value.toFixed(1)}m in scope</p>
              </div>
              <ul className={styles.bucketList}>
                {subject.members.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => setInspect({ kind: "position", id: p.id })}>
                      <span className={styles.ref}>{p.id}</span>
                      <span>{p.instrument}</span>
                      <span className={styles.num}>{p.days} d</span>
                    </button>
                  </li>
                ))}
                {subject.members.length === 0 && <li className={styles.drawerEmpty}>Empty bucket.</li>}
              </ul>
              <p className={styles.drawerNote}>
                {(
                  (subject.value / Math.max(0.001, sim.ladderTotal)) *
                  100
                ).toFixed(1)}
                % of the book in scope matures in this window.
              </p>
            </>
          )}

          {!subject && (
            <p className={styles.drawerEmpty}>
              Select a position, an account, a payment run or a ladder bucket to inspect it.
            </p>
          )}
        </aside>
      </div>

      <footer className={styles.status}>
        <span>Recomputed {stamp(ticks)} · {sim.on.length} shock{sim.on.length === 1 ? "" : "s"}</span>
        <span>
          {scopedPositions.length} position{scopedPositions.length === 1 ? "" : "s"} in scope · 3
          unmatched lines
        </span>
        <span>Vault — fictional treasury software</span>
        <span>ABUD · Multiverse 04</span>
      </footer>
    </div>
  );
}
