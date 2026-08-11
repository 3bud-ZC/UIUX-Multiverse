# ABUD — UI/UX Multiverse

One designer, ten independent websites, reached through a neutral lobby. This is
a portfolio piece whose subject is design judgement, so the craft of the result
is the product. Treat these as standing rules, not milestone notes.

A world is not a theme of a shared page: it is its own site at its own route,
and entering one must feel like leaving this site and opening another.

## Working rules

**Quality over speed.** A merely functional implementation is a failed one. If a
direction looks ordinary in the browser, change it rather than justify it.

**Inspect the rendered UI.** A passing build and a clean typecheck say nothing
about whether the design is acceptable. Never call visual work done without
looking at screenshots of it. See the `responsive-motion-qa` skill for the
harness and the viewport matrix.

**Worlds must differ structurally.** A world is a grid, a layout grammar, a type
system, a density, a surface, a navigation pattern and a motion curve — never a
palette swap. See the `world-art-direction` skill for the differentiation test.

**Avoid generic AI UI.** Equal card rows, purposeless gradients, blanket
glassmorphism, decorative numbering, and marketing copy are rejected on sight.
See the `visual-quality-gate` skill for the full list and the acceptance bar.

**Mobile is first-class.** Phone layouts are designed, not derived. Reinterpret
desktop ideas for touch instead of scaling them down.

**Animation needs intent.** Every animation names a state or a relationship. If
it names nothing, remove it. Honour `prefers-reduced-motion` by producing a
complete still composition, not a broken one.

**Accessibility is part of the design.** Semantic structure, keyboard paths,
visible focus in the active world's accent, labelled controls, adequate touch
targets, and text at 4.5:1 or better against its ground.

**Performance is part of the craft.** One animation frame loop, parked when
hidden or when motion is reduced. Static canvas layers baked once at layout.
Pointer work outside React so movement never triggers a render. No dependency
enters without a reason that a hand-written alternative could not meet.

**No unrelated changes.** Keep diffs scoped to what was asked.

## Architecture

- Next.js App Router + TypeScript. CSS Modules with CSS custom properties —
  deliberately not a utility framework, which would pull ten worlds toward one
  visual system.
- `/` is the lobby. `/worlds/<id>` is a world, and owns everything below the
  route: its own component under `src/components/worlds/<id>/`, its own CSS
  module, its own type, colour, spacing and motion. No world imports another
  world's stylesheet, and none of them import the lobby's.
- `src/lib/worlds.ts` describes worlds only from the *outside* — name, category,
  concept, ground colour, display voice, route. It is what the lobby, the ⌘
  switcher and the escape control read. Anything a world needs internally
  belongs to that world, not here.
- Shared *technical* primitives are good: `FieldCanvas`, `useReveal`,
  `useWorldGround`, `pointerStore`. A shared *visual* system across worlds is
  the thing to avoid.
- Global chrome inside a world is limited to one small escape control and ⌘K.
  No shared bar, frame, rail or grid may surround a world.
- The lobby owns no display face. Its instrumentation is mono and sans; every
  display face on it is borrowed from the world it names.

## Progress

`STATUS.md` is the single progress file. Update it after each meaningful change.
Do not create ROADMAP, PLAN, TODO, PROGRESS, NOTES or similar files.
