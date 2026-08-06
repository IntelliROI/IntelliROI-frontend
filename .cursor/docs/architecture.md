# IntelliROI Architecture (on-demand)

Use `@architecture.md` when you need system-level reasoning (e.g. "does this screen fit?")
without loading every always-applied rule.

This file is an **index**, not a second copy of the architecture skill. Prefer the sources
below so guidance stays unique.

## When to use what

| Need | Source |
|------|--------|
| Always-on coding guardrails | `.cursor/rules/*.mdc` |
| Product hierarchy, modules, MVP, dashboards | skill `intelliroi-architecture` |
| Visual tokens / terminal theme | `intelliroi-frontend-theme.mdc` + skill `intelliroi-theme` |
| Platform analysis (pipelines, domains) | `.cursor/skills/01-PLATFORM-ARCHITECTURE-ANALYSIS.md` |
| Full folder tree | `.cursor/skills/02-FRONTEND-FOLDER-STRUCTURE.md` |
| Roles & dashboards | `.cursor/skills/03-ROLE-HIERARCHY-AND-DASHBOARDS.md` |
| Request / execution flow | `.cursor/skills/04-APPLICATION-EXECUTION-FLOW.md` |

## Quick reminders (rules already enforce these)

1. **Two pipelines** — Workspace chat (P1) never waits on cost/ROI (P2).
2. **Tenant in every query key** — `companySlug` first; no cross-tenant cache bleed.
3. **`app/` is routes only** — logic lives in `features/{domain}/`.
4. **One route, role-adaptive UI** for shared screens (`/dashboard`, `/analytics`, `/roi`, `/usage`).
5. **RBAC via `<Can>` + `role-matrix.ts`** — not scattered `if (role === …)` in JSX.

For deep detail, open the matching skill or numbered doc — do not paste those bodies here.
