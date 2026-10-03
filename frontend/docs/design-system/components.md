# Splot component catalog

This is the source of truth for shared UI primitives in `frontend/components/`.
The live reference is `/design-system`. Public copy and accessible names are
Polish; component APIs and this technical documentation are English.

## Actions, forms, and feedback

| Component | Source | Contract |
| --- | --- | --- |
| `Button`, `ButtonLink`, `IconButton` | `ui/Button.tsx` | `Button` and `IconButton` render native actions; `ButtonLink` renders navigation. All expose `primary`, `secondary`, `tertiary`, and `destructive` variants plus `sm`, `md`, and `lg` sizes. An icon-only action requires a Polish accessible `label`. |
| `Dialog` | `ui/Dialog.tsx` | Controlled native modal for explicit decisions; Escape/backdrop close it and focus returns to the trigger. |
| `PageNavigationBar`, `AppNavigation` | `ui/PageNavigationBar.tsx`, `ui/AppNavigation.tsx` | Responsive navigation with landmarks and current-page state. |
| `TextField`, `SearchField`, `SelectField`, `DateField` | `ui/FormControls.tsx` | Native labelled controls with associated help and error text. |
| `RadioGroup`, `CheckboxGroup`, `SegmentedControl` | `ui/FormControls.tsx` | Native grouped choices with fieldset/legend semantics. |
| `Slider`, `Stepper` | `ui/FormControls.tsx` | Labelled numeric controls with visible value and keyboard operation. |
| `Alert`, `Banner`, `Toast`, `ToastViewport` | `ui/Alert.tsx`, `ui/Toast.tsx` | `Alert` is a live changed-status update; `Banner` is persistent contextual guidance and may link to a next step; `Toast` is transient. All have textual, icon-supported variants. `dismissible` is opt-in and exposes a named native button. |
| `Tag`, `Badge`, `LinearProgress`, `CircularProgress` | `ui/Tag.tsx`, `ui/Progress.tsx` | `Tag` is category/metadata display and can have an optional remove button. `Badge` is compact named status with a decorative semantic indicator. Both retain visible textual meaning and use `neutral`, `success`, `info`, `warning`, or `danger` variants. |

## Splot domain components

| Component | Required public data | Purpose |
| --- | --- | --- |
| `NeedCard` | title, summary, category, locality, update time, status, action | A resident need with enough context to assess and open it. |
| `SolutionCard` | title, summary, organization, category, availability, action | An NGO or public-service offer and its next step. |
| `OrganizationCard` | name, organization type, locality, service tags, action | A responsible organization and its areas of help. |
| `MatchSummary` | need title, match count, summary, action | A compact explanation of available matches. |
| `ContactAction` | organization, contact method, safety note, action | A safe, explicit route into organization contact. |
| `ModerationStatus` | label, semantic variant, description | ROPS-only status context; never a public-user default. |

All card actions are links because they navigate to a detail or contact route.
The components render semantic article/aside/status structures, retain visible
focus, and reflow from one column on mobile to richer layouts on wider screens.

## Admin and geographic information

| Component | Source | Contract |
| --- | --- | --- |
| `DataTable` | `ui/DataTable.tsx` | Searchable and sortable native table with Polish labels and empty state. Optional `selectable` adds named native row/select-all checkboxes; `cellKind: "status"` plus `statusVariants` renders a textual `Badge` status. It scrolls horizontally on narrow screens rather than dropping data. |
| `Map` | `ui/Map.tsx` | Map plus keyboard-accessible organization list and selected-detail area. The list remains available when map configuration fails. |

## Accessibility infrastructure

| Component | Source | Contract |
| --- | --- | --- |
| `AccessibilityProvider`, `useAccessibilityPreferences` | `accessibility/AccessibilityProvider.tsx` | Sole owner of appearance, text-scale, and link-underlining persistence. |
| `AccessibilityMenu` | `accessibility/AccessibilityMenu.tsx` | Polish global preference launcher; preserve documented keyboard, focus, speech, and reset behavior. |
