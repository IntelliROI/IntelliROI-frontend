# InteliROI — Role Hierarchy, RBAC & Dashboard Specifications

## 1. The Five Personas

```
1. SUPER ADMIN        — InteliROI (platform owner). Sees ALL companies.
2. COMPANY OWNER/CEO  — tenant admin. Sees ONE company, all departments.
3. DEPARTMENT HEAD     — sees ONE department, all its teams.
4. TEAM LEAD           — sees ONE team, its members + projects.
5. EMPLOYEE            — sees only themself (their usage, ROI, chat).
```

Optional cross-cutting roles that can be layered on later without restructuring:
- **Finance/Budget Owner** — read-only across cost/budget domains at any scope.
- **Project Manager** — cross-team visibility scoped to specific `project_id`s.

## 2. Data Scope Matrix

| Persona | `company_id` scope | `department_id` scope | `team_id` scope | `employee_id` scope |
|---|---|---|---|---|
| Super Admin | ALL | ALL | ALL | ALL |
| Company Owner/CEO | 1 (own) | ALL within company | ALL within company | ALL within company |
| Department Head | 1 (own) | 1 (own) | ALL within department | ALL within department |
| Team Lead | 1 (own) | 1 (own) | 1 (own) | ALL within team |
| Employee | 1 (own) | 1 (own, read-only) | 1 (own, read-only) | self only |

This matrix should be **enforced server-side** (API filters by JWT claims), and **mirrored client-side** only for UX (hiding nav items, disabling filters) — never trust the client filter as a security boundary.

## 3. RBAC Permission Matrix (representative, not exhaustive)

| Action | Super Admin | Owner/CEO | Dept Head | Team Lead | Employee |
|---|---|---|---|---|---|
| Manage companies (create/suspend) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage global AI provider catalog | ✅ | ❌ | ❌ | ❌ | ❌ |
| Connect company AI provider keys | ❌ | ✅ | ❌ | ❌ | ❌ |
| Create/edit departments | ❌ | ✅ | ❌ | ❌ | ❌ |
| Create/edit teams | ❌ | ✅ | ✅ (own dept) | ❌ | ❌ |
| Add/remove team members | ❌ | ✅ | ✅ | ✅ (own team) | ❌ |
| Set/edit budgets | ❌ | ✅ | ✅ (dept scope) | ❌ | ❌ |
| Approve task benchmarks | ❌ | ✅ | ✅ | ❌ | ❌ (can propose) |
| View company-wide ROI | ❌ | ✅ | ❌ | ❌ | ❌ |
| View department ROI | ❌ | ✅ | ✅ | ❌ | ❌ |
| View team ROI | ❌ | ✅ | ✅ | ✅ | ❌ |
| View own ROI | ❌ | ✅ | ✅ | ✅ | ✅ |
| Use AI Workspace (chat) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage roles/permissions | ❌ | ✅ | ❌ | ❌ | ❌ |
| View audit logs | ✅ (platform) | ✅ (tenant) | ❌ | ❌ | ❌ |

Implement as a single source of truth in `lib/rbac/role-matrix.ts` — a `{role: {resource: {action: boolean}}}` object — consumed by both a `<Can action="..." resource="...">` component and route guards in `middleware.ts`.

---

## 4. Dashboard Specifications Per Persona

Each dashboard is a distinct top-level widget layout, but all reuse the same `DashboardGrid` + `KpiTile` + chart primitives from `components/dashboard` and `components/charts`. Only the **data scope** and **widget selection** change per role — this is why `dashboard/page.tsx` is one route that renders a different composition based on session role, rather than five duplicated routes.

### 4.1 Super Admin Dashboard (`/super-admin/dashboard`)

Platform-wide, cross-tenant view. This is the "business of running InteliROI" view, not any customer's AI usage.

**KPI row:**
- Total active companies (tenants) + this month's new signups
- Total platform MRR / subscription revenue
- Total AI spend processed platform-wide (this month)
- Total active employees across all tenants

**Widgets:**
- **Tenant growth chart** — new companies over time
- **Tenant health table** — company, plan, status, last active, usage trend (sortable, filterable)
- **Provider health panel** — uptime/latency per provider (OpenAI/Claude/Gemini) across the platform
- **Platform-wide token/cost trend** (daily/monthly)
- **Top companies by spend** leaderboard
- **Subscription plan distribution** (donut: Free/Pro/Enterprise)
- **Recent platform audit log** feed (security-relevant events only)
- **System alerts** — queue backlog, failed webhook deliveries, provider pricing sync failures
- **Feature flag quick-toggle panel**

**Primary actions from this screen:** onboard/suspend a company, impersonate a company owner (support), edit global provider catalog, publish a feature flag.

---

### 4.2 Company Owner / CEO Dashboard (`/[companySlug]/dashboard`)

The "is our AI investment paying off" view. This is the flagship screen of the product.

**KPI row:**
- Total AI spend this month (vs budget, vs last month %)
- Total business value generated this month
- **Overall Company ROI %** (hero metric, large)
- Active employees using AI (adoption rate: active / total seats)

