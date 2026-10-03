# Splot frontend instructions for Claude

@AGENTS.md

Before changing interface code, read `docs/design-system.md`, the complete
catalog at `docs/design-system/components.md`, and
`docs/accessibility-system.md`. For product-specific UI decisions, follow the
repository-local `../skills/splot-design-system/SKILL.md`.

Splot is a calm, warm, civic interface: quiet blue-gray canvas, white rounded
surfaces, gentle borders, generous space, trustworthy navy structure, and one
clear emerald next step. Use the shared components and semantic tokens; do not
introduce generic dashboard patterns, raw colours, or look-alike controls.

The Django backend at `http://localhost:8000/api/` is fully built with 7 ROPS
modules, 34+ endpoints, and interactive Swagger docs at `/api/docs/`. Read the
root `AGENTS.md` and `backend/AGENTS.md` for the domain map before integrating
or creating data flows. Replace mock data in `lib/solutions.ts` with real API
calls when wiring features.
