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

1. Add `netlify.toml` (already in repo) and set Netlify env:
   - `NEXT_PUBLIC_USE_API_PROXY=true`
   - `NEXT_PUBLIC_APP_URL=https://your-site.netlify.app`
   - `AUTH_UPSTREAM` / `ORG_UPSTREAM` / … = reachable HTTP backends
2. Remove or stop relying on baked-in `NEXT_PUBLIC_*_BASE=http://192.168…` for the browser.
3. Redeploy.

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
