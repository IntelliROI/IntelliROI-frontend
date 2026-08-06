# IntelliROI Theme — Reference

Companion to `SKILL.md`. Exact values from the landing codebase.

## Tailwind brand colors

Defined in `app/tailwind.config.js` and reinforced in `app/src/index.css` utilities:

```
ink #09090B
surface #111827
surface-2 #1F2937
text-primary #F8FAFC
text-secondary #CBD5E1
hairline #2A2A2A
accent #00E5A8 / foreground #09090B
accent-blue #4F8CFF
warning #F59E0B
danger #EF4444
success #22C55E
```

Note: shadcn HSL `--accent` in `:root` is slate; **UI `accent` is overridden to mint hex** in Tailwind. Prefer `text-accent` / `bg-accent` / `border-accent`.

## Fonts

```js
fontFamily: {
  sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
}
```

Weights loaded: Inter 300–700; JetBrains Mono 300–700.

## Spacing shell

| Token | Class |
|-------|-------|
| Container | `mx-auto w-full max-w-[1400px] px-6 md:px-12` |
| Section pad | `py-24 md:py-32 lg:py-36` |
| Nav | `h-[72px]`; Lenis offset `-72` |

## CSS animations (`index.css`)

### marquee
```css
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.animate-marquee { animation: marquee 48s linear infinite; }
.animate-marquee:hover { animation-play-state: paused; }
```

### blink-cursor
```css
@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-blink { animation: blink-cursor 1.1s step-end infinite; }
```

### pulse-dot
```css
@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0, 229, 168, 0.5); }
  50% { opacity: 0.7; box-shadow: 0 0 0 6px rgba(0, 229, 168, 0); }
}
.animate-pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
```

### Film grain
`body::after` fixed overlay, SVG `feTurbulence`, opacity `0.035`, `z-index: 60`, `pointer-events: none`.

## Framer Motion patterns

### Reveal (default section entrance)
```js
initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: "-60px" }}
transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
```

### CountUp spring
```js
useSpring(mv, { stiffness: 55, damping: 18 })
```

### Hero MaskedLine
```js
initial={{ y: "110%" }}
animate={{ y: "0%" }}
transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
```

### Lenis (`App.jsx`)
```js
new Lenis({ duration: 1.15, smoothWheel: true })
```

## Glow shadows

```
Hero CTA:     0 0 40px rgba(0,229,168,0.25)
Final CTA:    0 0 50px rgba(0,229,168,0.3)
Pricing feat: 0 0 60px rgba(0,229,168,0.12)
Dash frame:   0 0 80px rgba(0,229,168,0.08)
Modal:        0 0 80px rgba(0,229,168,0.1)
Pipeline dot: 0 0 10px rgba(0,229,168,0.9)
```

## Chart colors

| Series | Hex |
|--------|-----|
| Value / OpenAI | `#00E5A8` |
| Cost / Anthropic | `#4F8CFF` |
| Google | `#F59E0B` |
| Bedrock / muted | `#CBD5E1` |
| Axis / grid | `#2A2A2A` tick `#CBD5E1` font JetBrains Mono 9px |

## Section layout recipes

| Pattern | Classes |
|---------|---------|
| Hairline mosaic | `grid gap-px bg-hairline` + child `bg-ink` |
| Editorial 4/8 | `md:grid-cols-12` → `col-span-4` / `col-span-8` |
| Split 2-col | `lg:grid-cols-2 gap-12` or `gap-16` |
| Pricing 3-col | `lg:grid-cols-3 gap-6` |

## Shared primitives

File: `app/src/components/landing/shared.jsx`

| Export | Purpose |
|--------|---------|
| `Reveal` | Viewport fade/slide-in |
| `CountUp` | Animated metric numbers |
| `Chapter` | Section number + label |
| `SectionShell` | Max-width section wrapper |
| `scrollToId` | Lenis-aware anchor scroll |

## Key source files

- `app/src/index.css`
- `app/tailwind.config.js`
- `app/index.html`
- `app/src/App.jsx`
- `app/src/components/landing/shared.jsx`
- `docs/DESIGN_SYSTEM.md`
