# Splot component catalog

This is the source of truth for all shared UI components in
`frontend/components/`. The live reference is `/design-system`. Public copy and
accessible names are Polish; component APIs and this technical documentation
are English. Files ending in `Showcase` demonstrate the system and are not
public primitives to compose in product routes.

## Actions, forms, and feedback

| Component | Source | Contract |
| --- | --- | --- |
| `Button`, `ButtonLink`, `IconButton` | `ui/Button.tsx` | `Button` and `IconButton` render native actions; `ButtonLink` renders navigation. All expose `primary`, `secondary`, `tertiary`, and `destructive` variants plus `sm`, `md`, and `lg` sizes. An icon-only action requires a Polish accessible `label`. |
| `Dialog` | `ui/Dialog.tsx` | Controlled native modal for explicit decisions; Escape/backdrop close it and focus returns to the trigger. |
| `PageNavigationBar`, `AppNavigation`, `Pagination` | `ui/PageNavigationBar.tsx`, `ui/AppNavigation.tsx`, `ui/Pagination.tsx` | `PageNavigationBar` is the compact authenticated top bar: an optional back action directly precedes an optional labelled GET search field; optional named icon actions and a profile link or named profile action follow it. It wraps search and controls at narrow widths. `AppNavigation` takes one `items` collection and renders the persistent sidebar. `Pagination` exposes either `onPageChange` for in-place paging or `getPageHref` for link navigation; it names page controls and marks the current page programmatically. |
| `TabSwitcher` | `ui/TabSwitcher.tsx` | Controlled or uncontrolled WAI-ARIA tab list for content already available in the current view. It exposes labelled `tablist`, native tab buttons and associated panels; Left/Right, Home and End move focus and activate an enabled tab. The horizontal list scrolls at narrow widths. |
| `TextField`, `TextAreaField`, `SearchField`, `SelectField`, `DateField` | `ui/FormControls.tsx` | Native labelled controls with associated help and error text. `TextAreaField` supports an optional visible character counter when `maxLength` is provided; it does not announce every keystroke. |
| `PageHeader`, `SearchFilterBar` | `ui/PageHeader.tsx`, `ui/SearchFilterBar.tsx` | `PageHeader` renders a semantic `header`, title and optional description; it defaults to `h1` and permits a lower heading level in a nested showcase. `SearchFilterBar` pairs a labelled controlled search input with a named native button that lets the parent open filters. |
| `RadioGroup`, `CheckboxGroup`, `CheckboxChipGroup`, `SegmentedControl` | `ui/FormControls.tsx` | Native grouped choices with fieldset/legend semantics. `CheckboxChipGroup` is a wrapping, multi-select category control with optional decorative icons and 44 px touch targets. |
| `Slider`, `Stepper` | `ui/FormControls.tsx` | Labelled numeric controls with visible value and keyboard operation. |
| `StepProgress` | `ui/FormControls.tsx` | Named ordered list of form steps with `currentStep`; it marks the current item with `aria-current="step"`, exposes text states for completed/current/upcoming steps, reflows vertically on small screens, and does not provide navigation. |
| `Alert`, `Banner`, `Toast`, `ToastViewport` | `ui/Alert.tsx`, `ui/Toast.tsx` | `Alert` is a live changed-status update; `Banner` is persistent contextual guidance and may link to a next step; `Toast` is transient. All have textual, icon-supported variants. `dismissible` is opt-in and exposes a named native button. |
| `Tag`, `Badge`, `LinearProgress`, `CircularProgress` | `ui/Tag.tsx`, `ui/Progress.tsx` | `Tag` is category/metadata display and can have an optional remove button. `Badge` is compact named status with a decorative semantic indicator. Both retain visible textual meaning and use `neutral`, `success`, `info`, `warning`, or `danger` variants. |

## Splot domain components

