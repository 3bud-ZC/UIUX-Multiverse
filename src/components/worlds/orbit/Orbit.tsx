"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useWorldGround } from "@/lib/hooks/useWorldGround";
import { getWorld } from "@/lib/worlds";
import { CONTRACTS, MODULES, POWER_BUDGET, SECTORS } from "./data";
import styles from "./Orbit.module.css";
import { ShipCanvas, type LaunchPhase } from "./ShipCanvas";

const WORLD = getWorld("orbit");

/**
 * Orbit — Deep Field.
 *
 * A game page's job is to make you believe there is a game behind it, and the
 * only way to do that is to let you play a little of it. Three nested choices,
 * each of which changes something you can see:
 *
 *   the sector    repaints the sky the hero renders against, changes how much
 *                 wreckage is drifting in it, and swaps the contract board
 *   the contract  sets the hazard, the window and what the briefing advises
 *   the loadout   rebuilds the ship — armour, boom, claw, dish, screen, nozzles
 *
 * Then the launch sequence runs the camera: it pushes in on the countdown,
 * lights the burn on ignition, and lets the ship fall away down the lens.
 *
 * The ship itself is a mesh rendered by `ShipCanvas`, which is also the only
 * frame loop on the route — it draws the sky, the wrecks and the parallax the
 * HUD reads.
 */
