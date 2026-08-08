# IntelliROI Landing — Design System Analysis

> Double-pass inventory of theme, typography, color, layout patterns, and motion.
> Source of truth for the project skill (`.cursor/skills/intelliroi-theme`) and rule (`.cursor/rules/intelliroi-frontend-theme.mdc`).
>
> Analyzed: `app/src/**`, `app/tailwind.config.js`, `app/index.html`, `app/src/index.css`

---

## 1. Theme & Visual Identity

| Attribute | Spec |
|-----------|------|
| **Mode** | Dark only (`html.dark`). No light theme. |
| **Aesthetic** | Terminal / Bloomberg / ops-console |
| **Personality** | Precision, enterprise, high-signal, infrastructure-grade |
| **Composition** | Single long-scroll landing, chaptered sections (`01`–`10`) |
| **Corners** | Sharp rectangles (almost no border-radius in UI) |
| **Atmosphere** | Film-grain overlay + radial mint glows + CSS grid backdrop |
| **Product visual** | Faux dashboard chrome (Recharts + tables), not photography |

### Brand test
If you remove the nav, the first viewport must still read as IntelliROI: mint accent, mono labels, ink background, hairline grid, live-status pulse.

### Page structure (`App.jsx`)
1. Fixed `Nav` → 2. `Hero` → 3. `Marquee` → 4. `Problem` → 5. `Solution` → 6. `Features` → 7. `DashboardSection` → 8. `ROICalculator` → 9. `Architecture` → 10. `Integrations` → 11. `Security` → 12. `Pricing` → 13. `FAQ` → 14. `FinalCTA` (+ footer) → 15. `DemoModal` → Sonner toaster

### Recurring section pattern
- **Chapter:** mono number + hairline rule + uppercase label (`Chapter` in `shared.jsx`)
- **Headline:** Inter, medium (or light for hero/final CTA), accent span on key phrase
- **Body:** `text-text-secondary`, `leading-relaxed`
- **Content:** hairline grids / bordered panels / `gap-px` mosaics

---

## 2. Typography

### Families

| Role | Font | Weights | Tailwind |
|------|------|---------|----------|
| UI / headings / body | **Inter** | 300–700 | `font-sans` |
| System / labels / CTAs / data / logo | **JetBrains Mono** | 300–700 | `font-mono` |

Loaded via Google Fonts in `index.html` and `@import` in `index.css`.

### Type scale

| Use | Spec |
|-----|------|
| Hero H1 | `text-5xl` → `sm:text-6xl` → `lg:text-7xl` → `xl:text-[5.25rem]` · `font-light` · `leading-[0.98]` · `tracking-tighter` |
| Section H2 | `text-3xl md:text-5xl` · `font-medium` · `tracking-tight` |
| Final CTA H2 | `text-4xl md:text-6xl lg:text-7xl` · `font-light` · `leading-[1.05]` · `tracking-tighter` |
| Card H3 | `text-base` / `text-lg` · `font-medium` · `tracking-tight` |
| Body | `text-base md:text-lg` · `leading-relaxed` · `text-text-secondary` |
| Chapter / overline | `font-mono text-xs` or `text-[10px]` · `uppercase` · `tracking-[0.25em]`–`[0.3em]` |
| Nav links | `font-mono text-[11px] uppercase tracking-[0.2em]` |
| CTAs | `font-mono text-xs` / `text-[11px]` · `font-semibold` · `uppercase` · `tracking-[0.2em]` |
| Micro labels | `font-mono text-[8px]`–`text-[10px]` · tracking `0.15em`–`0.25em` |
| Metrics / data | `font-mono` · `font-light` · `text-2xl`–`text-7xl` |
| Logo wordmark | `font-mono text-sm font-semibold tracking-[0.2em]` → `INTELLIROI` |

### Letter-spacing tokens
`tracking-tighter` · `tracking-tight` · `tracking-wider` · `tracking-widest` · custom `0.12em`–`0.3em`

---

## 3. Color Palette

### Brand tokens (use these in UI)

| Token | Hex | Role |
|-------|-----|------|
| `ink` | `#09090B` | Page background, primary button text |
| `surface` | `#111827` | Elevated panels, hover fills |
| `surface-2` | `#1F2937` | Deeper elevation (sparingly) |
| `text-primary` | `#F8FAFC` | Headings, primary text |
| `text-secondary` | `#CBD5E1` | Body, muted labels |
| `hairline` | `#2A2A2A` | Borders, grid lines, range track |
| `accent` (mint) | `#00E5A8` | Primary brand / CTAs / live states |
| `accent-blue` | `#4F8CFF` | Secondary chart series |
| `warning` | `#F59E0B` | Tertiary chart (e.g. Google) |
| `danger` | `#EF4444` | Negative deltas |
| `success` | `#22C55E` | Token available; prefer mint for positive ROI |

