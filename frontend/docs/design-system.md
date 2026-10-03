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
- Splot's palette is navy `#062340`, deep emerald `#007A55`, yellow `#FFC107`, orange
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
small, purposeful set of semantic roles: display heading (`.type-display`),
page heading (`.type-h1`), section heading (`.type-h2`), card heading
(`.type-h3`), body (`.type-body`), caption (`.type-caption`), and label
(`.type-label`). Use semantic HTML first; these classes apply the visual role
and do not replace `h1`–`h6`, `p`, or `label`. Use the display role only for a
public-page hero; it does not permit more than one semantic route `h1`.

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
| Actions | `Button`, `ButtonLink`, `IconButton` | `Button` and `IconButton` are native actions; `ButtonLink` is navigation. All support `sm`, `md`, and `lg`; icon-only controls require an accessible Polish label. |
| Forms | `TextField`, `SearchField`, `SelectField`, `DateField`, `RadioGroup`, `CheckboxGroup`, `SegmentedControl`, `Slider`, `Stepper` | Persistent label, hint/error association, validation state, keyboard use, and visible focus. |
| Feedback | `Alert`, `Banner`, `Toast`, `Tag`, `Badge`, `LinearProgress`, `CircularProgress` | Textual non-colour cue; use alerts for changed status, contextual banners for persistent guidance, tags for metadata, and badges for compact named status. |
| Navigation | `AppNavigation`, `PageNavigationBar`, `Pagination` | Landmark and current-page state; mobile and desktop expose the same destinations. |
| Overlays | `Dialog` | Native modal for an explicit decision with dismissal and focus restoration. |
| Splot domain | `QuickAction`, `ContentSection`, `ChallengeCard`, `RecommendationCard`, `NeedCard`, `SolutionCard`, `OrganizationCard`, `MatchSummary`, `ContactAction`, `ModerationStatus` | Identify the subject, responsible organization, status, and safe next action without relying on colour. |
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
- Use the action hierarchy consistently: dimensional emerald primary actions,
  green outlined secondary actions, neutral outlined tertiary actions, and
  pale-red destructive actions. Disabled controls are deliberately quiet and
  must retain their native disabled state.
- Before changing foundations, review `accessibility-system.md`; its preference
  contract and semantic-token rules are authoritative.

## Feedback and status patterns

- `Alert` is a short, icon-supported status update. Use `success`, `info`,
  `warning`, or `danger` with a concrete Polish title and explanation. It uses
  a polite live region by default and an assertive one for errors; use it only
  when the content has changed and needs attention.
- `Banner` is persistent, in-context guidance rather than a routine live
  announcement. It can include one navigational action. Both feedback
  components may expose an opt-in, named dismiss button; do not make required
  task information dismissible by default.
- `Tag` labels a category or feature. It supports the same semantic variants
  plus an optional native remove button. `Badge` names a compact status and
  adds a decorative variant indicator; the visible Polish label remains the
  meaning. Neither component is interactive unless its explicit control is
  rendered.
- Feedback and status patterns stack and wrap without clipping at enlarged text
  or 400% zoom. Verify a dismissible alert with keyboard focus and each pattern
  in light, dark, grayscale, high-contrast, and forced-colors modes.

## Tables

- `DataTable` is the ROPS pattern for searchable, sortable records. It keeps a
  native table at every width and permits horizontal scrolling rather than
  hiding columns on narrow screens.
- Set `selectable` only when a following bulk action is available. Its native
  row and select-all checkboxes have Polish names and maintain selection while
  filtering or sorting.
- A column with `cellKind: "status"` renders the existing `Badge` component.
  Map visible status text to a semantic variant through `statusVariants`; do
  not make the colour or indicator its sole meaning.

## Pagination

- `Pagination` renders a named `nav` with an ordered page list, current-page
  state, previous/next controls, and non-interactive ellipses for omitted page
  ranges. It uses either `onPageChange` for in-place content updates or
  `getPageHref` for URL navigation.
- The current page uses `aria-current="page"`; every control has a Polish
  accessible name. Boundary controls are visibly and programmatically disabled.
- Keep the control group horizontally scrollable at narrow widths and enlarged
  text. Do not remove the current page or previous/next controls on mobile.

## Splot cards

- Domain cards identify the subject, owner, plain-language status, useful
  context, and one safe next action. Status always has a text label; its badge
  indicator is supplementary.
- `SolutionCard` supports an optional meaningful `image` (`src` and Polish
  `alt`) and optional `engagement` counts for likes and matches. Use the image
  only when it helps a visitor assess the offer; it must not replace the title
  or summary.
- Card actions are links because they lead to details or contact. The outlined
  action treatment remains at least 44 CSS pixels tall and the card reflows as
  a single column at narrow widths and enlarged text.

## Resident discovery

- `QuickAction` is a prominent resident link to a primary discovery task. It
  pairs a visible Polish label with an icon and uses a semantic visual variant;
  colour never communicates the action alone.
- `ContentSection` groups a heading, an explicit “show all” link, and an
  intentionally horizontally scrollable card strip. The full collection link
  remains available without horizontal scrolling.
- `ChallengeCard` names a regional challenge and its visible solution count.
  `RecommendationCard` names a proposed solution, its organization, and
  optional category. Both use meaningful local imagery and are whole-card
  links.
