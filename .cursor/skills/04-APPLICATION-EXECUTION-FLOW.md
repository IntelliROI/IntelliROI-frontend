# InteliROI — Application Execution Flow

Two different "flows" matter here and they get confused easily. This doc separates them:

- **§1 Build Order** — the sequence you should build features in, so each phase is demoable and nothing blocks on something unbuilt.
- **§2 Runtime User Flow** — what actually happens, in order, once the product is live (this is the "factory" from the source docs, translated into screen-by-screen frontend behavior).

---

## 1. Build Order (Phased Delivery Plan)

Build strictly in this order. Each phase should be shippable/demoable on its own before starting the next — resist building analytics before usage tracking has real data flowing.

### Phase 0 — Foundation (Week 1)
- Next.js app scaffold, `.cursor/rules`, design system tokens, `components/ui` (shadcn install)
- `lib/api-client.ts`, `lib/query-client.ts`, environment config
- `middleware.ts` skeleton (no real auth yet, just structure)
- Empty route tree from doc 02 with placeholder pages (fast way to sanity-check the whole IA with stakeholders before any real work)

### Phase 1 — Identity & Multi-Tenancy
- `features/auth`: login, register-company, forgot/reset password, email verification
- Session handling, JWT storage, `useSession` hook
- `lib/rbac/role-matrix.ts` + `<Can>` guard component
- `middleware.ts` real implementation: redirect unauthenticated → `/login`, redirect wrong-tenant → 403
- **Demo:** a user can register a company, log in, and land on an empty dashboard shell scoped to their `companySlug`.

### Phase 2 — Super Admin Core
- Super admin route group + layout + sidebar
- Companies list/detail (tenant management)
- Global AI provider catalog + `provider_models`
- **Demo:** platform owner can see all registered tenants and manage the provider catalog.

### Phase 3 — Organization Structure
- `features/organization`: departments, teams, team members, projects, employees CRUD
- Onboarding wizard (`(onboarding)/onboarding/*`): company profile → departments → connect AI providers → invite team
- Org chart / breadcrumb navigation
- **Demo:** CEO completes onboarding, creates departments/teams, invites employees who show up in the directory.

### Phase 4 — AI Provider Configuration (company-level)
- `features/ai-providers`: connect provider API keys, enable models, set limits
- Secure key input UI (masked, never re-displayed in full)
- **Demo:** CEO connects an OpenAI key, sees available models populate.

### Phase 5 — AI Workspace (Pipeline 1: the real-time path)
- `features/ai-workspace`: conversation list, chat window, streaming responses, model/provider selector, prompt templates
- This is the **highest-priority end-user feature** — employees must be able to chat productively before anything downstream matters
- **Demo:** employee picks a project, provider, model, sends a prompt, gets a streamed response. Nothing about cost/ROI shown yet — by design (Pipeline 1 is fast and dumb).

### Phase 6 — Usage Tracking (start of Pipeline 2)
- `features/usage`: raw `ai_requests` table with tokens/latency/status, request detail drawer
- No cost or ROI yet — purely "here's what happened, technically"
- **Demo:** every chat message from Phase 5 now shows up in a usage log with token counts.

### Phase 7 — Cost Engine
- `features/cost`: cost breakdown per request, budgets CRUD, budget progress bars, budget-exceeded alerts
- Requires `provider_pricing` (built in Phase 2) to compute `$` from tokens
- **Demo:** usage log now shows a dollar cost per request; budgets page shows burn-down.

### Phase 8 — Business Context Engine
- `features/business-context`: job roles + hourly cost, task categories, task benchmark proposal/approval workflow
- **Demo:** a request can be tagged with a task category; a Dept Head can approve a benchmark ("Code Generation saves Frontend Devs 30 min").

### Phase 9 — Analytics Engine
- `features/analytics`: scoped analytics views (company/department/team/employee/provider/model), trend charts, comparison tables
- Consumes precomputed `*_analytics_daily/monthly` tables — **frontend never aggregates raw requests client-side**
- **Demo:** every dashboard from doc 03 can now show real trend charts instead of empty states.

