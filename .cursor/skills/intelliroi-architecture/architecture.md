# IntelliROI Frontend Architecture Reference

Companion to `SKILL.md`. Long-term structure for Next.js App Router + TypeScript.

## Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Login, SSO, password reset
│   ├── (platform)/               # Super Admin shell
│   ├── (company)/                # Company-scoped authenticated shell
│   ├── api/                      # BFF / route handlers if needed
│   ├── layout.tsx
│   └── providers.tsx
├── features/                     # Feature modules (primary unit of work)
│   ├── auth/
│   ├── organization/
│   ├── departments/
│   ├── teams/
│   ├── projects/
│   ├── employees/
│   ├── ai-workspace/
│   ├── conversations/
│   ├── prompt-library/
│   ├── analytics/
│   ├── roi/
│   ├── reports/
│   ├── audit-logs/
│   ├── billing/
│   ├── notifications/
│   ├── settings/
│   └── support/
├── shared/                       # Cross-feature reuse
│   ├── components/
│   │   ├── ui/                   # shadcn primitives
│   │   ├── layout/               # Shell, sidebar, topbar, page header
│   │   ├── data-display/         # KPI, charts, tables, badges
│   │   ├── forms/                # Form field wrappers
│   │   └── feedback/             # Empty, error, loading, toasts
│   ├── hooks/
│   ├── lib/                      # cn, formatters, constants
│   ├── types/
│   └── utils/
├── entities/                     # Domain models & mappers (optional thin layer)
│   ├── company/
│   ├── department/
│   ├── team/
│   ├── employee/
│   ├── conversation/
│   └── usage/
├── processes/                    # Multi-feature flows (onboarding, invite)
├── widgets/                      # Composite UI blocks used across pages
├── core/                         # App infrastructure
│   ├── api/                      # HTTP client, interceptors, endpoints
│   ├── auth/                     # Session, tokens, guards
│   ├── rbac/                     # Permissions, role maps, can()
│   ├── store/                    # Zustand stores
│   ├── query/                    # React Query client & keys
│   └── config/                   # Env, feature flags
└── styles/
    └── globals.css
```

Feature module internal layout (repeat per feature):

```
features/analytics/
├── api/                 # fetchers + React Query hooks
├── components/
├── hooks/
├── stores/              # feature-local Zustand if needed
├── types/
├── schemas/             # Zod
├── constants/
└── index.ts             # public exports only
```

## Route Structure

```
/(auth)
  /login
  /forgot-password
  /sso/callback

/(platform)                          # Super Admin
  /dashboard
  /companies
  /companies/[companyId]
  /plans
  /billing
  /providers
  /analytics
  /health
  /support
  /audit-logs
  /settings

/(company)                           # Tenant shell
  /dashboard                         # Role-resolved dashboard
  /organization
  /departments
  /departments/[departmentId]
  /teams
  /teams/[teamId]
  /employees
  /employees/[employeeId]
  /projects
  /projects/[projectId]
  /workspace                         # AI Workspace
  /workspace/[conversationId]
  /conversations
  /prompts
  /analytics
  /analytics/usage
  /analytics/tokens
  /analytics/departments
  /analytics/teams
  /analytics/employees
  /roi
  /reports
  /audit-logs
  /billing
  /notifications
  /settings
  /settings/providers
  /settings/policies
  /settings/budgets
```

Route access is enforced via layout guards + RBAC, not by hiding UI alone.

## Layout Architecture

| Layout | Responsibility |
|--------|----------------|
| Root | Fonts, theme, providers (Query, auth, toast) |
| `(auth)` | Centered minimal chrome, no sidebar |
| `(platform)` | Platform sidebar + topbar + Super Admin nav |
| `(company)` | Tenant sidebar + org switcher context + role-filtered nav |
| Page | PageHeader + filters + primary content + optional side panel |

Shell composition:

```
AppShell
├── Sidebar (role-filtered nav)
├── Topbar (search, notifications, user menu, org context)
└── Main
    ├── PageHeader (title, breadcrumbs, actions)
    └── Content (feature page)
