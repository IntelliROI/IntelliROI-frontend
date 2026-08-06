# InteliROI — Platform Architecture Analysis

> Synthesized from: `The Right Way to Design the Database.md`, `The Complete System Flow.md`, `DATABASE DESIGN SCHEMA FOR INTELIROI.md`

## 1. What This Product Actually Is

InteliROI is a **multi-tenant B2B SaaS platform** that sits between a company's employees and AI providers (OpenAI, Claude, Gemini, etc.). Every AI prompt an employee sends goes through InteliROI's own gateway instead of hitting ChatGPT directly. Because InteliROI is the middleman, it can:

1. **Meter** exactly who used which model, how many tokens, at what latency (Usage Engine)
2. **Cost** that usage in real currency, versioned against provider pricing (Cost Engine)
3. **Attribute** that usage to a business unit — employee → team → department → project → task type (Business Context Engine)
4. **Convert** that into a dollar value using hourly cost rate × estimated time saved (ROI Engine)
5. **Aggregate** it into dashboards a CEO can actually read (Analytics Engine)
6. **Recommend** cost optimizations ("move documentation tasks to GPT-5 Mini, save $90/mo") (Recommendation Engine)

In one sentence: **InteliROI answers "Is the money we spend on AI actually worth it, and for whom?"**

## 2. The Two-Pipeline Principle (the most important architectural idea)

This is the single design decision everything else hangs off of. Do not merge these.

```
PIPELINE 1 — REAL-TIME (must be fast, employee is waiting)
Employee → AI Gateway → AI Provider → Usage Collector → Store Raw Request
                                                                │
                                                                ▼
PIPELINE 2 — BACKGROUND (async, workers/queues, no user waiting)
Stored Request → Cost Engine → Business Context Engine → Analytics Engine
                                                                │
                                                                ▼
                                                          ROI Engine → Executive Dashboard
```

**Frontend implication:** the AI Workspace (chat) screen only ever needs to render Pipeline 1's output (a streamed response). It must NEVER block on cost/ROI calculation. Dashboards read Pipeline 2's *precomputed* tables — they never calculate ROI live. This dictates two entirely different data-fetching strategies in the frontend (see doc 04).

## 3. Central Object: the AI Usage Event

Everything fans out from one event:

```
AI Usage Event
   ├──► Cost Event         (money)
   ├──► Business Event     (who/what/where)
   ├──► ROI Event          (value)
   └──► Analytics Event    (aggregates)
```

Frontend components should mirror this: a single `UsageEventCard` / `RequestDetailDrawer` component that progressively reveals cost, business context, and ROI as those async facts arrive — rather than four separate unrelated widgets.

## 4. The 13 Data Domains → Frontend Feature Modules

| # | Domain | Owns | Frontend Feature Module |
|---|--------|------|--------------------------|
| 1 | Identity/Auth | companies, users, roles, permissions, sessions | `features/auth` |
| 2 | Organization | departments, teams, team_members, projects | `features/organization` |
| 3 | AI Configuration | providers, provider_models, provider_pricing | `features/ai-providers` |
| 4 | AI Workspace | conversations, messages, attachments, prompt_templates | `features/ai-workspace` |
| 5 | AI Gateway | ai_requests | `features/ai-gateway` |
| 6 | Usage Tracking | usage_events, token_usage | `features/usage` |
| 7 | Cost Engine | cost_events, budgets, budget_consumption | `features/cost` |
| 8 | Business Context | job_roles, task_categories, task_benchmarks, business_events | `features/business-context` |
| 9 | Analytics | *_analytics_daily / monthly | `features/analytics` |
| 10 | ROI Engine | roi_inputs, roi_events, roi_summary, roi_recommendations | `features/roi` |
| 11 | Notifications | notifications, alert_rules | `features/notifications` |
| 12 | Audit | audit_logs, activity_logs, security_logs | `features/audit` |
| 13 | System Config | feature_flags, system_settings, integrations | `features/system-config` (super-admin only) |

This 1:1 mapping between backend domain and frontend feature module is deliberate — see doc 02.

## 5. The Organizational Hierarchy (drives RBAC + routing + dashboards)

```
Platform (InteliROI itself)
  └── Super Admin (platform owner — you)
         │  manages every tenant/company on the platform
         ▼
     Company / Tenant  (e.g. "Penguin Technologies")
       └── Company Owner / CEO  (tenant admin)
              │
              ▼
          Department  (Engineering, Sales, HR, Marketing)
            └── Department Head / Manager
                   │
                   ▼
               Team  (Frontend, Backend, QA)
                 └── Team Lead
                        │
                        ▼
                    Project  (Invoice Builder, ...)
                        │
                        ▼
                    Employee (individual contributor — uses AI Workspace)
```

Five distinct dashboard personas fall out of this tree: **Super Admin, Company Owner/CEO, Department Head, Team Lead, Employee.** Each needs a different data scope and a different set of widgets — fully specified in doc 03.

## 6. What Should Be Calculated vs Stored (frontend consequence)

The source docs are explicit: separate **raw facts** (immutable — tokens, latency, timestamps) from **derived values** (recomputable — cost, ROI, analytics). On the frontend this means:

- Raw fact screens (AI Requests table, Conversation history) are simple CRUD/read views.
- Derived value screens (Analytics, ROI, Recommendations) must always show **"as of" / last-computed-at metadata**, because these numbers can be silently recalculated when a formula version or provider pricing changes (`roi_formula_versions`, `provider_pricing.effective_from/to`). Every ROI widget should be able to answer "which formula version produced this number?"

## 7. Multi-Tenancy Is Not Optional

Every table beneath `companies` is tenant-scoped. The frontend must never allow a route, API call, or cached query key to cross a `company_id` boundary. This is why the folder structure in doc 02 nests almost the entire app under a `[companySlug]` dynamic segment, with Super Admin living in a structurally separate route group that has no tenant scope at all.