### Chart series
OpenAI `#00E5A8` · Anthropic `#4F8CFF` · Google `#F59E0B` · Bedrock `#CBD5E1`

### Opacity patterns
- Accent fills: `/5` `/10` `/30` `/40` `/50` `/60`
- Secondary text: `/40` `/50` `/60`
- Nav / modal: `bg-ink/70` `/80` `/95`
- Surfaces: `bg-surface/20` `/40` `/60`

### Interaction colors
- Selection: bg `#00E5A8`, text `#09090B`
- Focus ring: `2px solid #00E5A8`, offset `2px`
- Scrollbar: track `#09090B`, thumb `#2A2A2A`, hover thumb `#00E5A8`

### Gradients (atmosphere)

| Name | Value | Where |
|------|-------|-------|
| Hero glow | `radial-gradient(ellipse at center, rgba(0,229,168,0.09) 0%, rgba(9,9,11,0) 65%)` | Hero |
| Dash glow | `radial-gradient(circle at center, rgba(0,229,168,0.12) 0%, transparent 70%)` | Hero dashboard |
| Final CTA glow | `radial-gradient(ellipse at center, rgba(0,229,168,0.1) 0%, rgba(9,9,11,0) 65%)` | FinalCTA |
| Feature hover orb | `radial-gradient(circle, rgba(0,229,168,0.12) 0%, transparent 70%)` | Features |
| Grid pattern | `#2A2A2A` 1px lines, `72×72`, radial mask | Hero |
| Film grain | SVG noise, opacity `0.035`, `z-index: 60` | `body::after` |
| Marquee mask | `linear-gradient(90deg, transparent, black 12%, black 88%, transparent)` | Marquee |

---

## 4. Layout & Spacing

| Token | Value |
|-------|-------|
| Max width | `max-w-[1400px]` (`SectionShell`, Nav, footer) |
| Final CTA max | `max-w-[1100px]` |
| Horizontal pad | `px-6 md:px-12` |
| Section vertical | `py-24 md:py-32 lg:py-36` |
| Nav height | `h-[72px]` (scroll offset `-72`) |
| Modal max | `max-w-lg` |

### Layout patterns
- **Hairline mosaic:** `gap-px` + `bg-hairline` + children `bg-ink`
- **Feature mosaic:** `gap-4` + bordered cards; occasional `md:col-span-2`
- **12-col editorial:** chapter `col-span-4` + content `col-span-8`
- **2-col split:** Solution, Dashboard, Integrations, Architecture, ROI
- **Hero:** `lg:grid-cols-2`, `gap-16`
- **Pricing:** `lg:grid-cols-3`, `gap-6`; featured card `lg:-my-4`

### Borders & radius
- Default border: `1px` `border-hairline`
- Featured/hover: `border-accent` or `border-accent/40`–`/60`
- UI radius: **0** (sharp). Only status dots / window chrome use `rounded-full`.

### Shadows (glow only — never soft card shadows)

| Spec | Where |
|------|-------|
| `0 0 40px rgba(0,229,168,0.25)` | Hero primary CTA |
| `0 0 50px rgba(0,229,168,0.3)` | Final CTA primary |
| `0 0 60px rgba(0,229,168,0.12)` | Featured pricing |
| `0 0 80px rgba(0,229,168,0.08–0.1)` | Dashboard frame, modal |
| `0 0 10–12px rgba(0,229,168,0.9)` | Traveling pipeline dots |

---

## 5. Component Patterns

### Logo
`h-7 w-7` square · `border-accent/60` · `bg-accent/10` · inner `h-2 w-2 bg-accent` · + `INTELLIROI` mono wordmark

### Buttons

| Variant | Idle | Hover |
|---------|------|-------|
| **Primary** | `border-accent bg-accent text-ink` · mono uppercase · optional mint glow | `bg-transparent text-accent` |
| **Secondary** | `border-hairline text-text-primary` | `border-accent/50 text-accent` |
| **Icon** | Lucide `ArrowUpRight` `strokeWidth={1.5}` | `translate-x-0.5 -translate-y-0.5` |

### Cards
- Sharp bordered panels; prefer mosaics over floating cards
- Hover: `bg-surface` or `border-accent/50`, `duration-500`
- Codes: `ERR-01`, `MOD-01`, `L1`, `RECO-01` in mono micro type
- Icons: Lucide only, `strokeWidth={1.5}`, hover → accent

### Nav
- Fixed `z-50`; unscrolled transparent; scrolled: `bg-ink/70 backdrop-blur-xl border-hairline`
- Status: `animate-pulse-dot` + “Systems Operational”

### Forms
- Inputs: `border-hairline`, ink/surface bg, `focus:border-accent`, no radius
- Range: track `2px #2A2A2A`; thumb `16×16 #00E5A8`; hover `scale(1.3)` `0.15s`

### Badges
- Square accent chips: `border-accent/30 bg-accent/10` + mono uppercase (not pill clusters)

