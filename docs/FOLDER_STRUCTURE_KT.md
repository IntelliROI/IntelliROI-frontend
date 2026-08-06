# IntelliROI Frontend — Folder Structure KT Guide

> Knowledge-transfer document for engineers joining the codebase.  
> Read this before changing routes, features, RBAC, or API wiring.  
> Companion sources: `.cursor/skills/02-FRONTEND-FOLDER-STRUCTURE.md`, `intelliroi-architecture`, `docs/DESIGN_SYSTEM.md`.

---

## 1. Product mental model (teach this first)

IntelliROI is **not** a consumer chat app. It is a multi-tenant B2B OS that sits between companies and AI providers:

```
Employee → IntelliROI Gateway → OpenAI / Claude / Gemini / …
                │
                ├─ Pipeline 1 (real-time): chat stream — never waits on cost/ROI
                └─ Pipeline 2 (async): usage → cost → business context → analytics → ROI
```

**Hierarchy:** Platform → Company → Department → Team → Employee → AI Workspace.

**Roles:** `SUPER_ADMIN` · `COMPANY_OWNER` · `DEPARTMENT_HEAD` · `TEAM_LEAD` · `EMPLOYEE`.

---

## 2. Top-level repo map

```
IntelliROI-frontend/
├── .cursor/                 # Rules & skills (architecture, theme, RBAC docs)
├── docs/                    # DESIGN_SYSTEM.md, this KT guide
├── InteliROI.postman_collection.json
├── InteliROI.local.postman_environment.json
├── .env.local / .env.example
├── package.json
├── next.config.mjs
├── tailwind.config.ts       # Brand tokens: ink, accent, fonts
├── tsconfig.json
├── global.d.ts              # Ambient CSS module types
└── src/                     # ALL application code lives here
```

---

## 3. How data flows (team cheat sheet)

```
Browser
  → src/app/**/page.tsx           # Thin route: URL params → compose UI
      → src/features/{domain}/    # Business UI + API for ONE backend domain
          → hooks/*.queries.ts    # TanStack Query keys include companySlug
          → api/*.api.ts          # Typed HTTP (mock OR live Postman services)
              → src/lib/api/client.ts
      → src/components/           # Dumb shared UI (shell, KPI, charts)
      → src/stores/               # Zustand: auth / sidebar / chat draft ONLY
      → src/lib/rbac/             # can() + <Can>
```

**Rules:**

1. `app/` pages stay thin — no business transforms in `page.tsx` long-term.
2. Server data → TanStack Query. Never mirror API lists into Zustand.
3. Client-only UI state → Zustand (`auth-store`, `ui-store`, `chat-store`).
4. Permissions → `lib/rbac/role-matrix.ts` first; UI uses `<Can>`, not scattered `if (role === …)`.
5. Tenant scope → every company query key starts with `['company', companySlug, …]`.

---

## 4. `src/app/` — Routes only

| Path | Purpose |
|------|---------|
| `layout.tsx` | Root: Inter + JetBrains Mono, dark class, providers |
| `providers.tsx` | TanStack Query + Sonner toasts |
| `page.tsx` | Marketing/landing → login CTA |
| `forbidden/page.tsx` | 403 UX |
| `middleware.ts` | Session cookie + tenant/role hard guards |

### `(auth)/` — public (no session)

| Route | What |
|-------|------|
| `login/` | `LoginForm` |
| `register-company/` | New tenant signup |
| `forgot-password/` | Request reset email |
| `reset-password/[token]/` | Set new password |
| `verify-email/[token]/` | Email verification ack |

Auth **logic** lives in `features/auth/`, not in the page files.

### `(onboarding)/onboarding/` — first-run wizard (session required)

| Step | Route | Purpose |
|------|-------|---------|
| 1 | `company-profile/` | Confirm company profile |
| 2 | `departments/` | Seed first departments |
| 3 | `ai-providers/` | Connect provider API keys |
| 4 | `invite-team/` | Invite coworkers |

After completion → `/{companySlug}/dashboard`.

### `(platform-admin)/super-admin/` — Super Admin only

| Route | What |
|-------|------|
| `dashboard/` | Platform KPIs, tenants, provider health |
| `companies/`, `companies/[companyId]/` | Tenant list/detail |
| `providers/` | Global AI provider catalog |
| `platform-analytics/` | Cross-tenant metrics |
| `system-health/` | Service health (:8081–:8089) |
| `feature-flags/`, `audit-logs/`, `settings/` | Ops surfaces |

### `(company)/[companySlug]/` — tenant application

Everything is scoped by slug (e.g. `/acme/dashboard`).

