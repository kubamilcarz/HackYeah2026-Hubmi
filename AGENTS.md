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

- Reuse semantic tokens and documented components before creating a one-off UI.
- The planned component inventory is `frontend/docs/design-system.md`; update
  it when a component becomes shared or its public contract changes.
- Read `frontend/docs/accessibility-system.md` for any frontend component or
  flow that affects interaction, content, theming, or layout.
