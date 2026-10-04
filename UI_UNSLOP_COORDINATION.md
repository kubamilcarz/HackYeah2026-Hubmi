# UI Unslop Coordination

Temporary working ledger for simplifying the UI introduced across Modules I–VII.
Delete this file when the cleanup is complete or move the useful decisions into
the relevant design-system documentation.

## Working agreement

- Work one vertical slice at a time. Do not combine unrelated route cleanups.
- Preserve the existing backend contracts unless the slice explicitly includes
  an API change.
- Reuse the shared Splot UI inventory before introducing another pattern.
- Keep public copy in Polish, preserve native semantics, keyboard operation,
  visible focus, 44 px primary targets, reflow, and all supported appearance
  modes.
- Each slice should leave its route linted, type-checked, and manually checked
  at mobile width plus enlarged text / 400% zoom.

## Slice backlog

| # | Slice | Scope | Main files | Status | Owner / notes |
| --- | --- | --- | --- | --- | --- |
| 0 | Shell and personas | Simplify the global demo-profile bar and modal; remove page-level coupling where possible. | `HubShell`, `PersonaSwitcherModal`, `PersonaContext`, `globals.css` | Complete | Demo-profile switching lives in the top bar; chooser uses native radios and admin navigation follows the active role. |
| 1 | Module I — matchmaking | Need-report wizard and solution matcher: consolidate result, loading, error, gap, and dialog patterns. | `NeedReportFlow`, `SolutionMatcher`, `globals.css` | Complete | Shared Biała plama outcome, query-edit dialog, explicit error state, and response-aware loading are validated. |
| 2 | Module II — knowledge and region | Innovation library/detail and regional challenges; consolidate filters, cards, tabs, and white-spot treatment. | `InnovationLibraryView`, `InnovationDetailView`, `ChallengesRegionalView` | Complete | Uses the shared search/filter bar and Biała plama outcome; innovation library/detail are now token-based responsive compositions. |
| 3 | Module III — creator | Entry-mode choice, quick note, FERS wizard, concept diagram, and printable grant output. | `IdeaCreatorView`, `IdeaQuickNoteForm`, `FersGrantWizard`, `ConceptDiagramView`, `FersPrintView` | Not started | |
| 4 | Module IV — tester | Pilot discovery, recruitment, evaluation, details, and create-pilot flows. | `PilotTesterView` | Complete | Discovery-first public flow; create-pilot remains coordinator-only. |
| 5 | Module V — communication | Partnerships, ROPS questions, FAQ, and expert-duty workflows. | `ContactPartnershipsView` | Complete | Cross-sector partnership exchange, ROPS consultation form, knowledge-base FAQ, and expert duty queue consolidated into token-based responsive components. Ad-hoc Tailwind utility classes replaced with Splot design tokens, bureaucratic branding eliminated, and persona state sync refactored. |
| 6 | Module VI — ROPS administration | Moderation, FERS review, innovation advancement, trends/report, and inquiries. | `AdminDashboardView`, `app/admin/page.tsx`, `globals.css` | Complete | ROPS-only workflow with explicit coordinator verification and preview mode. Ad-hoc Tailwind utility classes replaced with Splot tokens in `globals.css`. Integrated shared `DataTable` for counties breakdown with sorting and search, added dynamic county filtering in moderation, polished all 5 modals and regional print report. |
| 7 | Module VII — municipal middleman | Municipal implementation package generator, service standards, staffing, 70/15/15 funding montage, and council resolutions. | `MiddlemanView`, `app/middleman/page.tsx`, `globals.css` | Complete | JST / CUS workflow. Eliminated duplicate intro card and "Moduł VII" jargon. Replaced raw ad-hoc classes with semantic tokens (`.middleman-card`, `.middleman-kpi-grid`, `.middleman-staffing-card`, `.middleman-funding-card`, `.middleman-catalog-card`). Fixed persona render state sync and added transient Toast feedback. |

## Current inventory by module

### Module I

- Demo persona bar and persona-switcher modal in the shared shell.
- Expanded need-report flow: form, validation, loading, match results, and
  “Biała plama” outcome.
- Expanded solution matcher: prompt, processing state, carousel results, gap
  outcome, and query-edit dialogs.

### Module II

- Innovation library route and browse/filter experience.
- Innovation-detail presentation: four tabs, metadata, implementation,
  video/transcript, and downloads.
- Regional challenges route: county, challenge, and trends / white-spots tabs.
- Navigation additions for the innovation library and regional challenges.

### Module III

- Idea-creator mode choice and fast idea note.
- Five-step, twelve-point FERS grant wizard with assistive actions.
- Concept diagram and a print-oriented FERS output.

### Module IV

- Pilot overview and filters.
- Pilot cards plus recruitment, evaluation, detail, and creation dialogs.

### Module V

- Partnership exchange, filters, offer creation, and reply flow.
- ROPS consultation form, FAQ browser, and expert-duty queue.
- Navigation additions for creator, tester, middleman, and contact routes.