| Component | Required public data | Purpose |
| --- | --- | --- |
| `NeedCard` | title, summary, category, locality, update time, status, action | A resident need with enough context to assess and open it. |
| `SolutionCard` | title, summary, organization, category, availability, action; optional image, engagement, and match label | An NGO or public-service offer and its next step. Optional image requires meaningful Polish alt text; optional engagement exposes likes and matches as labelled context. An optional match label makes a local relevance score explicit in matching flows. |
| `SolutionDetailHero` | image, title, summary; optional match label and heading level | Detail-page hero with one meaningful image, heading and plain-language introduction. It stacks on mobile and becomes two columns on wide screens. |
| `ExpandableDescription` | description; optional preview length and Polish labels | Client-side in-place disclosure for longer supporting descriptions. The native button exposes its expanded state and controls the description paragraph. |
| `SolutionInterestActions`, `FavoriteButton` | optional default local state | Local-only demo controls for interest and saved state. `FavoriteButton` is a named icon button and both controls expose `aria-pressed`; persistence is intentionally outside these primitives. |
| `DetailMetadataSection`, `SolutionDetailSidebar` | section title and labelled metadata items; sidebar children | Supplementary detail groups using a heading plus definition list. Metadata values can compose existing `Tag` and `Badge` components. |
| `OrganizationCard` | name, organization type, locality, service tags, action | A responsible organization and its areas of help. |
| `MatchSummary` | need title, match count, summary, action | A compact explanation of available matches. |
| `ContactAction` | organization, contact method, safety note, action | A safe, explicit route into organization contact. |
| `ConnectionList` | aria label, entries with name, organization, tags, and action; optional avatar | Headerless directory for comparable people or organisations. Each semantic list row keeps profile context, areas of activity and one named navigational contact action. |
| `ModerationStatus` | label, semantic variant, description | ROPS-only status context; never a public-user default. |
| `QuickAction` | href, label, icon, variant | Prominent resident discovery link with a visible Polish label and supplementary icon. |
| `ContentSection` | title, action, children; optional description | Section heading, “show all” link, and labelled horizontally scrollable discovery content. |
| `ChallengeCard` | href, title, solution count, image | Compact whole-card link for a regional challenge; image needs meaningful Polish alt text. |
| `RecommendationCard` | href, title, organization, image; optional category | Compact whole-card recommendation link; image needs meaningful Polish alt text. |

All card actions are links because they navigate to a detail or contact route.
The components render semantic article/aside/status structures, retain visible
focus, and reflow from one column on mobile to richer layouts on wider screens.

`PageNavigationBar` accessibility test: with keyboard only, confirm the back
button, search field, submit action, every utility action, and profile link are
reachable in that order with visible focus; at 400% zoom, the wrapped controls
remain visible and the search field keeps its associated Polish label.

## Admin and geographic information

| Component | Source | Contract |
| --- | --- | --- |
| `DataTable` | `ui/DataTable.tsx` | Searchable and sortable native table with Polish labels and empty state. Optional `selectable` adds named native row/select-all checkboxes; `cellKind: "status"` plus `statusVariants` renders a textual `Badge` status. It scrolls horizontally on narrow screens rather than dropping data. |
| `Map` | `ui/Map.tsx` | Desktop map plus keyboard-accessible organization list and in-map selected-detail card. The list remains available when map configuration fails. |

## Knowledge resource patterns

| Component | Source | Contract |
| --- | --- | --- |
| `KnowledgeResourceBrowser` | `ui/KnowledgeResourceBrowser.tsx` | Client-side knowledge-hub composition of `PageHeader`, `SearchFilterBar`, `TabSwitcher`, `Dialog`, `CheckboxChipGroup`, `Button`, and `Tag`. Its current in-memory resources are reference data; product routes provide real data and persistence outside this component. |

- `PageHeader` is a static semantic `header`; use its default `h1` once per
  route. Set `headingLevel` only when demonstrating it inside an existing
  heading hierarchy. Its title and description wrap naturally at enlarged text.
- `SearchFilterBar` is a client composition for controlled searches. It keeps
  the input label visible and moves its named filter action below the field on
  narrow screens; on wider screens the action remains beside it.
- `TabSwitcher` uses native `button` elements with `tablist`, `tab` and
  `tabpanel` roles. It supports enabled, selected and disabled states and
  automatic keyboard activation. Test a horizontally overflowing tab list at
  400% zoom with Arrow keys, Home and End, then confirm the visible focus ring,
  selected label and panel relationship in every supported appearance mode.
- `ConnectionList` is a native list rather than a table because its content
  has no column headings. Its avatar is decorative when adjacent text names
  the entry; rows stack profile, tags and action on mobile, then form clear
  columns on wider screens. Test its action links and tag wrapping at 400% zoom.

## Accessibility infrastructure

| Component | Source | Contract |
| --- | --- | --- |
| `AccessibilityProvider`, `useAccessibilityPreferences` | `accessibility/AccessibilityProvider.tsx` | Sole owner of appearance, text-scale, and link-underlining persistence. |
| `AccessibilityMenu` | `accessibility/AccessibilityMenu.tsx` | Polish global preference launcher; preserve documented keyboard, focus, speech, and reset behavior. |

## Reference-only compositions

`ControlsShowcase`, `DiscoveryShowcase`, `FeedbackShowcase`, `NavigationShowcase`,
`PaginationShowcase`, and `SolutionDetailShowcase` exist only to demonstrate
the public primitives on `/design-system`. Do not import them into product
routes; use the components they compose instead.