export function Orbit() {
  useWorldGround(WORLD);
  const reduced = useReducedMotion();
  const [sector, setSector] = useState(SECTORS[0]!.id);
  const [contract, setContract] = useState(CONTRACTS[0]!.id);
  const [fitted, setFitted] = useState<string[]>(["hull", "tether"]);
  const [phase, setPhase] = useState<LaunchPhase>("idle");
  const [count, setCount] = useState(3);
  const sceneRef = useRef<HTMLDivElement>(null);

  const activeSector = SECTORS.find((s) => s.id === sector) ?? SECTORS[0]!;
  const board = useMemo(() => CONTRACTS.filter((c) => c.sector === sector), [sector]);
  const active = board.find((c) => c.id === contract) ?? board[0]!;
  // Stable identity: the canvas re-bakes its sky when this object changes.
  const env = useMemo(() => activeSector.env, [activeSector]);

  const load = useMemo(() => {
    const list = MODULES.filter((m) => fitted.includes(m.id));
    return {
      power: list.reduce((n, m) => n + m.power, 0),
      mass: list.reduce((n, m) => n + m.mass, 0),
    };
  }, [fitted]);
  const over = load.power > POWER_BUDGET;
  const advised = fitted.includes(active.advises);

  /* The launch sequence. Countdown, ignition, away — each a state the HUD, the
     camera and the plumes all read from the same place. */
  useEffect(() => {
    if (phase !== "counting") return;
    if (count === 0) {
      const id = window.setTimeout(() => setPhase("ignition"), 320);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setCount((c) => c - 1), 780);
    return () => window.clearTimeout(id);
  }, [phase, count]);

  useEffect(() => {
    if (phase !== "ignition") return;
    const id = window.setTimeout(() => setPhase("away"), 900);
    return () => window.clearTimeout(id);
  }, [phase]);

  const abort = useCallback(() => {
    setPhase("idle");
    setCount(3);
  }, []);

  const pickSector = useCallback((id: string) => {
    setSector(id);
    const first = CONTRACTS.find((c) => c.sector === id);
    if (first) setContract(first.id);
    setPhase("idle");
    setCount(3);
  }, []);

  const toggle = (id: string) =>
    setFitted((list) => (list.includes(id) ? list.filter((m) => m !== id) : [...list, id]));

  const hudPhase =
    phase === "away"
      ? "UNDER BURN"
      : phase === "ignition"
        ? "IGNITION"
        : phase === "counting"
          ? `T−${count}`
          : "HOLDING";

  return (
    <div className={styles.game}>
      <section className={styles.scene} ref={sceneRef} aria-labelledby="title-h">
        <ShipCanvas
          fitted={fitted}
          phase={phase}
          env={env}
          className={styles.stage}
          parallaxTarget={sceneRef}
        />
        <div className={styles.horizon} aria-hidden="true" />

        <div className={styles.hud} aria-hidden="true">
          <span className={styles.hudTL}>
            SYS · {over ? "OVERDRAWN" : "NOMINAL"} <i>·</i> {hudPhase}
          </span>
          <span className={styles.hudTR}>
            PWR {load.power}/{POWER_BUDGET} <i>·</i> MASS {load.mass}t
          </span>
          <span className={styles.hudBL}>
            {activeSector.code} · {activeSector.name.toUpperCase()}
          </span>
          <span className={styles.hudBR}>
            {active.id} <i>·</i> HAZ {active.hazard}/5
          </span>
          <span className={styles.reticle} data-phase={phase} />
        </div>

        <div className={styles.titleBlock}>
          <p className={styles.studio}>Orbit Interactive presents</p>
          <h1 className={styles.title} id="title-h">
            Deep
            <span>Field</span>
          </h1>
          <p className={styles.tagline}>
            Salvage what is left. The dark does not pay for effort — only for what you bring back.
          </p>
          <div className={styles.titleActions}>
            <a className={styles.cta} href="#board">
              Take a contract
            </a>
            <p className={styles.fittedLine}>
              Fitted:{" "}
              {fitted.length === 0
                ? "bare hull"
                : MODULES.filter((m) => fitted.includes(m.id))
                    .map((m) => m.name.toLowerCase())
                    .join(", ")}
            </p>
          </div>
        </div>
      </section>

      {/* ── The sector: the outer choice, and the one that changes the sky ── */}
      <section className={styles.sectors} id="board" aria-labelledby="sectors-h">
        <header className={styles.sectionHead}>
          <h2 className={styles.h2} id="sectors-h">
            Where you are going
          </h2>
          <p className={styles.sectionNote}>
            Four sectors are open this cycle. Each one has its own sky, its own wreckage and its own
            board.
          </p>
        </header>

        <ul className={styles.sectorList}>
          {SECTORS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={styles.sector}
                data-on={s.id === sector ? "" : undefined}
                onClick={() => pickSector(s.id)}
                aria-pressed={s.id === sector}
              >
                <span className={styles.sectorCode}>{s.code}</span>
                <span className={styles.sectorName}>{s.name}</span>
                <span className={styles.sectorNote}>{s.note}</span>
                <span className={styles.sectorMeta}>
                  {CONTRACTS.filter((c) => c.sector === s.id).length} open · {s.transit} out
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.contracts} aria-labelledby="contracts-h">
        <header className={styles.sectionHead}>
          <h2 className={styles.h2} id="contracts-h">
            Contract board
          </h2>
          <p className={styles.sectionNote}>
            {board.length} open in {activeSector.name}. Payout on retrieval, not on attempt.
          </p>
        </header>

        <div className={styles.board}>
          <ul className={styles.contractList}>
            {board.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={styles.contract}
                  data-on={contract === c.id ? "" : undefined}
                  onClick={() => {
                    setContract(c.id);
                    abort();
                  }}
                >
                  <span className={styles.contractId}>{c.id}</span>
                  <span className={styles.contractName}>{c.name}</span>
                  <span className={styles.contractSector}>◈ {c.payout}</span>
                  <span className={styles.hazard} aria-label={`Hazard ${c.hazard} of 5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <i key={i} data-on={i < c.hazard ? "" : undefined} />
                    ))}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <article className={styles.brief} key={active.id}>
            <p className={styles.briefId}>{active.id}</p>
            <h3 className={styles.briefName}>{active.name}</h3>
            <p className={styles.briefText}>{active.brief}</p>
            <ul className={styles.hazardList}>
              {active.hazards.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <dl className={styles.briefMeta}>
              <div>
                <dt>Payout</dt>
                <dd>◈ {active.payout}</dd>
              </div>
              <div>
                <dt>Window</dt>
                <dd>{active.duration}</dd>
              </div>
              <div>
                <dt>Hazard</dt>
                <dd data-high={active.hazard >= 4 ? "" : undefined}>{active.hazard} / 5</dd>
              </div>
            </dl>
            <p className={styles.advice} data-met={advised ? "" : undefined}>
              {advised
                ? `Briefing advised the ${MODULES.find((m) => m.id === active.advises)?.name.toLowerCase()}. Fitted.`
                : `Briefing advises the ${MODULES.find((m) => m.id === active.advises)?.name.toLowerCase()}. Not fitted.`}
            </p>
          </article>
        </div>
      </section>

      <section className={styles.loadout} aria-labelledby="loadout-h">
        <header className={styles.sectionHead}>
          <h2 className={styles.h2} id="loadout-h">
            Fit the hull
          </h2>
          <p className={styles.sectionNote}>
            The reactor gives you {POWER_BUDGET}. Everything else is a trade — and every module is a
            part you will see bolted on up there.
          </p>
        </header>

        <div className={styles.bay}>
          <ul className={styles.modules}>
            {MODULES.map((m) => {
              const on = fitted.includes(m.id);
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    className={styles.module}
                    data-on={on ? "" : undefined}
                    data-advised={m.id === active.advises ? "" : undefined}
                    onClick={() => toggle(m.id)}
                    aria-pressed={on}
                  >
                    <span className={styles.moduleName}>{m.name}</span>
                    <span className={styles.moduleNote}>{m.note}</span>
                    <span className={styles.moduleFits}>{m.fits}</span>
                    <span className={styles.moduleStats}>
                      <b>{m.power}</b> pwr · <b>{m.mass}</b> t
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className={styles.readout}>
            <p className={styles.readoutLabel}>Reactor load</p>
            <div className={styles.gauge} data-over={over ? "" : undefined}>
              <span style={{ width: `${Math.min((load.power / POWER_BUDGET) * 100, 100)}%` }} />
            </div>
            <p className={styles.readoutValue} data-over={over ? "" : undefined}>
              {load.power} / {POWER_BUDGET}
            </p>
            <dl className={styles.readoutRows}>
              <div>
                <dt>Mass</dt>
                <dd>{load.mass} t</dd>
              </div>
              <div>
                <dt>Modules</dt>
                <dd>{fitted.length} fitted</dd>
              </div>
              <div>
                <dt>Transit</dt>
                <dd>{activeSector.transit}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd data-bad={over ? "" : undefined}>{over ? "Overdrawn" : "Within budget"}</dd>
              </div>
            </dl>

            <div className={styles.launchRow}>
              <button
                type="button"
                className={styles.launch}
                disabled={over || phase !== "idle"}
                onClick={() => {
                  setCount(3);
                  setPhase("counting");
                }}
              >
                {phase === "idle" && `Launch — ${active.id}`}
                {phase === "counting" && (count > 0 ? `Ignition in ${count}` : "Ignition")}
                {phase === "ignition" && "Burning"}
                {phase === "away" && "Away"}
              </button>
              {phase !== "idle" && (
                <button type="button" className={styles.abort} onClick={abort}>
                  {phase === "away" ? "Recall to dock" : "Abort"}
                </button>
              )}
            </div>

            <p className={styles.launchNote} role="status">
              {over && "Drop a module. The reactor will not carry it."}
              {!over && phase === "idle" && "Holding on the pad until the drift window opens."}
              {phase === "counting" && "Tether stowed. Bay doors clear."}
              {phase === "ignition" && "Main burn lit. Both nozzles reading."}
              {phase === "away" &&
                `Out of dock and running dark toward ${activeSector.name.toLowerCase()}.`}
            </p>
            {reduced && (
              <p className={styles.reducedNote}>
                Motion reduced — the camera holds still and the sequence resolves in one step.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className={styles.lore} aria-labelledby="lore-h">
        <h2 className={styles.h2} id="lore-h">
          Eleven years
          <br />
          of quiet
        </h2>
        <div className={styles.loreText}>
          <p>
            The shipping lanes emptied in a season. What is left out there is not wreckage exactly —
            it is inventory, still in its crates, still logged against companies that no longer file
            returns.
          </p>
          <p>
            Deep Field is a game about going to get it, in a hull you fitted yourself, with a power
            budget that never quite covers what you wanted to bring.
          </p>
        </div>
      </section>

      <footer className={styles.release}>
        <div className={styles.releaseMain}>
          <p className={styles.releaseDate}>Winter 2026</p>
          <p className={styles.releasePlatforms}>PC · PS5 · Xbox Series X|S</p>
        </div>
        <p className={styles.colophon}>
          Orbit — a fictional game, drawn as a design exercise. The Salvager is an original mesh,
          modelled and rendered here; no third-party model or texture is used · ABUD · Multiverse 05
        </p>
      </footer>
    </div>
  );
}
