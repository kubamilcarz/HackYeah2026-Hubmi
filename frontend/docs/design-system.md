# Splot design system

## Purpose

The design system gives Splot one coherent, accessible interface across its
resident, NGO, local-government, and ROPS-admin experiences. It is mobile-first
for PWA use and responsive for desktop work. Components should make the next
step in a social-support journey clear, safe, and understandable.

## Foundations

- Use semantic CSS tokens from `app/globals.css`; do not introduce raw palette
  values into components. Tokens must work in light, dark, grayscale, and both
  high-contrast themes.
- Use the existing Geist font tokens, `rem` typography, unitless line heights,
  and responsive layouts that tolerate 200% in-product text scale and 400%
  browser zoom.
- Customer-facing copy is Polish by default. Prefer short, concrete labels and
  plain-language explanations of status, eligibility, privacy, and next steps.
- A primary touch control is at least 44 by 44 CSS pixels. Do not use colour,
  placement, or an icon alone to convey meaning.

## Component inventory

Build and document a component only when a product flow needs it. Keep its
public API small, semantic, and reusable; compose feature-specific UI from
these components rather than introducing look-alikes.

| Group | Components | Required contract |
| --- | --- | --- |
| Foundations | `Container`, `Stack`, `Cluster`, `Divider`, `Surface`, `VisuallyHidden` | Responsive layout primitives; no visual-only semantics. |
| Actions | `Button`, `IconButton`, `Link`, `ButtonLink` | Native button versus link semantics; loading/disabled states; accessible names. |
| Forms | `Field`, `TextInput`, `TextArea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `FileUpload`, `FormError` | Persistent label, hint/error association, validation state, keyboard use, and visible focus. |
| Feedback | `Alert`, `StatusBadge`, `InlineMessage`, `EmptyState`, `LoadingState`, `Toast` | Textual non-colour cue; announced status only when a change needs attention. |
| Content | `Card`, `List`, `MetadataList`, `Tag`, `Avatar`, `PageHeader` | Clear hierarchy; meaningful image alternatives; actions remain discoverable at enlarged text. |
| Navigation | `AppShell`, `Header`, `BottomNavigation`, `Breadcrumbs`, `Tabs`, `Pagination` | Landmark and current-page state; keyboard-operable; mobile and desktop navigation expose the same destinations. |
| Overlays | `Dialog`, `Drawer`, `Popover`, `Tooltip`, `Menu` | Use the matching interaction pattern; explicit dismissal and focus management. |
| Splot domain | `NeedCard`, `SolutionCard`, `OrganizationCard`, `MatchSummary`, `ContactAction`, `ModerationStatus` | Identify the subject, responsible organization, status, and safe next action without relying on colour. |
| Admin | `DataTable`, `FilterBar`, `BulkActionBar`, `AuditStatus` | Responsive alternative to dense tables; labelled filters; selection and result changes announced. |

## Adoption rules

- Start a feature with the smallest existing component composition that meets
  its needs. Promote a feature pattern into this inventory only after it is
  shared or clearly reusable.
- New component documentation must state its intent, native element/ARIA
  pattern, variants, states, responsive behaviour, and an accessibility test
  scenario.
- Do not use generic `div` click handlers, raw hex colours, fixed text
  containers, or CSS that disables the global focus treatment.
- Before changing foundations, review `accessibility-system.md`; its preference
  contract and semantic-token rules are authoritative.
