---
name: world-art-direction
description: Defines how a design world in the ABUD Multiverse is created or changed so worlds stay structurally different rather than recoloured. Use this whenever adding a new world, editing src/lib/worlds.ts, writing or restyling a world under src/components/worlds/, adding an atmosphere renderer in src/lib/fields/, or whenever a change would make two worlds share a layout, grid, navigation pattern or motion curve. Also use it when reviewing whether a world "feels different enough" — that judgement has concrete criteria here.
---

# World art direction

The whole project rests on one claim: ten worlds, ten design systems, one hand.
That claim collapses the moment two worlds differ only in palette. A visitor who
notices that Vault is Nova with amber instead of cyan has caught the site
lying — so the bar is that a screenshot with all colour removed should still be
identifiable as exactly one world.

## The differentiation test

Before a world is considered done, it must differ from every existing world on
at least **five** of these seven axes. Fewer than five means it is a skin.

| Axis | What it means in practice |
| --- | --- |
| Grid | Column count and base unit. 12/8pt is not 6/12pt is not "no grid, z-layers". |
| Layout grammar | Where content is anchored: centred, hung left, cornered, cellular, spread. |
| Type system | A display face with a genuinely different silhouette, plus its own tracking and leading. |
| Density | How much information sits in one screen. Atelier is 1, Vault is 5. |
| Surface | Paper, glass, deep space, cast concrete, flat ink, hairline panel. |
| Navigation | Command bar, editorial index, ticker, sidebar tree, radial HUD, margin notes. |
| Motion | Its own easing curve and duration, used consistently across the whole route. |

Decide these before writing markup, and record the summary in the world's
`system` field so the lobby can state it. The rest lives in the world's own CSS
module, because that is the only place it can differ far enough.

## Where a new world touches the codebase

1. `src/lib/worlds.ts` — add the `World` entry. This describes the world from
   the outside only: name, category, product, concept, ground, display voice,
   route. It is what the lobby, the ⌘ switcher and the escape control read.
2. `src/app/fonts.ts` — load its display and body faces with `preload: false`.
   No two worlds may share a display + body pairing.
3. `src/app/worlds/<id>/page.tsx` — the route and its metadata.
4. `src/components/worlds/<id>/<Name>.tsx` + its own CSS module — the site.
5. Optional: `src/lib/fields/<name>.ts` if the world wants a canvas of its own.
   Write a genuinely different algorithm, register it in `fields/index.ts`, and
   mount it from the world with `FieldCanvas` — never from shared chrome.

If you find yourself special-casing a world inside the lobby or the switcher,
the model is missing a field — add the field instead.

## Worlds own their own CSS

Every world has its own CSS module and shares nothing visual with the others.
That looks like duplication and it is not: a shared world stylesheet is exactly
the mechanism that would drag ten sites back toward one look. Shared *technical*
primitives (`FieldCanvas`, `useReveal`, `useWorldGround`, the pointer store) are
good. Shared *visual* systems across worlds are the failure mode.

Global chrome inside a world is one small escape control and ⌘K. Everything else
on the page belongs to the world.

## Copy is part of the art direction

Each world's `concept` — and every line of copy inside it — should sound like
someone who works in that industry, not like a landing page. Concrete beats clever. "Certainty, at a
glance." is Vault; "Empowering financial clarity" is nobody.

Avoid: seamless, elevate, empower, unlock, journey, cutting-edge, next-level.

## Fields must stay cheap

An atmosphere renderer runs every frame behind live type. Keep it honest:

- Bake anything static to an offscreen canvas at `layout()` and `drawImage` it.
- Batch strokes into as few `stroke()` calls as the design allows.
- Never call `Math.random` — use `seeded()` from `fields/types.ts`, so the
  composition is stable across renders and server and client agree.
- Respect the `reduced` flag by drawing one meaningful static frame, not by
  drawing nothing.
