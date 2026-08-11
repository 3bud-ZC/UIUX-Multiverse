"use client";

import { useCallback, useState } from "react";
import { FieldCanvas } from "@/components/common/FieldCanvas";
import { useWorldGround } from "@/lib/hooks/useWorldGround";
import { getWorld } from "@/lib/worlds";
import { MATERIALS, MODES, WORKS, type ModeId } from "./data";
import { Drawing, type ViewState } from "./Drawing";
import styles from "./Forma.module.css";

const WORLD = getWorld("forma");

export function Forma() {
  useWorldGround(WORLD);
  const [current, setCurrent] = useState(WORKS[0].no);
  const project = WORKS.find((w) => w.no === current) ?? WORKS[0];

  /* One view state for the whole drawing set. Every control below writes into
     it, and the four standing views are presets on the same two angles. */
  const [view, setView] = useState<ViewState>({
    mode: "plan",
    az: 0,
    el: 90,
    explode: 0,
    level: null,
    grid: true,
    dims: true,
    annos: true,
    structure: false,
    sun: WORKS[0].sun,
    heavy: false,
  });

  const setMode = useCallback((id: ModeId) => {
    const preset = MODES.find((m) => m.id === id) ?? MODES[0];
    setView((v) => ({ ...v, mode: id, az: preset.az, el: preset.el }));
  }, []);

  /* Turning the model by hand puts you in an axonometric, because that is what
     you are then looking at — the mode follows the geometry rather than gating it. */
  const turn = useCallback((patch: Partial<ViewState>) => {
    setView((v) => {
      const next = { ...v, ...patch };
      const matched = MODES.find(
        (m) => Math.abs(m.el - next.el) < 1 && Math.abs(m.az - next.az) < 1,
      );
      return {
        ...next,
        mode: matched?.id ?? (next.el > 78 ? "plan" : next.el < 12 ? "section" : "axon"),
      };
    });
  }, []);

  const levels = [...new Set(project.volumes.map((v) => v.level))].sort((a, z) => a - z);

  const pick = useCallback((no: string) => {
    setCurrent(no);
    const work = WORKS.find((w) => w.no === no);
    // A different building is a different site, so the sun and the isolated
    // storey reset with it rather than carrying over meaninglessly.
    setView((v) => ({ ...v, sun: work?.sun ?? v.sun, level: null, explode: 0 }));
  }, []);

  return (
    <div className={styles.sheet}>
      <header className={styles.titleBlock}>
        <div className={styles.tbName}>
          <p className={styles.studio}>Forma</p>
          <p className={styles.discipline}>Architecture &amp; research · Rotterdam</p>
        </div>
        <dl className={styles.tbMeta}>
          <div>
            <dt>Sheet</dt>
            <dd>A-001</dd>
          </div>
          <div>
            <dt>Rev</dt>
            <dd>C</dd>
          </div>
          <div>
            <dt>Issued</dt>
            <dd>2026-08-10</dd>
          </div>
          <div>
            <dt>Scale</dt>
            <dd>1:200</dd>
          </div>
        </dl>
        <nav className={styles.tbNav} aria-label="Sheets">
          <a href="#works">Works</a>
          <a href="#study">Case</a>
          <a href="#studio">Studio</a>
        </nav>
      </header>

      <section className={styles.opening} aria-labelledby="opening-h">
        <FieldCanvas
          kind="axonometric"
          colors={{ ...WORLD.palette, raise: "#b9b7af" }}
          className={styles.field}
        />
        <div className={styles.openingType}>
          <p className={styles.marginNote}>
            Est. 2016 · 14 built · 3 on site
            <br />
            The office publishes drawings, not renders.
          </p>
          {/* Two lines, set out rather than scaled up: the second is indented to
              the sheet's third column and the rule under it is the datum both
              sit on, so the headline reads as drafted instead of shouted. */}
          <h1 className={styles.h1} id="opening-h">
            <span className={styles.h1a}>Structure</span>
            <span className={styles.h1b}>left showing</span>
          </h1>
          <p className={styles.h1Rule} aria-hidden="true" />
        </div>
        <p className={styles.openingText}>
          Forma works on small buildings with long lives: a house, a workshop, an archive. Each is
          set out on a grid that stays visible after the building is finished, because the grid is
          how the thing was reasoned and hiding it would be a kind of lie about the work.
        </p>
      </section>

      <section className={styles.works} id="works" aria-labelledby="works-h">
        <div className={styles.worksIndex}>
          <h2 className={styles.h2} id="works-h">
            Selected works
          </h2>
          <table className={styles.index}>
            <thead>
              <tr>
                <th scope="col">No.</th>
                <th scope="col">Project</th>
                <th scope="col">Program</th>
                <th scope="col">Place</th>
                <th scope="col">Year</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {WORKS.map((w) => (
                <tr
                  key={w.no}
                  data-on={current === w.no ? "" : undefined}
                  onClick={() => pick(w.no)}
                >
                  <td>
                    <button type="button" className={styles.indexButton}>
                      {w.no}
                    </button>
                  </td>
                  <td className={styles.indexName}>{w.name}</td>
                  <td>{w.program}</td>
                  <td>{w.place}</td>
                  <td>{w.year}</td>
                  <td>{w.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* The schedule of accommodation, measured off the same volumes the
              drawing is projected from — so it cannot disagree with the plan. */}
          <div className={styles.programme}>
            <h3 className={styles.programmeHead}>
              {project.no} · schedule of accommodation
            </h3>
            <table className={styles.schedule}>
              <thead>
                <tr>
                  <th scope="col">Space</th>
                  <th scope="col">Storey</th>
                  <th scope="col" className={styles.qty}>
                    Area
                  </th>
                  <th scope="col" className={styles.qty}>
                    Volume
                  </th>
                </tr>
              </thead>
              <tbody>
                {project.volumes
                  .filter((v) => v.name)
                  .map((v) => (
                    <tr key={v.name}>
                      <th scope="row">{v.name}</th>
                      <td>{v.kind === "void" ? "external" : v.level}</td>
                      <td className={styles.qty}>{Math.round(v.w * v.d)} m²</td>
                      <td className={styles.qty}>{Math.round(v.w * v.d * v.h)} m³</td>
                    </tr>
                  ))}
                <tr className={styles.scheduleTotal}>
                  <th scope="row">Enclosed</th>
                  <td>{levels.length} storeys</td>
                  <td className={styles.qty}>
                    {Math.round(
                      project.volumes
                        .filter((v) => v.kind !== "void")
                        .reduce((sum, v) => sum + v.w * v.d, 0),
                    )}{" "}
                    m²
                  </td>
                  <td className={styles.qty}>
                    {project.bay.toFixed(1)} m bay
                  </td>
                </tr>
              </tbody>
            </table>
            <p className={styles.programmeNote}>
              {project.program} · {project.place} · {project.status.toLowerCase()}. Roof:{" "}
              {project.roof === "monitor"
                ? "north-light monitor"
                : project.roof === "vault"
                  ? "single vault"
                  : project.roof}
              . Site falls 1:{Math.round(1 / Math.max(0.005, project.slope))}.
            </p>
          </div>
        </div>

        <figure className={styles.plate}>
          {/* The drawing set. One building, held four ways — this is the whole
              argument of the office, so it is a control rather than a caption. */}
          <div className={styles.modes} role="group" aria-label="Drawing">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={styles.mode}
                data-on={view.mode === m.id ? "" : undefined}
                onClick={() => setMode(m.id)}
                aria-pressed={view.mode === m.id}
              >
                {m.label}
              </button>
            ))}
            <span className={styles.modeNote}>
              {MODES.find((m) => m.id === view.mode)?.note ??
                `${Math.round(view.az)}° / ${Math.round(view.el)}°`}
            </span>
          </div>

          <Drawing work={project} view={view} />

          {/* ── The instruments ──────────────────────────────────────────────
              Nothing here is a switch for its own sake. Elevation folds the plan
              up into the axonometric; explode lifts the storeys the section
              stacks; isolate answers "which floor is that"; dimensions and
              annotations are two of the three things a drawing is issued with or
              without; structure draws the bay the project is set out on; and the
              sun is a real vector tested against real face normals. */}
          <div className={styles.instruments}>
            <label className={styles.slider}>
              <span>Azimuth</span>
              <input
                type="range"
                min={0}
                max={90}
                step={1}
                value={Math.round(view.az)}
                onChange={(event) => turn({ az: Number(event.target.value) })}
              />
              <b>{Math.round(view.az)}°</b>
            </label>
            <label className={styles.slider}>
              <span>Elevation</span>
              <input
                type="range"
                min={0}
                max={90}
                step={1}
                value={Math.round(view.el)}
                onChange={(event) => turn({ el: Number(event.target.value) })}
              />
              <b>{Math.round(view.el)}°</b>
            </label>
            <label className={styles.slider}>
              <span>Explode</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(view.explode * 100)}
                onChange={(event) =>
                  setView((v) => ({ ...v, explode: Number(event.target.value) / 100 }))
                }
                disabled={levels.length < 2}
              />
              <b>{levels.length < 2 ? "one storey" : `${Math.round(view.explode * 100)}%`}</b>
            </label>
            <label className={styles.slider}>
              <span>Daylight</span>
              <input
                type="range"
                min={0}
                max={359}
                step={1}
                value={Math.round(view.sun)}
                onChange={(event) => setView((v) => ({ ...v, sun: Number(event.target.value) }))}
              />
              <b>{Math.round(view.sun)}°</b>
            </label>

            <div className={styles.isolate} role="group" aria-label="Isolate storey">
              <span>Storey</span>
              <button
                type="button"
                data-on={view.level === null ? "" : undefined}
                onClick={() => setView((v) => ({ ...v, level: null }))}
              >
                All
              </button>
              {levels.map((l) => (
                <button
                  key={l}
                  type="button"
                  data-on={view.level === l ? "" : undefined}
                  onClick={() => setView((v) => ({ ...v, level: l }))}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className={styles.toggles} role="group" aria-label="Sheet options">
              {(
                [
                  ["grid", "Set-out grid"],
                  ["dims", "Dimensions"],
                  ["annos", "Annotations"],
                  ["structure", "Structure"],
                  ["heavy", "Heavy line"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={styles.toggle}
                  data-on={view[key] ? "" : undefined}
                  aria-pressed={view[key]}
                  onClick={() => setView((v) => ({ ...v, [key]: !v[key] }))}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className={styles.instrumentNote}>
              {view.structure
                ? project.system
                : view.explode > 0.05
                  ? `${levels.length} storeys, lifted clear of one another.`
                  : view.level !== null
                    ? `Storey ${view.level} isolated. Everything else is ghosted, not hidden.`
                    : `Set out on a ${project.bay.toFixed(1)} m bay. Drag elevation to fold the plan up into the axonometric.`}
            </p>
          </div>
          <figcaption>
            <p className={styles.plateName}>
              {project.no} — {project.name}
            </p>
            <p className={styles.plateNote}>{project.note}</p>
            <dl className={styles.plateMeta}>
              <div>
                <dt>Area</dt>
                <dd>{project.area}</dd>
              </div>
              <div>
                <dt>Structure</dt>
                <dd>{project.structure}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{project.status}</dd>
              </div>
            </dl>
          </figcaption>
        </figure>
      </section>

      <section className={styles.study} id="study" aria-labelledby="study-h">
        <h2 className={styles.h2} id="study-h">
          25.07 — Archive extension
        </h2>
        <div className={styles.studyGrid}>
          <figure className={styles.studyPlate}>
            <Drawing
              work={WORKS.find((w) => w.no === "25.07") ?? WORKS[0]}
              view={{
                mode: "section",
                az: 0,
                el: 0,
                explode: 0,
                level: null,
                grid: false,
                dims: true,
                annos: true,
                structure: false,
                sun: 180,
                heavy: false,
              }}
            />
            <figcaption>Long section, looking north</figcaption>
          </figure>
          <div className={styles.studyText}>
            <p>
              The brief asked for 1,100 m² of closed storage and one room where the collection could
              be read. Stacking the storage and putting the reading room underneath it kept the
              footprint at the size of the existing yard, which is the only reason the tree stayed.
            </p>
            <p>
              The slabs are precast and left exposed. Services run in the zone above the shelving,
              where they are reachable without a ladder and invisible from the reading room floor.
            </p>
          </div>
          <table className={styles.materials}>
            <caption>Principal quantities</caption>
            <tbody>
              {MATERIALS.map((m) => (
                <tr key={m.m}>
                  <th scope="row">{m.m}</th>
                  <td className={styles.qty}>{m.q}</td>
                  <td>{m.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.office} id="studio" aria-labelledby="studio-h">
        <h2 className={styles.h2} id="studio-h">
          The office
        </h2>
        <div className={styles.essay}>
          <p>
            Eleven people, one floor, in a building the studio converted in 2018 and has been
            correcting ever since. Work is drawn by hand first and modelled second; the model is a
            check, not an idea.
          </p>
          <p>
            The office does not enter competitions with rendered images. Where a competition
            requires one, it submits an axonometric and a materials schedule instead, and it has
            lost several this way.
          </p>
        </div>
        <aside className={styles.annotations}>
          <p>
            <span>01</span> Drawings are issued at A1 and read at A3. Anything that fails at A3 is
            redrawn.
          </p>
          <p>
            <span>02</span> Every project keeps a single grid from sketch to setting-out.
          </p>
          <p>
            <span>03</span> Photographs are commissioned two winters after completion.
          </p>
        </aside>
      </section>

      <footer className={styles.colophon}>
        <p>Forma — a fictional practice, drawn as a design exercise</p>
        <p>51°55′N 4°28′E · Rotterdam</p>
        <p>ABUD · Multiverse 06</p>
      </footer>
    </div>
  );
}
