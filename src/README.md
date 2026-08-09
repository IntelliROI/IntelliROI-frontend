# `src/` — Beginner map

IntelliROI keeps **one app shell**. Folders mirror product domains so new developers can find code fast.

```
src/
├── app/              # ROUTES ONLY (Next.js App Router) — keep pages thin
├── components/       # Shared UI (buttons, shell, charts) — no business APIs
├── features/         # ONE folder per business domain (auth, roi, usage, …)
├── config/           # Navigation, site URLs, feature flags
├── constants/        # Roles, enums (stable vocabulary)
├── lib/              # api client, rbac, auth cookies, theme, utils
├── stores/           # Zustand: auth / ui / chat draft ONLY (not server lists)
├── styles/           # globals.css + design tokens
└── types/            # Shared TypeScript types
```

## Registration journey (design docs)

```
Register company (CEO)
  → Onboarding: Company settings
  → Job roles (hourly cost)
  → Departments
  → Teams
  → AI providers
  → Employees (full org identity)
  → /{companySlug}/dashboard
```

Ongoing: `organization/job-roles`, `departments`, `teams`, `employees/new`.

## Golden rules

1. **`app/` page** = URL + compose components. No heavy logic.
2. **`features/<name>/`** = API + hooks + feature UI for that domain.
3. **Server data** → TanStack Query (`features/*/hooks`). Never copy API lists into Zustand.
4. **Permissions** → `lib/rbac` + `<Can>`. Don’t scatter `if (role === "CEO")`.
5. **Role colors** → `data-role-theme` on `AppShell` (`lib/theme/role-theme.ts`).

## Features ↔ product

| Folder | Owns |
|--------|------|
| `auth` | Login, register, session |
| `organization` | Depts, teams, employees, projects |
| `ai-workspace` | Chat UI |
| `ai-providers` | Company provider config |
| `ai-gateway` | Prompt/stream calls |
| `usage` / `cost` / `roi` / `analytics` | Intelligence rollups |
| `audit` / `notifications` | Ops |
| `business-context` | Task benchmarks |
| `system-config` | Super Admin platform |

## Route groups

| Group | Who |
|-------|-----|
| `(auth)` | Public login/register |
| `(onboarding)` | First-time company setup |
| `(platform-admin)` | Super Admin |
| `(company)/[companySlug]` | Tenant (CEO → Employee) |

Deep guide: `docs/FOLDER_STRUCTURE_KT.md` · Product rules: `AGENTS.md`
