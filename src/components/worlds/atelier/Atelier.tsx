"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { FieldCanvas } from "@/components/common/FieldCanvas";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useReveal } from "@/lib/hooks/useReveal";
import { useWorldGround } from "@/lib/hooks/useWorldGround";
import { getWorld } from "@/lib/worlds";
import { bare, ERAS, FORMS, PLATES, POETS } from "./data";
import styles from "./Atelier.module.css";

const WORLD = getWorld("atelier");

/**
 * مِجاز — an Arabic poetry house.
 *
 * Arabic first, right to left, and built the way an Arabic page is built rather
 * than by mirroring a Latin one: the text block sits against the right edge and
 * the wide margin on the left carries the glosses, which is where a manuscript
 * has always put them. Nothing here is a translated layout.
 *
 * The signature is the verse stage. A line does not fade in — it is *written*,
 * word after word, right to left, with the ink still wet at the leading edge
 * and a calligraphic swash drawing underneath it. Changing the poet re-inks the
 * whole line, so the writing is the navigation.
 */
export function Atelier() {
  useWorldGround(WORLD);
  const root = useReveal<HTMLDivElement>();
  const reduced = useReducedMotion();

  const [eraId, setEraId] = useState(ERAS[0]!.id);
  const [poetId, setPoetId] = useState(POETS[0]!.id);
  /** Bumped on every rewrite so the ink animation restarts from a clean page. */
  const [take, setTake] = useState(0);
  const [foot, setFoot] = useState<number | null>(null);
  /** Set for the length of one page turn when the century changes. */
  const [turning, setTurning] = useState(false);
  const firstEra = useRef(true);

  const era = ERAS.find((e) => e.id === eraId) ?? ERAS[0]!;
  const inEra = useMemo(() => POETS.filter((p) => p.era === eraId), [eraId]);
  const poet = useMemo(
    () => inEra.find((p) => p.id === poetId) ?? inEra[0] ?? POETS[0]!,
    [inEra, poetId],
  );

  const choose = useCallback((id: string) => {
    setPoetId(id);
    setTake((t) => t + 1);
    setFoot(null);
  }, []);

  /* Changing century turns the page: one leaf sweeps across, and the ink, the
     paper temperature and the amount of ornament are different underneath it. */
  const chooseEra = useCallback((id: string) => {
    setEraId(id);
    const first = POETS.find((p) => p.era === id);
    if (first) setPoetId(first.id);
    setTake((t) => t + 1);
    setFoot(null);
  }, []);

  useEffect(() => {
    if (firstEra.current) {
      firstEra.current = false;
      return;
    }
    setTurning(true);
    const id = window.setTimeout(() => setTurning(false), 900);
    return () => window.clearTimeout(id);
  }, [eraId]);

  const colors = useMemo(
    () => ({
      base: era.base,
      raise: era.rule,
      ink: era.ink,
      dim: WORLD.palette.dim,
      line: era.rule,
      accent: era.accent,
      accentAlt: era.accentAlt,
    }),
    [era],
  );

  return (
    <div
      className={styles.world}
      dir="rtl"
      lang="ar"
      ref={root}
      data-era={era.id}
      data-turning={turning ? "" : undefined}
      style={
        {
          "--era-base": era.base,
          "--era-ink": era.ink,
          "--era-accent": era.accent,
          "--era-alt": era.accentAlt,
          "--era-rule": era.rule,
          "--era-grain": era.grain,
          "--era-ornament": era.ornament,
        } as CSSProperties
      }
    >
      <FieldCanvas
        kind="ink-bloom"
        colors={colors}
        className={styles.field}
        follow={1.8}
      />
      {/* The leaf. It only exists while a century is being turned. */}
      <div className={styles.leaf} aria-hidden="true" />

      <header className={styles.folio}>
        <a className={styles.wordmark} href="#stage">
          مِجاز
        </a>
        <p className={styles.tagline}>ديوانٌ ومعرضٌ للشِّعر العربي</p>
        <nav className={styles.nav} aria-label="أقسام الموقع">
          <a href="#stage">البيت</a>
          <a href="#poets">الشعراء</a>
          <a href="#bahr">البحر</a>
          <a href="#forms">الأشكال</a>
          <a href="#gallery">المعرض</a>
          <a href="#reading">غرفة القراءة</a>
        </nav>
      </header>

      {/* ── العصور ──────────────────────────────────────────────────────────
          Not a filter. Each century has its own ink, its own paper temperature
          and its own tolerance for ornament, and the page changes to match. */}
      <nav className={styles.eras} aria-label="العصور">
        {ERAS.map((e) => (
          <button
            key={e.id}
            type="button"
            className={styles.era}
            data-on={e.id === era.id ? "" : undefined}
            onClick={() => chooseEra(e.id)}
            aria-pressed={e.id === era.id}
          >
            <span className={styles.eraName}>{e.name}</span>
            <span className={styles.eraSpan}>{e.span}</span>
          </button>
        ))}
      </nav>
      <p className={styles.eraNote} key={era.id}>
        {era.note}
      </p>

      <main id="main">
        {/* ── The verse stage ───────────────────────────────────────────── */}
        <section className={styles.stage} id="stage" aria-labelledby="stage-title">
          <Illumination className={styles.corner} motif="star" />

          <p className={styles.stageMeta}>
            <span className={styles.poetTag}>{poet.name}</span>
            <span aria-hidden="true">·</span>
            <span>{poet.bahr}</span>
            <span aria-hidden="true">·</span>
            <span>{poet.form}</span>
            <span aria-hidden="true">·</span>
            <span>{era.name}</span>
          </p>

          <h1 className={styles.srTitle} id="stage-title">
            {poet.verse.sadr} — {poet.verse.ajuz}
          </h1>

          <div className={styles.verse} key={`${poet.id}-${take}`} aria-hidden="true">
            <Hemistich text={poet.verse.sadr} offset={0} reduced={reduced} />
            <span className={styles.caesura} />
            <Hemistich text={poet.verse.ajuz} offset={poet.verse.sadr.split(" ").length} reduced={reduced} />
            <Swash />
          </div>

          {/* The outer margin is not empty space — in a manuscript it is where
              the scribe writes who said this and when. */}
          <aside className={styles.stageMargin} aria-hidden="true">
            <span className={styles.marginRule} />
            <span className={styles.marginYears}>{poet.years}</span>
            <span className={styles.marginKunya}>{poet.kunya}</span>
          </aside>

          <div className={styles.stageFoot}>
            <button type="button" className={styles.rewrite} onClick={() => setTake((t) => t + 1)}>
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <path
                  d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
              أعِد الكتابة
            </button>
            <p className={styles.epithet}>{poet.epithet}</p>
          </div>
        </section>

        {/* ── The poets ─────────────────────────────────────────────────── */}
        <section className={styles.poets} id="poets" aria-labelledby="poets-title">
          <div className={styles.sectionHead}>
            <h2 id="poets-title">الشُّعراء</h2>
            <p>
              {inEra.length === 1 ? "ديوانٌ واحد" : `${["", "شاعرٌ واحد", "شاعران", "ثلاثة شعراء", "أربعة شعراء"][inEra.length] ?? `${inEra.length} شعراء`}`} من{" "}
              <b>{era.name}</b>. اختَر شاعرًا يُكتَب بيتُه من جديد.
            </p>
          </div>

          <ul className={styles.poetList}>
            {inEra.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={styles.poet}
                  data-on={p.id === poet.id ? "" : undefined}
                  onClick={() => choose(p.id)}
                  aria-pressed={p.id === poet.id}
                >
                  <span className={styles.poetName}>{p.name}</span>
                  <span className={styles.poetKunya}>{p.kunya}</span>
                  <span className={styles.poetYears}>
                    {p.years} <i>·</i> {p.form}
                  </span>
                  <span className={styles.poetNote}>{p.note}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* ── The metre ─────────────────────────────────────────────────── */}
        <section className={styles.bahr} id="bahr" aria-labelledby="bahr-title">
          <div className={styles.sectionHead}>
            <h2 id="bahr-title">البحر والتَّفعيلة</h2>
            <p>
              كلّ بيتٍ يجري على وزن. هذا وزن <b>{poet.bahr}</b>، مُقَطَّعًا إلى تفعيلاته: المستدير
              الأسود مقطعٌ طويل، والأبيض قصير.
            </p>
          </div>

          <ol className={styles.feet} data-take={take}>
            {poet.feet.map((f, i) => (
              <li key={`${poet.id}-${f}-${i}`} style={{ "--i": i } as CSSProperties}>
                <button
                  type="button"
                  className={styles.foot}
                  data-on={foot === i ? "" : undefined}
                  onClick={() => setFoot((c) => (c === i ? null : i))}
                  aria-pressed={foot === i}
                >
                  <span className={styles.footName}>{f}</span>
                  <span className={styles.footPattern} aria-hidden="true">
                    {[...poet.pattern[i]].map((c, j) => (
                      <i key={j} data-long={c === "●" ? "" : undefined} />
                    ))}
                  </span>
                  <span className="sr-only">
                    {poet.pattern[i]
                      .split("")
                      .map((c) => (c === "●" ? "مقطع طويل" : "مقطع قصير"))
                      .join("، ")}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <p className={styles.bahrNote} aria-live="polite">
            {foot === null
              ? "اضغط تفعيلةً لتراها وحدها."
              : `التفعيلة ${foot + 1} من ${poet.feet.length} — ${poet.feet[foot]}، وهي ${
                  [...poet.pattern[foot]].filter((c) => c === "●").length
                } مقاطع طويلة و${[...poet.pattern[foot]].filter((c) => c === "○").length} قصيرة.`}
          </p>
        </section>

        {/* ── الأشكال — what shape the poem is in ───────────────────────── */}
        <section className={styles.forms} id="forms" aria-labelledby="forms-title">
          <div className={styles.sectionHead}>
            <h2 id="forms-title">الأشكال الشِّعرية</h2>
            <p>
              خمسة أشكال، من الوقوف على الطلل إلى الموشَّح الذي خرج على الوزن كلّه. الشكل ليس قالبًا —
              هو ما يقدر الشاعر أن يقوله.
            </p>
          </div>

          <dl className={styles.formList}>
            {FORMS.map((f, i) => (
              <div key={f.id} className={styles.form} data-reveal style={{ "--i": i } as CSSProperties}>
                <dt>
                  <span className={styles.formName}>{f.name}</span>
                  <span className={styles.formWhen}>{f.when}</span>
                </dt>
                <dd>
                  <p className={styles.formWhat}>{f.what}</p>
                  <p className={styles.formLine}>{f.line}</p>
                  <p className={styles.formBy}>— {f.by}</p>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── The gallery ───────────────────────────────────────────────── */}
        <section className={styles.gallery} id="gallery" aria-labelledby="gallery-title">
          <div className={styles.sectionHead}>
            <h2 id="gallery-title">المعرض</h2>
            <p>أربع لوحاتٍ مُذَهَّبة، كلٌّ منها بيتٌ واحد وزخرفةٌ واحدة.</p>
          </div>

          <div className={styles.plates}>
            {PLATES.map((plate, i) => (
              <article className={styles.plate} key={plate.id} data-reveal style={{ "--i": i } as CSSProperties}>
                <Illumination className={styles.plateArt} motif={plate.motif} />
                <p className={styles.plateLine}>{plate.line}</p>
                <p className={styles.plateBy}>{plate.by}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── The reading room ──────────────────────────────────────────── */}
        <section className={styles.reading} id="reading" aria-labelledby="reading-title">
          <div className={styles.sectionHead}>
            <h2 id="reading-title">غرفة القراءة</h2>
            <p>
              مقطعٌ من ديوان <b>{poet.name}</b>، والشرح في الهامش كما يوضَع في المخطوط.
            </p>
          </div>

          <div className={styles.column} key={poet.id}>
            <div className={styles.body}>
              {poet.passage.map((line, i) => (
                <p className={styles.line} key={i} data-reveal style={{ "--i": i } as CSSProperties}>
                  {line}
                </p>
              ))}
              <p className={styles.sign}>— {poet.kunya}</p>
            </div>

            <aside className={styles.margin} aria-label="شرح المفردات">
              {poet.gloss.map((g, i) => (
                <p
                  className={styles.gloss}
                  key={g.term}
                  data-reveal
                  style={{ "--i": i, "--tilt": `${(i % 2 === 0 ? -1 : 1) * (0.7 + i * 0.2)}deg` } as CSSProperties}
                >
                  <b>{g.term}</b>
                  <span>{g.meaning}</span>
                </p>
              ))}
            </aside>
          </div>
        </section>
      </main>

      <footer className={styles.colophon}>
        <p>
          مِجاز — {POETS.length} شاعرًا في خمسة عصور، ونصوصٌ من التراث العربي في المُلكية العامة.
        </p>
        <p>حُرِّرَت بخطّ عارف رقعة وأميري وريم كوفي.</p>
      </footer>
    </div>
  );
}

/**
 * One hemistich, written word by word.
 *
 * The reveal is a clip from the right rather than an opacity fade, so the line
 * arrives the way a nib lays it down. The blur that clears as each word lands is
 * the ink drying, and it is the only reason the effect reads as writing at all.
 */
function Hemistich({ text, offset, reduced }: { text: string; offset: number; reduced: boolean }) {
  const words = text.split(" ");
  return (
    <span className={styles.hemistich}>
      {words.map((w, i) => (
        <span
          className={styles.word}
          key={`${w}-${i}`}
          style={{ "--i": reduced ? 0 : offset + i } as CSSProperties}
        >
          {/* The hand runs the skeleton of the line first and points it on the
              way back. Harakat are combining marks, so both layers are exactly
              the same width and the line never moves under them. */}
          <span className={styles.skeleton}>{bare(w)}</span>
          <span className={styles.pointed}>{w}</span>
        </span>
      ))}
    </span>
  );
}

/** The swash under the verse: one stroke, drawn after the last word lands. */
function Swash() {
  return (
    <svg className={styles.swash} viewBox="0 0 900 60" preserveAspectRatio="none" aria-hidden="true">
      <path d="M890 22 C760 46 620 8 470 30 C330 50 220 18 92 40 C56 46 34 40 20 28" />
    </svg>
  );
}

/**
 * Illumination — geometric ornament drawn rather than photographed.
 *
 * Four motifs, all built from the same construction an illuminator uses: a
 * circle, its division, and the interlace that comes out of it.
 */
function Illumination({
  motif,
  className,
}: {
  motif: "star" | "knot" | "arch" | "vine";
  className?: string;
}) {
  return (
    <svg
      className={`${styles.illum} ${className ?? ""}`}
      viewBox="0 0 120 120"
      aria-hidden="true"
      data-motif={motif}
    >
      {motif === "star" && <StarMotif />}
      {motif === "knot" && <KnotMotif />}
      {motif === "arch" && <ArchMotif />}
      {motif === "vine" && <VineMotif />}
    </svg>
  );
}

function StarMotif() {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? 48 : 22;
    return `${60 + Math.cos(a) * r},${60 + Math.sin(a) * r}`;
  }).join(" ");
  return (
    <>
      <circle className={styles.iRing} cx="60" cy="60" r="52" />
      <polygon className={styles.iFill} points={pts} />
      <polygon
        className={styles.iLine}
        points={Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return `${60 + Math.cos(a) * 34},${60 + Math.sin(a) * 34}`;
        }).join(" ")}
      />
      <circle className={styles.iDot} cx="60" cy="60" r="7" />
    </>
  );
}

function KnotMotif() {
  return (
    <>
      <circle className={styles.iRing} cx="60" cy="60" r="52" />
      {[0, 45, 90, 135].map((deg) => (
        <ellipse
          key={deg}
          className={styles.iLine}
          cx="60"
          cy="60"
          rx="46"
          ry="17"
          transform={`rotate(${deg} 60 60)`}
        />
      ))}
      <circle className={styles.iDot} cx="60" cy="60" r="9" />
    </>
  );
}

function ArchMotif() {
  return (
    <>
      <path className={styles.iFill} d="M18 108 V56 A42 42 0 0 1 102 56 V108 Z" />
      <path className={styles.iLine} d="M30 108 V58 A30 30 0 0 1 90 58 V108" />
      <path className={styles.iLine} d="M42 108 V60 A18 18 0 0 1 78 60 V108" />
      <path className={styles.iRing} d="M12 108 H108" />
      <circle className={styles.iDot} cx="60" cy="46" r="6" />
    </>
  );
}

function VineMotif() {
  return (
    <>
      <circle className={styles.iRing} cx="60" cy="60" r="52" />
      <path
        className={styles.iLine}
        d="M60 108 C28 92 22 62 44 44 C62 30 74 46 66 60 C58 74 40 66 46 50"
      />
      <path
        className={styles.iLine}
        d="M60 108 C92 92 98 62 76 44 C58 30 46 46 54 60 C62 74 80 66 74 50"
      />
      <circle className={styles.iDot} cx="60" cy="30" r="6" />
    </>
  );
}
