# IntelliROI Theme — Reference

Source: `.cursor/docs/DESIGN_SYSTEM.md`

## CSS variables

```css
--ink: #09090B;
--surface: #111827;
--surface-2: #1F2937;
--text-primary: #F8FAFC;
--text-secondary: #CBD5E1;
--hairline: #2A2A2A;
--accent: #00E5A8;
--accent-blue: #4F8CFF;
--warning: #F59E0B;
--danger: #EF4444;
--ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1);
--reveal-duration: 0.7s;
```

## Type scale (landing / marketing)

| Use | Spec |
|-----|------|
| Hero H1 | `text-5xl` → `xl:text-[5.25rem]` · `font-light` · `leading-[0.98]` · `tracking-tighter` |
| Section H2 | `text-3xl md:text-5xl` · `font-medium` · `tracking-tight` |
| Body | `text-base md:text-lg` · `leading-relaxed` · `text-text-secondary` |
| Chapter / overline | `font-mono text-xs` / `text-[10px]` · `uppercase` · `tracking-[0.25em]` |
| Metrics | `font-mono font-light` · large sizes |
| Logo | `font-mono text-sm font-semibold tracking-[0.2em]` → `INTELLIROI` |

## Layout

- Max width: `max-w-[1400px]`; pad `px-6 md:px-12`
- Section vertical: `py-24 md:py-32 lg:py-36`
- Nav height: `72px`
- Default border: `1px border-hairline`; radius **0** (except status dots)

## Gradients

- Hero glow: `radial-gradient(ellipse at center, rgba(0,229,168,0.09) 0%, rgba(9,9,11,0) 65%)`
- Grid: `#2A2A2A` 1px / `72×72` with radial mask
- Film grain: SVG noise opacity `0.035`

## Button variants

| Variant | Idle | Hover |
|---------|------|-------|
| Primary | `border-accent bg-accent text-ink` | transparent + `text-accent` |
| Secondary | `border-hairline text-text-primary` | `border-accent/50 text-accent` |

## Framer default

```js
{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }
```

## Section chapter pattern

Mono number + hairline rule + uppercase label → Inter headline (accent span on key phrase) → secondary body → hairline grid / mosaic content.

## App shell note

Product app UI inherits the same tokens and sharp ops-console language. Prefer scoped dashboards with mono KPI figures and hairline panels over soft SaaS card stacks.

## Role accents (product shell)

Chassis stays fixed. Set `data-role-theme` on AppShell and bind interactive chrome to `--role-accent`:

| Theme | Hex |
|-------|-----|
| `super-admin` | `#67E8F9` |
| `ceo` | `#E8C547` |
| `department-manager` | `#4F8CFF` |
| `team-lead` | `#2DD4BF` |
| `employee` | `#00E5A8` |

Logo / landing CTAs keep `--brand-accent: #00E5A8`. Full rules: `.cursor/docs/ROLE_COLOR_IDENTITY.md`. Dashboard patterns: skill `intelliroi-dashboard`.
