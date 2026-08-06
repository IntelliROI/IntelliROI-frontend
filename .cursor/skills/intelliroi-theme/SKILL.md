---
name: intelliroi-theme
description: >-
  Apply and preserve the IntelliROI dark terminal/Bloomberg design system
  (Inter + JetBrains Mono, mint #00E5A8, ink #09090B, hairline grids, Framer
  Motion reveals, Lenis scroll). Use when building or editing frontend UI,
  landing sections, components, Tailwind styles, CSS, buttons, cards, charts,
  animations, or any visual work in this app so the theme stays unique and consistent.
---

# IntelliROI Theme Skill

Enforce the IntelliROI visual system on every frontend change. Full inventory: [docs/DESIGN_SYSTEM.md](../../../docs/DESIGN_SYSTEM.md) and [reference.md](reference.md).

## When this skill applies

- New or edited React/JSX components under `app/src`
- Tailwind / CSS / `tailwind.config.js` / `index.css` changes
- Landing sections, CTAs, forms, charts, modals, nav
- Motion, hover, scroll, or status-indicator work

## Non-negotiables

1. **Dark only** — background `ink` `#09090B`. No light mode.
2. **Accent is mint** `#00E5A8` — CTAs, live states, positive ROI. Secondary data: `#4F8CFF`.
3. **Fonts** — Inter (`font-sans`) for prose/headings; JetBrains Mono (`font-mono`) for nav, CTAs, labels, metrics, logo, codes.
4. **Sharp + hairline** — near-zero radius; borders `#2A2A2A`; prefer `gap-px` mosaics over soft cards.
5. **Glow not drop-shadow** — mint `box-shadow` on hero CTAs / featured panels only.
6. **Chapter system** — major sections use `Chapter` (mono number + rule + uppercase label) via `shared.jsx`.
7. **Motion** — `Reveal` ease `[0.22, 1, 0.36, 1]`; `animate-pulse-dot` for live; Lenis `1.15s`; purposeful, not noisy.
8. **Icons** — Lucide only, `strokeWidth={1.5}`. No emoji.
9. **No AI-default looks** — no purple-indigo themes, cream+serif+terracotta, or broadsheet layouts.

## Build checklist

Copy and track:

```
Theme check:
- [ ] Uses ink / surface / hairline / accent tokens (not ad-hoc colors)
- [ ] Inter for prose; JetBrains Mono for system chrome
- [ ] Sharp corners; hairline borders
- [ ] Primary CTA = filled mint → invert on hover
- [ ] Secondary CTA = hairline outline → accent border/text on hover
- [ ] Section has Chapter + one headline + short support (one job)
- [ ] Motion: Reveal and/or pulse-dot; shared easing
- [ ] No photography/pills/floating badges in hero
- [ ] Lucide stroke 1.5
```

## Component recipes

### Primary button
```jsx
className="group flex items-center gap-2 border border-accent bg-accent px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink shadow-[0_0_40px_rgba(0,229,168,0.25)] transition-all duration-300 hover:bg-transparent hover:text-accent"
```

### Secondary button
```jsx
className="border border-hairline px-7 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-text-primary transition-colors duration-300 hover:border-accent/50 hover:text-accent"
```

### Section shell + chapter
```jsx
import { Reveal, Chapter, SectionShell } from "./shared";

<SectionShell id="example">
  <Reveal>
    <Chapter number="01" label="Example" id="example" />
    <h2 className="mt-10 text-3xl font-medium tracking-tight text-text-primary md:text-5xl">
      Headline with <span className="text-accent">accent phrase</span>
    </h2>
    <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg">
      One short supporting sentence.
    </p>
  </Reveal>
</SectionShell>
```

### Live status
```jsx
<span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
```

### Hairline mosaic
```jsx
<div className="grid gap-px bg-hairline md:grid-cols-2">
  <div className="bg-ink p-6">…</div>
  <div className="bg-ink p-6">…</div>
</div>
```

## Color quick reference

| Token | Hex |
|-------|-----|
| ink | `#09090B` |
| surface | `#111827` |
| text-primary | `#F8FAFC` |
| text-secondary | `#CBD5E1` |
| hairline | `#2A2A2A` |
| accent | `#00E5A8` |
| accent-blue | `#4F8CFF` |
| danger | `#EF4444` |
| warning | `#F59E0B` |

## Motion quick reference

| Piece | Spec |
|-------|------|
| Reveal | opacity + y30→0, `0.7s`, ease `[0.22, 1, 0.36, 1]` |
| CountUp | spring stiffness 55, damping 18 |
| pulse-dot | 2s ease-in-out infinite |
| marquee | 48s linear infinite |
| blink | 1.1s step-end infinite |
| Lenis | duration 1.15 |

Reuse `Reveal` / `CountUp` / `Chapter` / `SectionShell` from `app/src/components/landing/shared.jsx` instead of inventing new primitives.

## Anti-patterns

| Avoid | Prefer |
|-------|--------|
| `#purple` / indigo gradients | Mint `#00E5A8` on ink |
| `rounded-2xl` cards + soft shadows | Sharp `border-hairline` panels |
| Inter-only UI | Mono for labels/CTAs/data |
| Flat single-color hero | Grid + mint radial glow + grain |
| Decorative pill clusters | Square mono chips / chapter labels |
| Random easings | Shared `[0.22, 1, 0.36, 1]` |

## More detail

- Token tables, animation inventory, layout specs → [reference.md](reference.md)
- Full double-pass analysis → [docs/DESIGN_SYSTEM.md](../../../docs/DESIGN_SYSTEM.md)
