# JobReady UI foundation

## Direction

JobReady uses a restrained developer-tool visual language: neutral backgrounds and surfaces, one burnt-orange brand accent, semantic status colors, subtle borders, small shadows, and sans-serif typography. The authenticated product should feel technical and calm rather than like a coaching portal or generic AI SaaS template.

The spacing scale follows 4/8/12/16/24/32/48/64px. Authenticated pages use a shared `app-page` width and header pattern; reading-heavy pages may use the narrower layout.

## Navigation

Desktop uses a persistent left sidebar with:

- Dashboard
- Readiness
  - Overview
  - Role matches
  - Evidence gaps
- Projects
- Settings and logout in the footer

Mobile uses a four-item bottom navigation: Home, Readiness, Projects, Account. Readiness subpages use compact in-page tabs on mobile. Project detail and mission routes inherit the Projects active state. No placeholder navigation destinations are exposed.

## Shared UI

`src/components/ui.tsx` contains small reusable primitives for buttons, cards, headers, badges, progress, metrics, alerts, empty/error/loading states, skeletons, tabs, breadcrumbs, steps, filter chips, tooltips, form fields, and file upload surfaces.

`src/components/domain-ui.tsx` contains JobReady-specific presentation components such as role-match cards, project cards, mission cards, evidence-status rows, and project progress.

Domain/business logic remains outside these components. Existing API, Supabase, scoring, recommendation, and entitlement boundaries are unchanged by this phase.
