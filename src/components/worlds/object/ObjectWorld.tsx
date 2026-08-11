"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useReveal } from "@/lib/hooks/useReveal";
import { useWorldGround } from "@/lib/hooks/useWorldGround";
import { getWorld } from "@/lib/worlds";
import { FINISHES, PLATE, STATIONS } from "./data";
import { useRadio } from "./useRadio";
import { RadioWavesCanvas } from "./RadioWavesCanvas";
import styles from "./ObjectWorld.module.css";

const WORLD = getWorld("object");

/**
 * أثير — a radio set, and the archive behind it.
 *
 * The whole site is one object. There is no hero image and no product shot:
 * the set is drawn, it is the centre of the page, and every control on it does
 * something. The catalogue underneath is not a separate section so much as what
 * the set is currently tuned to.
 *
 * The signature is the dial. Drag the knob — or use the arrow keys on it — and
 * the needle sweeps across the scale, the lamp behind the glass changes colour,
 * the station, the schedule and the archive all change with it, and the room
 * tone the set is emitting slides to the new band. One control moves the whole
 * decade.
 */
export function ObjectWorld() {
  useWorldGround(WORLD);
  const root = useReveal<HTMLDivElement>();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(2);
  const [on, setOn] = useState(false);
  const [volume, setVolume] = useState(0.62);
  const [finishId, setFinishId] = useState(FINISHES[0].id);
  const [dragging, setDragging] = useState(false);
  /** True for a moment after the dial moves, so the set hisses between bands. */
  const [tuning, setTuning] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const volKnobRef = useRef<HTMLDivElement>(null);
  const settleRef = useRef<number | null>(null);

  const station = STATIONS[index];
  const finish = FINISHES.find((f) => f.id === finishId) ?? FINISHES[0];

  /* The set actually plays. Nothing is sampled: see useRadio for why, and for
     how the maqam ends up between the piano's keys. */
  useRadio({
    on,
    volume,
    audioUrl: station.audioUrl,
    tuning,
    position: index / (STATIONS.length - 1),
  });

  const tuneTo = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(STATIONS.length - 1, next));
    setIndex((was) => {
      if (was !== clamped) setTuning(true);
      return clamped;
    });
  }, []);

  /* Landing on a band clears the interference — but only once the hand stops. */
  useEffect(() => {
    if (!tuning) return;
    if (settleRef.current !== null) window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => setTuning(false), 520);
    return () => {
      if (settleRef.current !== null) window.clearTimeout(settleRef.current);
    };
  }, [tuning, index]);

  const power = useCallback(() => setOn((was) => !was), []);

  /* Dragging the knob. The angle of the hand around the knob's centre maps
     straight onto the dial, so the control behaves like the thing it draws. */
  const angleToStation = useCallback((event: PointerEvent | ReactPointerEvent) => {
    const el = knobRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const a = Math.atan2(event.clientY - cy, event.clientX - cx);
    // Sweep runs from -140° to +140°, which is the travel a real pointer knob has.
    const deg = (a * 180) / Math.PI;
    const t = (deg + 140) / 280;
    if (t < -0.15 || t > 1.15) return null;
    return Math.round(Math.max(0, Math.min(1, t)) * (STATIONS.length - 1));
  }, []);

  // Listeners live on the window rather than the knob so the hand can wander
  // off the control mid-turn without the dial letting go — which is what a
  // physical knob does.
  useEffect(() => {
    if (!dragging) return undefined;
    const move = (event: PointerEvent) => {
      const next = angleToStation(event);
      if (next !== null) tuneTo(next);
    };
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, angleToStation, tuneTo]);

  /* The volume knob turns through 280° like the tuner, because it is the same
     kind of object and should behave like one. */
  const volumeFromAngle = useCallback((event: PointerEvent | ReactPointerEvent) => {
    const el = volKnobRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const a = Math.atan2(
      event.clientY - (rect.top + rect.height / 2),
      event.clientX - (rect.left + rect.width / 2),
    );
    const t = ((a * 180) / Math.PI + 140) / 280;
    if (t < -0.15 || t > 1.15) return null;
    return Math.max(0, Math.min(1, t));
  }, []);

  const [volDragging, setVolDragging] = useState(false);

  useEffect(() => {
    if (!volDragging) return undefined;
    const move = (event: PointerEvent) => {
      const next = volumeFromAngle(event);
      if (next !== null) setVolume(next);
    };
    const up = () => setVolDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [volDragging, volumeFromAngle]);

  const onKnobKey = (event: React.KeyboardEvent) => {
    // The dial is printed right to left, so ArrowLeft advances the band.
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      tuneTo(index + 1);
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      tuneTo(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      tuneTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      tuneTo(STATIONS.length - 1);
    }
  };

  const vars = useMemo(
    () =>
      ({
        "--glow": on ? station.glow : finish.lamp,
        "--wood-a": finish.woodA,
        "--wood-b": finish.woodB,
        "--grain": finish.grain,
        "--cloth": finish.cloth,
        "--plate-face": finish.plate,
        "--plate-ink": finish.plateInk,
        "--knob-face": finish.knob,
        "--knob-edge": finish.knobEdge,
        "--glass-a": finish.glassA,
        "--glass-b": finish.glassB,
        "--cast": finish.shadow,
        "--beat": `${(60 / station.music.bpm).toFixed(3)}s`,
        "--vol": volume,
        /* The printed scale runs from 10% to 90% of the track so the outermost
           station's caption has somewhere to sit without leaving the glass. */
        "--needle": `${10 + station.at * 80}%`,
          "--knob-turn": `${-140 + (index / (STATIONS.length - 1)) * 280}deg`,
        "--vol-turn": `${-140 + volume * 280}deg`,
      }) as CSSProperties,
    [station, index, finish, on, volume],
  );

  return (
    <div
      className={styles.world}
      dir="rtl"
      lang="ar"
      ref={root}
      style={vars}
      data-on={on ? "" : undefined}
      data-tuning={tuning ? "" : undefined}
      data-finish={finish.id}
    >
      <RadioWavesCanvas />

      <header className={styles.head}>
        <p className={styles.brand}>أثير</p>
        <p className={styles.sub}>أرشيف الإذاعة والطرب القديم</p>
        <nav className={styles.nav} aria-label="أقسام">
          <a href="#set">الجهاز</a>
          <a href="#schedule">الخريطة</a>
          <a href="#archive">الأرشيف</a>
          <a href="#about">عن الأرشيف</a>
        </nav>
      </header>

      <main id="main">
        {/* ── The set ───────────────────────────────────────────────────── */}
        <section className={styles.setSection} id="set">
          <div className={styles.cabinet}>
            <div className={styles.veneer} aria-hidden="true" />

            <div className={styles.dial}>
              <div className={styles.glass}>
                <div className={styles.lamp} aria-hidden="true" />

                {/* Scale, station marks and needle share one track, so a
                    station's printed position and the needle that lands on it
                    are measured against exactly the same width. */}
                <div className={styles.track} aria-hidden="true">
                  <ol className={styles.scale}>
                    {Array.from({ length: 41 }, (_, i) => (
                      <li key={i} data-major={i % 8 === 0 ? "" : undefined} />
                    ))}
                  </ol>
                  <ul className={styles.marks}>
                    {STATIONS.map((s, i) => (
                      <li
                        key={s.id}
                        style={{ "--at": s.at } as CSSProperties}
                        data-on={i === index ? "" : undefined}
                      >
                        <b>{s.khz}</b>
                        <span>{s.name}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.pointer} />
                </div>

                <p className={styles.band} aria-hidden="true">
                  الموجة المتوسطة · ك.هرتز
                </p>
              </div>
            </div>

            <div className={styles.controls}>
              <button
                type="button"
                className={styles.power}
                onClick={power}
                aria-pressed={on}
              >
                <span className={styles.powerLed} aria-hidden="true" />
                {on ? "أطفِئ" : "شغِّل"}
              </button>

              <div className={styles.grilleWrap}>
                <div className={styles.grille} aria-hidden="true">
                  {Array.from({ length: 13 }, (_, i) => (
                    <i key={i} />
                  ))}
                </div>
                <div className={styles.vu} aria-hidden="true">
                  {Array.from({ length: 18 }, (_, i) => (
                    <i key={i} style={{ "--i": i } as CSSProperties} />
                  ))}
                </div>
              </div>

              {/* The dial. A real control: drag it, or take it with the keyboard. */}
              <div
                ref={knobRef}
                className={styles.knob}
                role="slider"
                tabIndex={0}
                aria-label="مؤشّر الموجة"
                aria-valuemin={0}
                aria-valuemax={STATIONS.length - 1}
                aria-valuenow={index}
                aria-valuetext={`${station.khz} — ${station.name}`}
                onKeyDown={onKnobKey}
                onWheel={(event) => {
                  if (event.deltaY > 0) tuneTo(index - 1);
                  else if (event.deltaY < 0) tuneTo(index + 1);
                }}
                onPointerDown={(event) => {
                  setDragging(true);
                  knobRef.current?.focus();
                  const next = angleToStation(event);
                  if (next !== null) tuneTo(next);
                }}
              >
                <span className={styles.knobFace} aria-hidden="true">
                  {Array.from({ length: 16 }, (_, i) => (
                    <i key={i} style={{ "--a": `${(i / 16) * 360}deg` } as CSSProperties} />
                  ))}
                </span>
                <span className={styles.knobMark} aria-hidden="true" />
                <span className={styles.knobLabel} aria-hidden="true">
                  تَوليف
                </span>
              </div>

              {/* Volume is a knob, not a slider — this is a 1958 cabinet. */}
              <div
                ref={volKnobRef}
                className={styles.volKnob}
                role="slider"
                tabIndex={0}
                aria-label="مستوى الصوت"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(volume * 100)}
                aria-valuetext={`${Math.round(volume * 100)} من ١٠٠`}
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                    event.preventDefault();
                    setVolume((v) => Math.min(1, v + 0.08));
                  } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    event.preventDefault();
                    setVolume((v) => Math.max(0, v - 0.08));
                  }
                }}
                onWheel={(event) => {
                  if (event.deltaY > 0) setVolume((v) => Math.max(0, v - 0.04));
                  else if (event.deltaY < 0) setVolume((v) => Math.min(1, v + 0.04));
                }}
                onPointerDown={(event) => {
                  setVolDragging(true);
                  volKnobRef.current?.focus();
                  const next = volumeFromAngle(event);
                  if (next !== null) setVolume(next);
                }}
              >
                <span className={styles.knobFace} aria-hidden="true">
                  {Array.from({ length: 12 }, (_, i) => (
                    <i key={i} style={{ "--a": `${(i / 12) * 360}deg` } as CSSProperties} />
                  ))}
                </span>
                <span className={styles.volMark} aria-hidden="true" />
                <span className={styles.knobLabel} aria-hidden="true">
                  صوت
                </span>
              </div>
            </div>

            {/* ── The finishes ────────────────────────────────────────────────
                A radio was furniture, and furniture came in finishes. Each one
                changes the two woods, the cloth, the plate, the knobs, the tint
                of the glass and how the box casts its shadow into the room. */}
            <div className={styles.finishes}>
              <p className={styles.finishLabel}>الكسوة</p>
              <ul className={styles.finishList}>
                {FINISHES.map((f) => (
                  <li key={f.id}>
                    <button
                      type="button"
                      className={styles.finishChip}
                      style={{ "--chip": f.chip } as CSSProperties}
                      data-on={f.id === finish.id ? "" : undefined}
                      onClick={() => setFinishId(f.id)}
                      aria-pressed={f.id === finish.id}
                    >
                      <span className={styles.finishSwatch} aria-hidden="true" />
                      <span className={styles.finishName}>{f.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className={styles.finishNote}>{finish.note}</p>
            </div>
          </div>

          <div className={styles.readout} key={station.id}>
            <p className={styles.decade}>{station.decade}</p>
            <h1 className={styles.stationName}>{station.name}</h1>
            <p className={styles.mood}>{station.mood}</p>
            <p className={styles.announcer}>{station.announcer}</p>
            <dl className={styles.bandSpecs}>
              <div>
                <dt>المقام</dt>
                <dd>{station.music.maqam}</dd>
              </div>
              <div>
                <dt>الإيقاع</dt>
                <dd>
                  {String(station.music.bpm).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)])} نبضة
                </dd>
              </div>
              <div>
                <dt>التخت</dt>
                <dd>
                  {station.music.ensemble.box > 0.4
                    ? "صندوق إيقاع وكمان"
                    : station.music.ensemble.strings > 0.7
                      ? "أوركسترا وقانون"
                      : "عود وقانون ورِق"}
                </dd>
              </div>
            </dl>
            <p className={styles.hint}>
              اضغط «شغِّل»، ثم أدِر قرص التوليف بالسحب أو بالأسهم. ما تسمعه مُولَّدٌ في المتصفّح
              لحظةَ سماعه من مقام المحطّة وإيقاعها وتختها — لا تسجيلَ محفوظًا هنا ولا حقَّ لأحدٍ
              فيه، لأنّ تسجيلات ذلك الزمن ليست ملكًا لنا.
            </p>
          </div>
        </section>

        {/* ── Schedule ──────────────────────────────────────────────────── */}
        <section className={styles.schedule} id="schedule" aria-labelledby="sched-title">
          <div className={styles.secHead}>
            <h2 id="sched-title">خريطة الإرسال</h2>
            <p>ما يُذاع اليوم على {station.name}.</p>
          </div>
          <ol className={styles.slots} key={`sch-${station.id}`}>
            {station.programme.map((slot, i) => (
              <li key={slot.title} style={{ "--i": i } as CSSProperties}>
                <span className={styles.slotTime}>{slot.time}</span>
                <span className={styles.slotTitle}>{slot.title}</span>
                <span className={styles.slotKind}>{slot.kind}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Archive ───────────────────────────────────────────────────── */}
        <section className={styles.archive} id="archive" aria-labelledby="arch-title">
          <div className={styles.secHead}>
            <h2 id="arch-title">الأرشيف</h2>
            <p>تسجيلاتٌ من {station.decade}، محفوظة على شريط.</p>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">التسجيل</th>
                <th scope="col">الأداء</th>
                <th scope="col">السنة</th>
                <th scope="col">المدّة</th>
              </tr>
            </thead>
            <tbody key={`arc-${station.id}`}>
              {station.archive.map((rec, i) => (
                <tr key={rec.title} style={{ "--i": i } as CSSProperties}>
                  <td>{rec.title}</td>
                  <td>{rec.by}</td>
                  <td>{rec.year}</td>
                  <td className={styles.len}>{rec.len}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── The plate on the back ─────────────────────────────────────── */}
        <section className={styles.about} id="about" aria-labelledby="about-title">
          <div className={styles.secHead}>
            <h2 id="about-title">عن الجهاز</h2>
            <p>لوحة المواصفات، كما تُثبَّت على ظهر الصندوق.</p>
          </div>
          <dl className={styles.plate}>
            {PLATE.map((row) => (
              <div key={row.k}>
                <dt>{row.k}</dt>
                <dd>{row.v}</dd>
              </div>
            ))}
            <div>
              <dt>الكسوة المُركَّبة</dt>
              <dd>{finish.name} — {finish.note}</dd>
            </div>
            <div>
              <dt>الصوت</dt>
              <dd>مُولَّد في المتصفّح · لا تسجيلات مُرخَّصة</dd>
            </div>
          </dl>
          {reduced && (
            <p className={styles.hint}>
              وُضِع الجهاز في وضع السكون: المؤشّر ثابت، والإضاءة ثابتة. الصوت لا يبدأ إلّا
              بطلبك، في كلّ الأحوال.
            </p>
          )}
        </section>
      </main>

      <footer className={styles.foot}>
        <p>أثير — أرشيفٌ متخيَّل لإذاعةٍ لم تكن.</p>
        <p>الأسماء والتسجيلات كُتبت لهذا الموقع، ولا تخصّ أحدًا.</p>
      </footer>
    </div>
  );
}
