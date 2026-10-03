# Splot color foundations

Splot uses a quiet civic palette. Navy (`#062340`) provides structure and
headings; green (`#16A34A`) identifies the primary next action. Yellow
(`#FFC107`) and orange (`#FF7A00`) are attention signals, never normal text or
white-text action fills.

## Token contract

Components consume semantic tokens only:

```text
--surface-*  --content-*  --border-*  --action-*  --navigation-*  --feedback-*  --focus-ring
```

The default light theme uses a blue-gray canvas, white raised surfaces, navy
content, green primary actions, and a navy focus ring. The primary-action
foreground is navy at rest and white for darker hover/pressed states. Danger is
kept separate from brand green.

Navigation uses `--navigation-active-surface`, `--navigation-active-content`,
and `--navigation-active-indicator` for the current destination. These tokens
are mapped in every appearance mode; components must not create their own
selected-state palette.

Dark mode uses deep navy surfaces, white/blue-gray content, and a lighter green
action treatment. Grayscale and both high-contrast themes intentionally remap
the same semantic tokens instead of applying a filter. In forced-colors mode,
system colors take precedence.

## Accessibility rules

- Use color as supporting context only: statuses also need visible text and an
  icon or programmatic state where appropriate.
- Normal text must meet 4.5:1 contrast; focus indicators and required control
  boundaries must meet 3:1 contrast.
- Keep inline links underlined. Do not remove the focus outline or create
  component-specific palette overrides.
- Verify the four configured appearance modes plus forced-colors when changing
  a semantic token or interaction state.

The live palette reference is `/design-system#fundamenty`; the implementation
maps are in `app/globals.css`.
