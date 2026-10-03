# Antigravity Agent Guidelines – Splot Backend (HackYeah 2026)

## Quick Context for Agents
This backend is the digital heart of **Splot** – Małopolski Hub Innowacji Społecznych for **ROPS Kraków**.
It is a **Django 6.1** + **Django REST Framework 3.18** backend connecting social needs, regional challenges, and ROPS social innovations across 22 counties of Małopolska.

---

## Key Architecture & Domain Map

All application logic lives in `backend/api/`:
- `models.py`:
  - `InnovationCategory`: 9 official ROPS categories (`seniors`, `youth_family`, `mobility`, `sensory`, `health`, `labor`, `foreigners`, `homelessness`, `intellectual`).
  - `County` & `Municipality`: 22 counties of Małopolska with demographic stats (senior ratio, challenges).
  - `SocialInnovation`: ROPS innovations (*BaWita*, *Senior CUDER*, *Merkury*, *Modularne łazienki*, *OSL*, *Kawiarenka Naprawcza*) with WCAG video transcripts and PDF guidebooks.
  - `ProblemSubmission` & `ProblemMatch`: Needs reported by residents/NGOs/JST, with calculated match score and Polish justification.
  - `RegionalChallenge`: Key regional challenges linked to counties and innovations.
  - `IdeaSubmission`: Two-tier Idea Creator: quick Note (`fiszka`) and official 12-point FERS Grant Application (`grant_fers`, max 50k PLN) with ROPS evaluation.
  - `PilotProject` & `PilotEvaluation`: Innovation testing (recruitment + 1-5 WCAG feedback surveys with barriers).
  - `PartnershipPost`: Cross-sector cooperation board (JST <-> NGO).
  - `Inquiry`: Direct dialogue with ROPS coordinators and expert mentors with publishing to FAQ.
  - `MiddlemanPackage`: Implementation package for municipalities (standards, staffing, cost breakdown, financial montage with 70% FERS / 15% PFRON / 15% Gmina).
- `views.py`:
  - `MatchmakingAnalyzeView` (`POST /api/matchmaking/analyze/`): Hybrid category + keyword + audience scoring engine. Detects gaps (*„Biała plama”*) when score < 45% and suggests Creator.
  - `MiddlemanPackageView` (`POST /api/middleman/package/`): JST service package generator.
  - `AdminTrendsView` (`GET /api/admin/trends/`): Aggregated trends by county & category + white spots list.
  - `AdminModerationView` (`PATCH /api/admin/moderate/<id>/`): Moderation of submissions.
  - ViewSets for all resources with rich filtering (`?category=`, `?county=`, `?stage=`, `?type=`, `?q=`).
- `serializers.py`: DRF serializers decorated for `drf-spectacular`.
- `management/commands/seed_demo_data.py`: Seeds authentic ROPS data, 6 innovations, pilots, inquiries, partnerships, and 5 demo personas.
- `tests.py`: 11 integration tests covering all modules (`python manage.py test api`).

---

## Demo Personas

When testing or demoing flows, use these 5 quick persona profiles:
1. `anna_nowak` (Resident/Caregiver, Grybów, Nowosądecki) -> Matchmaking, Pilot evaluations.
2. `marek_wisniewski` (JST / CUS Myślenice) -> Middleman AI, municipal partnerships.
3. `katarzyna_zielinska` (NGO / Fundacja Aktywna Małopolska, Tarnów) -> 12-point FERS grant application.
4. `piotr_adamski` (Expert mentor, Kraków) -> Expert evaluation, FAQ answers.
5. `magdalena_kaczmarczyk` (ROPS Coordinator / Admin) -> Admin trends, moderation, grant evaluation.

---

## Quick Command Cheatsheet

```bash
# Activate virtual environment
source .venv/bin/activate

# Run tests
python manage.py test api

# Seed or re-seed demo data
python manage.py seed_demo_data

# Run dev server
python manage.py runserver 8000
```

Interactive API documentation:
- Swagger UI: `http://localhost:8000/api/docs/`
- OpenAPI JSON Schema: `http://localhost:8000/api/schema/`