**Widgets:**
- **ROI trend chart** — company ROI % over last 6/12 months
- **Department comparison table** — spend, business value, ROI%, adoption %, sorted by ROI descending
- **Budget health** — progress bars per department against `monthly_limit`, red/amber/green
- **Provider cost breakdown** — donut: GPT-5 vs Claude vs Gemini spend
- **Top task categories by value generated** — bar chart (Code Gen, Docs, Testing...)
- **Recommendation feed** (`roi_recommendations`) — "Switch documentation tasks to GPT-5 Mini — save $90/mo", each with Accept/Dismiss
- **Top performing employees** leaderboard (by ROI or adoption)
- **Recent activity** — new department created, provider connected, budget exceeded alert
- **Notification/alert banner** — budget exceeded, API key expiring, usage spike

**Primary actions:** drill into a department, review a recommendation, adjust a budget, invite employees, connect a new AI provider.

---

### 4.3 Department Head Dashboard (`/[companySlug]/organization/departments/[departmentId]`)

Same shape as CEO dashboard, scoped down one level, plus a benchmark-approval queue.

**KPI row:** department spend, department ROI %, department budget remaining, active employees in department.

**Widgets:**
- **Team comparison table** — spend, ROI%, adoption %, sorted, per team in this department
- **Department ROI trend chart**
- **Task benchmark approval queue** — pending `task_benchmarks` proposed by employees/managers awaiting `approved_by`
- **Department budget consumption** chart (daily burn-down vs `monthly_limit`)
- **Top employees in department** leaderboard
- **Department recommendations** (filtered `roi_recommendations` where `department_id` matches)

**Primary actions:** approve/reject a benchmark, create a team, reassign a team lead, request budget increase (escalates to CEO).

---

### 4.4 Team Lead Dashboard (`/[companySlug]/organization/departments/[departmentId]/teams/[teamId]`)

Operational, day-to-day view — smallest KPI set, most member-level detail.

**KPI row:** team spend this month, team ROI %, requests this week, team member count.

**Widgets:**
- **Team members table** — name, role, requests today/week, personal ROI %, last active
- **Project breakdown** — spend & ROI per project this team works on
- **Task category usage** — what kinds of tasks this team uses AI for (donut/bar)
- **Recent AI requests feed** — lightweight, recent activity, not raw prompts (privacy)
- **Team benchmark proposals** — propose a new `task_benchmark` for CEO/Dept Head approval

**Primary actions:** add/remove team member, propose a benchmark, view a member's detail, message the team.

---

### 4.5 Employee Dashboard (`/[companySlug]/my-workspace`)

Personal, self-service. Least admin chrome, most direct path to the AI Workspace itself.

**KPI row:** my requests this month, my spend this month, my time saved (hrs), my personal ROI %.

**Widgets:**
- **"Continue chatting" CTA** — big, prominent, links straight into `ai-workspace`
- **My usage trend** — small sparkline, tokens/requests over time
- **My time saved by task category** — bar chart (what AI is helping me with most)
- **My recent conversations** — quick-resume list
- **My recommendations** — personal tips ("You use GPT-5 for simple SQL — try GPT-5 Mini")
- **Recognition/gamification (optional)** — "Top 10% AI adopter in your team this month"

**Primary actions:** start a new AI conversation (this is the money screen — everything else is secondary), propose a task benchmark, view own request history.

---

## 5. Shared Cross-Persona Screens

These exist once, but render different data based on RBAC scope automatically via the same `useAnalytics(scope, id)` / `useRoiSummary(scope, id)` hooks:

- `/analytics` — company/department/team/employee analytics (same component tree, different scope prop)
- `/roi` — same pattern
- `/usage` — raw AI request table, columns/filters adapt to role (Employee sees only own rows; CEO sees a "grouped by employee" toggle)
- `/notifications` — same list component, server filters by recipient

## 6. Sidebar Navigation Per Role (summary)

| Nav Item | Super Admin | Owner/CEO | Dept Head | Team Lead | Employee |
|---|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Companies (tenants) | ✅ | — | — | — | — |
| Departments | — | ✅ | (own only) | — | — |
| Teams | — | ✅ | ✅ | (own only) | — |
| Employees | — | ✅ | ✅ (dept) | ✅ (team) | — |
| AI Providers | ✅ (global) | ✅ (company) | — | — | — |
| AI Workspace (chat) | — | ✅ | ✅ | ✅ | ✅ |
| Usage | — | ✅ | ✅ | ✅ | ✅ (own) |
| Budgets | ✅ (platform) | ✅ | ✅ (view) | — | — |
| Business Context | — | ✅ | ✅ | (propose) | (propose) |
| Analytics | ✅ (platform) | ✅ | ✅ | ✅ | ✅ (own) |
| ROI | — | ✅ | ✅ | ✅ | ✅ (own) |
| Reports | — | ✅ | ✅ | — | — |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ (platform) | ✅ (company) | — | — | — |
| Audit Logs | ✅ | ✅ | — | — | — |

This table is the literal source data for `config/navigation.ts`.
