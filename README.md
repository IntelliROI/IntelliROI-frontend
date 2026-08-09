# IntelliROI Frontend

Enterprise **AI intelligence / governance** SaaS — meter usage, cost, and **Estimated ROI** across Company → Department → Team → Employee.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With `NEXT_PUBLIC_USE_MOCKS=true`, UI runs without backends.

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind · TanStack Query · Zustand · Zod · Framer Motion · Recharts

## Architecture (read first)

| Doc | Purpose |
|-----|---------|
| [`AGENTS.md`](./AGENTS.md) | Product non‑negotiables + Cursor skills |
| [`src/README.md`](./src/README.md) | Beginner folder map |
| [`docs/FOLDER_STRUCTURE_KT.md`](./docs/FOLDER_STRUCTURE_KT.md) | Full KT guide |
| [`.cursor/docs/ROLE_COLOR_IDENTITY.md`](./.cursor/docs/ROLE_COLOR_IDENTITY.md) | Shared fonts + role accents |

**One shell + RBAC scope** — not five separate role apps.

## Scripts

| Command | What |
|---------|------|
| `npm run dev` | Local dev |
| `npm run build` | Production build |
| `npm run start` | Serve build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Security & performance defaults

- Middleware guards: auth cookie, Super Admin routes, tenant slug match
- Security headers: `X-Frame-Options`, `nosniff`, Referrer-Policy, Permissions-Policy
- Query defaults: 60s staleTime, no refetch-on-focus spam
- API client: 30s timeout, abort support
- Fonts: `display: swap` · `poweredByHeader: false`

## Role accents

Same Inter + JetBrains Mono chassis; interactive accent changes by role (`data-role-theme` on AppShell).
