# STATUS — ABUD · UI/UX Multiverse

Single source of truth for project progress. Updated after every meaningful change.

**Last updated:** 2026-08-11
**Overall completion:** ~93% of the ten-world vision · Milestone 04 complete

---

## Project goal

An interactive design exhibition rather than a portfolio page: one designer, and
**ten genuinely independent websites**, reached through a neutral lobby. A
visitor arrives at the lobby, browses ten design directions, and *enters* one —
at which point the multiverse gets out of the way entirely and they are on a
different site. The claim the project makes is that all ten came from the same
hand and share nothing else, so a screenshot with the colour removed should
still identify exactly one world.

## Current milestone

**Milestone 04 — Final quality pass, from the owner's own review of the rendered
site. Complete.**

The lobby was approved and is untouched. Everything in this milestone went into
the ten worlds, and the through-line was one instruction: *stop describing the
product and be it.* Every control that read as UI now delivers state, every
world that showed a picture of a subject now draws the subject, and the two
worlds that talked about sound now make it.

---

## What changed, world by world

### 01 · Nova — typographic identity and a hero that proves its claim

- **New display face.** Archivo Expanded in caps was the exact silhouette every
  AI product currently wears. Nova is now set in **Schibsted Grotesk**, in
  *sentence case*, with the hierarchy carried by weight (300 against 800 inside
  one sentence) rather than by width and shouting. Display size dropped from
  5.75rem to 3.5rem and the hero got shorter.
- **The identity is a filing habit, not a font.** Sections are numbered entries
  (§01–§06); the rail navigates by the same numbers and knows which one you are
  reading (one `IntersectionObserver`, no frame loop); every panel states its own
  reference. Utility type is lowercase mono with tabular numerals; tracked caps
  are reserved for true labels.
- **The hero is now an artefact.** Left: the claim. Right: a **grounding ledger**
  — three real claims from RUN-8842 with the record each came from, its
  timestamp, and its confidence measured against a floor that is *marked on the
  bar*. One of the three is below it, so the policy is visible rather than
  asserted.
- **The field joined the argument.** `vector-flow` gained an optional sink
  (`cx`, `cy`, `converge`); Nova points it at the ledger, so the probes turn to
  face it and go out as they arrive. Scattered signal resolving into one grounded
  claim — which is the product's sentence.
- **Richer run.** The phase spine reports each stage's duration; every confidence
  bar in the stream carries the same floor marker as the ledger; sub-floor steps
  turn amber.
- **Real command surface.** The search field was a `<span>`. It is now an input
  that matches the decisions Nova can actually run, opens the best match on
  Enter, and focuses on ⌘/.
- **The agent chain stopped being four cards.** It is drawn as a pipeline: one
  rule, four stops on it, uneven column widths, the read stage lit.

### 02 · مِجاز — five centuries, twelve poets, and ink that behaves

- **Eras are art direction, not a filter.** الجاهلي · صدر الإسلام · الأموي ·
  العباسي · الأندلسي, each with its own paper temperature, ink, gold, rule colour
  and **ornament restraint** — a جاهلي page has almost no illumination because it
  had no illuminator; an أندلسي page is covered in it. All four inks are
  registered `@property` `<color>`, so a change of century cross-fades the whole
  sheet on one 900 ms curve.
- **A page turn between centuries.** One leaf with a shadow under its leading
  edge sweeps right to left, and the century underneath it is different.
- **Twelve poets** (was five), three to a period, each with the metre they are
  actually written in, its feet and syllable pattern, a passage and marginal
  glosses. All public domain; poets died between the 6th and 14th centuries.
- **The diacritics arrive after the letters.** The verse writes its *skeleton*
  first and the harakat settle onto it afterwards, which is the order a scribe
  works in. Both layers are the same width — harakat are combining marks — so the
  line never moves. A `bare()` helper strips the marks.
- **الأشكال الشِّعرية** — a new section on the five forms (معلَّقة، قصيدة، رثاء،
  غزل عذري، موشَّح), each with what it is and a line that is in it.
