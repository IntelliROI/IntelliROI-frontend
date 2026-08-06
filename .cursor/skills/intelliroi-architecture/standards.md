# IntelliROI Coding Standards & Roadmap

Companion to `SKILL.md` and `architecture.md`.

## File Naming Convention

| Kind | Convention | Example |
|------|------------|---------|
| Route segments | `kebab-case` folders | `ai-workspace/` |
| React components | `PascalCase.tsx` | `KpiCard.tsx` |
| Hooks | `useCamelCase.ts` | `useOrgScope.ts` |
| Utilities | `camelCase.ts` | `formatTokens.ts` |
| Types | `camelCase.types.ts` or `types.ts` | `analytics.types.ts` |
| Zod schemas | `camelCase.schema.ts` | `inviteEmployee.schema.ts` |
| API modules | `camelCase.api.ts` | `departments.api.ts` |
| Query hooks | `camelCase.queries.ts` | `departments.queries.ts` |
| Constants | `camelCase.constants.ts` or `SCREAMING` exports | `ANALYTICS_RANGE` |
| Feature public API | `index.ts` barrel (export only public) | |

Avoid default exports for components/hooks except Next.js route files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).

## Coding Standards

1. **TypeScript strict** — no `any`; prefer `unknown` + narrowing; explicit return types on exported functions.
2. **Server/Client boundaries** — mark `"use client"` only where needed; push data fetching to server components or React Query intentionally.
3. **Colocation** — keep feature code inside `features/<name>`; promote to `shared/` only after second use.
4. **Accessibility** — Radix/shadcn defaults; keyboard nav; visible focus; label all inputs; respect `prefers-reduced-motion`.
5. **Errors** — never swallow; map API errors to user-visible states; log unexpected failures.
6. **Security** — no secrets in client bundles; RBAC on routes and mutations; sanitize rendered markdown/HTML in workspace if any.
7. **Performance** — virtualize large tables; paginate analytics; avoid fetching org-wide datasets on employee views.
8. **Testing mindset** — pure utils and Zod schemas should be unit-testable; critical RBAC helpers must be covered.
9. **Imports** — absolute aliases (`@/features/...`, `@/shared/...`, `@/core/...`); no deep relative `../../../`.
10. **Comments** — only for non-obvious business rules (e.g. ROI estimation caveats), not narration.

## Utility Structure

```
shared/lib/
├── cn.ts
├── format/
│   ├── currency.ts
│   ├── number.ts
│   ├── tokens.ts
│   └── date.ts
├── crypto/          # client-safe helpers only
└── constants/
    └── navigation.ts

shared/utils/
├── assert.ts
├── noop.ts
└── download.ts
```

Format tokens, USD, percentages, and compact numbers consistently across dashboards.

## Design System Alignment

- Base primitives: shadcn/ui + Radix
- Visual tokens: follow `intelliroi-theme` skill
- Charts: one chart library chosen project-wide (e.g. Recharts) wrapped in `AnalyticsChart`
- Icons: Lucide (or Heroicons) SVG only — never emoji as icons
- Motion: Framer Motion for shell transitions and intentional feedback — not decorative noise

## Component Organization Rules

1. `shared/components/ui` — shadcn only (generated/edited carefully)
2. `shared/components/*` — domain-agnostic composites
3. `features/*/components` — domain-specific
4. `widgets/` — cross-page compositions that are not a full feature
5. Pages (`app/**/page.tsx`) stay thin: compose feature widgets + pass params

## Implementation Roadmap

### Phase 0 — Foundation
- [ ] Next.js App Router scaffold + TypeScript + Tailwind + shadcn
- [ ] Path aliases, lint/format, env config
- [ ] Auth skeleton + RBAC primitives
- [ ] AppShell layouts `(auth)`, `(platform)`, `(company)`
- [ ] Design tokens / dark theme (`intelliroi-theme`)

### Phase 1 — Organization MVP
- [ ] Companies (Super Admin)
- [ ] Departments, Teams, Employees CRUD (scoped)
- [ ] Invites + role assignment
- [ ] Org hierarchy selectors + breadcrumbs

### Phase 2 — AI Workspace MVP
- [ ] Provider selection
- [ ] Prompt chat + model picker
- [ ] Conversation history
- [ ] Business-context metadata on messages (dept/team/project tags)

### Phase 3 — Analytics & ROI MVP
- [ ] Executive / role dashboards
- [ ] Usage + token analytics
- [ ] Department / team / employee analytics
- [ ] Estimated ROI views
- [ ] Shared filter bar (date + scope)

### Phase 4 — Governance
- [ ] Audit logs
- [ ] Policies / budgets (CEO+)
- [ ] Reports export

### Phase 5 — Commercial & Ops
- [ ] Billing / plans (platform + company as applicable)
- [ ] Notifications
- [ ] Support tooling

### Phase 6 — Integrations (Future)
- [ ] Integration registry + feature flags
- [ ] Add providers without restructuring core modules

## Quality Bar (Definition of Done)

A feature is done when:

- [ ] Correct role can access; incorrect role is blocked (UI + route)
- [ ] Data queries are scoped to hierarchy
- [ ] Loading / empty / error / forbidden states exist
- [ ] Responsive at 375 / 768 / 1024 / 1440
- [ ] Types + Zod at API boundary
- [ ] Matches dark enterprise visual language
- [ ] No consumer-chat visual regressions in the app shell

## Engineering North Star

Optimize for long-term maintainability, scalability, readability, and developer productivity — similar expectations to products from Microsoft, Google, Atlassian, Stripe, Vercel, and Linear.
