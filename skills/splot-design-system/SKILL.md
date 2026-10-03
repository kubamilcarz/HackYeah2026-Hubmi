---
name: splot-design-system
description: Build or review Splot frontend UI using the established component catalog, warm civic visual language, and WCAG 2.2 AA contract. Use for Splot interface, design-system, layout, theme, or interaction work; not backend-only tasks.
---

# Splot design system

Splot is a mobile-first PWA social hub. It helps residents, NGOs, and local
government connect needs with solutions; ROPS staff use separate administrative
workflows. Produce public-facing Polish copy unless the route establishes
another locale.

## Read before changing UI

1. Read `AGENTS.md` and `frontend/AGENTS.md`.
2. Read `frontend/docs/design-system.md` and the canonical component catalog at
   `frontend/docs/design-system/components.md`.
3. Read `frontend/docs/accessibility-system.md` for any component, layout,
   interaction, token, theme, or preference change.

## Splot’s visual and product voice

Create **warm civic clarity**: quiet blue-gray canvas, white rounded surfaces,
gentle borders, generous whitespace, navy structure and headings, and one
dimensionally emerald primary action for each decision. Use yellow and orange
only to support attention, never as routine text-on-white action fills.

The interface must feel trustworthy, human, and action-oriented. Make the
subject, responsible organization, status, and safe next step plain. Do not
turn a public flow into an ROPS workflow; do not make it feel like a generic
analytics dashboard, a clinical portal, or a gamified consumer product.

## Composition rules

- Reuse a catalogued component before creating a new visual pattern. The
  catalog names every public component and its contract; `*Showcase` files are
  reference-only and do not belong in product routes.
- Use semantic CSS tokens from `frontend/app/globals.css`, never raw palette
  values or component-specific theme overrides.
- Use a native link for navigation and a native button for an in-place action.
  Prefer native HTML over ARIA and only add ARIA where native semantics cannot
  describe the interaction.
- Build mobile-first, then adapt the same information architecture to larger
  screens. Preserve the primary action and content at enlarged text and 400%
  browser zoom.
- Keep client boundaries narrow. Use server components by default; add
  `"use client"` only for browser APIs or real client interaction.

## Non-negotiable checks

- Polish visible labels and accessible names; concise, concrete, plain-language
  wording for status, eligibility, privacy, and next steps.
- Visible focus, keyboard access, meaningful labels/hints/errors, and a 44 CSS
  pixel default target for primary touch controls.
- Textual non-colour status cues; meaningful image alt text or empty alt for
  decorative images.
- Verify the relevant light, dark, grayscale, high-contrast, reduced-motion,
  forced-colours, keyboard, touch, and reflow states. The accessibility menu
  supplements accessible defaults and is never the only accessibility route.
- Do not create another preference store. `AccessibilityProvider` owns
  appearance, text scale, and link underlining.

When a new shared component is genuinely warranted, document its purpose,
public data/variants/states, responsive behaviour, native semantic pattern,
and an accessibility test scenario in `frontend/docs/design-system/components.md`.
