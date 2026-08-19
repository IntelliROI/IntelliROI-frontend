---
name: intelliroi-rbac
description: IntelliROI RBAC — role experiences, sidebars, permissions matrix, scope isolation, and privacy rules. Use when building navigation, dashboards, auth guards, middleware, Can/permission checks, or role-specific UI for Super Admin, CEO, Department Manager, Team Lead, or Employee.
---

# IntelliROI RBAC

## Roles & scope

| Role | Scope | Must not see |
|------|-------|--------------|
| Super Admin | Entire platform | Customer employee prompts (default) |
| CEO / Owner | Entire company | Other companies |
| Department Manager | Own department | Other depts; company AI provider config (unless granted) |
| Team Lead | Own team | Whole company; other teams |
| Employee | Self | Org management, providers, others’ analytics |

## Permission model

Permissions are **scope-aware**. Example: `employee.view` means:

- CEO → all company employees
- Dept Manager → department employees
- Team Lead → team members
- Employee → self only

Backend enforces; frontend hides.

## Sidebar patterns (by role)

**Super Admin:** Dashboard, Organizations, Users, Providers, Platform Analytics, Subscriptions, System Health, Audit, Support, Settings

**CEO:** Executive Dashboard, Organization (Departments/Teams/Employees/Job Roles), Projects, AI Intelligence (Usage/Costs/Models/Providers), Analytics, ROI, Governance (Policies/Limits), Audit, Support, Settings

**Dept Manager:** Dept Dashboard, Teams, Employees, Projects, AI Usage/Costs, ROI, Audit, Support, Profile — no company settings/providers unless granted

**Team Lead:** Team Dashboard, Members, Projects, AI Usage/Costs, ROI, Conversations (if privacy allows), Support, Profile

**Employee:** AI Workspace, Conversations, My AI Usage, My ROI, My Projects, Activity, Support, Profile

## Privacy

Team Lead / Manager access to **full prompts/conversations** is optional and permission-gated — not implied by role.

## Implementation patterns

```tsx
// Nav item
{ label: "Employees", path: "...", permission: "employee.view", scope: "COMPANY" }

// Gate actions
<Can permission="provider.manage" scope="COMPANY">...</Can>
```

Filter nav from current user: role → permissions → scope → sidebar.

## Dashboard scope

Same KPIs (requests, tokens, cost, time saved, estimated value, estimated ROI) — change aggregation window only.

Each role also gets a **unique accent** on the shared chassis (`data-role-theme`). See `.cursor/docs/ROLE_COLOR_IDENTITY.md` and skill `intelliroi-dashboard`.

## Full matrix

See `.cursor/docs/Restructure frontend architecture.md` §22.
