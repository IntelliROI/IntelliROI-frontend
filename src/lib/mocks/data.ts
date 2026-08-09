import { ROLES } from "@/constants/roles";
import { type Company, type User } from "@/types/auth.types";
import {
  mockDepartmentsStore,
  mockEmployeesStore,
  mockProjectsStore,
  mockTeamsStore,
} from "@/lib/mocks/org-store";

export const mockCompany: Company = {
  uuid: "cmp-acme-001",
  id: 1,
  name: "Acme ROI Labs",
  slug: "acme",
  industry: "software",
  company_size: "51-200",
  timezone: "Asia/Kolkata",
  currency: "USD",
  status: "active",
  plan: "Enterprise",
};

export const mockUsers: Record<string, User & { password: string }> = {
  "super@intelliroi.com": {
    uuid: "usr-super-001",
    email: "super@intelliroi.com",
    first_name: "Nova",
    last_name: "Admin",
    role: ROLES.SUPER_ADMIN,
    password: "Password123!",
  },
  "ceo@acme.test": {
    uuid: "usr-ceo-001",
    email: "ceo@acme.test",
    first_name: "Ada",
    last_name: "Owner",
    role: ROLES.COMPANY_OWNER,
    company: mockCompany,
    password: "Password123!",
  },
  "dept@acme.test": {
    uuid: "usr-dept-001",
    email: "dept@acme.test",
    first_name: "Jordan",
    last_name: "Head",
    role: ROLES.DEPARTMENT_HEAD,
    company: mockCompany,
    department_id: 1,
    password: "Password123!",
  },
  "lead@acme.test": {
    uuid: "usr-lead-001",
    email: "lead@acme.test",
    first_name: "Sam",
    last_name: "Lead",
    role: ROLES.TEAM_LEAD,
    company: mockCompany,
    department_id: 1,
    team_id: 1,
    password: "Password123!",
  },
  "emp@acme.test": {
    uuid: "usr-emp-001",
    email: "emp@acme.test",
    first_name: "Riley",
    last_name: "Maker",
    role: ROLES.EMPLOYEE,
    company: mockCompany,
    department_id: 1,
    team_id: 1,
    job_role: "Software Engineer",
    password: "Password123!",
  },
};

export const mockDepartments = mockDepartmentsStore;
export const mockTeams = mockTeamsStore;
export const mockProjects = mockProjectsStore;

/** Snapshot helper for legacy consumers — prefer organizationApi.listEmployees() */
export function getMockEmployeeRows() {
  return mockEmployeesStore.map((e) => ({
    uuid: e.uuid,
    name: e.display_name,
    email: e.email,
    role: e.app_role,
    department: e.department_name,
    team: e.team_name,
    spend: e.spend,
    roi_pct: e.roi_pct,
    requests: e.requests,
  }));
}

/** @deprecated use getMockEmployeeRows() or organizationApi */
export const mockEmployees = getMockEmployeeRows();

export const mockCompanies = [
  mockCompany,
  {
    uuid: "cmp-nova-002",
    id: 2,
    name: "Nova Health",
    slug: "nova-health",
    industry: "healthcare",
    company_size: "201-500",
    status: "active" as const,
    plan: "Pro",
  },
  {
    uuid: "cmp-orbit-003",
    id: 3,
    name: "Orbit Logistics",
    slug: "orbit",
    industry: "logistics",
    company_size: "51-200",
    status: "trial" as const,
    plan: "Trial",
  },
  {
    uuid: "cmp-peak-004",
    id: 4,
    name: "Peak Finance",
    slug: "peak-finance",
    industry: "fintech",
    company_size: "11-50",
    status: "suspended" as const,
    plan: "Pro",
  },
];

export const mockRoiCompany = {
  period: "month",
  total_spend: 39120,
  business_value: 128400,
  roi_pct: 228.2,
  time_saved_hours: 1840,
  formula_version: "roi-v2.4",
  computed_at: new Date().toISOString(),
  adoption_rate: 0.74,
  active_employees: 86,
  total_seats: 116,
  vs_last_month_pct: 12.4,
};

