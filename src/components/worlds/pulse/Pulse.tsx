"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { FieldCanvas } from "@/components/common/FieldCanvas";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useReveal } from "@/lib/hooks/useReveal";
import { useWorldGround } from "@/lib/hooks/useWorldGround";
import { getWorld } from "@/lib/worlds";
import { Cover, MaqamRule, Portrait } from "./art";
import {
  ALL_TRACKS,
  ARTISTS,
  getArtist,
  HOUSES,
  PLAYLISTS,
  RADIO,
  RELEASES,
  SESSIONS,
  releaseIndex,
  type HouseId,
} from "./data";
import styles from "./Pulse.module.css";
import { useMusicEngine } from "./useMusicEngine";
import { Waveform } from "./Waveform";

const WORLD = getWorld("pulse");

function clock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Arabic-indic digits, because the archive counts in them. */
function arabicDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]!);
}

function arabicClock(seconds: number): string {
  return arabicDigits(clock(seconds));
}

/** What the transport is walking through: a house's shelf, or an edited list. */
type Source = { kind: "house"; id: HouseId } | { kind: "list"; id: string };

function queueFor(source: Source): number[] {
  if (source.kind === "house") {
    return ALL_TRACKS.reduce<number[]>((acc, entry, i) => {
      if (RELEASES[entry.release]!.house === source.id) acc.push(i);
      return acc;
    }, []);
  }
  const list = PLAYLISTS.find((p) => p.id === source.id);
  if (!list) return [];
  return list.picks.flatMap((cat) => {
    const ri = releaseIndex(cat);
    return ALL_TRACKS.reduce<number[]>((acc, entry, i) => {
      if (entry.release === ri) acc.push(i);
      return acc;
    }, []);
  });
}

/**
 * Pulse — a listening service, its label, and the archive it bought.
 *
 * One idea holds the whole site together: **the page is whatever is playing.**
 * A record does not just tint an accent — it hands the page its two inks, its
 * tempo, its type, its reading direction and its layout grammar. Put on a
 * twelve-inch from the floor and Pulse is a poster printed in two fluorescents
 * at 128 BPM. Put on a 1958 wasla and the same page becomes a right-to-left
 * paper archive at 62, set in the display kufi that Egyptian sleeves were
 * lettered in, with its metre under it. Nothing is a theme switch: the tempo
 * drives the sequencer that is actually making the sound, the halftone press
 * behind everything, and every animation on the page, from one `--beat`.
 *
 * The audio is synthesised here from the record's tempo, root and scale — which
 * is how the archive can be in Rast rather than in a rounded-off version of it.
 */
