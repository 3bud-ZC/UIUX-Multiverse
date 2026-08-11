"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useWorldGround } from "@/lib/hooks/useWorldGround";
import { getWorld } from "@/lib/worlds";
import { Onboarding } from "./Onboarding";
import styles from "./Luma.module.css";

const WORLD = getWorld("luma");

type Screen = "today" | "rhythm" | "rest";

const TABS: { id: Screen; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "rhythm", label: "Rhythm" },
  { id: "rest", label: "Rest" },
];

const HOURS = [
  { h: "6", v: 8 },
  { h: "7", v: 22 },
  { h: "8", v: 61 },
  { h: "9", v: 88 },
  { h: "10", v: 74 },
  { h: "11", v: 52 },
  { h: "12", v: 66 },
  { h: "13", v: 48 },
  { h: "14", v: 39 },
  { h: "15", v: 44 },
  { h: "16", v: 30 },
  { h: "17", v: 18 },
  { h: "18", v: 12 },
  { h: "19", v: 7 },
  { h: "20", v: 4 },
  { h: "21", v: 2 },
];

const SOUNDS = ["Rain on canvas", "Low room tone", "Harbour", "Off"];

/** One phone. The frame is only furniture — on a phone it is removed entirely. */
function Phone({
  screen,
  onTab,
  interactive = false,
  sound,
  onSound,
  bedtime,
  onBedtime,
}: {
  screen: Screen;
  onTab?: (s: Screen) => void;
  interactive?: boolean;
  sound?: string;
  onSound?: (s: string) => void;
  bedtime?: number;
  onBedtime?: (v: number) => void;
}) {
  return (
    <div className={styles.phone} data-live={interactive ? "" : undefined}>
      <div className={styles.status} aria-hidden="true">
        <span>9:41</span>
        <span className={styles.statusRight}>
          <i />
          <i />
          <i />
        </span>
      </div>

      <div className={styles.screen} data-screen={screen}>
        {screen === "today" && (
          <div className={styles.today}>
            <p className={styles.greet}>Good morning, Salma</p>
            <p className={styles.sub}>You are 40 minutes into today&rsquo;s light.</p>

            <div className={styles.ring}>
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="52" className={styles.ringTrack} />
                <circle cx="60" cy="60" r="52" className={styles.ringFill} />
              </svg>
              <div className={styles.ringLabel}>
                <b>62%</b>
                <span>of daily dose</span>
              </div>
            </div>

            <ul className={styles.cards}>
              <li className={styles.card} data-tone="do">
                <span className={styles.cardTime}>Now</span>
                <span className={styles.cardTitle}>Step outside for 20 minutes</span>
                <span className={styles.cardNote}>Cloud cover is thin — this is the best light today.</span>
              </li>
              <li className={styles.card}>
                <span className={styles.cardTime}>14:30</span>
                <span className={styles.cardTitle}>Last coffee</span>
                <span className={styles.cardNote}>Eight hours before your sleep window opens.</span>
              </li>
              <li className={styles.card}>
                <span className={styles.cardTime}>21:40</span>
                <span className={styles.cardTitle}>Dim the house</span>
                <span className={styles.cardNote}>Lights down to 20%. Luma can do this for you.</span>
              </li>
            </ul>
          </div>
        )}

        {screen === "rhythm" && (
          <div className={styles.rhythm}>
            <p className={styles.screenTitle}>Your day in light</p>
            <p className={styles.sub}>Measured at the wrist, in lux, against your target curve.</p>
            <div className={styles.chart}>
              {HOURS.map((h) => (
                <span key={h.h} className={styles.bar} style={{ height: `${h.v}%` }}>
                  <i />
                </span>
              ))}
            </div>
            <div className={styles.axis} aria-hidden="true">
              <span>6</span>
              <span>12</span>
              <span>18</span>
              <span>21</span>
            </div>
            <dl className={styles.stats}>
              <div>
                <dt>Morning</dt>
                <dd>on target</dd>
              </div>
              <div>
                <dt>Afternoon</dt>
                <dd data-low="">−22%</dd>
              </div>
              <div>
                <dt>Evening</dt>
                <dd>clean</dd>
              </div>
            </dl>
            <div className={styles.streak}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={d + i} data-on={i < 5 ? "" : undefined}>
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {screen === "rest" && (
          <div className={styles.rest}>
            <p className={styles.screenTitle}>Tonight</p>
            <p className={styles.sub}>Your window opens at 22:40 and closes at 07:10.</p>

            <label className={styles.slider}>
              <span className={styles.sliderHead}>
                Wind-down starts
                <b>{`${20 + Math.floor((bedtime ?? 40) / 60)}:${String((bedtime ?? 40) % 60).padStart(2, "0")}`}</b>
              </span>
              <input
                type="range"
                min={0}
                max={119}
                step={5}
                value={bedtime ?? 40}
                onChange={(e) => onBedtime?.(Number(e.target.value))}
                aria-label="Wind-down start time"
              />
            </label>

            <p className={styles.fieldLabel}>Sound</p>
            <div className={styles.chips}>
              {SOUNDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={styles.chip}
                  data-on={sound === s ? "" : undefined}
                  onClick={() => onSound?.(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className={styles.alarm}>
              <div>
                <p className={styles.alarmTime}>07:10</p>
                <p className={styles.alarmNote}>Wakes you in the lightest 20 minutes before this.</p>
              </div>
              <span className={styles.toggle} data-on="" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>

      <nav className={styles.tabs} aria-label="App sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={styles.tab}
            data-on={screen === t.id ? "" : undefined}
            onClick={() => onTab?.(t.id)}
            disabled={!onTab}
          >
            <span className={styles.tabDot} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export function Luma() {
  useWorldGround(WORLD);
  const [screen, setScreen] = useState<Screen>("today");
  const [sound, setSound] = useState(SOUNDS[0]);
  const [bedtime, setBedtime] = useState(40);

  /**
   * The phone plays itself until you touch it.
   *
   * A device shot is a photograph of a product; a device that walks through its
   * own screens is the product. So the hero runs the app — today, rhythm, rest,
   * back to today — and the moment a hand arrives anywhere on the device the
   * demo stops for good and hands it over. It never takes control back.
   */
  const [demo, setDemo] = useState(true);
  const reduced = useReducedMotion();
  const takeOver = useRef(() => setDemo(false)).current;

  useEffect(() => {
    if (!demo || reduced) return;
    const order: Screen[] = ["today", "rhythm", "rest"];
    const timer = setInterval(() => {
      setScreen((s) => order[(order.indexOf(s) + 1) % order.length]);
    }, 3400);
    return () => clearInterval(timer);
  }, [demo, reduced]);

  return (
    <div className={styles.site}>
      <header className={styles.head}>
        <p className={styles.logo}>
          <span className={styles.logoMark} aria-hidden="true" />
          Luma
        </p>
        <nav className={styles.nav} aria-label="Sections">
          <a href="#flow">Onboarding</a>
          <a href="#detail">Interactions</a>
          <a href="#states">States</a>
        </nav>
        <a className={styles.getLink} href="#get">
          Get Luma
        </a>
      </header>

      <section className={styles.hero} aria-labelledby="hero-h">
        <div className={styles.heroType}>
          <p className={styles.eyebrow}>iOS · Android · watch</p>
          <h1 className={styles.h1} id="hero-h">
            Light in the morning.
            <br />
            Dark at night.
            <br />
            <em>That is the whole app.</em>
          </h1>
          <p className={styles.lead}>
            Luma reads the light you actually get, not the light you meant to get, and moves three
            things around your day: when you go out, when you stop drinking coffee, and when the
            house dims.
          </p>
          <div className={styles.actions}>
            <a className={styles.primary} href="#get">
              Download
            </a>
            <p className={styles.rating}>
              4.8 ★ · 21,400 ratings · free for 30 days
            </p>
          </div>
          <p className={styles.tryIt} data-demo={demo ? "" : undefined}>
            {demo
              ? "Playing itself — touch the phone and it is yours."
              : "The phone is live — switch tabs, set a sound, move the dial."}
          </p>
        </div>

        <div
          className={styles.heroPhone}
          data-demo={demo ? "" : undefined}
          onPointerDown={takeOver}
          onFocusCapture={takeOver}
        >
          <Phone
            screen={screen}
            onTab={setScreen}
            interactive
            sound={sound}
            onSound={setSound}
            bedtime={bedtime}
            onBedtime={setBedtime}
          />
        </div>
      </section>

      <section className={styles.flow} id="flow" aria-labelledby="flow-h">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="flow-h">
            Three questions, then it gets out of the way
          </h2>
          <p className={styles.sectionNote}>
            Onboarding, in full and in order — answer it here. There is no fourth screen.
          </p>
        </div>
        <Onboarding />
      </section>

      <section className={styles.detail} id="detail" aria-labelledby="detail-h">
        <div className={styles.detailPhone}>
          <Phone screen="rhythm" />
          <span className={styles.callout} data-at="a">
            Bars are measurements. The line behind them is the target — no number is invented.
          </span>
          <span className={styles.callout} data-at="b">
            Press and hold any hour to see where you were.
          </span>
        </div>
        <div className={styles.detailText}>
          <h2 className={styles.h2} id="detail-h">
            Built for one hand, at 7am
          </h2>
          <ul className={styles.rules}>
            <li>
              <b>Everything reachable.</b> Every primary action sits in the bottom third. Settings
              live behind a long-press, not a hamburger.
            </li>
            <li>
              <b>Spring, not slide.</b> Tab changes settle in 480ms with a small overshoot, so the
              app feels held rather than driven.
            </li>
            <li>
              <b>Quiet by default.</b> One notification a day, at the moment it can change something.
              Two if the weather turns.
            </li>
            <li>
              <b>Legible outdoors.</b> Minimum 17pt body, 4.6:1 contrast, and a high-contrast mode
              that drops the gradients entirely.
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.states} id="states" aria-labelledby="states-h">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="states-h">
            The states nobody screenshots
          </h2>
          <p className={styles.sectionNote}>Permission, emptiness and failure, designed on purpose.</p>
        </div>
        <ul className={styles.stateList}>
          <li className={styles.state}>
            <div className={styles.stateCard} data-kind="permission">
              <p className={styles.stateTitle}>Luma needs the light sensor</p>
              <p className={styles.stateBody}>
                Without it the app can still time your evening, but it cannot tell you whether the
                morning worked.
              </p>
              <span className={styles.stateAction}>Allow access</span>
              <span className={styles.stateGhost}>Continue without</span>
            </div>
            <p className={styles.stateLabel}>Permission — asked once, with the reason</p>
          </li>
          <li className={styles.state}>
            <div className={styles.stateCard} data-kind="empty">
              <p className={styles.stateTitle}>Nothing to show yet</p>
              <p className={styles.stateBody}>
                Three days of wear and the rhythm view fills in. Day one of three.
              </p>
              <span className={styles.stateBar} aria-hidden="true">
                <i style={{ width: "33%" }} />
              </span>
            </div>
            <p className={styles.stateLabel}>Empty — a countdown, not an illustration</p>
          </li>
          <li className={styles.state}>
            <div className={styles.stateCard} data-kind="error">
              <p className={styles.stateTitle}>Watch hasn&rsquo;t synced since Tuesday</p>
              <p className={styles.stateBody}>
                Open Luma on the watch once and it will catch up. Today&rsquo;s figures are from the
                phone only.
              </p>
              <span className={styles.stateAction}>How to fix this</span>
            </div>
            <p className={styles.stateLabel}>Failure — what happened, and what to do</p>
          </li>
        </ul>
      </section>

      <footer className={styles.get} id="get">
        <div className={styles.getInner}>
          <h2 className={styles.getTitle}>Free for thirty days, then €3.99 a month</h2>
          <p className={styles.getNote}>
            No account needed to start. Data stays on the device unless you turn on backup.
          </p>
          <div className={styles.getActions}>
            <span className={styles.primary}>App Store</span>
            <span className={styles.secondary}>Google Play</span>
          </div>
        </div>
        <p className={styles.colophon}>
          Luma — a fictional app, designed as an exercise · ABUD · Multiverse 07
        </p>
      </footer>
    </div>
  );
}
