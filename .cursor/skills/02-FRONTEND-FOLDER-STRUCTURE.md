# InteliROI — Frontend Folder Structure (Next.js 14+ App Router)

Design goals, in priority order:
1. **A beginner can find any screen in under 10 seconds** just by reading folder names.
2. **Route structure mirrors the org hierarchy** (Platform → Company → Department → Team → Employee).
3. **Feature modules mirror the 13 backend domains 1:1** (see doc 01 §4) — no "misc" or "utils-of-utils" dumping grounds.
4. **RBAC is structural, not just conditional rendering** — a Team Lead physically cannot reach Super Admin code because it lives in a different route group with its own layout/middleware guard.

---

## 1. Top-Level Tree

```
inteliroi-web/
├── .cursor/
│   └── rules/                        # see doc 05
├── public/
│   └── assets/
├── src/
│   ├── app/                          # Next.js App Router — ROUTES ONLY
│   ├── features/                     # DOMAIN LOGIC — one folder per backend domain
│   ├── components/                   # SHARED, dumb, reusable UI — no domain logic
│   ├── lib/                          # framework glue (api client, query client, auth)
│   ├── hooks/                        # cross-feature generic hooks
│   ├── stores/                       # global client state (zustand)
│   ├── types/                        # shared TS types / generated API types
│   ├── config/                       # env, feature flags, nav config, role-permission maps
│   ├── constants/                    # enums mirroring backend enums
│   ├── styles/                       # tailwind config, globals.css, design tokens
│   └── middleware.ts                 # auth + tenant + role guard, runs on every request
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Rule of thumb used throughout:** `app/` is only allowed to import from `features/`, `components/`, `lib/`. It never contains business logic itself — a `page.tsx` is a thin composition of feature components. This is what keeps routing simple even as features grow complex.

---

## 2. `src/app/` — Route Groups by Hierarchy Level

Route groups (parentheses) don't affect the URL — they let us give each persona its own `layout.tsx`, its own middleware guard, and its own sidebar without polluting the URL.

```
app/
├── layout.tsx                         # root layout: fonts, theme provider, toaster
├── page.tsx                           # marketing/landing redirect → /login
├── globals.css
│
├── (auth)/                            # PUBLIC — no session required
│   ├── layout.tsx                     # centered auth card layout
│   ├── login/page.tsx
│   ├── register-company/page.tsx      # Phase 1: new tenant self-signup
│   ├── forgot-password/page.tsx
│   ├── reset-password/[token]/page.tsx
│   └── verify-email/[token]/page.tsx
│
├── (platform-admin)/                  # SUPER ADMIN ONLY — guarded by middleware
│   └── super-admin/
│       ├── layout.tsx                 # platform admin shell (its own sidebar/topbar)
│       ├── dashboard/page.tsx
│       ├── companies/
│       │   ├── page.tsx               # all tenants list
│       │   └── [companyId]/
│       │       ├── page.tsx           # tenant detail / impersonate / suspend
│       │       └── billing/page.tsx
│       ├── providers/
│       │   ├── page.tsx               # global provider catalog (OpenAI, Claude, Gemini)
│       │   └── [providerId]/models/page.tsx
│       ├── pricing/page.tsx           # provider_pricing versioning UI
│       ├── feature-flags/page.tsx
│       ├── system-health/page.tsx     # gateway uptime, queue depth, latency
│       ├── platform-analytics/page.tsx # cross-tenant usage/revenue
│       └── audit-logs/page.tsx        # platform-level audit trail
│
├── (onboarding)/                      # NEW COMPANY — first-run wizard, session required
│   └── onboarding/
│       ├── layout.tsx
│       ├── company-profile/page.tsx
│       ├── departments/page.tsx
│       ├── ai-providers/page.tsx      # connect OpenAI/Claude/Gemini API keys
│       └── invite-team/page.tsx
│
└── (company)/                         # TENANT-SCOPED — everything below is per-company
    └── [companySlug]/
        ├── layout.tsx                 # reads role from session, renders correct sidebar
        │
        ├── dashboard/                 # role-adaptive: same route, different widgets
        │   └── page.tsx               # renders <CeoDashboard/>, <DeptHeadDashboard/>, etc.
        │
        ├── organization/
        │   ├── departments/
        │   │   ├── page.tsx
        │   │   └── [departmentId]/
        │   │       ├── page.tsx               # department dashboard
        │   │       ├── settings/page.tsx
        │   │       └── teams/
        │   │           ├── page.tsx
        │   │           └── [teamId]/
        │   │               ├── page.tsx       # team dashboard
        │   │               ├── members/page.tsx
        │   │               └── projects/page.tsx
        │   ├── projects/
        │   │   ├── page.tsx
        │   │   └── [projectId]/page.tsx
        │   └── employees/
        │       ├── page.tsx                    # directory, filterable by dept/team
        │       └── [employeeId]/
        │           ├── page.tsx                # employee profile + personal analytics
        │           └── roles/page.tsx           # employee_roles history
        │
        ├── ai-providers/
        │   ├── page.tsx                        # connected providers for this company
        │   └── [providerId]/page.tsx           # api key mgmt, model enablement, limits
        │
        ├── ai-workspace/                       # THE CHAT — Pipeline 1 (real-time)
        │   ├── layout.tsx                      # conversation list sidebar + chat pane
        │   ├── page.tsx                        # empty state / new conversation
        │   ├── [conversationId]/page.tsx
        │   └── templates/page.tsx              # prompt_templates library
        │
        ├── usage/
        │   ├── page.tsx                        # ai_requests table (raw facts, filterable)
        │   └── [requestId]/page.tsx            # single request drill-down
        │
        ├── budgets/
        │   ├── page.tsx                        # budgets across company/dept/team scopes
        │   └── [budgetId]/page.tsx
        │
        ├── business-context/
        │   ├── task-categories/page.tsx
        │   ├── task-benchmarks/page.tsx        # approve/reject benchmark proposals
        │   └── job-roles/page.tsx              # hourly_cost per role
        │
        ├── analytics/
        │   ├── page.tsx                        # company-wide analytics
        │   ├── department/[departmentId]/page.tsx
        │   ├── team/[teamId]/page.tsx
        │   ├── employee/[employeeId]/page.tsx
        │   └── providers/page.tsx              # provider/model comparison
        │
        ├── roi/
        │   ├── page.tsx                        # company ROI summary
        │   ├── department/[departmentId]/page.tsx
        │   ├── team/[teamId]/page.tsx
        │   ├── employee/[employeeId]/page.tsx
        │   └── recommendations/page.tsx
        │
        ├── reports/
        │   ├── page.tsx                        # saved_reports list
        │   └── [reportId]/page.tsx
        │
        ├── notifications/page.tsx
        │
        ├── settings/
        │   ├── company/page.tsx
        │   ├── billing/page.tsx
        │   ├── roles-permissions/page.tsx
        │   ├── integrations/page.tsx           # Jira/GitHub/Slack/HRMS
        │   └── audit-logs/page.tsx             # tenant-scoped audit trail
        │
        └── my-workspace/                       # EMPLOYEE self-service, scoped to self
            ├── page.tsx                        # "my usage, my ROI, my recommendations"
            └── history/page.tsx
