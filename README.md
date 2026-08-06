# IntelliROI Frontend

Enterprise AI Intelligence OS — Next.js 14 App Router frontend for metering, costing, and ROI on employee AI usage.

## Stack

- Next.js 14 (App Router) · React 18 · TypeScript (strict)
- TailwindCSS · IntelliROI dark terminal theme (mint `#00E5A8` / ink `#09090B`)
- TanStack Query · Zustand · React Hook Form-ready · Zod-ready · Recharts · Framer Motion · Lucide

## Architecture

```
src/
├── app/                  # routes only (auth | super-admin | [companySlug])
├── features/             # domain modules 1:1 with backend services
├── components/           # shared UI (layout, charts, dashboard, feedback)
├── lib/                  # api client, rbac, mocks, utils
├── stores/               # Zustand (auth, ui, chat) — no server data
├── config/               # navigation, site/env
└── constants/            # roles
```

**Two pipelines:** AI Workspace (P1) never waits on cost/ROI (P2).

**RBAC:** `lib/rbac/role-matrix.ts` + `<Can>` + role-adaptive `/dashboard`.

## API integration (Postman)

Environment bases match `InteliROI.local.postman_environment.json`:

| Service | Port | Env |
|---------|------|-----|
| auth | 8081 | `NEXT_PUBLIC_AUTH_BASE` |
| organization | 8082 | `NEXT_PUBLIC_ORG_BASE` |
| business-context | 8083 | `NEXT_PUBLIC_BC_BASE` |
| ai-gateway | 8084 | `NEXT_PUBLIC_AI_BASE` |
| usage-cost | 8085 | `NEXT_PUBLIC_COST_BASE` |
| roi-engine | 8086 | `NEXT_PUBLIC_ROI_BASE` |
| analytics | 8087 | `NEXT_PUBLIC_ANALYTICS_BASE` |
| notification | 8088 | `NEXT_PUBLIC_NOTIFY_BASE` |
| billing | 8089 | `NEXT_PUBLIC_BILLING_BASE` |

Feature API modules live under `src/features/*/api/*.api.ts` and switch via:

```
NEXT_PUBLIC_USE_MOCKS=true   # local UI without backend
NEXT_PUBLIC_USE_MOCKS=false  # hit live Postman services
```

## Quick start

See also **[docs/FOLDER_STRUCTURE_KT.md](./docs/FOLDER_STRUCTURE_KT.md)** for team KT (folder map, auth flow, where code lives).

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Enter platform**.

### Demo personas (password `Password123!`)

| Email | Role |
|-------|------|
| `super@intelliroi.com` | Super Admin |
| `ceo@acme.test` | Company Owner / CEO |
| `dept@acme.test` | Department Head |
| `lead@acme.test` | Team Lead |
| `emp@acme.test` | Employee |

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Design system

Tokens and patterns: `docs/DESIGN_SYSTEM.md` · skill `intelliroi-theme` · rule `intelliroi-frontend-theme`.
