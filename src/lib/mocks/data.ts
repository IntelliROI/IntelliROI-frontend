import { ROLES } from "@/constants/roles";
import { type Company, type User } from "@/types/auth.types";

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

export const mockDepartments = [
  {
    id: 1,
    department_name: "Engineering",
    manager_user_uuid: "usr-dept-001",
    employee_count: 42,
    monthly_spend: 18420,
    roi_pct: 312,
    budget_limit: 25000,
  },
  {
    id: 2,
    department_name: "Sales",
    manager_user_uuid: null,
    employee_count: 28,
    monthly_spend: 9200,
    roi_pct: 248,
    budget_limit: 12000,
  },
  {
    id: 3,
    department_name: "Marketing",
    manager_user_uuid: null,
    employee_count: 18,
    monthly_spend: 6400,
    roi_pct: 189,
    budget_limit: 8000,
  },
  {
    id: 4,
    department_name: "Customer Success",
    manager_user_uuid: null,
    employee_count: 22,
    monthly_spend: 5100,
    roi_pct: 221,
    budget_limit: 7000,
  },
];

export const mockTeams = [
  { id: 1, team_name: "Platform", department_id: 1, lead_user_uuid: "usr-lead-001", member_count: 8, monthly_spend: 6200, roi_pct: 340 },
  { id: 2, team_name: "Frontend", department_id: 1, lead_user_uuid: null, member_count: 6, monthly_spend: 4100, roi_pct: 290 },
  { id: 3, team_name: "QA", department_id: 1, lead_user_uuid: null, member_count: 5, monthly_spend: 2800, roi_pct: 260 },
  { id: 4, team_name: "Enterprise Sales", department_id: 2, lead_user_uuid: null, member_count: 10, monthly_spend: 5200, roi_pct: 255 },
];

export const mockProjects = [
  { id: 1, project_name: "Invoice Builder", department_id: 1, team_id: 1, status: "active" },
  { id: 2, project_name: "ROI Console", department_id: 1, team_id: 2, status: "active" },
  { id: 3, project_name: "Outbound Copilot", department_id: 2, team_id: 4, status: "active" },
];

export const mockEmployees = [
  { uuid: "usr-emp-001", name: "Riley Maker", email: "emp@acme.test", role: "EMPLOYEE", department: "Engineering", team: "Platform", spend: 420, roi_pct: 380, requests: 146 },
  { uuid: "usr-emp-002", name: "Casey Chen", email: "casey@acme.test", role: "EMPLOYEE", department: "Engineering", team: "Frontend", spend: 380, roi_pct: 310, requests: 121 },
  { uuid: "usr-emp-003", name: "Morgan Lee", email: "morgan@acme.test", role: "EMPLOYEE", department: "Sales", team: "Enterprise Sales", spend: 510, roi_pct: 265, requests: 98 },
  { uuid: "usr-emp-004", name: "Avery Patel", email: "avery@acme.test", role: "EMPLOYEE", department: "Marketing", team: "—", spend: 290, roi_pct: 198, requests: 74 },
];

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
