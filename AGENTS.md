# Splot

Splot is the digital heart of a local social hub: it connects needs with
solutions among NGOs, residents, and local-government units. ROPS staff
administer the platform. It is a mobile-first web application delivered in a
PWA form factor, while remaining fully effective on wider screens.

## Repository map

- `frontend/` is the Next.js 16 / React 19 client. Read `frontend/AGENTS.md`
  and the relevant frontend documentation before changing it.
- `backend/` is reserved for the Django API.
  Do not invent endpoints, models, or integrations before the product flow establishes them.

## Product and interface principles

- Design for trust, clarity, and action: people should be able to understand a
  need, assess the offered help, and take the next safe step without specialist
  knowledge.
- Treat residents, NGOs, local-government users, and ROPS administrators as
  distinct audiences. Never expose an administrative workflow as a public-user
  default.
- Use Polish for new customer-facing copy unless a route explicitly establishes
  another locale. Keep code, identifiers, and technical documentation in
  English.
- Build mobile-first, with touch-friendly controls and progressive enhancement
  for desktop—not separate mobile and desktop products.
- Accessibility is a product requirement. The baseline target is WCAG 2.2 AA;
  the floating preferences control complements, and never replaces, accessible
  defaults.

## Design-system governance

- Splot’s interface has a deliberate **warm civic clarity**: quiet blue-gray
  canvases, white rounded surfaces, gentle borders, generous space, trustworthy
  navy structure, and one dimensional emerald primary action at each decision
  point. It should feel calm and capable, never bureaucratic, clinical, or
  gamified.
- Start with the documented shared component that already solves the task; do
  not recreate a look-alike. The canonical catalog and public contracts are
  `frontend/docs/design-system/components.md`; `frontend/docs/design-system.md`
  gives the foundations and composition rules.
- The existing shared inventory is: actions (`Button`, `ButtonLink`,
  `IconButton`); forms (`TextField`, `TextAreaField`, `SearchField`,
  `SelectField`, `DateField`, `RadioGroup`, `CheckboxGroup`,
  `CheckboxChipGroup`, `SegmentedControl`, `Slider`, `Stepper`,
  `StepProgress`); feedback (`Alert`, `Banner`, `Toast`, `ToastViewport`,
  `Tag`, `Badge`, `LinearProgress`, `CircularProgress`); navigation
  (`AppNavigation`, `PageNavigationBar`, `Pagination`, `TabSwitcher`);
  composition (`PageHeader`, `SearchFilterBar`, `Dialog`); domain patterns
  (`QuickAction`, `ContentSection`, `ChallengeCard`, `RecommendationCard`,
  `NeedCard`, `SolutionCard`, `OrganizationCard`, `MatchSummary`,
  `ContactAction`, `ModerationStatus`, `ConnectionList`,
  `SolutionDetailHero`, `ExpandableDescription`,
  `SolutionInterestActions`, `FavoriteButton`, `DetailMetadataSection`,
  `SolutionDetailSidebar`, `KnowledgeResourceBrowser`); administration and
  place (`DataTable`, `Map`); and accessibility infrastructure
  (`AccessibilityProvider`, `useAccessibilityPreferences`,
  `AccessibilityMenu`).
- Use `skills/splot-design-system/SKILL.md` when an AI task changes or adds
  Splot UI. It routes to the authoritative documentation and records the
  product-specific decisions that generic framework guidance will miss.
- Update the catalog when a component becomes shared or its public contract
  changes. A shared component needs documented purpose, data/variants/states,
  responsive behaviour, semantic pattern, and at least one accessibility test.
- Read `frontend/docs/accessibility-system.md` for any frontend component or
  flow that affects interaction, content, theming, or layout. It is
  authoritative for the preference provider and appearance contract.
