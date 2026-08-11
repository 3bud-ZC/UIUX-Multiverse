---
name: responsive-motion-qa
description: How to verify UI in this project across viewports, interaction states and reduced motion, using the headless Chrome CDP harness. Use this after any change that affects layout, typography, animation, the lobby index, a world route or the ⌘ switcher, and whenever visual verification is needed but the in-app browser preview pane is unavailable. Also use it when a change "should be fine" — layout regressions here are usually invisible in code and obvious in a screenshot.
---

# Responsive & motion QA

A build passing proves nothing about layout. Verify by looking, at real sizes,
with real interaction. This skill exists because the failures that matter in
this project — a nowrap title escaping its column, a rail label colliding with a
texture, an inline element ignoring a width — are invisible in the source and
immediate in a screenshot.

## The harness

If the in-app browser pane will not composite frames, drive headless Chrome over
CDP instead. Node 24 ships a global `WebSocket`, so no dependency is needed.

Start Chrome once per session:

```bash
chrome --headless=new --remote-debugging-port=9222 --hide-scrollbars --force-device-scale-factor=1 --user-data-dir=<scratch>/chrome-profile about:blank
```

Then drive it with a small script that opens a target, applies
`Emulation.setDeviceMetricsOverride`, navigates, runs a list of steps
(`wait` / `move` / `click` / `key` / `eval` / `shot`) and captures
`Page.captureScreenshot`. Keep the script and its step files in the scratchpad,
never in the repo. Pass step lists as a JSON **file** rather than an inline
argument — shell quoting will otherwise corrupt any expression containing
quotes.

Useful emulation flags: `mobile: true` plus `Emulation.setTouchEmulationEnabled`
for phones, and `Emulation.setEmulatedMedia` with
`prefers-reduced-motion: reduce` for the motion pass.

## The matrix

Check every layout-affecting change at all four:

| Width | Height | What it is testing |
| --- | --- | --- |
| 1440 | 900 | The authored desktop composition. |
| 1024 | 768 | The tablet break — where side columns start to crowd. |
| 390 | 844 | The designed phone layout, not a shrunk desktop. |
| 360 | 740 | The narrow phone. Things that fit at 390 fail here. |

Plus one pass at 1440 with reduced motion emulated.

## What to assert, not just eyeball

Screenshots catch composition; a few evaluated expressions catch the rest. Worth
running on every pass:

- **Horizontal overflow.** Compare `documentElement.scrollWidth` to
  `clientWidth`, *and* walk elements looking for `getBoundingClientRect().right`
  beyond the client width. The second check matters because the stage is a fixed,
  clipped element — it can hide real overflow from `scrollWidth` entirely.
- **Console.** Collect `Log.entryAdded` and `Runtime.exceptionThrown` and require
  the result to be empty. A 500 from a CSS syntax error surfaces here and nowhere
  else.
- **Focus.** Tab a few times, then read `document.activeElement` — its label and
  its computed `outlineColor` / `outlineWidth`. A focus ring that inherits the
  world accent must actually be applied, not merely defined.
- **Leakage.** On a world route, read `documentElement.style.background` and
  confirm it is that world's ground; navigate back and confirm it is cleared. A
  light world showing the lobby's near-black on overscroll is the shared-shell
  bug returning.

## Interaction passes

Beyond the static shots, exercise: hover and focus on the lobby index (the row
expands and the masthead preview swaps), `⌘K` / `Ctrl+K` inside a world, arrow
keys through the switcher, `Escape` to close it, and the escape control back to
the lobby.

Each world also owns interactions worth driving directly: Nova's scenario tabs
and commit, Vault's tabs, sort and row selection, Pulse's transport, Orbit's
loadout budget, Signal's case stepper, Object's finish swatches, Luma's tab bar,
and Mercato's filters, product page and basket drawer.

## Reduced motion means designed-still, not broken

Under `prefers-reduced-motion: reduce` the result should still be a complete,
composed screen: the entry sequence is skipped entirely rather than frozen
mid-way, atmosphere renderers draw one meaningful static frame and park the
frame loop, and the pointer tracks exactly instead of lagging. A reduced-motion
screenshot that looks unfinished is a bug, not an accommodation.