```

Breadcrumbs must reflect hierarchy: Company / Department / Team / …

## Dashboard Architecture

Resolve dashboard by role at `/dashboard` (or dedicated routes if preferred):

| Role | Dashboard focus |
|------|-----------------|
| Super Admin | Platform metrics, companies, health, revenue/plans |
| CEO | Org AI adoption, spend, ROI, dept comparison |
| Department Manager | Dept usage, teams, benchmarks, adoption |
| Team Lead | Team usage, employees, projects |
| Employee | Personal usage, conversations, personal ROI |

Shared dashboard building blocks in `shared/components/data-display/`:

- `KpiCard`, `TrendSparkline`, `AnalyticsChart`, `DataTable`, `FilterBar`, `DateRangePicker`, `ScopeSelector` (dept/team)

## RBAC Strategy

```
core/rbac/
├── roles.ts           # Role enum
├── permissions.ts     # Permission strings
├── role-permissions.ts
├── can.ts             # can(user, permission, resource?)
└── guards.ts          # RequirePermission, useCan
```

Rules:

1. Roles are hierarchical for **scope**, not automatic permission inheritance — map explicitly.
2. Every API query includes scope (`companyId`, `departmentId`, `teamId`) derived from session + selection.
3. UI uses `can()` for buttons/nav; layouts use server/middleware checks for routes.
4. Resource-level checks for viewing another employee’s data (managers+ only within scope).

Permission examples:

- `company:read` · `department:manage` · `team:manage` · `employee:invite`
- `workspace:use` · `analytics:org` · `analytics:dept` · `analytics:team` · `analytics:self`
- `roi:read` · `audit:read` · `billing:manage` · `providers:manage`

## Authentication Flow

1. Login / SSO → tokens stored securely (httpOnly cookie preferred).
2. Bootstrap session → `GET /me` returns user, roles, org memberships, permissions.
3. Hydrate auth store + React Query cache.
4. Middleware redirects unauthenticated users to `/(auth)/login`.
5. Role/layout resolution chooses `(platform)` vs `(company)`.
6. Logout clears session + query cache.

## State Management

| Concern | Tool |
|---------|------|
| Server/async data | React Query |
| Auth session, UI prefs, sidebar, selected org scope | Zustand |
| Forms | React Hook Form + Zod |
| URL filters (date range, dept, team) | nuqs or searchParams |

Conventions:

- Query keys: `['analytics', 'tokens', { companyId, range }]`
- No duplicate server state in Zustand
- Feature stores stay inside `features/*/stores`

## API Layer

```
core/api/
├── client.ts          # fetch wrapper, auth header, error normalize
├── errors.ts
└── endpoints.ts       # path constants optional

features/<feature>/api/
├── <feature>.api.ts   # pure HTTP functions
└── <feature>.queries.ts  # useQuery / useMutation hooks
```

Standards:

- Typed request/response with Zod parse on boundaries
- Central error → toast / inline error mapping
- Golang API is source of truth; frontend never invents business metrics formulas without API contract

## Shared Components

Priority shared set:

- Layout: `AppShell`, `Sidebar`, `Topbar`, `PageHeader`, `Breadcrumbs`
- Data: `KpiCard`, `MetricDelta`, `AnalyticsChart`, `DataTable`, `Pagination`
- Filters: `FilterBar`, `DateRangePicker`, `OrgScopeFilter`
- Feedback: `EmptyState`, `ErrorState`, `LoadingSkeleton`, `PermissionDenied`
- Workspace: `ModelSelector`, `PromptComposer`, `ConversationList` (enterprise, not consumer bubbles)

shadcn lives in `shared/components/ui/`. Feature components never re-implement primitives.

## Hooks & Providers

**Reusable hooks (`shared/hooks` or `core/`):**

- `useSession`, `useCurrentRole`, `useCan`
- `useOrgScope` — company/dept/team selection
- `useDateRange`
- `useDebouncedValue`
- `useMediaQuery`

**Providers (`app/providers.tsx`):**

- `QueryClientProvider`
- `AuthProvider` (or session from server + client hydrate)
- `ThemeProvider` (dark-first)
- `TooltipProvider`
- Optional: `OrgScopeProvider`

## Context vs Zustand

- Prefer Zustand for client global UI/auth scope
- Use React Context sparingly (theme, tooltip) — avoid Context for high-frequency data

## Responsive Strategy

| Breakpoint | Behavior |
|------------|----------|
| `< md` | Collapsible sidebar (drawer), stacked KPI grids, card-first tables |
| `md–lg` | Compact sidebar, 2-col metrics |
| `≥ lg` | Full shell, dense tables, multi-panel analytics |

Dashboards must remain usable on laptop (1366px) and scale to 1440+/ultrawide without sparse emptiness or cramped density.

## Future Integrations

Place under `features/integrations/` (future) with a registry pattern:

```
features/integrations/
├── registry.ts
├── types.ts
└── providers/   # jira, github, slack, ...
```

Core org/analytics/workspace modules must not import integration UIs directly — use ports/adapters or lazy feature flags.
