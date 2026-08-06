---
name: intelliroi-architecture
description: >-
  Enterprise AI Intelligence Platform frontend architecture for IntelliROI —
  multi-tenant SaaS for monitoring, governing, analyzing, and measuring AI
  adoption. Covers product hierarchy, RBAC roles, feature modules, Next.js App
  Router structure, dashboards, design philosophy, and MVP scope. Use when
  building, scaffolding, designing, or reviewing IntelliROI frontend features,
  routes, layouts, dashboards, AI workspace, analytics, governance, or
  organization management.
---

# IntelliROI — Enterprise Frontend Architecture

This is **not** a consumer AI chat app. It is a multi-tenant enterprise SaaS that sits between companies and AI providers (OpenAI, Claude, Gemini, Azure OpenAI, Amazon Bedrock). Every AI interaction is enriched with business context for observability, governance, analytics, and ROI.

**Product goal:** The operating system for Enterprise AI Intelligence.

When this skill applies, also consult `intelliroi-theme` for visual tokens and `ui-ux-pro-max` for design-system generation (enterprise dark SaaS, not consumer chat UI).

## Non-Negotiables

1. **Hierarchy-aware** — Every screen respects Platform → Company → Department → Team → Employee → AI Workspace.
2. **Role-based** — Navigation, dashboards, and data scopes are RBAC-driven. Never leak cross-role data.
3. **Enterprise aesthetic** — Dark-first, premium, minimal, high information density, large whitespace, executive-friendly. Avoid consumer chat aesthetics (bubbles, playful gradients, emoji-as-UI).
4. **Feature-based architecture** — Scalable, modular, strongly typed, maintainable over short-term speed.
5. **Future-proof** — Integrations (Jira, GitHub, Slack, Salesforce, HRMS, Copilot, etc.) are modules — do not restructure core for them.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict) |
| Styling | TailwindCSS + shadcn/ui + Radix UI |
| Server state | React Query (TanStack Query) |
| Client state | Zustand |
| Forms | React Hook Form + Zod |
| Motion | Framer Motion |
| Backend | Golang API |
| Database | PostgreSQL |

## Product Hierarchy

```
Platform
└── Super Admin
└── Companies
    └── CEO
    └── Departments
        └── Teams
            └── Team Leads
                └── Employees
                    └── AI Workspace
```

## Roles & Capabilities

| Role | Can manage / access |
|------|---------------------|
| **Super Admin** | Companies, plans, billing, AI providers, platform analytics/health, support, audit logs |
| **Company CEO** | Departments, managers, AI providers, company analytics/policies, AI budgets |
| **Department Manager** | Teams, team leads, department analytics, benchmarks, AI adoption |
| **Team Lead** | Employees, projects, team usage/analytics |
| **Employee** | Login, AI Workspace, conversations, personal analytics, estimated ROI |

Each role gets its **own dashboard** exposing only relevant metrics.

## Core Modules (MVP)

Organization Management · AI Workspace · Provider Selection · Prompt Chat · Conversation History · Usage / Token / Department / Team / Employee Analytics · Estimated ROI · Executive Dashboard · Audit Logs

**Also in product surface:** Auth, Projects, Prompt Library, Reports, Settings, Notifications, Billing, Support

**Future modules (design for extension, do not build yet):** Jira, GitHub, Azure DevOps, Slack, Teams, Notion, Confluence, Salesforce, HubSpot, HRMS, ERP, Microsoft Copilot, Google Workspace

## Navigation (Role-Filtered)

Dashboard · Organization · Companies · Departments · Teams · Employees · Projects · AI Workspace · Conversations · Analytics · ROI · Reports · Audit Logs · Settings

Show only items the current role is allowed to see.

## Design Philosophy

- Dark first, premium enterprise, modern SaaS
- Minimal, professional typography, executive-friendly
- High information density **with** large whitespace (clarity over clutter)
- Dashboards over chat chrome; charts, tables, filters, KPIs as primary UI
- Prefer Linear / Stripe / Vercel / Atlassian density patterns over consumer AI UIs

## Agent Workflow

When implementing or designing frontend work:

1. **Identify role + hierarchy scope** — Whose screen is this? What org level does data belong to?
2. **Place code in the correct feature module** — See [architecture.md](architecture.md).
3. **Wire RBAC** — Route guards, nav visibility, query scopes, empty/forbidden states.
4. **Match design system** — Use IntelliROI theme tokens; dark enterprise shell.
5. **Prefer shared primitives** — Layout shells, data tables, KPI cards, filters, charts, empty/error states.
6. **Type everything** — Zod schemas at API boundaries; shared domain types for org hierarchy entities.
7. **Do not** invent consumer chat UX or flatten the org hierarchy into a generic admin CRUD.

## Deep References

- [architecture.md](architecture.md) — Folder/route structure, layouts, RBAC, state, API layer, components, hooks, providers
- [standards.md](standards.md) — Naming, coding standards, utilities, responsive strategy, implementation roadmap

## Anti-Patterns

- Treating the product as “ChatGPT with a sidebar”
- Single shared dashboard for all roles
- Ignoring department/team scope in analytics queries
- Hard-coding integration UI into core modules
- Purple AI gradients, emoji icons, bubbly chat-first landing inside the app shell
- Giant god-components or `pages/`-style dumping grounds instead of feature modules
