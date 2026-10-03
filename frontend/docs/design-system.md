# Splot design system

## Purpose

The design system gives Splot one coherent, accessible interface across its
resident, NGO, local-government, and ROPS-admin experiences. It is mobile-first
for PWA use and responsive for desktop work. Components should make the next
step in a social-support journey clear, safe, and understandable.

## Foundations

- Use semantic CSS tokens from `app/globals.css`; do not introduce raw palette
  values into components. Tokens must work in light, deep-navy dark, grayscale,
  and both high-contrast themes.
- Splot's palette is navy `#062340`, green `#16A34A`, yellow `#FFC107`, orange
  `#FF7A00`, white `#FFFFFF`, and the documented blue-gray neutral scale.
  Navy provides structure and headings; accessible green-derived action tokens
  power primary CTAs and selection. Yellow and orange are attention colours,
  not text-on-white action fills. Light green is reserved until its canonical
  brand value is supplied.
- Use the existing Geist font tokens, `rem` typography, unitless line heights,
  and responsive layouts that tolerate 200% in-product text scale and 400%
  browser zoom.
- Customer-facing copy is Polish by default. Prefer short, concrete labels and
  plain-language explanations of status, eligibility, privacy, and next steps.
- A primary touch control is at least 44 by 44 CSS pixels. Do not use colour,
  placement, or an icon alone to convey meaning.

## Typography

Splot uses Geist with a system sans-serif fallback. The web type scale is a
small, purposeful set of semantic roles: page heading (`.type-h1`), section
heading (`.type-h2`), card heading (`.type-h3`), body (`.type-body`), caption
(`.type-caption`), and label (`.type-label`). Use semantic HTML first; these
classes apply the visual role and do not replace `h1`–`h6`, `p`, or `label`.

All sizes use `rem` tokens and unitless line heights where a component needs a
custom value. This keeps Splot readable with its text-scale preference and at
400% browser zoom. See [the full typography reference](design-system/typography.md)
for the role table and usage constraints.

## Component inventory

Build and document a component only when a product flow needs it. Keep its
public API small, semantic, and reusable; compose feature-specific UI from
these components rather than introducing look-alikes.

| Group | Components | Required contract |
| --- | --- | --- |
| Actions | `Button`, `IconButton` | Native button actions; icon-only controls require an accessible Polish label. |
| Forms | `TextField`, `SearchField`, `SelectField`, `DateField`, `RadioGroup`, `CheckboxGroup`, `SegmentedControl`, `Slider`, `Stepper` | Persistent label, hint/error association, validation state, keyboard use, and visible focus. |
| Feedback | `Alert`, `Banner`, `Toast`, `Tag`, `Badge`, `LinearProgress`, `CircularProgress` | Textual non-colour cue; announce only status changes that need attention. |
| Navigation | `AppNavigation`, `PageNavigationBar` | Landmark and current-page state; mobile and desktop expose the same destinations. |
| Overlays | `Dialog` | Native modal for an explicit decision with dismissal and focus restoration. |
| Splot domain | `NeedCard`, `SolutionCard`, `OrganizationCard`, `MatchSummary`, `ContactAction`, `ModerationStatus` | Identify the subject, responsible organization, status, and safe next action without relying on colour. |
| Admin and location | `DataTable`, `Map` | Responsive table alternative and map/list pairing; labelled filters and accessible location list. |

## Adoption rules

- Start a feature with the smallest existing component composition that meets
  its needs. Promote a feature pattern into this inventory only after it is
  shared or clearly reusable.
- New component documentation must state its intent, native element/ARIA
  pattern, variants, states, responsive behaviour, and an accessibility test
  scenario.
- Do not use generic `div` click handlers, raw hex colours, fixed text
  containers, or CSS that disables the global focus treatment.
- Aim for warm civic clarity: quiet neutral canvases, white rounded surfaces,
  gentle borders, generous space, and one visually dominant green action per
  decision point.
- Before changing foundations, review `accessibility-system.md`; its preference
  contract and semantic-token rules are authoritative.
