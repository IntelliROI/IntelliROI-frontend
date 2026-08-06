# IntelliROI — Cursor Rules & Skills

Rules and skills are **separate**. Rules auto-attach (or always apply). Skills load on
demand when the agent matches their description or you `@`-mention them.

Do not paste rule or skill bodies into this file — each lives in its own path so content
stays unique and editable in one place.

## Rules (`.cursor/rules/*.mdc`)

Short, actionable guardrails. Cursor attaches them via frontmatter (`alwaysApply` / `globs`).

| File | Scope | Purpose |
|------|-------|---------|
| `000-project-context.mdc` | always | Product + non-negotiable principles |
| `010-folder-structure.mdc` | always | Where new code must live |
| `020-naming-conventions.mdc` | always | File / component / hook naming |
| `030-component-standards.mdc` | `src/**/*.tsx` | React/Next component standards |
| `040-data-fetching.mdc` | feature api/hooks | TanStack Query + Pipeline 1/2 |
| `050-state-management.mdc` | `src/stores/**` | Zustand vs Query vs URL vs local |
| `060-styling-design-system.mdc` | components/features | Tailwind/shadcn patterns (theme tokens elsewhere) |
| `070-rbac-multitenancy.mdc` | rbac / middleware / app | Tenant isolation + `<Can>` |
| `080-forms-validation.mdc` | forms + schemas | RHF + zod |
| `090-testing-quality.mdc` | always | Tests + PR quality bar |
| `intelliroi-frontend-theme.mdc` | UI globs | Dark terminal theme tokens (unique from 060) |

### Frontmatter cheat sheet

- `alwaysApply: true` — every request (keep short).
- `globs: "…"` — auto-attach when matching files are in context.
- `description` — rule purpose + Cursor’s “should I fetch this?” signal.

## Skills (`.cursor/skills/`)

Longer workflows and domain knowledge. Each skill is a folder with `SKILL.md` (or a
standalone reference `.md`). Not auto-injected like always-apply rules.

### IntelliROI product / architecture

| Path | Role |
|------|------|
| `intelliroi-architecture/` | Product hierarchy, RBAC, modules, App Router, MVP |
| `intelliroi-theme/` | Apply/preserve dark terminal theme |
| `01-PLATFORM-ARCHITECTURE-ANALYSIS.md` | Platform analysis reference |
| `02-FRONTEND-FOLDER-STRUCTURE.md` | Full folder tree reference |
| `03-ROLE-HIERARCHY-AND-DASHBOARDS.md` | Roles & dashboards reference |
| `04-APPLICATION-EXECUTION-FLOW.md` | Execution flow reference |

### Design / UI tooling

| Path | Role |
|------|------|
| `ui-ux-pro-max/` | Styles, palettes, UX guidelines, stacks |
| `ui-styling/` | shadcn + Tailwind patterns |
| `design-system/` | Tokens, component specs, slides |
| `design/` | Logo, CIP, banners, icons, social |
| `brand/` | Brand voice & visual identity |
| `banner-design/` | Banner / hero creatives |
| `slides/` | HTML presentations |

## On-demand docs (`.cursor/docs/`)

| Path | When |
|------|------|
| `architecture.md` | `@architecture.md` for system fit questions — indexes skills/docs, no duplication |

## Uniqueness map (avoid double-writing)

| Concern | Own it here | Do not also redefine in |
|---------|-------------|-------------------------|
| Always-on principles | `000-project-context.mdc` | architecture skill body as always-apply |
| Folder placement decisions | `010-folder-structure.mdc` | paste full tree into rules |
| Full folder tree | `02-FRONTEND-FOLDER-STRUCTURE.md` | rules |
| Theme tokens (mint, ink, motion) | `intelliroi-frontend-theme.mdc` + `intelliroi-theme` | `060-styling-*.mdc` |
| Tailwind/shadcn usage | `060-styling-design-system.mdc` | theme rule |
| Deep product / RBAC narrative | `intelliroi-architecture` + docs 01–04 | rules (keep rules short) |
| Naming table | `020-naming-conventions.mdc` | keep `standards.md` aligned, one source for agent edits |

## Layout

```
.cursor/
├── rules/           # auto / always-apply .mdc guardrails
├── skills/          # on-demand skills + numbered architecture refs
│   └── 05-CURSOR-RULES-AND-SKILLS-README.md   # this index
└── docs/
    └── architecture.md
```