```

**Why `[companySlug]` and not a cookie-only tenant?** Putting the tenant in the URL makes it impossible to accidentally fetch the wrong company's data on a stale client cache, makes links shareable/bookmarkable within a company, and lets `middleware.ts` validate the slug against the session's `company_id` on every request — a hard structural guard, not just a UI convenience.

---

## 3. `src/features/` — One Folder Per Backend Domain

Each feature is a **vertical slice**: its own components, hooks, API calls, types, and (if needed) client store. `app/` pages import from here; features never import from `app/`.

```
features/
├── auth/
│   ├── components/           # LoginForm, MfaChallenge, SessionExpiredModal
│   ├── hooks/                # useSession, useLogin, useLogout
│   ├── api/                  # auth.api.ts  (login, refresh, logout endpoints)
│   ├── types/                # auth.types.ts
│   └── utils/                # token storage, permission checks
│
├── organization/
│   ├── components/
│   │   ├── departments/      # DepartmentCard, DepartmentForm, DepartmentTree
│   │   ├── teams/            # TeamCard, TeamMembersList, TeamLeadPicker
│   │   ├── projects/         # ProjectCard, ProjectMembersTable
│   │   └── employees/        # EmployeeDirectoryTable, EmployeeProfileCard
│   ├── hooks/                # useDepartments, useTeam, useEmployee, useOrgTree
│   ├── api/
│   ├── types/
│   └── utils/                # org-chart flattening/traversal helpers
│
├── ai-providers/
│   ├── components/           # ProviderCard, ApiKeyForm, ModelCapabilityBadges
│   ├── hooks/                # useProviders, useProviderModels, usePricingHistory
│   ├── api/
│   └── types/
│
├── ai-workspace/
│   ├── components/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ConversationSidebar.tsx
│   │   ├── ModelProviderSelector.tsx
│   │   ├── PromptTemplatePicker.tsx
│   │   └── AttachmentUploader.tsx
│   ├── hooks/                 # useConversation, useStreamingChat, useMessages
│   ├── api/                   # streaming fetch to /chat (SSE/websocket)
│   └── types/
│
├── ai-gateway/                # thin — mostly request status/monitoring, not chat itself
│   ├── components/            # RequestStatusBadge, LatencyIndicator
│   ├── hooks/                 # useRequestStatus
│   └── types/
│
├── usage/
│   ├── components/            # UsageEventsTable, TokenUsageBreakdownChart
│   ├── hooks/                 # useUsageEvents, useRequestDetail
│   ├── api/
│   └── types/
│
├── cost/
│   ├── components/            # CostBreakdownCard, BudgetProgressBar, BudgetAlertBanner
│   ├── hooks/                 # useBudgets, useCostEvents, useBudgetConsumption
│   ├── api/
│   └── types/
│
├── business-context/
│   ├── components/            # TaskCategoryList, BenchmarkApprovalTable, JobRoleForm
│   ├── hooks/                 # useTaskCategories, useTaskBenchmarks, useJobRoles
│   ├── api/
│   └── types/
│
├── analytics/
│   ├── components/            # TrendChart, ComparisonBarChart, LeaderboardTable, KpiTile
│   ├── hooks/                 # useAnalytics(scope, period)  — scope: company|dept|team|employee
│   ├── api/
│   └── types/
│
├── roi/
│   ├── components/
│   │   ├── RoiSummaryCard.tsx
│   │   ├── RoiTrendChart.tsx
│   │   ├── RoiFormulaVersionBadge.tsx
│   │   ├── RecommendationCard.tsx
│   │   └── RecommendationFeed.tsx
│   ├── hooks/                 # useRoiSummary, useRoiEvents, useRecommendations
│   ├── api/
│   └── types/
│
├── notifications/
│   ├── components/            # NotificationBell, NotificationList, AlertRuleForm
│   ├── hooks/                 # useNotifications, useAlertRules
│   ├── api/
│   └── types/
│
├── audit/
│   ├── components/            # AuditLogTable, ActivityTimeline
│   ├── hooks/                 # useAuditLogs
│   └── types/
│
└── system-config/             # super-admin only — feature flags, integrations, tenants
    ├── components/            # TenantCard, FeatureFlagToggle, IntegrationCard
    ├── hooks/
    ├── api/
    └── types/