- **Marginalia enter like notes**, each at its own slight angle, staggered after
  the passage lands.

### 03 · Pulse — rebuilt

The weakest world is now the densest. One idea: **the page is whatever is
playing.**

- **Three houses, three grammars.** *The Floor* is a two-colour poster hung
  against an oversized name. *الأرشيف* is a sheet of cream paper, set right to
  left in display kufi, with its maqam ruled beside it. *The Room* is an
  engineer's document, mono and monochrome, where the take outranks the performer.
  Same markup, re-grammared by `data-house`.
- **The page runs at the record's tempo.** One `--beat` (60/bpm) times the level
  meters, the on-air dot, the playing row and the press. Change the record and the
  site changes speed.
- **It plays.** `useMusicEngine` synthesises a preview from the three facts the
  catalogue already stores — tempo, root, scale. The archive is therefore
  genuinely in **Rast** and **Bayati**: the scales are stored in *cents*, so the
  third lands around 350 and the second around 150, neither of which exists on a
  piano. Three arrangements: four-to-the-floor, a wahda under an oud phrase, and
  a brushed session. Real volume, real seek.
- **Drawn imagery, not colour plates.** An original screen-print system: eight
  hand-built **portraits** (four face outlines, eight hair plates, garments,
  accessories, a visible halftone screen and the accent plate knocked out of
  register), ten **covers** in three house grammars, and typographic covers for
  the edits so a playlist never looks like an album.
- **The maqam, ruled.** The archive prints its scale against the piano's twelve
  semitones and calls out the degrees that fall between two keys.
- **A floating console** — deliberately not a full-width bar — with transport,
  waveform scrub, volume, queue and tempo, lifted clear of the escape control.
- **Waveforms as identifiers.** Each track's silhouette is derived from its title
  with an eight-section arrangement, and it is also the scrub target.

### 04 · Vault — the product became real

The look was approved; the navigation was decoration. Now:

- **Entity switcher** (group + two subsidiaries) changes whose book you are
  reading — positions, balances, payments and the log all filter by it.
- **The tree drives everything.** Each node carries a *scope* (a currency, an
  asset class, payments, FX). Positions, balances, the ladder, the log, the KPIs
  and the crumb all answer to it, and each node prints its live count.
- **The ladder is derived, not tabulated** — the scoped positions bucketed by days
  to maturity, translated at the shocked rate. So it moves when you roll a
  deposit, change entity or apply a shock, and the 90-day policy test **can fail**.
- **The inspector inspects everything** — a position, an account, a payment run or
  a ladder bucket — and its actions *write*: rolling a deposit moves it out along
  the ladder, approving a run collects a signature and releases at two, sweeping
  an account moves the money. Every write is stamped and appended to the log.
- **Search filters** positions and payments and reports its count. Views switch
  on 1–4. The status bar reports when the derivation last ran.
- **The Ladder view is a view**, not a chart: roll-off schedule and concentration
  by counterparty beside it, with the €20 m single-name limit flagged at 60%.

### 05 · Orbit — the ship is modelled now

- **The vector ship is gone.** It was rounded rectangles, and no polish makes that
  read as a spacecraft. The Salvager is a **mesh** — ~640 polygons in metres,
  built from a spine truss, reactor drum, engine block, radiators, cargo cradles
  and a hexagonal pressure hull — rasterised by a hand-written painter's-algorithm
  renderer with model-space normals, a fixed key and rim light, depth haze and
  per-material edge weights.
- **No dependency.** A renderer this size is a few hundred lines and draws exactly
  what this world needs; a 3D library would be several hundred kilobytes for a
  fraction of its surface. **No third-party model, texture or asset is used** —
  the mesh is original and lives in `ship.ts`.
- **The loadout rebuilds the ship.** Armour is three plates a side with real
  thickness and a bolt strip; the tether builds a boom and a three-finger claw;
  the scanner raises a mast and opens a dish; the screen throws a lattice arc
  across the bow; the burst drive bolts on two more nozzles and their pumps.