| Area | Path | Feature code |
|------|------|--------------|
| Role dashboard | `dashboard/` | Switches CEO / Dept / Team / Employee widgets |
| Departments | `organization/departments/` | `features/organization` |
| Department detail | `organization/departments/[departmentId]/` | `DepartmentDashboard` |
| Team detail | `.../teams/[teamId]/` | `TeamDashboard` |
| Teams list | `organization/teams/` | Org API |
| Employees | `organization/employees/` | Directory + profile |
| Projects | `organization/projects/` | Project list |
| AI Workspace | `ai-workspace/`, `[conversationId]/` | Pipeline 1 chat |
| Prompt templates | `ai-workspace/templates/` | Template library |
| AI Providers | `ai-providers/` | Company keys |
| Usage | `usage/`, `usage/[requestId]/` | Raw request facts |
| Budgets | `budgets/` | Cost service |
| Benchmarks | `business-context/task-benchmarks/` | Approve/reject |
| Analytics | `analytics/` + scoped child routes | Precomputed aggregates |
| ROI | `roi/`, `roi/recommendations/` | Financial ROI + provenance |
| My Workspace | `my-workspace/` | Employee self-service |
| Notifications | `notifications/` | Inbox + mark read |
| Settings | `settings/company`, `settings/audit-logs` | Billing + audit |
| Reports | `reports/` | Saved packs (placeholder) |

**Department vs Team:**

- Department UI → `features/organization/components/DepartmentDashboard.tsx`
- Team UI → `features/organization/components/TeamDashboard.tsx`
- Shared HTTP → `features/organization/api/organization.api.ts`

---

## 5. `src/features/` — Domain logic (1 folder ≈ 1 backend domain)

| Feature | Backend (Postman) | Contains |
|---------|-------------------|----------|
| `auth/` | auth :8081 | Login/register/forgot/reset, `RequireAuth`, schemas, hooks |
| `organization/` | org :8082 | Depts, teams, employees, projects + dashboards |
| `ai-providers/` | ai :8084 (keys) | Company provider key management UI/hooks |
| `ai-gateway/` | ai :8084 | Low-level chat/providers/conversations API |
| `ai-workspace/` | uses ai-gateway | Chat UI, templates, streaming buffer |
| `usage/` | cost/gateway facts | Request table + detail |
| `cost/` | cost :8085 | Budgets / cost summary API |
| `business-context/` | bc :8083 | Job roles, categories, benchmarks |
| `analytics/` | analytics :8087 | Scoped analytics hooks + API |
| `roi/` | roi :8086 | ROI summary, recommendations, CEO dashboard |
| `notifications/` | notify :8088 | Inbox UI + API |
| `audit/` | (tenant/platform logs) | Audit table components |
| `system-config/` | billing + platform | Super-admin metrics, billing |

### Ideal feature shape (grow toward this)

```
features/roi/
  api/roi.api.ts
  hooks/useRoiSummary.ts
  hooks/roi.queries.ts      # queryKey factories
  types/roi.types.ts
  schemas/…                 # zod at mutation boundaries
  components/
  index.ts
```

---

## 6. `src/components/` — Shared, domain-agnostic UI

| Folder | Contents |
|--------|----------|
| `layout/AppShell.tsx` | Sidebar + topbar + logout + notification bell |
| `dashboard/KpiTile.tsx` | KPI mosaic cell |
| `charts/Charts.tsx` | Recharts wrappers (mint/blue palette) |
| `feedback/States.tsx` | PageHeader, EmptyState, LoadingBlock, DataTable |
| `ui/` | Button, Input, Panel, Chapter, LiveDot, Provenance |

**Rule:** if a component imports `features/`, move it into that feature.

---

## 7. `src/lib/` — Framework glue

| Path | Job |
|------|-----|
| `api/client.ts` | `apiRequest(service, path)`, Bearer token, unwrap `{ data }` |
| `api/query-keys.ts` | Tenant-safe TanStack Query key factories |
| `rbac/role-matrix.ts` | Single source of permissions |
| `rbac/Can.tsx` | Conditionally render by permission |
| `mocks/data.ts` | Demo tenants, users, ROI, depts (when `USE_MOCKS=true`) |
| `utils.ts` | `cn`, currency/percent formatters, slugify |
| `motion.ts` | Shared Framer ease `[0.22, 1, 0.36, 1]` |

Service bases → `config/site.ts` (env → ports **8081–8089**).

---

## 8. `src/stores/` — Zustand (client-only)