```

---

## 4. `src/components/` — Shared, Domain-Agnostic UI

```
components/
├── ui/                    # shadcn/ui primitives — Button, Card, Dialog, Table, Tabs, Select...
├── charts/                # thin wrappers around recharts: <LineChart/>, <BarChart/>, <DonutChart/>
├── layout/
│   ├── AppShell.tsx        # sidebar + topbar + content slot, used by every dashboard layout
│   ├── Sidebar.tsx         # renders nav items from config/navigation.ts based on role
│   ├── Topbar.tsx          # company switcher (super admin), notification bell, user menu
│   ├── Breadcrumbs.tsx     # derives from org hierarchy: Company > Dept > Team
│   └── PageHeader.tsx
├── dashboard/
│   ├── KpiTile.tsx          # generic "$420 spent / +12% vs last month" tile
│   ├── DashboardGrid.tsx    # responsive widget grid
│   └── EmptyState.tsx
├── forms/
│   ├── FormField.tsx        # react-hook-form + zod wrapper
│   └── FormActions.tsx
├── feedback/
│   ├── LoadingSkeletons.tsx
│   ├── ErrorBoundary.tsx
│   └── ConfirmDialog.tsx
└── data-table/
    ├── DataTable.tsx         # tanstack-table wrapper: sort/filter/paginate
    └── DataTableToolbar.tsx
```

---

## 5. `src/lib/`, `src/stores/`, `src/config/`

```
lib/
├── api-client.ts            # axios/fetch wrapper, injects tenant header + auth token
├── query-client.ts          # TanStack Query client + default cache config
├── auth/
│   ├── session.ts            # server-side session read (cookies)
│   └── permissions.ts        # can(user, action, resource) — RBAC checker
├── rbac/
│   └── role-matrix.ts         # SuperAdmin/Owner/DeptHead/TeamLead/Employee → allowed actions
└── validators/                # zod schemas shared client+server

stores/                       # zustand — ONLY for cross-page client-only UI state
├── ui-store.ts                 # sidebar collapsed, theme, active company (super admin)
└── chat-store.ts               # in-flight streaming message buffer

config/
├── navigation.ts               # nav tree per role, consumed by Sidebar.tsx
├── site.ts                     # app name, support links
└── feature-flags.ts            # client-side flag reader (backed by system_settings)

types/
├── api/                        # generated types from OpenAPI (source of truth)
├── domain/                     # hand-written domain types mirroring the 13 domains
└── rbac.ts                     # Role, Permission enums

constants/
├── roles.ts                    # SUPER_ADMIN, COMPANY_OWNER, DEPT_HEAD, TEAM_LEAD, EMPLOYEE
├── providers.ts
└── task-categories.ts
```

---

## 6. Naming & File Conventions (quick reference)

| Thing | Convention | Example |
|---|---|---|
| Route folder | kebab-case | `ai-workspace/`, `task-benchmarks/` |
| Component file | PascalCase.tsx | `RecommendationCard.tsx` |
| Hook file | camelCase, `use` prefix | `useRoiSummary.ts` |
| API module | `{domain}.api.ts` | `roi.api.ts` |
| Type file | `{domain}.types.ts` | `roi.types.ts` |
| Zustand store | `{domain}-store.ts` | `chat-store.ts` |
| Server action | `{verb}-{noun}.action.ts` | `approve-benchmark.action.ts` |

---

## 7. Why This Structure Scales

- **Adding a 14th domain** (e.g. HRMS integration) = one new `features/hrms-integration/` folder + one new route segment. Nothing else touches.
- **Adding a new role** (e.g. "Finance Reviewer") = one entry in `lib/rbac/role-matrix.ts` + one branch in `config/navigation.ts`. No route restructuring.
- **A beginner** opening `features/roi/` sees exactly the same shape (`components/`, `hooks/`, `api/`, `types/`) as every other domain — pattern recognition does the onboarding for you.