export const mockCostSummary = {
  scope: "company",
  period: "month",
  total_cost: 39120,
  by_provider: [
    { provider: "openai", cost: 21400 },
    { provider: "anthropic", cost: 11200 },
    { provider: "google", cost: 6520 },
  ],
  by_department: mockDepartments.map((d) => ({
    department_id: d.id,
    department_name: d.department_name,
    cost: d.monthly_spend,
  })),
};

export const mockAnalyticsCompany = {
  period: "day",
  requests: 4820,
  tokens_in: 12_400_000,
  tokens_out: 4_820_000,
  active_users: 86,
  series: Array.from({ length: 14 }).map((_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
    requests: 280 + Math.round(Math.sin(i / 2) * 40 + i * 8),
    cost: 2200 + Math.round(Math.cos(i / 3) * 180 + i * 40),
    roi_pct: 180 + i * 3.5,
  })),
};

export const mockRecommendations = [
  {
    id: 1,
    title: "Route documentation tasks to GPT-4o Mini",
    impact_monthly_usd: 90,
    status: "open",
    scope: "company",
    rationale: "Docs prompts average 1.2k tokens with low complexity.",
  },
  {
    id: 2,
    title: "Cap Sales Claude Opus for outreach drafts",
    impact_monthly_usd: 240,
    status: "open",
    scope: "department",
    department_id: 2,
    rationale: "Opus over-indexed on simple email generation.",
  },
  {
    id: 3,
    title: "Enable prompt templates for QA regression",
    impact_monthly_usd: 60,
    status: "open",
    scope: "team",
    team_id: 3,
    rationale: "Repeated prompts inflate tokens 18%.",
  },
];

export const mockProviders = [
  { name: "openai", display_name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini"], status: "healthy", latency_ms: 420 },
  { name: "anthropic", display_name: "Anthropic", models: ["claude-sonnet-4-20250514"], status: "healthy", latency_ms: 510 },
  { name: "google", display_name: "Google", models: ["gemini-1.5-pro"], status: "degraded", latency_ms: 890 },
];

export const mockConfiguredProviders = [
  { id: 1, provider: "openai", key_alias: "prod-primary", created_at: "2026-07-01T10:00:00Z" },
  { id: 2, provider: "anthropic", key_alias: "prod-claude", created_at: "2026-07-12T10:00:00Z" },
];

export const mockConversations = [
  {
    uuid: "conv-001",
    title: "Refactor auth middleware",
    provider: "openai",
    model: "gpt-4o-mini",
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    message_count: 8,
  },
  {
    uuid: "conv-002",
    title: "SQL for ROI rollup",
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    message_count: 14,
  },
];

export const mockBudgets = [
  { id: 1, scope: "company", monthly_limit: 50000, consumed: 39120, period: "month" },
  { id: 2, scope: "department", scope_id: 1, monthly_limit: 25000, consumed: 18420, period: "month" },
  { id: 3, scope: "department", scope_id: 2, monthly_limit: 12000, consumed: 9200, period: "month" },
];

export const mockBenchmarks = [
  {
    id: 1,
    task_category: "Code Generation",
    baseline_minutes: 45,
    ai_assisted_minutes: 12,
    status: "pending",
    proposed_by: "Riley Maker",
  },
  {
    id: 2,
    task_category: "Documentation",
    baseline_minutes: 30,
    ai_assisted_minutes: 8,
    status: "pending",
    proposed_by: "Casey Chen",
  },
];

export const mockNotifications = [
  {
    id: 1,
    title: "Engineering budget at 74%",
    body: "Department Engineering has consumed $18,420 of $25,000.",
    read: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 2,
    title: "New ROI recommendation",
    body: "Potential $240/mo savings on Sales model routing.",
    read: false,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
];

export const mockPlatformMetrics = {
  active_companies: 128,
  new_signups_month: 14,
  mrr: 186400,
  platform_ai_spend: 2_480_000,
  active_employees: 18420,
  plan_distribution: [
    { plan: "Free", count: 42 },
    { plan: "Pro", count: 61 },
    { plan: "Enterprise", count: 25 },
  ],
};

export function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