### Phase 10 — ROI Engine
- `features/roi`: ROI summary cards, ROI trend charts, formula version badge, recommendations feed
- **Demo:** the CEO dashboard's hero "Overall ROI %" metric goes live; recommendations start appearing.

### Phase 11 — Notifications & Alerts
- `features/notifications`: notification bell, list, alert rule configuration
- Wire up budget-exceeded, API-key-expiring, usage-spike, daily-summary triggers from earlier phases
- **Demo:** exceeding a budget (Phase 7) now produces a real notification.

### Phase 12 — Reports, Audit, Polish
- `features/audit`: audit log tables (platform + tenant scoped)
- Saved reports / exports (PDF/CSV)
- Integrations settings (Jira/GitHub/Slack placeholders — future work per source docs)
- Accessibility pass, empty states, loading skeletons, error boundaries everywhere
- **Demo:** feature-complete MVP matching all three source documents.

**Why this order works:** Phases 5→10 exactly retrace the "AI Usage Event" fan-out diagram from doc 01 §3 — you literally cannot build a believable ROI dashboard (Phase 10) without real usage data (Phase 6) flowing through cost (Phase 7) and business context (Phase 8) first. Building analytics/ROI screens earlier only produces fake-looking demo data and rework.

---

## 2. Runtime User Flow (what happens once live)

This is the "factory" from `The Complete System Flow.md`, mapped to actual screens/components.

```
1. Company Registration
   /register-company → creates `companies` row → redirect to /onboarding

2. Onboarding
   /onboarding/company-profile → company_settings
   /onboarding/departments      → seeds departments (Engineering, Sales, HR, Marketing)
   /onboarding/ai-providers     → provider_api_keys stored (encrypted server-side)
   /onboarding/invite-team      → users + user_roles created, invite emails sent
   → redirect to /[companySlug]/dashboard (CEO view)

3. Organization Buildout (CEO, ongoing)
   /organization/departments/[id]/teams → teams created
   /organization/.../teams/[id]/members → employees assigned, job_role + hourly_cost set

4. Daily Use (Employee) — THE CORE LOOP
   /[companySlug]/ai-workspace
     → select Project, Provider, Model
     → send prompt
     → AI Gateway validates: JWT, budget, permissions, rate limit
     → request forwarded to provider, response streamed back into ChatWindow
     → (client is now done — Pipeline 1 complete, employee has their answer)

5. Background Enrichment (invisible to employee, powers dashboards)
   Usage Collector  → ai_requests row stored (raw facts only)
   Cost Engine      → cost_events row computed from provider_pricing
   Business Context → business_events row: employee→team→department→project→task_category
   Analytics Engine → *_analytics_daily rows upserted (aggregation job)
   ROI Engine       → roi_inputs → roi_events → roi_summary rows computed

6. Dashboards Read Precomputed Data (never live-calculate)
   Employee   → /my-workspace           reads own roi_summary + analytics rows
   Team Lead  → /organization/.../teams/[id]  reads team-scoped rows
   Dept Head  → /organization/departments/[id] reads dept-scoped rows
   CEO        → /dashboard              reads company-scoped rows + roi_recommendations
   Super Admin→ /super-admin/dashboard  reads cross-tenant aggregates

7. Alerts Loop Back
   Budget exceeded / usage spike / API key expiring
     → notifications row created
     → NotificationBell badge updates (poll or websocket)
     → relevant persona sees banner on next dashboard visit
```

### Key frontend data-fetching rule that falls out of this

- **AI Workspace screens** → use streaming (SSE/websocket), optimistic UI, no caching of the response itself beyond the conversation.
- **Everything downstream of Usage Collector** (usage, cost, business-context, analytics, ROI, notifications) → use TanStack Query with normal cache/staleTime, because this data is eventually-consistent by design (background workers populate it a few seconds to minutes after the chat happened). **Do not build a spinner that waits for ROI to appear synchronously after a chat message** — surface it as "ROI will update within a few minutes" if you want to acknowledge the async gap in the UI.
