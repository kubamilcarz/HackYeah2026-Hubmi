# Splot

Splot is the digital heart of a local social hub: it connects needs with
solutions among NGOs, residents, and local-government units. ROPS staff
administer the platform. It is a mobile-first web application delivered in a
PWA form factor, while remaining fully effective on wider screens.

## Repository map

- `frontend/` is the Next.js 16 / React 19 client. Read `frontend/AGENTS.md`
  and the relevant frontend documentation before changing it.
- `backend/` is the Django 6.1 + DRF 3.18 API. Read `backend/AGENTS.md` for
  the full domain map (13 models, 20 serializers, 34+ endpoints), demo
  personas, and developer commands. Read `backend/GEMINI.md` for
  hackathon-scope constraints (SQLite, no Docker, no auth overhead). Do not
  duplicate or contradict existing models, endpoints, or scoring logic without
  reading the established code first.
- `skills/splot-design-system/` contains the AI skill for composing Splot UI.
  Use it for any frontend interface, design-system, layout, theme, or
  interaction work.

## Backend modules (established)

The backend implements seven ROPS Kraków modules across `backend/api/`. Consult
`backend/AGENTS.md` for the complete model, view, and endpoint reference before
adding or changing backend code.

1. **Matchmaking Społeczny** — Hybrid scoring engine pairing problems with ROPS
   innovations; detects "Białe plamy" (innovation gaps) when score < 45%.
   `POST /api/matchmaking/analyze/`
2. **Zasobnik Wiedzy i Trendy** — Knowledge catalog of social innovations with
   WCAG video transcripts and PDF guidebooks, regional challenges across 22
   counties. `GET /api/innovations/`, `/api/challenges/`, `/api/categories/`,
   `/api/counties/`
3. **Kreator Pomysłów & Generator Wniosków FERS** — Two-tier idea creator:
   quick note ("fiszka") and 12-point FERS Action 5.1 grant application (up to
   50 000 PLN). `GET|POST /api/ideas/`, `POST /api/ideas/{id}/evaluate/`
4. **Tester Innowacji** — Pilot management, tester recruitment, and WCAG
   evaluation surveys (1–5 usability/effectiveness/accessibility).
   `GET /api/pilots/`, `POST /api/pilots/{id}/apply/`, `POST /api/evaluations/`
5. **Platforma Aktywnej Komunikacji** — Cross-sector partnership board and
   direct Q&A with ROPS coordinators and mentors.
   `GET|POST /api/partnerships/`, `GET|POST /api/inquiries/`
6. **Panel Administratora ROPS** — Submission moderation and regional trend
   analytics. `GET /api/admin/trends/`,
   `PATCH /api/admin/moderate/{id}/`
7. **Middleman Innowacji (AI dla JST)** — Municipal implementation package
   generator (service standards, staffing, cost breakdown, 70/15/15 funding
   montage). `POST /api/middleman/package/`

Interactive API documentation: Swagger UI at `http://localhost:8000/api/docs/`,
OpenAPI schema at `http://localhost:8000/api/schema/`.

## Frontend routes (established)

| Route | Purpose |
|---|---|
| `/` | Public landing page with hero, search, and CTAs |
| `/start` | Resident dashboard with quick actions, challenges carousel, and regional stats |
| `/needs/new` | Multi-step need-reporting wizard (`NeedReportFlow`) |
| `/solutions` | Solution matcher hub with natural-language query and AI matching |
| `/solutions/[slug]` | Solution detail view with tabbed content and metadata sidebar |
| `/map` | Interactive Mapbox GL map of Małopolska with location pins and filters |
| `/design-system` | Living design-system showcase (reference only, not a product route) |

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