| Store | Holds | Must NOT hold |
|-------|-------|---------------|
| `auth-store.ts` | user, company, tokens (+ cookie sync for middleware) | ROI/analytics lists |
| `ui-store.ts` | sidebar collapsed | Server entities |
| `chat-store.ts` | draft, streaming buffer, active conversation id | Full conversation history (use Query) |

---

## 9. `src/config/` · `src/constants/` · `src/types/` · `src/styles/`

| Path | Purpose |
|------|---------|
| `config/site.ts` | Service URLs, `useMocks`, site name |
| `config/navigation.ts` | Role-filtered sidebar items |
| `constants/roles.ts` | Role enum + labels |
| `types/auth.types.ts` | User, Company, AuthSession |
| `types/css.d.ts` | Allows `import "*.css"` |
| `styles/globals.css` | Tokens, grain, scrollbar, selection |

---

## 10. Auth & session flow

1. `/login` → `LoginForm` → `authApi.login`
2. `useAuthStore.setSession` persists tokens (localStorage **and** cookies for middleware)
3. Redirect:
   - Super Admin → `/super-admin/dashboard`
   - New company → `/onboarding/company-profile` (when onboarding incomplete)
   - Employee → `/{slug}/my-workspace`
   - Others → `/{slug}/dashboard`
4. Layouts wrap with `RequireAuth`; middleware double-checks cookie + role/tenant
5. `apiRequest` attaches `Authorization: Bearer …`

**Demo personas** (password `Password123!`):

| Email | Role |
|-------|------|
| `super@intelliroi.com` | Super Admin |
| `ceo@acme.test` | Company Owner |
| `dept@acme.test` | Department Head |
| `lead@acme.test` | Team Lead |
| `emp@acme.test` | Employee |

---

## 11. API / Postman mapping

| Env var | Port | Feature |
|---------|------|---------|
| `NEXT_PUBLIC_AUTH_BASE` | 8081 | auth |
| `NEXT_PUBLIC_ORG_BASE` | 8082 | organization |
| `NEXT_PUBLIC_BC_BASE` | 8083 | business-context |
| `NEXT_PUBLIC_AI_BASE` | 8084 | ai-gateway / workspace |
| `NEXT_PUBLIC_COST_BASE` | 8085 | cost / usage $ |
| `NEXT_PUBLIC_ROI_BASE` | 8086 | roi |
| `NEXT_PUBLIC_ANALYTICS_BASE` | 8087 | analytics |
| `NEXT_PUBLIC_NOTIFY_BASE` | 8088 | notifications |
| `NEXT_PUBLIC_BILLING_BASE` | 8089 | billing |

`NEXT_PUBLIC_USE_MOCKS=true` → mock repository (UI unchanged).  
`false` → live Go services from the Postman collection.

---

## 12. Theme (non-negotiable)

- Dark only: ink `#09090B`, mint accent `#00E5A8`, hairline `#2A2A2A`
- Inter (prose) + JetBrains Mono (labels/CTAs/metrics)
- Sharp corners, hairline mosaics — no soft purple card stacks
- Full inventory: `docs/DESIGN_SYSTEM.md` + skill `intelliroi-theme`

---

## 13. “Where is X?” quick index

| Question | Go here |
|----------|---------|
| Login / register / reset | `features/auth/` |
| Department UI | `features/organization/components/DepartmentDashboard.tsx` |
| Team UI | `features/organization/components/TeamDashboard.tsx` |
| Chat | `features/ai-workspace/` + `features/ai-gateway/api` |
| ROI numbers | `features/roi/` (never compute formulas in UI) |
| Permissions | `lib/rbac/role-matrix.ts` |
| Sidebar config | `config/navigation.ts` |
| Session | `stores/auth-store.ts` |
| Query keys | `lib/api/query-keys.ts` |
| HTTP bases | `config/site.ts` + `.env.local` |
| Usage requests | `features/usage/` |
| Audit logs UI | `features/audit/` |
| Notifications | `features/notifications/` |

---

## 14. What is solid vs still growing

**Solid pattern:** route groups, feature domains, RBAC matrix, mock-first APIs, theme tokens, role-adaptive dashboard, Postman service map.

**Still growing toward full MVP:** richer CRUD forms, full shadcn surface, real SSE streaming against gateway, PDF reports, integrations settings, comprehensive tests (rule `090-testing-quality`).

When adding a screen: place the route under the correct group, put logic in the matching `features/{domain}/`, use query keys with `companySlug`, wrap gated UI in `<Can>`, match the IntelliROI theme.

---

*Last updated with the P0/P1 gap closure pass (middleware cookies, onboarding, auth recovery routes, feature hooks/modules, scoped analytics, notifications, templates).*