export function Pulse() {
  useWorldGround(WORLD);
  const reduced = useReducedMotion();
  const revealRef = useReveal<HTMLDivElement>();

  const [source, setSource] = useState<Source>({ kind: "house", id: "floor" });
  const [qi, setQi] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [openArtist, setOpenArtist] = useState<string | null>(null);
  /** Set for the length of one key change, so the print can slip out of register. */
  const [changing, setChanging] = useState(false);

  const queue = useMemo(() => queueFor(source), [source]);
  const entry = ALL_TRACKS[queue[qi] ?? 0]!;
  const release = RELEASES[entry.release]!;
  const artist = getArtist(release.artistId);
  const house = HOUSES.find((h) => h.id === release.house)!;
  const archive = release.house === "archive";
  const fmt = archive ? arabicClock : clock;

  /* ── The key change ─────────────────────────────────────────────────────
     Every time the record changes, the press slips for one bar. The flag is
     driven off the catalogue number rather than a click, so it fires whether
     the change came from the tape, the shelf, a portrait or the queue running
     on by itself. */
  const previousCat = useRef(release.cat);
  useEffect(() => {
    if (previousCat.current === release.cat) return;
    previousCat.current = release.cat;
    setChanging(true);
    const id = window.setTimeout(() => setChanging(false), 760);
    return () => window.clearTimeout(id);
  }, [release.cat]);

  /* The transport. Real seconds, so a twenty-three minute wasla takes
     twenty-three minutes — that is what the archive is. */
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (elapsed < entry.len) return;
    setQi((i) => (i + 1) % Math.max(1, queue.length));
    setElapsed(0);
  }, [elapsed, entry.len, queue.length]);

  useMusicEngine(
    playing,
    { bpm: release.bpm, root: release.root, cents: release.cents, mode: house.mode },
    volume,
  );

  const goto = useCallback((next: Source, position: number, andPlay: boolean) => {
    setSource(next);
    setQi(Math.max(0, position));
    setElapsed(0);
    if (andPlay) setPlaying(true);
  }, []);

  const openHouse = useCallback(
    (id: HouseId) => {
      goto({ kind: "house", id }, 0, false);
    },
    [goto],
  );

  const playRelease = useCallback(
    (cat: string, trackIdx = 0) => {
      const ri = releaseIndex(cat);
      const next: Source = { kind: "house", id: RELEASES[ri]!.house };
      const q = queueFor(next);
      const position = q.findIndex(
        (i) => ALL_TRACKS[i]!.release === ri && ALL_TRACKS[i]!.index === trackIdx,
      );
      goto(next, position, true);
    },
    [goto],
  );

  const playList = useCallback(
    (id: string) => {
      goto({ kind: "list", id }, 0, true);
    },
    [goto],
  );

  const step = useCallback(
    (delta: number) => {
      setQi((i) => (i + delta + queue.length) % Math.max(1, queue.length));
      setElapsed(0);
    },
    [queue.length],
  );

  const progress = Math.min(1, elapsed / entry.len);
  const beat = 60 / release.bpm;

  const vars = {
    "--pulse-hot": release.hot,
    "--pulse-alt": release.alt,
    "--beat": `${beat.toFixed(4)}s`,
    "--bar": `${(beat * 4).toFixed(4)}s`,
  } as CSSProperties;

  const shelves = HOUSES.map((h) => ({
    house: h,
    records: RELEASES.filter((r) => r.house === h.id),
  }));

  return (
    <div
      className={styles.page}
      style={vars}
      data-house={release.house}
      data-playing={playing ? "" : undefined}
      data-changing={changing ? "" : undefined}
      ref={revealRef}
    >
      <FieldCanvas
        kind="halftone-beat"
        colors={{
          ...WORLD.palette,
          accent: release.hot,
          accentAlt: release.alt,
          raise: "#17141a",
        }}
        params={{ bpm: release.bpm, mode: house.mode }}
        className={styles.field}
        follow={2.4}
      />

      {/* ── The desk: mark, houses, what the page is currently set in ────── */}
      <header className={styles.desk}>
        <a className={styles.mark} href="#stage" aria-label="Pulse — now playing">
          <span className={styles.markMeter} aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <i key={i} style={{ "--i": i } as CSSProperties} />
            ))}
          </span>
          Pulse
        </a>

        <nav className={styles.tape} aria-label="Listening rooms">
          {HOUSES.map((h) => (
            <button
              key={h.id}
              type="button"
              className={styles.tapeItem}
              data-on={h.id === release.house ? "" : undefined}
              lang={h.rtl ? "ar" : undefined}
              dir={h.rtl ? "rtl" : undefined}
              onClick={() => openHouse(h.id)}
            >
              {h.label}
            </button>
          ))}
        </nav>

        <p className={styles.setIn}>
          <span>Set in</span>
          <b>{release.key}</b>
          <span>at</span>
          <b>{release.bpm}</b>
          <span>BPM</span>
        </p>
      </header>

      {/* ══ THE STAGE ══════════════════════════════════════════════════════
          One markup for three houses. `data-house` on the page re-grammars it:
          the floor hangs the sleeve left of an oversized name, the archive
          becomes a right-to-left sheet of paper, the room becomes a document. */}
      <main className={styles.stage} id="stage" aria-labelledby="stage-h">
        {/* One sheet: lockup, scrub and sides. The archive turns it into paper, so
            the whole record has to sit inside it rather than half on, half off. */}
        <div className={styles.sheet}>
        <div className={styles.stageFrame}>
          <figure className={styles.sleeve} key={release.cat}>
            <Cover
              kind={release.cover}
              portrait={archive ? artist.portrait : undefined}
              className={styles.sleeveArt}
            />
            <figcaption>
              {release.cat} · {release.format} · {release.year}
            </figcaption>
          </figure>

          <div className={styles.stageText} dir={archive ? "rtl" : undefined}>
            <p className={styles.eyebrow}>
              <span className={styles.live} aria-hidden="true" />
              {archive ? "من الأرشيف" : house.latin}
            </p>

            <h1 className={styles.stageTitle} id="stage-h">
              <span className={styles.artistLine}>
                {archive ? artist.arName : artist.name}
              </span>
              <span className={styles.albumLine}>
                {archive ? release.arTitle : release.title}
              </span>
            </h1>

            <p className={styles.note}>{release.note}</p>

            <dl className={styles.specs}>
              <div>
                <dt>{archive ? "المقام" : "Key"}</dt>
                <dd>{release.key}</dd>
              </div>
              <div>
                <dt>{archive ? "الإيقاع" : "Tempo"}</dt>
                <dd>
                  {archive ? `${arabicDigits(release.bpm)} نبضة` : `${release.bpm} BPM`}
                </dd>
              </div>
              <div>
                <dt>{archive ? "العزف" : "Played on"}</dt>
                <dd>{artist.instrument}</dd>
              </div>
              <div>
                <dt>{archive ? "المكان" : "Based"}</dt>
                <dd>{artist.base}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.portraitWrap} aria-hidden="true">
            <Portrait spec={artist.portrait} className={styles.portrait} />
          </div>

          {/* The archive rules its own intervals where the floor hangs a portrait. */}
          <aside className={styles.maqamWrap} dir="rtl">
            <h2 className={styles.maqamTitle}>{release.key} — درجات السلّم</h2>
            <MaqamRule cents={release.cents} className={styles.maqamRule} />
            <p className={styles.maqamNote}>
              الدرجات المعلَّمة بالأحمر لا يوجد لها مفتاح على البيانو. هذا ما تسمعه في التسجيل.
            </p>
          </aside>
        </div>

        {/* The record's own waveform, and the scrub. */}
        <div className={styles.scrub}>
          <p className={styles.scrubHead}>
            <span className={styles.scrubN}>{entry.n}</span>
            <b>{entry.title}</b>
            {entry.maqam && <em>مقام {entry.maqam}</em>}
          </p>
          <div className={styles.seek}>
            <Waveform seed={entry.title + release.cat} progress={progress} className={styles.wave} />
            <input
              type="range"
              className={styles.seekInput}
              min={0}
              max={entry.len}
              step={1}
              value={Math.min(elapsed, entry.len)}
              onChange={(event) => setElapsed(Number(event.target.value))}
              aria-label={`Seek within ${entry.title}`}
            />
          </div>
          <p className={styles.scrubTime}>
            {fmt(elapsed)} <i>/</i> {fmt(entry.len)}
          </p>
        </div>

        {/* The sides. The archive numbers its tracks in Arabic and names a maqam. */}
        <ol className={styles.tracks} dir={archive ? "rtl" : undefined}>
          {release.tracks.map((t, i) => {
            const at = queue.findIndex(
              (q) => ALL_TRACKS[q]!.release === entry.release && ALL_TRACKS[q]!.index === i,
            );
            const on = at === qi;
            return (
              <li key={t.n}>
                <button
                  type="button"
                  className={styles.trackRow}
                  data-on={on ? "" : undefined}
                  onClick={() => {
                    if (at >= 0) {
                      setQi(at);
                      setElapsed(0);
                      setPlaying(true);
                    } else {
                      playRelease(release.cat, i);
                    }
                  }}
                >
                  <span className={styles.trackN}>{t.n}</span>
                  <span className={styles.trackTitle}>{t.title}</span>
                  {t.maqam && <span className={styles.trackMaqam}>{t.maqam}</span>}
                  <Waveform seed={t.title + release.cat} bars={40} glyph className={styles.trackWave} />
                  <span className={styles.trackLen}>{fmt(t.len)}</span>
                </button>
              </li>
            );
          })}
        </ol>
        </div>
      </main>

      {/* ══ TONIGHT — the editorial shelf ════════════════════════════════ */}
      <section className={styles.tonight} aria-labelledby="tonight-h">
        <div className={styles.secHead}>
          <h2 className={styles.h2} id="tonight-h">
            Tonight
          </h2>
          <p>Five edits, each by someone who had a reason. Press one and it becomes the queue.</p>
        </div>

        <ul className={styles.lists}>
          {PLAYLISTS.map((list, i) => {
            const loaded = source.kind === "list" && source.id === list.id;
            return (
              <li key={list.id} data-shape={list.shape} data-reveal="" style={{ "--i": i } as CSSProperties}>
                <button
                  type="button"
                  className={styles.list}
                  data-on={loaded ? "" : undefined}
                  style={{ "--l-hot": list.hot, "--l-alt": list.alt } as CSSProperties}
                  onClick={() => playList(list.id)}
                  dir={list.arTitle ? "rtl" : undefined}
                >
                  <span className={styles.listPlate} aria-hidden="true">
                    <span className={styles.listShape} />
                    {/* Counted in the language of the edit — "3 records" inside an
                        RTL container reorders to "records 3". */}
                    <span className={styles.listCount}>
                      {list.arTitle
                        ? `${arabicDigits(list.picks.length)} تسجيلات`
                        : `${list.picks.length} records`}
                    </span>
                  </span>
                  <span className={styles.listTitle}>{list.arTitle ?? list.title}</span>
                  <span className={styles.listBy}>{list.by}</span>
                  <span className={styles.listLine}>{list.line}</span>
                  <span className={styles.listCta}>
                    {loaded ? "In the queue" : "Play this edit"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ══ THE ROSTER ═══════════════════════════════════════════════════ */}
      <section className={styles.roster} aria-labelledby="roster-h">
        <div className={styles.secHead}>
          <h2 className={styles.h2} id="roster-h">
            Who is on it
          </h2>
          <p>
            Eight names across three houses. Every portrait here is drawn for Pulse — the archive&apos;s
            singers are written, not borrowed.
          </p>
        </div>

        <ul className={styles.strip}>
          {ARTISTS.map((a) => {
            const record = RELEASES.find((r) => r.artistId === a.id)!;
            const open = openArtist === a.id;
            const rtl = Boolean(a.arName);
            return (
              <li key={a.id} className={styles.stripItem} data-open={open ? "" : undefined}>
                <button
                  type="button"
                  className={styles.card}
                  style={{ "--c-hot": record.hot, "--c-alt": record.alt } as CSSProperties}
                  onClick={() => setOpenArtist(open ? null : a.id)}
                  aria-expanded={open}
                >
                  <Portrait
                    spec={a.portrait}
                    className={styles.cardPortrait}
                    alt={`${a.arName ?? a.name} — drawn portrait`}
                  />
                  <span className={styles.cardBody} dir={rtl ? "rtl" : undefined}>
                    <span className={styles.cardName}>{a.arName ?? a.name}</span>
                    <span className={styles.cardMeta}>
                      {a.base} · {a.instrument}
                    </span>
                    <span className={styles.cardBio}>{a.bio}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.cardPlay}
                  onClick={() => playRelease(record.cat)}
                >
                  Play {record.arTitle ?? record.title}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ══ THE CATALOGUE — three racks, three grammars ═══════════════════ */}
      <section className={styles.catalogue} aria-labelledby="cat-h">
        <div className={styles.secHead}>
          <h2 className={styles.h2} id="cat-h">
            Catalogue
          </h2>
          <p>Ten records. The house a record comes from is printed on its sleeve.</p>
        </div>

        {shelves.map(({ house: h, records }) => (
          <div
            key={h.id}
            className={styles.rack}
            data-rack={h.id}
            dir={h.rtl ? "rtl" : undefined}
            lang={h.rtl ? "ar" : undefined}
          >
            <div className={styles.rackHead}>
              <h3 className={styles.rackName}>{h.label}</h3>
              <p className={styles.rackLine}>{h.line}</p>
            </div>
            <ul className={styles.records}>
              {records.map((r) => {
                const a = getArtist(r.artistId);
                const on = r.cat === release.cat;
                return (
                  <li key={r.cat} data-reveal="">
                    <button
                      type="button"
                      className={styles.record}
                      data-on={on ? "" : undefined}
                      style={{ "--c-hot": r.hot, "--c-alt": r.alt } as CSSProperties}
                      onClick={() => playRelease(r.cat)}
                    >
                      <span className={styles.recordArt}>
                        <Cover
                          kind={r.cover}
                          portrait={r.house === "archive" ? a.portrait : undefined}
                          className={styles.recordCover}
                        />
                        <span className={styles.recordBadge} aria-hidden="true">
                          {on && playing ? "Playing" : "Play"}
                        </span>
                      </span>
                      <span className={styles.recordCat}>{r.cat}</span>
                      <span className={styles.recordArtist}>{a.arName ?? a.name}</span>
                      <span className={styles.recordTitle}>{r.arTitle ?? r.title}</span>
                      <span className={styles.recordMeta}>
                        {r.format} · {r.tracks.length} · {r.year}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      {/* ══ THE ROOM — sessions, documented like an engineer's box ════════ */}
      <section className={styles.sessions} aria-labelledby="sess-h">
        <div className={styles.secHead}>
          <h2 className={styles.h2} id="sess-h">
            Box notes
          </h2>
          <p>
            What the engineer wrote on the tape box, transcribed. One take, one microphone position,
            no fixes.
          </p>
        </div>
        <ul className={styles.sessionList}>
          {SESSIONS.map((s) => {
            const r = RELEASES[releaseIndex(s.cat)]!;
            return (
              <li key={s.cat} className={styles.session} data-reveal="">
                <p className={styles.sessCat}>{s.cat}</p>
                <h3 className={styles.sessTitle}>{r.title}</h3>
                <dl className={styles.sessSpecs}>
                  <div>
                    <dt>Where</dt>
                    <dd>{s.where}</dd>
                  </div>
                  <div>
                    <dt>When</dt>
                    <dd>{s.when}</dd>
                  </div>
                  <div>
                    <dt>Chain</dt>
                    <dd>{s.chain}</dd>
                  </div>
                  <div>
                    <dt>Runtime</dt>
                    <dd>{s.runtime}</dd>
                  </div>
                </dl>
                <button type="button" className={styles.sessPlay} onClick={() => playRelease(s.cat)}>
                  Play the session
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.radioBand} aria-labelledby="radio-h">
        <p className={styles.onAir}>
          <span className={styles.dot} aria-hidden="true" />
          On air — Radio Pulse
        </p>
        <h2 className={styles.radioTitle} id="radio-h">
          {RADIO.title}
        </h2>
        <p className={styles.radioNote}>{RADIO.line}</p>
        <p className={styles.radioNext}>{RADIO.next}</p>
      </section>

      <footer className={styles.foot}>
        <p>
          Pulse is a fictional label, listening service and archive, drawn as a design exercise. Every
          performer, recording and catalogue number is invented; the portraits and sleeves are drawn
          here; the sound you hear is synthesised in the browser from each record&apos;s tempo, root and
          scale. Nothing is sampled and no real artist is named or pictured.
        </p>
        <p>ABUD · Multiverse 03</p>
      </footer>

      {/* ══ THE DOCK — the one piece of furniture that never leaves ═══════ */}
      <div className={styles.dock} role="region" aria-label="Player">
        <div className={styles.dockNow}>
          <Cover
            kind={release.cover}
            portrait={archive ? artist.portrait : undefined}
            className={styles.dockArt}
          />
          <span className={styles.dockText} dir={archive ? "rtl" : undefined}>
            <b>{entry.title}</b>
            <span>{archive ? artist.arName : artist.name}</span>
          </span>
        </div>

        <div className={styles.dockTransport}>
          <button
            type="button"
            className={styles.dockSkip}
            onClick={() => step(-1)}
            aria-label="Previous track"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path d="M18 5v14L8 12zM6 5v14" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.dockPlay}
            onClick={() => setPlaying((v) => !v)}
            aria-pressed={playing}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                <path d="M7 4l14 8-14 8z" fill="currentColor" />
              </svg>
            )}
            <span className="sr-only">{playing ? "Pause" : "Play"}</span>
          </button>
          <button
            type="button"
            className={styles.dockSkip}
            onClick={() => step(1)}
            aria-label="Next track"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path d="M6 5v14l10-7zM18 5v14" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className={styles.dockSeek}>
          <span className={styles.dockTime}>{fmt(elapsed)}</span>
          <div className={styles.seek}>
            <Waveform
              seed={entry.title + release.cat}
              bars={120}
              progress={progress}
              className={styles.dockWave}
            />
            <input
              type="range"
              className={styles.seekInput}
              min={0}
              max={entry.len}
              step={1}
              value={Math.min(elapsed, entry.len)}
              onChange={(event) => setElapsed(Number(event.target.value))}
              aria-label={`Seek within ${entry.title}`}
            />
          </div>
          <span className={styles.dockTime}>{fmt(entry.len)}</span>
        </div>

        <label className={styles.dockVol}>
          <span className="sr-only">Volume</span>
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" />
            <path
              d="M16 9c1.5 1.2 1.5 4.8 0 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(event) => setVolume(Number(event.target.value) / 100)}
          />
        </label>

        <p className={styles.dockQueue}>
          <span>{source.kind === "list" ? "Edit" : "Room"}</span>
          <b>
            {source.kind === "list"
              ? (PLAYLISTS.find((p) => p.id === source.id)?.title ?? "")
              : house.latin}
          </b>
          <span>
            {qi + 1}/{queue.length}
          </span>
        </p>

        <span className={styles.dockMeter} aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <i key={i} style={{ "--i": i } as CSSProperties} />
          ))}
        </span>
      </div>

      {reduced && (
        <p className={styles.reducedNote}>
          Motion reduced — the press holds still. Playback and the transport still work.
        </p>
      )}
    </div>
  );
}
