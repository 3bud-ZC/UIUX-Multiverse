---
name: visual-quality-gate
description: The acceptance bar for any UI in this project, and the checklist for spotting generic AI-generated frontend before it ships. Use this whenever building a new screen, section or component, when restyling existing UI, when a build passes but the design has not been judged yet, and whenever asked "is this good enough" or "does this look AI-generated". Apply it before declaring any visual work complete — a passing build and a clean typecheck say nothing about whether the design is acceptable here.
---

# Visual quality gate

This project is a portfolio piece whose entire job is to demonstrate taste. A
screen that works is not a screen that ships. Judge the rendered result, in a
browser, against the bar below — and be willing to throw work away.

## The tells of generated frontend

If a screen shows two or more of these, redesign it rather than adjust it.

- **The three default looks.** Cream page + high-contrast serif + terracotta
  accent; near-black + one acid-green accent; broadsheet with hairline rules and
  dense columns. Each is legitimate for some brief. None is a choice when it
  arrives regardless of subject.
- **A row of equal cards.** Three or four boxes with an icon, a bold line and
  two lines of grey text.
- **Decoration standing in for structure.** Gradients with no light source,
  glassmorphism on everything, rounded rectangles at every scale, a glow behind
  an element that is not emitting light.
- **Numbering that numbers nothing.** `01 / 02 / 03` on items that are not a
  sequence. Ordinals are content here only because the worlds genuinely are an
  index.
- **Motion without a referent.** Things that float, pulse or shimmer
  continuously while communicating no state.
- **Copy that sells instead of naming.** Empower, seamless, elevate, unlock,
  journey, transform. Also: a heading that could sit on any product.
- **Placeholder honesty failures.** A grey box where an image should be, shipped
  as if finished. Either compose the empty area deliberately, with a caption
  that says what it is, or cut it.

## The bar

**Composition.** Something must dominate. If every element has similar weight
the screen has no hierarchy, only arrangement. Negative space must read as
intentional — air around a strong focal point, not a gap where content ran out.

**Typography.** Display and body should be doing different jobs, with a real
size jump between levels. Measure stays in the 45–75 character range for running
text. Large display type needs negative tracking; small caps-and-tracking labels
need positive. A title must never collide with or overrun a neighbouring column —
size it against its own container, not the viewport.

**Colour.** Every colour on screen should be traceable to a token in the world
model. Body and secondary text hold at least 4.5:1 against their ground; check
it rather than assuming. Accents are for meaning — state, emphasis, the active
item — not for filling space.

**Detail.** Spacing comes off the 4pt scale. Hairlines are one device used
consistently, not a texture. Nothing is clipped, nothing overflows the viewport
horizontally unless that scroll is a deliberate, contained interaction.

**Intent.** For each animation, name the state it communicates. If you cannot,
delete it.

## How to actually judge it

Read the pixels, not the code. Take a screenshot at 1440 and at 390, and look
for the tells above before looking at anything else. Then zoom into the two or
three areas carrying the most craft — the type lockup, the densest panel, the
edge where two systems meet — because that is where generated work falls apart.

Ask the harder question directly: *would this survive next to strong work on
Awwwards or a senior designer's portfolio?* "It is fine" is a fail. If the
answer is no, say which specific area is weak and redesign that area.

Related: `world-art-direction` governs whether worlds differ enough;
`responsive-motion-qa` governs how the checking is performed across viewports.