- **Sectors.** Four, each with its own sky (two nebula inks, star colour, wreck
  density), transit time and contract board. Choosing one re-bakes the sky.
- **A launch sequence with a camera.** Countdown pushes in and rolls; ignition
  lights both nozzles; away drops the ship down the lens at 780 units with the
  plumes at full. Abort and recall both work.
- **One frame loop on the route.** The ship canvas draws the star field, the
  wrecks, the ship, the plumes and writes the parallax variables the HUD reads.
  `depthDrift` was deleted rather than left as a second loop.

### 06 · Forma — one set-out, four drawings, nine instruments

- **The drawings are computed.** There is no per-view artwork. Each project is a
  list of volumes in metres, and every view is that set-out projected:
  `sy = y′·sin(el) − z·cos(el)`. At 90° of elevation it is a plan, at 0° a
  section, anywhere between an axonometric — so **dragging the elevation slider
  folds the plan up into the axonometric** and you can watch which wall becomes
  which.
- **Nine controls, each of which teaches something**: azimuth, elevation, explode,
  daylight, storey isolation, set-out grid, dimensions, annotations, structure,
  heavy line. Poché only appears where the projection actually cuts. Daylight is a
  real vector against real face normals. Dimensions are measured off the volumes
  in millimetres. The scale is measured from the fit and reported honestly, so a
  96 m² workshop and a 1 240 m² archive do not claim the same scale.
- **Five genuinely different projects** — a courtyard house, a bar with a north
  light monitor, a stacked archive, six repeated units, a vaulted chapel cut into
  a slope. Selecting one changes geometry, roof profile, bay, site fall, sun,
  programme, description, area, structure and status.
- **A schedule of accommodation**, measured off the same volumes, so it cannot
  disagree with the plan beside it.
- **The headline was re-set, not re-sized.** Two lines on the sheet's grid, the
  second indented to the third column, both on a datum rule, at 3.8rem instead of
  6.5rem — architectural rather than enormous.

### 07 · Luma — onboarding is a sequence

- The three static cards with a grey field and a fake Continue button are gone.
  One question at a time, each with the control it would actually ship with: a
  **city choice**, a **time dial** you drag or key, and a **slide-to-finish** that
  also completes on a press for the keyboard.
- **The phone answers the open question.** Pick Oslo and it prints Oslo's sunrise
  and draws the 15h 43m arc; move the dial and the wind-down time and the light
  curve move with it; finish and it says there is nothing to do for three days.
- Progress is three filling segments. The claim "three questions, then it gets out
  of the way" is now demonstrated rather than asserted.

### 08 · شَرارة — an authored scene

- One control, `شغِّل المشهد`, plays a **seven-beat cartoon**: anticipation
  (crouch, squash to 1.2 × 0.78), a dash with speed lines and a dust puff, a
  **held impact frame** with twelve rays and a `بام!` in stroked Lalezar, a
  scatter of sixteen objects flung on real angles while the phone squashes and
  overshoots back, the cat barging in from the other side with a speech bubble,
  a burst that covers the cut — the world changes underneath it — and a landing.
- Keyed the way an animator keys: every beat is a state, nothing loops forever,
  and when it is over the interface is exactly where it was.
- Reduced motion skips the travel and keeps the result.

### 09 · أثير — the radio plays

- **Real audio, per band.** `useRadio` synthesises each decade from five stored
  facts: tempo, tonic, maqam in cents, ensemble mix and a sixteen-step phrase.
  The 1930s band is oud, qanun and riq on a wahda in Bayati at 58; the 1950s band
  is a broadcast orchestra in Rast at 76; the 1980s band is a drum box in Kurd at
  118. They sound different because they *are* different.
- **Tuning is not a cross-fade.** While the dial moves the band ducks and a real
  interference chain opens — band-passed noise whose centre tracks the dial, plus
  a heterodyne whistle that sweeps as you pass a carrier — and the glass hashes.
  Land on a band and it clears.
- **A volume knob**, not a slider: same 280° physics as the tuner, drag or arrow
  keys, and it changes the actual gain.
