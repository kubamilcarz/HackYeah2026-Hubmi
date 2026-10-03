# Splot frontend

Splot is a mobile-first PWA social hub for connecting residents, NGOs, and
local-government units with needs and solutions. ROPS staff have dedicated
administrative workflows; public routes must not expose that complexity by
default.

## Interface source of truth

- [Design-system overview](docs/design-system.md) — foundations, visual voice,
  adoption rules, and responsive composition guidance.
- [Component catalog](docs/design-system/components.md) — every shared public
  component and its contract.
- [Accessibility system](docs/accessibility-system.md) — WCAG 2.2 AA baseline,
  theme/text preferences, semantics, and validation requirements.
- [`/design-system`](app/design-system/page.tsx) — live component reference.

Use the existing component catalog and semantic tokens before building a new
pattern. The desired Splot feel is warm civic clarity: quiet blue-gray canvas,
white rounded surfaces, gentle borders, generous space, trustworthy navy
structure, and a single clear emerald action at each decision point.

For AI-assisted UI changes, also follow
[`../skills/splot-design-system/SKILL.md`](../skills/splot-design-system/SKILL.md).

## Development

Install dependencies and run the local application:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use `npm run lint` before
handing off a frontend change.

The app uses Next.js 16, React 19, Tailwind CSS 4, Geist, Phosphor icons, and
Mapbox GL. Review the current Next.js guidance in `node_modules/next/dist/docs/`
before changing framework-sensitive code; the version has breaking changes from
earlier Next.js releases.

`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is optional in local development. When it is
not configured, `Map` shows its accessible list fallback rather than hiding
location results.
