# IntelliROI — Role Color Identity

> Shared chassis (fonts, surfaces, layout language) + **role-scoped accent identity**.
> Landing / marketing stays brand mint. Product dashboards tint by hierarchy role.

---

## Decision

**Do not** ship five different themes (different fonts, radii, backgrounds).

**Do** keep one IntelliROI chassis and swap only the **role accent** (and its glow/muted variants). This is how top MNC SaaS products signal context without breaking brand: one product DNA, clear altitude cues.

```
Chassis (constant)          Role accent (variable)
─────────────────           ──────────────────────
ink / surface / hairline    --role-accent
Inter + JetBrains Mono      --role-accent-muted
Sharp corners (≈0)          --role-glow
Hairline mosaics            active nav / CTAs / focus / KPI spark
Lucide 1.5 · motion ease    role badge · primary chart series
Brand mint logo wordmark
Status: warning / danger
```

---

## Role accent map

| Role | Token key | Hex | Glow | Meaning |
|------|-----------|-----|------|---------|
| **Brand / Landing** | `brand` | `#00E5A8` | `rgba(0,229,168,0.25)` | Marketing + logo always |
| **Super Admin** | `platform` | `#67E8F9` | `rgba(103,232,249,0.22)` | Ice cyan — infrastructure |
| **CEO / Owner** | `executive` | `#E8C547` | `rgba(232,197,71,0.22)` | Executive gold — business value |
| **Department Manager** | `department` | `#4F8CFF` | `rgba(79,140,255,0.22)` | Signal blue — dept scope |
| **Team Lead** | `team` | `#2DD4BF` | `rgba(45,212,191,0.22)` | Aurora teal — team scope |
| **Employee** | `employee` | `#00E5A8` | `rgba(0,229,168,0.25)` | Brand mint — AI workspace |

### Fixed semantic colors (never role-swap)

| Token | Hex | Use |
|-------|-----|-----|
| `warning` | `#F59E0B` | Alerts / tertiary charts (≠ executive gold) |
| `danger` | `#EF4444` | Negative deltas |
| `success` | `#22C55E` | Optional; prefer role accent for positive ROI |

### Chassis (unchanged)

| Token | Hex |
|-------|-----|
| `ink` | `#09090B` |
| `surface` | `#111827` |
| `surface-2` | `#1F2937` |
| `text-primary` | `#F8FAFC` |
| `text-secondary` | `#CBD5E1` |
| `hairline` | `#2A2A2A` |

---

## What role accent paints

**Yes — use `--role-accent`:**
- Active sidebar item indicator / text
- Primary buttons & focus rings in that experience
- Live status pulse on that shell
- KPI tile sparkline / primary chart series
- Role chip / “VIEWING AS” scope badge
- Soft radial atmosphere tint (low opacity, same as current mint glow pattern)

**No — keep brand / chassis:**
- `INTELLIROI` logo mark + wordmark → always mint brand
- Page background → always `ink`
- Body / secondary text → chassis tokens
- Borders → `hairline` (active border may use role accent at 40–60%)
- Cross-role drill-down breadcrumbs → chassis; optional tiny role dot

---

## CSS contract

Set on the authenticated shell root (e.g. `AppShell`):

```html
<div data-role-theme="ceo" class="min-h-screen bg-ink ...">
```

```css
:root {
  --brand-accent: #00E5A8;
  --role-accent: var(--brand-accent);
  --role-accent-muted: color-mix(in srgb, var(--role-accent) 15%, transparent);
  --role-glow: 0 0 40px color-mix(in srgb, var(--role-accent) 25%, transparent);
}

[data-role-theme="super-admin"] { --role-accent: #67E8F9; }
[data-role-theme="ceo"]         { --role-accent: #E8C547; }
[data-role-theme="department-manager"] { --role-accent: #4F8CFF; }
[data-role-theme="team-lead"]   { --role-accent: #2DD4BF; }
[data-role-theme="employee"]    { --role-accent: #00E5A8; }
```

Tailwind: map `accent` utilities used inside the shell to `var(--role-accent)` where interactive; keep `brand` utilities for logo/marketing.

---

## Hierarchy altitude (visual story)

```
Platform     ice cyan     ← cold / system
Company      gold         ← money / ROI
Department   blue         ← management
Team         teal         ← coordination
Employee     mint         ← product / AI (brand home)
```

Altitude should feel progressive, not random rainbow. Never introduce purple/indigo as a role accent.

---

## Impersonation / support

If Super Admin opens a company tenant view, show **company role theme** for content but keep a persistent **platform ice-cyan** “Platform support” strip so identity never confuses.
