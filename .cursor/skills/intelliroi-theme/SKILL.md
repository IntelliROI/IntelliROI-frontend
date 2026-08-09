---
name: intelliroi-theme
description: IntelliROI visual chassis — dark ops-console, Inter + JetBrains Mono, hairline grids, brand mint logo, plus role-scoped --role-accent colors. Use when styling UI, landing pages, tokens, components, or any visual work. For dashboards also read intelliroi-dashboard.
---

# IntelliROI Theme

## Identity model

**One chassis + role accents.**

| Layer | What stays fixed | What changes |
|-------|------------------|--------------|
| Chassis | ink/surface/hairline, Inter + Mono, sharp corners, motion, Lucide | — |
| Brand | Logo + landing primary `#00E5A8` | — |
| Role | — | `--role-accent` per hierarchy (see below) |

Landing = brand mint. Authenticated shells set `data-role-theme` and paint interactive chrome with role accent.

## Chassis tokens

| Token | Hex |
|-------|-----|
| ink | `#09090B` |
| surface | `#111827` |
| surface-2 | `#1F2937` |
| text-primary | `#F8FAFC` |
| text-secondary | `#CBD5E1` |
| hairline | `#2A2A2A` |
| brand accent | `#00E5A8` |
| accent-blue | `#4F8CFF` |
| warning | `#F59E0B` |
| danger | `#EF4444` |

## Role accents

| Role | Hex |
|------|-----|
| Super Admin | `#67E8F9` |
| CEO | `#E8C547` |
| Dept Manager | `#4F8CFF` |
| Team Lead | `#2DD4BF` |
| Employee | `#00E5A8` |

Full contract: `.cursor/docs/ROLE_COLOR_IDENTITY.md`

## Type

- **Inter** — headings/body
- **JetBrains Mono** — labels, CTAs, metrics, wordmark

Never swap fonts per role.

## Components

- Primary button in-app: role accent fill → invert on hover + role glow
- Panels: hairline mosaics, not soft cards
- Logo: always brand mint
- Icons: Lucide `strokeWidth={1.5}`

## Motion

Ease `[0.22, 1, 0.36, 1]` · Reveal 0.7s · CountUp for KPIs · pulse-dot uses role accent

## Don't

Light mode · purple/cream AI defaults · large radius · emoji · five unrelated themes · role-coloring backgrounds/logo

## Related

- Dashboards: [../intelliroi-dashboard/SKILL.md](../intelliroi-dashboard/SKILL.md)
- Token inventory: [reference.md](reference.md)
- `.cursor/docs/DESIGN_SYSTEM.md`
