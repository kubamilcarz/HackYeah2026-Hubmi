<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Splot frontend rules

- This is the mobile-first PWA frontend for Splot, a social hub that connects
  residents', NGOs', and local-government units' needs with solutions. ROPS
  staff administer the hub. Read the repository-root `AGENTS.md` for shared
  product context.
- Use Polish for customer-facing copy unless the route establishes another
  locale. Keep source code and technical documentation in English.
- Read `docs/design-system.md` before adding or changing shared UI. Reuse its
  components and semantic tokens; use `docs/design-system/components.md` for
  the complete component catalog and public contracts. Update the catalog when
  a shared component or its public contract changes.
- Read `docs/accessibility-system.md` before modifying UI, layout, theme,
  interaction, or accessibility preferences. WCAG 2.2 AA is the baseline.
- Preserve Splot’s warm civic clarity: blue-gray canvas, white rounded
  surfaces, gentle borders, generous spacing, navy structure, and one
  dimensionally emerald primary action per decision. The UI should help people
  act together—not resemble a generic dashboard, a government form, or a
  consumer-growth product.
- Reuse the appropriate inventory group before creating a new component:
  actions (`Button`, `ButtonLink`, `IconButton`); fields and choices
  (`TextField`, `TextAreaField`, `SearchField`, `SelectField`, `DateField`,
  `RadioGroup`, `CheckboxGroup`, `CheckboxChipGroup`, `SegmentedControl`,
  `Slider`, `Stepper`, `StepProgress`); feedback (`Alert`, `Banner`, `Toast`,
  `ToastViewport`, `Tag`, `Badge`, `LinearProgress`, `CircularProgress`);
  navigation (`AppNavigation`, `PageNavigationBar`, `Pagination`,
  `TabSwitcher`); page/overlay (`PageHeader`, `SearchFilterBar`, `Dialog`);
  domain (`QuickAction`, `ContentSection`, `ChallengeCard`,
  `RecommendationCard`, `NeedCard`, `SolutionCard`, `OrganizationCard`,
  `MatchSummary`, `ContactAction`, `ModerationStatus`, `ConnectionList`,
  `SolutionDetailHero`, `ExpandableDescription`,
  `SolutionInterestActions`, `FavoriteButton`, `DetailMetadataSection`,
  `SolutionDetailSidebar`, `KnowledgeResourceBrowser`); ROPS/location
  (`DataTable`, `Map`); and root accessibility (`AccessibilityProvider`,
  `useAccessibilityPreferences`, `AccessibilityMenu`).
- For AI-assisted UI work, follow the repository-local
  `../skills/splot-design-system/SKILL.md` alongside these rules.
- Prefer server components. Add `"use client"` only for browser APIs or actual
  client interaction, and keep client boundaries narrow.
- Preserve native HTML semantics. Choose a link for navigation and a button for
  an action; use ARIA only to supply behaviour native HTML cannot provide.
- Support keyboard operation, visible focus, touch targets of at least 44 CSS
  pixels for primary actions, enlarged text, browser zoom, reduced motion,
  forced colours, and every documented accessibility theme.
