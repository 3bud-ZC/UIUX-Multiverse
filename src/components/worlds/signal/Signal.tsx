"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useReveal } from "@/lib/hooks/useReveal";
import { useWorldGround } from "@/lib/hooks/useWorldGround";
import { getWorld } from "@/lib/worlds";
import { ADVENTURES, CHARACTERS, PARENT_FACTS, STRIP, type Character } from "./data";
import styles from "./Signal.module.css";

const WORLD = getWorld("signal");

/**
 * شَرارة — an Arabic learning game for children, published as a comic.
 *
 * The page is drawn, not composed: thick ink outlines, halftone, panels that
 * sit at angles to each other, and a cast that reacts. Everything is Arabic and
 * right to left, including the reading order of the strip — panel one is on the
 * right.
 *
 * The signature is the world switch. Choosing an adventure is not a tab change:
 * a shout lands over the phone, the device reloads to that world's screen, the
 * page's ground and accent repaint, and the stickers scattered across the hero
 * change with it. One control, and the whole comic changes chapter.
 */
/**
 * The scene.
 *
 * Eight beats of a cartoon, in the order an animator would key them: settle,
 * anticipate, dash, the impact frame, the scatter, an interruption from off
 * screen, the burst that covers the cut, and the landing. Each beat is a state
 * and each state is a class — nothing here is a loop that plays forever, which
 * is the difference between an authored moment and ambient wobble.
 */
const SCENE = [
  ["wind", 420],
  ["dash", 240],
  ["hit", 180],
  ["scatter", 640],
  ["cut", 780],
  ["wipe", 520],
  ["settle", 460],
] as const;

type Beat = (typeof SCENE)[number][0] | "idle";