### Toasts
Sonner `theme="dark"` `position="bottom-right"`

### Icons
Lucide React only. No emoji, no icon fonts.

### Microcopy tone
Uppercase mono labels, `//` comments, system codes (`ERR-`, `MOD-`, `RECO-`).

---

## 6. Animations & Motion

### Libraries
| Lib | Role |
|-----|------|
| `framer-motion` | Reveals, hero, FAQ, nav, modal, connectors |
| `lenis` | Smooth scroll `duration: 1.15`, `smoothWheel: true` |
| `tailwindcss-animate` | Accordion keyframes (available) |
| Recharts | Chart draw (`isAnimationActive`) |

### Shared easing
**Cubic bezier:** `[0.22, 1, 0.36, 1]` — default for Reveal, Hero, Nav, FAQ, DemoModal.

### CSS keyframes (`index.css`)

| Class / name | Spec | Use |
|--------------|------|-----|
| `.animate-marquee` | `marquee` 48s linear infinite; pause on hover | Logo strip |
| `.animate-blink` | `blink-cursor` 1.1s step-end infinite | Final CTA cursor `_` |
| `.animate-pulse-dot` | `pulse-dot` 2s ease-in-out infinite | Live status dots |
| Range thumb | `transform 0.15s ease` → scale 1.3 | ROI sliders |
| `animate-spin` | Tailwind default | DemoModal Loader2 |

### Framer Motion inventory

| Animation | Spec | File |
|-----------|------|------|
| `Reveal` | opacity 0→1, y 30→0, duration 0.7, viewport once, margin `-60px` | `shared.jsx` |
| `CountUp` | spring stiffness 55, damping 18 | `shared.jsx` |
| Hero `MaskedLine` | y 110%→0, duration 1, staggered delays | `Hero.jsx` |
| Hero scroll parallax | dashY 0→-70; glow fade | `Hero.jsx` |
| Hero dashboard enter | opacity + y 60→0, duration 1, delay 0.5 | `Hero.jsx` |
| Hero dept rows | x -12→0, stagger `1 + i*0.12` | `Hero.jsx` |
| Nav mobile | height 0↔auto, duration 0.35 | `Nav.jsx` |
| Solution connectors | traveling accent dot, duration 1.8, infinite linear | `Solution.jsx` |
| Solution nodes | `whileHover: { y: -4 }`, spring 300/20 | `Solution.jsx` |
| Architecture pulse | vertical dot top 4%→96%, duration 4, infinite | `Architecture.jsx` |
| Architecture layers | x 24→0, stagger `i*0.05` | `Architecture.jsx` |
| FAQ accordion | height/opacity, duration 0.4 | `FAQ.jsx` |
| Demo overlay | opacity 0.3s | `DemoModal.jsx` |
| Demo panel | opacity, y 32→0, scale 0.98→1, duration 0.45 | `DemoModal.jsx` |

### Transition durations
- Colors / borders: `300ms` or `500ms`
- Nav scroll state: `500ms`
- Provider bars: `transition-[width] duration-1000`

### Motion principles
1. Prefer purposeful reveals over decorative noise.
2. Live systems get `pulse-dot`; CTAs get invert-on-hover; data gets CountUp.
3. Lenis owns smooth scroll — keep `html { scroll-behavior: auto }`.
4. Ship 2–3 intentional motions per new visually led surface (reveal + one live indicator + one hover).

---

## 7. Do / Don't

### Do
- Use `ink` / `surface` / `hairline` / mint `accent` tokens
- Pair Inter (prose) + JetBrains Mono (system UI)
- Build with sharp hairline grids and `gap-px` mosaics
- Use mint glow shadows, not drop shadows
- Prefix sections with `Chapter` (number + rule + label)
- Keep Lucide stroke weight at `1.5`

### Don't
- Introduce light mode or cream / purple / terracotta AI-default themes
- Use Inter/Roboto as the only voice — mono is required for system chrome
- Soften UI with large border-radius or multi-layer card shadows
- Put photography, floating badges, or pill clusters in the hero
- Replace mint with purple/indigo as primary accent
- Add emoji or decorative icon rows

---

## 8. Key file index

| Path | Role |
|------|------|
| `app/src/index.css` | Tokens, grain, keyframes, scrollbar, range |
| `app/tailwind.config.js` | Theme extension |
| `app/index.html` | Fonts, dark class, selection |
| `app/src/App.jsx` | Composition + Lenis + Toaster |
| `app/src/components/landing/shared.jsx` | Reveal, Chapter, SectionShell, CountUp |
| `app/src/components/landing/*.jsx` | Section implementations |

---

## 9. Quick copy-paste tokens

```css
/* Brand */
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

/* Motion */
--ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1);
--reveal-duration: 0.7s;
--lenis-duration: 1.15s;
```

```js
// Framer default transition
{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }
```
