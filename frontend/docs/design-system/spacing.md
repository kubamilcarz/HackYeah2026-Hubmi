# Splot spacing

Splot uses a 4px-based spacing scale expressed in `rem`. Use the semantic
tokens below in shared components and layout composition rather than introducing
one-off measurements.

| Token | Value | Typical use |
| --- | --- | --- |
| `--space-1`–`--space-3` | 4–12px | Inline icon and compact grouping gaps |
| `--space-4`–`--space-6` | 16–24px | Field, card, and related-content spacing |
| `--space-8`–`--space-10` | 32–40px | Section-internal separation |
| `--space-12` | 48px | Minimum primary touch target and icon control dimension |
| `--space-16` | 64px | Large page separation |

Controls may grow above their minimum at larger text scales. Prefer flex/grid
`gap` for grouped content, preserve vertical rhythm, and verify that no
one-dimensional layout needs horizontal scrolling at 400% zoom. The live
reference is `/design-system#fundamenty`.