export function Signal() {
  useWorldGround(WORLD);
  const root = useReveal<HTMLDivElement>();
  const reduced = useReducedMotion();

  const [pick, setPick] = useState(ADVENTURES[0].id);
  /** Re-keys the shout so the burst replays even on the same world. */
  const [beat, setBeat] = useState(0);
  const [scene, setScene] = useState<Beat>("idle");
  const sceneRef = useRef(0);

  const world = useMemo(() => ADVENTURES.find((a) => a.id === pick) ?? ADVENTURES[0], [pick]);

  const choose = useCallback((id: typeof pick) => {
    setPick(id);
    setBeat((b) => b + 1);
  }, []);

  /* Leaving the world mid-scene invalidates the run, so the seven queued beats
     stop writing state into a component that is no longer on screen. */
  useEffect(
    () => () => {
      sceneRef.current += 1;
    },
    [],
  );

  /* One timeline, walked by index. Reduced motion gets the *result* — the world
     changes and the shout lands — without any of the travel, which is the honest
     accommodation for a sequence whose whole content is movement. */
  const playScene = useCallback(() => {
    if (scene !== "idle") return;
    const next = ADVENTURES[(ADVENTURES.findIndex((a) => a.id === pick) + 1) % ADVENTURES.length]!;

    if (reduced) {
      choose(next.id);
      return;
    }

    sceneRef.current += 1;
    const run = sceneRef.current;
    let elapsed = 0;
    for (const [name, ms] of SCENE) {
      window.setTimeout(() => {
        if (sceneRef.current !== run) return;
        setScene(name);
        // The cut is covered by the burst, the way it is in a cartoon.
        if (name === "wipe") choose(next.id);
      }, elapsed);
      elapsed += ms;
    }
    window.setTimeout(() => {
      if (sceneRef.current === run) setScene("idle");
    }, elapsed);
  }, [scene, pick, reduced, choose]);

  const vars = {
    "--pick": world.accent,
    "--pick-ground": world.ground,
  } as CSSProperties;

  const playing = scene !== "idle";

  return (
    <div
      className={styles.world}
      dir="rtl"
      lang="ar"
      ref={root}
      style={vars}
      data-motif={world.id}
      data-scene={scene}
    >
      <header className={styles.bar}>
        <a className={styles.logo} href="#main">
          <SparkGlyph />
          شَرارة
        </a>
        <nav className={styles.nav} aria-label="أقسام">
          <a href="#worlds">العوالم</a>
          <a href="#cast">الشخصيات</a>
          <a href="#how">كيف تلعب</a>
          <a href="#parents">للأهل</a>
        </nav>
        <a className={styles.getBtn} href="#get">
          حمِّل التطبيق
        </a>
      </header>

      <main id="main">
        {/* ── Hero: the character comes out of the phone ─────────────────── */}
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.kicker}>لُعبة تعليمية عربية · ٦ — ١١ سنة</p>
            <h1 className={styles.title}>
              اتعلّم وأنت
              <span className={styles.titleHot}>بتلعب</span>
            </h1>
            <p className={styles.lede}>
              أربعة عوالم، وشلّة من الأصحاب، وشَرارة تقودك فيها. كلّ إجابة صحيحة تفتح بابًا،
              وكلّ غلطة تخلّي بُرعُم يكبر.
            </p>
            <div className={styles.cta}>
              <a className={styles.primary} href="#get">
                ابدأ المغامرة
              </a>
              <a className={styles.secondary} href="#how">
                شوف إزاي بتشتغل
              </a>
            </div>
            <p className={styles.trust}>بلا إعلانات · بلا مشتريات · يشتغل من غير إنترنت</p>

            {/* The one control that plays the whole scene. It says what it does
                and it says when it is busy, because a child will press it twice. */}
            <button type="button" className={styles.playScene} onClick={playScene} disabled={playing}>
              <span className={styles.playSceneIcon} aria-hidden="true">
                ▶
              </span>
              {playing ? "شَرارة داخلة!" : "شغِّل المشهد"}
            </button>
          </div>

          <div className={styles.stage}>
            {/* Scattered around the device only — loose objects must never land
                on the copy they are meant to decorate. */}
            <Stickers motif={world.id} />
            <Burst key={beat} shout={world.shout} />
            <Hero face="spark" hue="#ff4f74" className={styles.mascot} />
            <Phone world={world} beat={beat} />
            <span className={styles.shadow} aria-hidden="true" />

            {/* ── The scene's own cast, dormant until it is asked for ──────── */}
            <div className={styles.sceneLayer} aria-hidden="true">
              <span className={styles.dust} />
              <Hero face="spark" hue="#ff4f74" className={styles.runner} />
              <span className={styles.streaks}>
                {[0, 1, 2, 3].map((i) => (
                  <i key={i} style={{ "--i": i } as CSSProperties} />
                ))}
              </span>
              <span className={styles.impact}>
                <span className={styles.impactRays}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <i key={i} style={{ "--a": `${i * 30}deg` } as CSSProperties} />
                  ))}
                </span>
                <span className={styles.impactWord}>بام!</span>
              </span>
              <span className={styles.bits}>
                {Array.from({ length: 16 }, (_, i) => (
                  <i
                    key={i}
                    style={
                      {
                        "--a": `${i * 22.5 + (i % 3) * 7}deg`,
                        "--d": `${90 + (i % 5) * 34}px`,
                        "--t": `${(i % 4) * 40}ms`,
                      } as CSSProperties
                    }
                  >
                    {["★", "٧", "ب", "◆", "؟"][i % 5]}
                  </i>
                ))}
              </span>
              <div className={styles.interrupt}>
                <Hero face="cat" hue="#ffd23f" className={styles.interruptFace} />
                <span className={styles.bubble}>أنا كمان!</span>
              </div>
              <span className={styles.wipe} />
            </div>
          </div>
        </section>

        {/* ── The four worlds ───────────────────────────────────────────── */}
        <section className={styles.worlds} id="worlds" aria-labelledby="worlds-title">
          <h2 className={styles.h2} id="worlds-title">
            اختَر عالَمك
          </h2>
          <p className={styles.sub}>اضغط أيّ عالَم — الصفحة كلّها هتتغيّر معاك.</p>

          <ul className={styles.picker}>
            {ADVENTURES.map((a, i) => (
              <li key={a.id} style={{ "--i": i } as CSSProperties}>
                <button
                  type="button"
                  className={styles.pickBtn}
                  data-on={a.id === world.id ? "" : undefined}
                  style={{ "--a": a.accent } as CSSProperties}
                  onClick={() => choose(a.id)}
                  aria-pressed={a.id === world.id}
                >
                  <span className={styles.pickGlyph} aria-hidden="true">
                    {a.glyph}
                  </span>
                  <span className={styles.pickName}>{a.name}</span>
                  <span className={styles.pickTag}>{a.tag}</span>
                  <span className={styles.progress} aria-hidden="true">
                    <i style={{ width: `${(a.cleared / a.levels) * 100}%` }} />
                  </span>
                  <span className={styles.pickCount}>
                    {a.cleared} من {a.levels} مرحلة
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className={styles.pickBlurb} aria-live="polite">
            {world.blurb}
          </p>
        </section>

        {/* ── The cast ──────────────────────────────────────────────────── */}
        <section className={styles.cast} id="cast" aria-labelledby="cast-title">
          <h2 className={styles.h2} id="cast-title">
            الشِّلَّة
          </h2>
          <p className={styles.sub}>أربعة أصحاب، وكلٌّ منهم بيعرف حاجة إنت لسّه ما تعرفهاش.</p>

          <ul className={styles.castRow}>
            {CHARACTERS.map((c, i) => (
              <li key={c.id} data-reveal style={{ "--i": i } as CSSProperties}>
                <article className={styles.card} style={{ "--hue": c.hue } as CSSProperties}>
                  <Hero face={c.face} hue={c.hue} className={styles.cardFace} />
                  <h3 className={styles.cardName}>{c.name}</h3>
                  <p className={styles.cardPower}>{c.power}</p>
                  <p className={styles.cardLine}>{c.line}</p>
                </article>
              </li>
            ))}
          </ul>
        </section>

        {/* ── How it plays, as a strip ──────────────────────────────────── */}
        <section className={styles.how} id="how" aria-labelledby="how-title">
          <h2 className={styles.h2} id="how-title">
            كيف تلعب
          </h2>
          <p className={styles.sub}>ثلاث لوحات، تُقرأ من اليمين.</p>

          <ol className={styles.strip}>
            {STRIP.map((panel, i) => (
              <li key={panel.n} data-reveal style={{ "--i": i } as CSSProperties}>
                <span className={styles.panelNo} aria-hidden="true">
                  {panel.n}
                </span>
                <span className={styles.bubble}>{panel.bubble}</span>
                <h3 className={styles.panelTitle}>{panel.title}</h3>
                <p className={styles.panelBody}>{panel.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── For parents: the one calm band on the page ────────────────── */}
        <section className={styles.parents} id="parents" aria-labelledby="parents-title">
          <div className={styles.parentsHead}>
            <h2 className={styles.h2} id="parents-title">
              كلمتين للأهل
            </h2>
            <p className={styles.sub}>
              الصفحة دي هادية على عمد. دي المعلومات اللي محتاجينها قبل ما تحمّلوا حاجة لطفل.
            </p>
          </div>

          <dl className={styles.facts}>
            {PARENT_FACTS.map((f) => (
              <div key={f.k}>
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Download ──────────────────────────────────────────────────── */}
        <section className={styles.get} id="get" aria-labelledby="get-title">
          <h2 className={styles.getTitle} id="get-title">
            !يلا نبدأ
          </h2>
          <div className={styles.cta}>
            <a className={styles.primary} href="#get">
              App Store
            </a>
            <a className={styles.secondary} href="#get">
              Google Play
            </a>
          </div>
          <p className={styles.trust}>مجاني بالكامل · ١٤٨ ميجابايت · بالعربية</p>
        </section>
      </main>

      <footer className={styles.foot}>
        <p>شَرارة — لعبة تعليمية عربية للأطفال.</p>
        <p>رُسمت وكُتبت بالكامل هنا؛ لا صور مأخوذة ولا مكتبة رسوم.</p>
      </footer>
    </div>
  );
}

/* ── Drawings ───────────────────────────────────────────────────────────── */

function SparkGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className={styles.sparkGlyph}>
      <path d="M12 1 l3 7 7 -2 -5 6 5 6 -7 -2 -3 7 -3 -7 -7 2 5 -6 -5 -6 7 2 Z" />
    </svg>
  );
}

/** The shout that lands when a world is chosen. Pure comic lettering. */
function Burst({ shout }: { shout: string }) {
  return (
    <span className={styles.burst} aria-hidden="true">
      <svg viewBox="0 0 200 140" preserveAspectRatio="none">
        <path d="M100 4 l16 26 28 -18 -6 32 34 -2 -20 26 24 22 -32 6 12 30 -30 -12 -12 30 -14 -28 -28 16 6 -30 -34 0 22 -26 -24 -22 32 -6 -12 -30 30 12 Z" />
      </svg>
      <b>{shout}</b>
    </span>
  );
}

/**
 * The phone, reloading into whichever world is chosen. The screen is a real
 * task list from that world, not a coloured plate.
 */
function Phone({ world, beat }: { world: (typeof ADVENTURES)[number]; beat: number }) {
  return (
    <div className={styles.phone}>
      <div className={styles.phoneNotch} aria-hidden="true" />
      <div className={styles.screen} key={`${world.id}-${beat}`} style={{ "--sg": world.ground } as CSSProperties}>
        <p className={styles.screenTop}>
          <span>{world.name}</span>
          <span className={styles.sparkCount} aria-label={`${world.cleared} شَرَرة`}>
            <SparkGlyph />
            {world.cleared}
          </span>
        </p>

        <div className={styles.screenCard}>
          <span className={styles.screenGlyph} aria-hidden="true">
            {world.glyph}
          </span>
        </div>

        <ul className={styles.tasks}>
          {world.screen.map((t, i) => (
            <li key={t.label} data-done={t.done ? "" : undefined} style={{ "--i": i } as CSSProperties}>
              <span className={styles.tick} aria-hidden="true">
                {t.done ? "✓" : "•"}
              </span>
              <span className={styles.taskLabel}>{t.label}</span>
              <span className={styles.taskValue}>{t.value}</span>
            </li>
          ))}
        </ul>

        <p className={styles.screenBtn}>كمِّل</p>
      </div>
    </div>
  );
}

/** Four faces, four constructions. Nothing here is a recoloured copy. */
function Hero({
  face,
  hue,
  className,
}: {
  face: Character["face"];
  hue: string;
  className?: string;
}) {
  return (
    <svg
      className={`${styles.face} ${className ?? ""}`}
      viewBox="0 0 140 160"
      style={{ "--hue": hue } as CSSProperties}
      aria-hidden="true"
    >
      {face === "spark" && (
        <g>
          <path className={styles.tuft} d="M52 34 L62 4 L72 30 L86 10 L84 36 Z" />
          <circle className={styles.skin} cx="70" cy="72" r="42" />
          <path className={styles.limb} d="M32 92 q-20 -6 -26 -26" />
          <path className={styles.limb} d="M108 92 q20 -6 26 -26" />
          <path className={styles.limb} d="M52 112 v34" />
          <path className={styles.limb} d="M88 112 v34" />
          <circle className={styles.eye} cx="56" cy="66" r="7" />
          <circle className={styles.eye} cx="84" cy="66" r="7" />
          <circle className={styles.glint} cx="53" cy="63" r="2.4" />
          <circle className={styles.glint} cx="81" cy="63" r="2.4" />
          <path className={styles.mouth} d="M56 86 q14 16 28 0" />
          <circle className={styles.blush} cx="40" cy="84" r="7" />
          <circle className={styles.blush} cx="100" cy="84" r="7" />
        </g>
      )}

      {face === "star" && (
        <g>
          <path
            className={styles.skin}
            d="M70 16 l14 34 37 3 -28 24 9 36 -32 -20 -32 20 9 -36 -28 -24 37 -3 Z"
          />
          <circle className={styles.eye} cx="58" cy="66" r="6" />
          <circle className={styles.eye} cx="82" cy="66" r="6" />
          <circle className={styles.glint} cx="55.6" cy="63.6" r="2" />
          <circle className={styles.glint} cx="79.6" cy="63.6" r="2" />
          <path className={styles.mouth} d="M60 82 q10 12 20 0" />
          <path className={styles.limb} d="M52 118 v28" />
          <path className={styles.limb} d="M88 118 v28" />
        </g>
      )}

      {face === "cat" && (
        <g>
          <path className={styles.skin} d="M32 52 L26 18 L58 38 Z" />
          <path className={styles.skin} d="M108 52 L114 18 L82 38 Z" />
          <ellipse className={styles.skin} cx="70" cy="76" rx="44" ry="38" />
          <circle className={styles.eye} cx="55" cy="70" r="7" />
          <circle className={styles.eye} cx="85" cy="70" r="7" />
          <circle className={styles.glint} cx="52.4" cy="67" r="2.4" />
          <circle className={styles.glint} cx="82.4" cy="67" r="2.4" />
          <path className={styles.mouth} d="M62 90 q8 8 16 0" />
          <path className={styles.whisker} d="M28 82 h-20 M30 90 h-20 M112 82 h20 M110 90 h20" />
          <path className={styles.limb} d="M112 108 q22 8 18 34" />
        </g>
      )}

      {face === "sprout" && (
        <g>
          <path className={styles.leaf} d="M70 40 C46 34 34 12 58 6 C76 2 78 24 70 40 Z" />
          <path className={styles.leaf} d="M70 40 C94 34 106 12 82 6 C64 2 62 24 70 40 Z" />
          <path className={styles.stem} d="M70 40 v22" />
          <ellipse className={styles.skin} cx="70" cy="94" rx="40" ry="36" />
          <circle className={styles.eye} cx="57" cy="88" r="6.5" />
          <circle className={styles.eye} cx="83" cy="88" r="6.5" />
          <circle className={styles.glint} cx="54.6" cy="85.4" r="2.2" />
          <circle className={styles.glint} cx="80.6" cy="85.4" r="2.2" />
          <path className={styles.mouth} d="M60 104 q10 12 20 0" />
          <circle className={styles.blush} cx="42" cy="102" r="6" />
          <circle className={styles.blush} cx="98" cy="102" r="6" />
        </g>
      )}
    </svg>
  );
}

/** Loose objects scattered behind the hero, swapped with the chosen world. */
function Stickers({ motif }: { motif: string }) {
  const set: Record<string, string[]> = {
    letters: ["ب", "ج", "س", "ن", "ء"],
    numbers: ["٣", "٧", "+", "٩", "="],
    space: ["★", "☄", "◑", "✧", "▲"],
    sea: ["≈", "◐", "❍", "∿", "◇"],
  };
  const glyphs = set[motif] ?? set.letters;

  return (
    <div className={styles.stickers} aria-hidden="true" key={motif}>
      {glyphs.map((g, i) => (
        <span key={`${motif}-${i}`} style={{ "--i": i } as CSSProperties}>
          {g}
        </span>
      ))}
    </div>
  );
}
