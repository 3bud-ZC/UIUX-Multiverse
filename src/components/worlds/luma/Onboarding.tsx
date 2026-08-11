"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import styles from "./Luma.module.css";

/**
 * Onboarding, as a sequence rather than as a picture of one.
 *
 * The old version was three cards side by side with a grey field and a fake
 * Continue button in each — a features grid wearing a phone frame. The claim
 * above it is "three questions, then it gets out of the way", and a claim about
 * a flow can only be made by the flow.
 *
 * So there is one question on screen at a time, each with the control it would
 * actually ship with — a location choice, a time dial you drag, a confirmation
 * you slide — and the phone beside it answers every one of them: pick Oslo and
 * it prints Oslo's sunrise, move the dial and the wind-down time moves with it.
 * The third answer is the product's whole personality: it asks for nothing for
 * three days.
 */

interface City {
  id: string;
  name: string;
  rise: string;
  set: string;
  /** Day length in hours, which is the reason the question is worth asking. */
  day: string;
}

const CITIES: readonly City[] = [
  { id: "lisbon", name: "Lisbon", rise: "06:52", set: "20:31", day: "13h 39m" },
  { id: "amman", name: "Amman", rise: "05:44", set: "19:24", day: "13h 40m" },
  { id: "oslo", name: "Oslo", rise: "05:31", set: "21:14", day: "15h 43m" },
  { id: "singapore", name: "Singapore", rise: "07:04", set: "19:12", day: "12h 08m" },
];

/** Minutes past 21:00, so the dial's range is the range people actually pick. */
const GOAL_MIN = 0;
const GOAL_MAX = 240;

