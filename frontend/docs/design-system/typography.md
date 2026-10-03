# Splot typography

Splot uses the Geist font loaded in `app/layout.tsx`, with a system sans-serif
fallback. Typography tokens live in `app/globals.css` and use `rem` values so
the accessibility text-scale preference and browser zoom remain effective.

| Role | Web class | Default size / line height | Use |
| --- | --- | --- | --- |
| Page heading | `.type-h1` | 32 / 40px | One route heading |
| Section heading | `.type-h2` | 20 / 28px | Major content section |
| Card heading | `.type-h3` | 16 / 24px | Component and card title |
| Body | `.type-body` | 16 / 24px | Primary reading text |
| Caption | `.type-caption` | 14 / 20px | Supporting metadata only |
| Label | `.type-label` | 14 / 20px, semibold | Form labels and compact control labels |

Use semantic headings and paragraphs; the classes provide presentation only.
Use `label` elements for form labels and reserve `.type-label` for their visual
treatment. Do not use captions for critical instructions or errors. Layouts
must reflow at 200% in-product text scale and 400% browser zoom without clipped
labels or hidden actions. The live reference is `/design-system#typografia`.
