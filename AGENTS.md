# IntelliROI Frontend — Agent Guide

This repo is the **IntelliROI** Next.js frontend: multi-tenant AI intelligence / governance SaaS.

## Product in one line

Employees use an AI Workspace; every request is attributed through the org hierarchy; the platform rolls up **usage → cost → estimated ROI** for executives.

## Always-on rules

Located in `.cursor/rules/` (applied automatically):

| File | Purpose |
|------|---------|
| `000-project-context.mdc` | What we build + core hierarchy |
| `050-skill-routing.mdc` | Which skill to read per task |
| `010-frontend-architecture.mdc` | One shell + scoped routes (when editing `src`/`app`) |
| `020-rbac-multitenancy.mdc` | Roles and tenant isolation |
| `030-design-system.mdc` | Visual chassis + role accents |
| `040-data-domain.mdc` | Org vs config + attribution |
| `070-role-color-identity.mdc` | Per-hierarchy accent colors |
| `080-performance-security.mdc` | Fast queries, headers, secure cookies |

## Project skills (read when relevant)

| Skill | Use for |
|-------|---------|
| `intelliroi-architecture` | Shell, routes, feature placement |
| `intelliroi-dashboard` | World-class analytics dashboards (21st.dev patterns) |
| `intelliroi-rbac` | Role UX, nav, permissions |
| `intelliroi-domain` | Entities, forms, ROI chain |
| `intelliroi-theme` | Chassis typography/surfaces + role color wiring |

Also available: `ui-styling`, `ui-ux-pro-max`, `design-system`, `brand`, `design` — constrained by IntelliROI chassis + role accents.

## Source docs

- `.cursor/docs/Platform_Hirarchy.md` — platform vs company hierarchy
- `.cursor/docs/Restructure frontend architecture.md` — RBAC frontend experiences
- `.cursor/docs/restructure design for IntelliRoi.md` — domain / data model
- `.cursor/docs/DESIGN_SYSTEM.md` — full visual inventory
- `.cursor/docs/ROLE_COLOR_IDENTITY.md` — shared fonts + unique role colors

## Non-negotiables

1. One application shell — not five role-specific apps
2. Scope-aware RBAC (company → department → team → self)
3. Every AI event attributable to company/dept/team/employee/project/task
4. Say **Estimated ROI**, never Actual ROI (MVP)
5. Shared typography/surfaces; **unique `--role-accent` per hierarchy** (not five full themes)
6. Dashboard UI aims at MNC SaaS analytics quality via 21st.dev-informed patterns