### Module VI

- ROPS-only admin route and overview metrics.
- Tabs for need moderation, FERS review, innovation maturity, trends/report,
  and inquiries, with supporting dialogs.

### Module VII

- Municipal implementation package configurator: innovation choice, county/municipality parameters, CUS status, and delivery model (własny / hybrydowy / zlecenie NGO).
- 5-part implementation package results: service standard (WCAG, SLA, KPI), staffing & competencies, budget & cost breakdown, 70/15/15 funding montage (FERS/PFRON/JST), and draft municipal council resolution.
- Saved implementation packages library with export and printable output.

## Definition of done for a slice

- [ ] Information architecture and one primary next action are clear.
- [ ] Repeated markup is composed from catalogued components or a documented
      shared component.
- [ ] Raw palette values / ad-hoc visual utilities are replaced with semantic
      Splot tokens where practical.
- [ ] Loading, empty, error, success, and permission states are intentional.
- [ ] Native controls and landmarks are used; focus, labels, and status
      announcements are verified by keyboard.
- [ ] Mobile, enlarged-text, 400% zoom, dark/high-contrast, reduced-motion,
      and forced-colours behavior has been checked where the slice is affected.
- [ ] Typecheck/lint passes and the coordinating row above is updated.

## Change log

| Date | Slice | Decision / outcome | Follow-up |
| --- | --- | --- | --- |
| 2026-10-04 | Audit | Baseline inventory created from commits `6a96be6` through `fb557e5`, plus relevant follow-up UI commits. | Start with slice 0 or 1. |
| 2026-10-04 | Shell and personas | Consolidated demo-profile switching into the persistent top-bar profile control; chooser now uses native radio inputs and the admin navigation no longer appears merely because the current route is `/admin`. | Run lint/typecheck and inspect at mobile and enlarged-text widths. |
| 2026-10-04 | Module I — matchmaking | Consolidated the Biała plama outcome, query-edit dialog, and matcher states. The matcher now waits for its API response before displaying results, gives failures an explicit retry/browse path, and treats a zero-result response as a gap. Match-result tokens no longer use raw palette values. | Scoped lint and TypeScript checks pass. |
| 2026-10-04 | Module II — knowledge and region | Consolidated the library search with `SearchFilterBar`, restored responsive token-based library/detail layouts, corrected selection semantics in regional master-detail lists, and use a clear Biała plama outcome instead of unrelated fallback innovations. | Production build remains blocked by the local Turbopack helper-port restriction; scoped lint and TypeScript checks pass. |
| 2026-10-04 | Module IV — tester | Unslopped tester: removed "Moduł IV" and bureaucratic branding across PilotTesterView, HubShell, AdminDashboardView, NeedReportFlow, and PersonaContext. Replaced compressed single-line code with clean structured React components, removed redundant duplicate intro banners in favor of a clean coordinator bar, added automatic selection and modal opening when navigating via ?innovation=, loaded dynamic county options, and aligned copy to "Pilotaże społeczne". | Scoped lint and TypeScript checks pass. |
| 2026-10-04 | Module V — communication | Unslopped communication: removed "Moduł V" and bureaucratic jargon across ContactPartnershipsView, HubShell, and AdminDashboardView. Converted inline raw Tailwind styling into semantic Splot tokens in globals.css, refactored persona form initialization to fix react-hooks/set-state-in-effect and removed any types, aligned page copy to "Współpraca i kontakt z ekspertami", and polished all 4 tabs (Giełda partnerstw, Konsultacje ROPS, Baza wiedzy FAQ, Dyżur eksperta). | Scoped lint and TypeScript checks pass. |
| 2026-10-04 | Module VI — ROPS administration | Unslopped ROPS administration: replaced raw Tailwind palette classes with semantic design tokens in `globals.css` (`.admin-coordinator-bar`, `.admin-kpi-card`, `.admin-card`, `.admin-callout`, `.admin-stat-summary`, `.admin-categories-grid`, `.admin-innovation-card`, `.admin-white-spots-banner`, `.admin-report-sheet`). Integrated shared `DataTable` for counties table with accessible sorting and search. Connected county filtering in moderation tab using dynamic counties. Polished modal dialogs (moderation, FERS evaluation, innovation advancement, inquiries answer, print report) with explicit aria-labels and keyboard navigation. Aligned copy with warm civic clarity. | Scoped lint and TypeScript checks pass. |
| 2026-10-04 | Module VII — municipal middleman | Unslopped and decluttered municipal middleman: removed duplicate intro banner, repetitive KPI/progress/breakdown duplication, and dark hacker-like terminal box. Replaced with clean civic document layout: compact 1-row montage summary (`.middleman-montage-summary`), 3-tab structured package details (Plan i procedura, Finanse i kadra, Wzór uchwały jako czysty dokument papierowy `.middleman-paper-document`), discrete demo profile buttons, and streamlined 2-column configurator. Fixed persona state sync and linting warnings. | Scoped lint and TypeScript checks pass. |
