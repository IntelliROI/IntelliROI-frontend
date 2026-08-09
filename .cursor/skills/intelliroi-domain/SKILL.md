---
name: intelliroi-domain
description: IntelliROI company domain model — org vs config entities, employee attribution, AI providers, policies, and ROI calculation chain. Use when modeling forms, APIs, types, organization features, projects, job roles, task benchmarks, usage events, or cost/ROI logic.
---

# IntelliROI Domain Model

## Core idea

Every person like Rahul must resolve to:

**Company → Department → Team → Job Role → Project → AI usage events**

Without that chain, analytics and ROI cannot roll up.

## Entity split

### Organization entities

Company · Department · Team · Employee · Project

### Configuration entities

Job Role (hourly cost) · AI Provider · AI Model · AI Policy · ROI config · Task categories / benchmarks · Company settings

### Auth vs business

`users` = authentication identity  
`employees` = org membership + `user_id` link

## MVP relationships

```
Company
├── company_settings (hours/day, days/month, currency, timezone)
├── departments → manager_employee_id
├── teams → department_id, team_lead_employee_id
├── employees → department_id, team_id, job_role_id, manager_employee_id
├── projects → department_id, team_id
├── job_roles → hourly_cost
├── ai_providers → models (pricing)
├── ai_policies (allowed providers/models/limits; scoped later)
└── task_benchmarks (e.g. Code Generation = 30 min)
```

## AI usage event (required fields)

company_id, department_id, team_id, employee_id, project_id, task_category, provider, model, input/output/total tokens, ai_cost

## Estimated ROI (MVP)

1. Look up employee → job_role.hourly_cost  
2. Look up task_category → benchmark minutes  
3. `value = (minutes/60) * hourly_cost`  
4. `estimated_roi = (value - ai_cost) / ai_cost * 100`  

Always label UI **Estimated ROI**.

## Forms guidance

**Add Employee** must capture org identity: department, team, job role, manager, employee code — not just name/email.

**Projects** must have org ownership (dept/team).

**Providers:** store credential references, never raw keys in plain fields.

## Journey check

CEO registers company → creates dept → team → job role → employee → project → employee chats in AI Workspace with project + task selected → gateway records full context → cost + ROI engines → scoped dashboards.

## Deep reference

`.cursor/docs/restructure design for IntelliRoi.md`
