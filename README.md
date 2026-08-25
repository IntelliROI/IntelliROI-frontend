# IntelliROI Frontend

Enterprise **AI intelligence / governance** SaaS — meter usage, cost, and **Estimated ROI** across Company → Department → Team → Employee.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app calls live Go services on `:8081`–`:8089`. All of those must be running.

## Netlify (HTTPS → HTTP backends)

Browsers block Mixed Content (`https://` page → `http://` API). This repo uses a **same-origin proxy** instead:

1. `netlify.toml` already sets `NEXT_PUBLIC_USE_API_PROXY=true` and proxies `/api-proxy/*` to `http://103.46.235.22:8081`–`:8089`.
2. In Netlify UI, **delete** any `NEXT_PUBLIC_AUTH_BASE` / `NEXT_PUBLIC_*_BASE` values that start with `http://` (they get baked into the browser bundle and cause Mixed Content).
3. Redeploy. After deploy, Network should show `https://intelliroi-web.netlify.app/api-proxy/auth/...` — never `http://103.46.235.22:8081`.

The browser calls `/api-proxy/auth/...` on your Netlify host; Next/Netlify forward to the HTTP upstream. **Private LAN IPs are not reachable from Netlify’s cloud** — use a public host or tunnel for `*_UPSTREAM`.

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