- **Six finishes** — جوز، أبنوس، عاج، أسود لامع، خمري، أزرق مصري. Each changes the
  two woods *and* the grain contrast, the cloth over the speaker, the front plate
  and its ink, the knob faces and their edge light, the tint of the dial glass,
  the pilot lamp and how the cabinet casts its shadow. The back plate reports
  which one is fitted.
- The VU meter is driven by the band's own tempo.

### 10 · Mercato — three additions, all of them information

- **Stock is state.** Adding takes one off the shelf; the low-stock flag moves on
  its own; the last one really is the last one and the button says *Sold out*.
- **A named confirmation** with an **Undo** that puts the thing back on the shelf.
- **The maker, on request** — a disclosure with who they are and since when, for
  all eight makers. A shopper who wants olive oil is not made to read about
  Umbria first.
- Nothing was added that animates on its own. The calm was the point.

---

## Media and licensing

**No third-party media is used anywhere in this repository.** There is no image
file, no audio file, no 3D model and no texture. Specifically:

| Asset | Origin |
| --- | --- |
| Pulse portraits and covers | Original SVG, built in `pulse/art.tsx` |
| Pulse audio | Synthesised in-browser from tempo, root and scale |
| Orbit's Salvager | Original mesh in `orbit/ship.ts`, rendered in `ShipCanvas` |
| Orbit sky and wrecks | Drawn to canvas, seeded, no images |
| أثير audio | Synthesised in-browser per band; no recordings |
| أثير cabinet and finishes | Drawn with gradients and rules |
| Forma drawings | Projected from volumes, no artwork |
| Mercato goods | Original SVG still lifes |
| مِجاز verse | Public domain; poets died 6th–14th c. |
| Atmosphere canvases | Hand-written renderers, seeded, never `Math.random` |

