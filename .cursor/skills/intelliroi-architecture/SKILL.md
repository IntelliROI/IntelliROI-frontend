---
name: intelliroi-architecture
description: IntelliROI platform architecture — hierarchy, one RBAC-driven shell, route groups, dashboards by scope, and AI intelligence flow. Use when building pages, layouts, navigation, features, dashboards, analytics, or deciding how company/department/team/employee experiences work. Read before any IntelliROI feature work.
---

# IntelliROI Architecture

## What we build

Multi-tenant SaaS that observes every AI request and rolls intelligence upward:

**Platform → Company → Department → Team → Employee → AI Request → Usage → Cost → Business Value → Estimated ROI**

## Mental model

Do **not** build five separate apps. Build:

```
Application Shell
  ├── Authorization (role + permission + scope)
  ├── Dynamic sidebar (filtered nav config)
  └── Scoped content (same modules, different aggregation)
```

## Hierarchy

```
Super Admin (platform)
└── Company (CEO / Owner)
    ├── Departments → Department Manager
    │     └── Teams → Team Lead → Employees
    ├── Projects (company / dept / team owned)
    ├── AI Providers + Policies
    ├── ROI Configuration
    └── Company Analytics
```

## Five experiences

| Experience | Primary question |
|------------|------------------|
| Super Admin | How is the SaaS platform performing? |
| CEO | Is our AI investment producing value? |
| Dept Manager | How is my department using AI? |
| Team Lead | How is my team using AI? |
| Employee | ChatGPT-like workspace + my usage/ROI |

## Frontend checklist

When adding a feature:

1. Identify **permission** + **scope** (PLATFORM | COMPANY | DEPARTMENT | TEAM | SELF)
2. Add nav item via config — not hardcoded role switches
3. Reuse analytics components; pass scope filters
4. Mirror scope in breadcrumbs and drill-down links
5. Keep Super Admin out of customer prompt-level data by default

## Route layers

- **Platform layer:** Super Admin
- **Customer management:** CEO / Manager / Lead org tools
- **AI Workspace:** Employee (and optional for managers)

## Intelligence flow

```
Employee → Project → Task Category → AI Gateway → Provider
  → Usage Event (tokens, cost, org context)
  → Analytics → ROI Engine → Scoped Dashboards
```

## Reference docs

- `.cursor/docs/Platform_Hirarchy.md`
- `.cursor/docs/Restructure frontend architecture.md`
- For domain entities: read [../intelliroi-domain/SKILL.md](../intelliroi-domain/SKILL.md)
- For role UIs: read [../intelliroi-rbac/SKILL.md](../intelliroi-rbac/SKILL.md)