function clock(minutesPast21: number): string {
  const total = 21 * 60 + minutesPast21;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [city, setCity] = useState<string | null>(null);
  const [goal, setGoal] = useState(90);
  const [confirm, setConfirm] = useState(0);
  const [done, setDone] = useState(false);

  const dialRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dialing, setDialing] = useState(false);
  const [sliding, setSliding] = useState(false);
  /** True once a slide has actually moved, so the trailing click is ignored. */
  const dragged = useRef(false);

  const active = CITIES.find((c) => c.id === city) ?? null;

  /* The dial. The angle of the hand around its centre is the time, so it behaves
     like the thing it draws rather than like a slider wearing a circle. */
  const angleToGoal = useCallback((event: PointerEvent | ReactPointerEvent) => {
    const el = dialRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const a = Math.atan2(
      event.clientY - (rect.top + rect.height / 2),
      event.clientX - (rect.left + rect.width / 2),
    );
    // Sweep from -130° to +130°, opening at the top.
    const deg = (a * 180) / Math.PI + 90;
    const wrapped = deg > 180 ? deg - 360 : deg;
    const t = (wrapped + 130) / 260;
    if (t < -0.2 || t > 1.2) return null;
    return Math.round(Math.max(0, Math.min(1, t)) * (GOAL_MAX / 15)) * 15;
  }, []);

  useEffect(() => {
    if (!dialing) return undefined;
    const move = (event: PointerEvent) => {
      const next = angleToGoal(event);
      if (next !== null) setGoal(next);
    };
    const up = () => setDialing(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dialing, angleToGoal]);

  /* The confirmation. Sliding is the gesture the app ships; pressing is the way
     a keyboard finishes it, and both land in the same place. */
  useEffect(() => {
    if (!sliding) return undefined;
    const move = (event: PointerEvent) => {
      const el = trackRef.current;
      if (!el) return;
      dragged.current = true;
      const rect = el.getBoundingClientRect();
      const t = (event.clientX - rect.left) / Math.max(1, rect.width - 56);
      setConfirm(Math.max(0, Math.min(1, t)));
    };
    const up = () => {
      setSliding(false);
      setConfirm((c) => {
        if (c > 0.82) {
          setDone(true);
          return 1;
        }
        return 0;
      });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [sliding]);

  const canAdvance = step === 0 ? city !== null : true;

  const restart = () => {
    setStep(0);
    setCity(null);
    setGoal(90);
    setConfirm(0);
    setDone(false);
  };

  const QUESTIONS = [
    {
      title: "Where do you wake up?",
      note: "Location sets sunrise and sunset, and nothing else. Only the coordinates leave the device, rounded to 10 km.",
    },
    {
      title: "When do you want to be asleep?",
      note: "One question, not a questionnaire. Luma works the rest out by watching the week.",
    },
    {
      title: "Wear it for three days",
      note: "No score, no streak and no advice until there is enough data to say something true.",
    },
  ];

  const question = QUESTIONS[step]!;

  return (
    <div className={styles.onboard} data-step={done ? "done" : step}>
      <div className={styles.onboardAsk}>
        {/* Progress is three segments, and it fills — not three numbered chips. */}
        <ol className={styles.progress} aria-label="Onboarding progress">
          {QUESTIONS.map((q, i) => (
            <li
              key={q.title}
              data-state={done || i < step ? "done" : i === step ? "here" : "waiting"}
            >
              <span className="sr-only">
                {q.title} — {done || i < step ? "answered" : i === step ? "current" : "to come"}
              </span>
            </li>
          ))}
        </ol>

        {done ? (
          <div className={styles.onboardDone}>
            <h3 className={styles.askTitle}>That was it.</h3>
            <p className={styles.askNote}>
              {active?.name ?? "Your city"}, asleep by {clock(goal)}, and nothing to do for three
              days. Luma will not ask you anything else.
            </p>
            <button type="button" className={styles.askGhost} onClick={restart}>
              Run it again
            </button>
          </div>
        ) : (
          <>
            <h3 className={styles.askTitle}>{question.title}</h3>
            <p className={styles.askNote}>{question.note}</p>

            {step === 0 && (
              <div className={styles.cityPick}>
                {CITIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={styles.cityChip}
                    data-on={city === c.id ? "" : undefined}
                    onClick={() => setCity(c.id)}
                    aria-pressed={city === c.id}
                  >
                    {c.name}
                  </button>
                ))}
                <button
                  type="button"
                  className={styles.cityLocate}
                  onClick={() => setCity("lisbon")}
                >
                  Use my location
                </button>
              </div>
            )}

            {step === 1 && (
              <div className={styles.dialWrap}>
                <div
                  ref={dialRef}
                  className={styles.dial}
                  role="slider"
                  tabIndex={0}
                  aria-label="Target time asleep"
                  aria-valuemin={GOAL_MIN}
                  aria-valuemax={GOAL_MAX}
                  aria-valuenow={goal}
                  aria-valuetext={clock(goal)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                      event.preventDefault();
                      setGoal((g) => Math.max(GOAL_MIN, g - 15));
                    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                      event.preventDefault();
                      setGoal((g) => Math.min(GOAL_MAX, g + 15));
                    }
                  }}
                  onPointerDown={(event) => {
                    setDialing(true);
                    dialRef.current?.focus();
                    const next = angleToGoal(event);
                    if (next !== null) setGoal(next);
                  }}
                  style={{ "--turn": `${-130 + (goal / GOAL_MAX) * 260}deg` } as React.CSSProperties}
                >
                  <span className={styles.dialTrack} aria-hidden="true" />
                  <span className={styles.dialHand} aria-hidden="true" />
                  <span className={styles.dialValue}>{clock(goal)}</span>
                  <span className={styles.dialCaption}>asleep by</span>
                </div>
                <dl className={styles.dialOut}>
                  <div>
                    <dt>Wind-down begins</dt>
                    <dd>{clock(goal - 45)}</dd>
                  </div>
                  <div>
                    <dt>Eight hours later</dt>
                    <dd>{clock(goal + 480)}</dd>
                  </div>
                </dl>
              </div>
            )}

            {step === 2 && (
              <div className={styles.confirmWrap}>
                <div className={styles.confirmTrack} ref={trackRef}>
                  <span
                    className={styles.confirmFill}
                    style={{ width: `${confirm * 100}%` }}
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    className={styles.confirmKnob}
                    style={{ left: `calc(${confirm * 100}% )` }}
                    onPointerDown={() => {
                      dragged.current = false;
                      setSliding(true);
                    }}
                    onClick={() => {
                      // A press is the keyboard's way through the same gesture —
                      // but a pointer drag also ends in a click, and letting go
                      // short of the end has to mean "not yet".
                      if (dragged.current) {
                        dragged.current = false;
                        return;
                      }
                      setConfirm(1);
                      setDone(true);
                    }}
                    aria-label="Slide to finish setting up"
                  >
                    <span aria-hidden="true">→</span>
                  </button>
                  <span className={styles.confirmLabel} aria-hidden="true">
                    {confirm > 0.82 ? "Let go" : "Slide to finish"}
                  </span>
                </div>
                <p className={styles.askHint}>
                  Or press it. Luma does not care which hand you have free.
                </p>
              </div>
            )}

            <div className={styles.onboardNav}>
              <button
                type="button"
                className={styles.askGhost}
                onClick={() => setStep((v) => Math.max(0, v - 1))}
                disabled={step === 0}
              >
                Back
              </button>
              {step < 2 && (
                <button
                  type="button"
                  className={styles.askNext}
                  onClick={() => setStep((v) => Math.min(2, v + 1))}
                  disabled={!canAdvance}
                >
                  {step === 0 && city === null ? "Pick a city first" : "Continue"}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── The phone answers the question that is on screen ─────────────── */}
      <div className={styles.onboardPhone}>
        <div className={styles.phone} data-live="">
          <div className={styles.status} aria-hidden="true">
            <span>{done ? clock(goal - 45) : "7:04"}</span>
            <span className={styles.statusDots}>
              <i />
              <i />
              <i />
            </span>
          </div>

          <div className={styles.onboardScreen} key={done ? "done" : step}>
            {done ? (
              <>
                <p className={styles.osKicker}>Set up</p>
                <p className={styles.osBig}>Three days</p>
                <p className={styles.osNote}>
                  Wear it and forget it. Luma will say something on Thursday.
                </p>
                <div className={styles.osQuiet} aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{ "--i": i } as React.CSSProperties} />
                  ))}
                </div>
              </>
            ) : step === 0 ? (
              <>
                <p className={styles.osKicker}>{active ? active.name : "Location"}</p>
                <p className={styles.osBig}>{active ? active.rise : "--:--"}</p>
                <p className={styles.osNote}>
                  {active
                    ? `Sunrise. Sunset at ${active.set}, giving you ${active.day} of daylight.`
                    : "Choose a city and the day is drawn from it."}
                </p>
                {/* The day, drawn: the arc is the reason the question is asked. */}
                <svg className={styles.osArc} viewBox="0 0 200 90" aria-hidden="true">
                  <path className={styles.osArcGround} d="M8 78 H192" />
                  <path
                    className={styles.osArcPath}
                    d="M18 78 C46 12 154 12 182 78"
                    data-on={active ? "" : undefined}
                  />
                  {active && <circle className={styles.osSun} cx="100" cy="24" r="7" />}
                </svg>
              </>
            ) : step === 1 ? (
              <>
                <p className={styles.osKicker}>Wind-down</p>
                <p className={styles.osBig}>{clock(goal - 45)}</p>
                <p className={styles.osNote}>
                  The light warms from here, and the screen loses its blue. Asleep by {clock(goal)}.
                </p>
                <div className={styles.osBars} aria-hidden="true">
                  {Array.from({ length: 14 }, (_, i) => (
                    <span
                      key={i}
                      style={
                        {
                          "--v": Math.max(
                            0.08,
                            1 - Math.abs(i - (goal / GOAL_MAX) * 10 - 2) / 6,
                          ),
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className={styles.osKicker}>Wear</p>
                <p className={styles.osBig}>Nothing yet</p>
                <p className={styles.osNote}>
                  Three nights of data before the first reading. No score in the meantime.
                </p>
                <div className={styles.osNights} aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span key={i} data-fill={confirm > (i + 1) / 3.2 ? "" : undefined} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