Fonts are Google Fonts, loaded through `next/font` (SIL Open Font License).
**Added this milestone:** Schibsted Grotesk (Nova display), Qahiri and Almarai
(Pulse's archive). **Removed:** Archivo. Twenty-six families; no two worlds share
a display + body pairing.

Every fictional performer, artist, poet-adjacent broadcaster, company, product
and catalogue number is invented. مِجاز's poets are real historical figures and
their verse is genuinely theirs; nothing else claims a real person.

---

## Differentiation matrix

| World | Layout grammar | Display / body | Motion | Density |
| --- | --- | --- | --- | --- |
| Nova | Rail + numbered record | Schibsted / Inter Tight / JetBrains | 240ms predictive | 4 |
| مِجاز | RTL manuscript block, wide outer margin | Aref Ruqaa / Amiri / Reem Kufi | Ink · 900–1400ms | 2 |
| Pulse | Floating console, three house grammars | Big Shoulders / Barlow / Qahiri | The record's own beat | 3 |
| Vault | Three-pane app shell + status bar | IBM Plex Mono / Plex Sans | 160ms state-driven | 5 |
| Orbit | Rendered depth field, corner HUD | Unbounded / Chakra Petch | Camera · 1100ms | 2 |
| Forma | Drafting sheet + instruments | Syne / Newsreader / Spline Sans Mono | 700ms quart | 3 |
| Luma | Device-forward; the app is the object | Outfit / Plus Jakarta | 480ms spring | 2 |
| شَرارة | Comic panels at angles, halftone, RTL | Lalezar / Marhey | Cartoon · keyed beats | 3 |
| أثير | Instrument-led, RTL bands | El Messiri / Tajawal | Mechanical · 900ms | 2 |
| Mercato | Filter column + catalogue + drawer | Fraunces / Karla | 180ms practical | 4 |

---

## Shared code

**Reused:** `FieldCanvas`, `pointerStore`, `useReveal`, `useReducedMotion`,
`useFinePointer`, `useWorldGround`, `seeded`, `alphaOf`, `swirl`.

**Extended:** `FieldCanvas` now accepts `params` — numeric parameters a world
feeds its own renderer (Pulse sends a tempo and a rhythm mode; Nova sends a
convergence point). Shared plumbing, world-specific meaning.

**New:** `halftoneBeat` (Pulse's press), `pulse/art.tsx`, `pulse/Waveform.tsx`,
`useMusicEngine`, `orbit/ship.ts`, `orbit/ShipCanvas.tsx`, `orbit/data.ts`,
`forma/data.ts`, `forma/Drawing.tsx`, `vault/data.ts`, `luma/Onboarding.tsx`,
`object/useRadio.ts`.

**Removed:** `beatBars`, `depthDrift`, `object/useRoomTone.ts`, Archivo.

---

## QA performed

Headless Chrome over CDP, per the `responsive-motion-qa` skill.

**55 scenes** — all eleven routes at 1440×900, 1024×768, 390×844 (touch) and
360×740 (touch), plus all eleven at 1440 with `prefers-reduced-motion: reduce`.

- **Console clean on all 55.** No errors, no warnings, no exceptions. This pass
  also captured `Runtime.consoleAPICalled`, which the previous harness did not —
  and it caught a real hydration mismatch in Pulse (see below).
- **Horizontal overflow** — `scrollWidth === clientWidth` on every route at every
  width, plus an element walk that ignores intentional scroll containers and SVG
  interiors.
- **Ground** — every world route paints its own ground on the document element;
  the lobby leaves it unset.

**Interaction driven directly:**

| World | Driven |
| --- | --- |
| Nova | Rail scroll-spy, command input, run replay, the chain |
| مِجاز | Era switch (page turn + full re-ink), poet selection, forms |
| Pulse | House tape (floor → archive → room), record selection, transport, seek, volume, audio context asserted `running` |
| Vault | All four views, entity menu, tree scope, three shocks composed, payment inspector under a breached floor |
| Orbit | Sector switch (sky re-bake), four loadout modules, full launch → away, abort |
| Forma | Four modes, all five projects, azimuth/elevation, structure overlay |
| Luma | Complete three-step onboarding, city → dial → slide → done |
| شَرارة | Full seven-beat scene, world change under the burst |
| أثير | Power, tuner by key, volume by key (62 → 66), finish change, `AudioContext` asserted created and `running` |
| Mercato | Product detail, maker disclosure, add (stock 3 → 2), confirmation |

**Fixed during QA:**

1. **Pulse hydration mismatch.** `Math.sin`/`Math.pow` are only specified to an
   implementation's own precision, so Node and Chrome disagreed in the last bit
   and the waveform rendered `height="4.541352266456047"` on the server against
   `…48` in the browser. The shape is now built from triangle waves, `Math.floor`
   and integer PRNG only — all exact in IEEE-754 — and quantised to three
   decimals. **This is worth remembering: any SSR-rendered geometry in this
   project must avoid transcendental functions.**
2. **Vault at 360** — the four view tabs plus their printed keyboard shortcuts
   pushed the page 10 px wide. The shortcut is a desk affordance and there is no
   keyboard on a phone, so it is dropped below 520 px and the strip scrolls.
3. **Luma at 1024** — the two phone callouts hung 37 px off the left edge. Below
   1100 px they sit under the device instead.
4. **شَرارة on phones** — the scene's cast entered from 18% outside a stage that
   is the width of the screen. The scene keeps its shape and travels less.
5. **Pulse ink polarity** — covers and portraits were drawing near-black ink on
   near-black paper, so the sleeves' bars and the faces were invisible. Covers now
   print light ink on dark stock, portraits dark ink on light.
6. **Pulse portrait eyes** — a closed dark outline around a white almond read as a
   spectacle lens at small sizes. Split into a heavy upper lid and a fine lash.
7. **Orbit blooms** — navigation lights were scaling with distance into 60 px
   glows that washed the plating they were bolted to; the claw light read as a
   second engine on the wrong end of the ship.
8. **Orbit armour** — one broad slab hid the hull it was protecting. Three plates
   a side with real gaps and a bolt strip.
9. **Forma dimension clipped** off the top of the sheet; offset reduced and the
   sheet padding raised.
10. **Pulse single-column phone layout** — desktop `grid-column: 2` and `3` were
    opening two implicit tracks and crushing the sleeve to 30 px.

**Found in a working-tree code review afterwards, and fixed:**

11. **Vault appended every log line twice.** `write()` called `setLog` from inside
    a `setTicks` updater, and React runs updaters twice under StrictMode. The
    clock now advances in a ref and the stamp is computed before either call.
12. **Vault hid the write it had just made.** Rolling a deposit logged against the
    instrument class, so the entry was filtered out of the log the operator was
    looking at. Session writes are now always in scope.
13. **Luma's release-to-cancel was unreachable with a mouse** — a pointer drag ends
    by firing `click`, which completed the confirmation regardless of where you
    let go. The trailing click is now suppressed after a real drag.
14. **شَرارة's seven queued beats outlived the route.** Leaving mid-scene now
    invalidates the run.
15. **Mercato's confirmation timer outlived the route.** Cleared on unmount.

**Known intentional clip:** شَرارة's decorative sticker layer and the mascot
extend a few pixels past the stage on phones and are clipped by it. There is no
page-level overflow; the loose objects are meant to run off the edge.

---

## Build

```
typecheck  clean
lint       clean
build      clean — 15 routes, all static, 103 kB shared first load
```

Heaviest route is Pulse at 17.4 kB / 129 kB first load, which is the portrait and
cover system plus the sequencer.

---

## Known issues, honestly

1. **Pulse's and أثير's music is synthesised, not recorded.** It is real audio and
   it is genuinely in the right maqamat, but it is a generated preview rather than
   a performance. That is a licensing constraint stated in the UI of both worlds,
   not a bug — and it is the only honest way to make an archive of invented
   recordings audible.
2. **Orbit's renderer has no depth buffer.** Faces are sorted by camera-space
   centroid and painted back to front, which is correct for the closed solids the
   current mesh is made of. A future part that interpenetrates another would sort
   wrongly, and the fix would be per-triangle splitting rather than a tweak.
3. **Forma's plan is a projection, not a cut through openings.** There are no
   doors, windows or stairs in the geometry, so the plan shows walls and rooms but
   not thresholds. Adding them means an opening primitive in the volume model.
4. **Vault's market tape is the weakest panel.** It is a `tick-matrix` canvas with
   three rates beside it; only SOFR responds to the rate shock. It should be a
   real curve derived from the same shock as everything else.
5. **Luma still has no gesture handling outside onboarding.** The slide-to-finish
   is real; swipe between tabs and long-press for settings are still described in
   copy rather than implemented.
6. **مِجاز's era palettes are close in three of five cases.** الأموي and العباسي
   read similarly at a glance; the جاهلي / أندلسي ends of the range carry the idea
   and the middle could be pushed further apart.
7. **No automated tests.** Verification is visual and assertion-based through the
   CDP harness; there is no unit or regression coverage, and the harness lives in
   the scratchpad rather than in the repository.
8. **Pulse's roster portraits share one facial layout.** Face shape, hair,
   garment, accessory and plate differ per artist, but the eye and mouth positions
   are fixed by the system, so the eight faces are a family rather than eight
   individuals.

## Deployment

- **Production URL**: https://uiux.abud.fun
- **GitHub Commit SHA**: b0915d63810011828821224c48fba94b4df39f36
- **VPS IP**: 167.99.157.6
- **Deployment Path**: /var/www/uiux-multiverse/releases/20260811061908 (symlinked to /var/www/uiux-multiverse/current)
- **PM2**: App name \uiux-multiverse\ running NextJS node server on port 3077
- **Nginx Config Path**: /etc/nginx/sites-available/uiux.abud.fun.conf (symlinked to sites-enabled)
- **HTTPS Status**: SSL enabled with Certbot/Let's Encrypt
- **Health-check**: Success. App serving requests securely.
- **Rollback Command**: ssh root@167.99.157.6 'ln -sfn /var/www/uiux-multiverse/releases/<PREVIOUS_TIMESTAMP> /var/www/uiux-multiverse/current && cd /var/www/uiux-multiverse/current && pm2 restart uiux-multiverse'
