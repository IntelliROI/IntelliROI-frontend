---
name: intelliroi-dashboard
description: World-class IntelliROI SaaS analytics dashboard patterns — MNC density, role-accent KPI mosaics, charts, shells. Use when building dashboards, analytics, ROI views, KPI tiles, sidebars, or any scoped executive/manager/employee intelligence UI. Prefer 21st.dev inspiration before inventing layouts.
---

# IntelliROI Dashboard (World-Class SaaS)

Build dashboards like top MNC analytics platforms (Stripe/Datadog/Vercel/Linear density + Bloomberg ops clarity) — **not** generic AI purple card grids.

## Before coding

1. Read `.cursor/skills/intelliroi-theme/SKILL.md` (chassis)
2. Read `.cursor/docs/ROLE_COLOR_IDENTITY.md` (role accent)
3. Query **21st.dev MCP** for layout inspiration (metadata first):
   - `get_inspiration` — enterprise analytics / KPI / charts
   - `search` — `type: "component"` for KPI cards, sidebars, line charts
4. Adapt patterns into IntelliROI tokens + `data-role-theme` — do not paste foreign fonts/radii/colors wholesale.

### Canonical 21st references (patterns, not copy-paste themes)

| Pattern | 21st component | Steal this |
|---------|----------------|------------|
| KPI + area chart strip | Advanced Stats | Hero metrics + timeline chart |
| Dense exec grid | Efferd Dashboard 2 | Multi-panel revenue/health mosaic |
| Sparkline KPI | Progress Metric Card / Weekly KPI Chart | Large figure + micro trend |
| Shell | Dashboard Sidebar (Charcoal Ink) | Collapsible rail + content frame |
| Trend lines | Line Charts (sean0205 series) | Clean metric series layouts |

## Chassis + role accent

- Surfaces/type/motion = shared IntelliROI chassis
- Interactive accent = `--role-accent` from viewer role
- Logo always brand mint

## Layout anatomy (every scoped dashboard)

```
┌─ Shell (sidebar role-tint active item) ──────────────┐
│ Breadcrumb = viewer scope only                       │
│ ┌─ KPI mosaic (gap-px hairline) ───────────────────┐ │
│ │ Hero KPI (mono, CountUp) │ spark │ delta %       │ │
│ │ 3–5 support KPIs                                 │ │
│ └──────────────────────────────────────────────────┘ │
│ ┌─ Primary chart ─────┐ ┌─ Breakdown / ranking ───┐ │
│ │ Usage / Cost / ROI  │ │ Dept|Team|Employee bars │ │
│ └─────────────────────┘ └─────────────────────────┘ │
│ ┌─ Insights / alerts (Estimated ROI language) ─────┐ │
│ └──────────────────────────────────────────────────┘ │
│ Drill: Company → Dept → Team → Employee → Request    │
└──────────────────────────────────────────────────────┘
```

## Role dashboard questions

| Role | First screen answers |
|------|----------------------|
| Super Admin | How healthy is the SaaS platform? |
| CEO | Is AI investment producing value? |
| Dept Manager | How is my department using AI? |
| Team Lead | How is my team performing? |
| Employee | What is my usage + estimated productivity? |

Same components; different **scope filters** + **role accent**.

## MNC quality bar

1. **Hierarchy of one** — one hero metric per viewport region; no equal-weight clutter
2. **Hairline mosaics** — `gap-px` + ink cells > floating soft cards
3. **Mono for data** — JetBrains Mono for KPIs, deltas, codes
4. **Estimated ROI** only — never “Actual ROI”
5. **Density with breath** — executive grids are information-rich, not cramped
6. **2–3 motions** — Reveal + CountUp + live pulse (role-colored)
7. **Empty/loading** — skeleton mirrors final mosaic (see Sidebar Dashboard Skeleton pattern)
8. **No glassmorphism soup / neon purple / rounded-full pill clusters**

## Implementation hooks

```tsx
// AppShell
<div data-role-theme={roleTheme}> // super-admin | ceo | department-manager | team-lead | employee
  <Sidebar /> {/* active item uses var(--role-accent) */}
  <DashboardScope scope={userScope} />
</div>
```

KPI tile: large mono value · micro label uppercase · sparkline in `--role-accent` · delta in success/danger semantics.

Charts: primary series = role accent; secondary = `accent-blue` / `warning` / `text-secondary` as needed for multi-series (providers).

## Anti-patterns

- Separate visual “skins” per role (different fonts/backgrounds)
- Rainbow everything — only interactive chrome + primary series
- Marketing landing density on ops dashboards (or vice versa)
- Cards with heavy drop shadows and large radius

## Deep links

- Role colors: `.cursor/docs/ROLE_COLOR_IDENTITY.md`
- Experiences: `.cursor/skills/intelliroi-rbac/SKILL.md`
- Theme tokens: `.cursor/skills/intelliroi-theme/reference.md`
