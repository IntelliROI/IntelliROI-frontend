import { ROLES, type Role } from "@/constants/roles";

/** Always put companySlug first for tenant-scoped caches. */
export const queryKeys = {
  company: {
    all: (companySlug: string) => ["company", companySlug] as const,
    departments: (companySlug: string) =>
      ["company", companySlug, "departments"] as const,
    department: (companySlug: string, departmentId: number) =>
      ["company", companySlug, "department", departmentId] as const,
    teams: (companySlug: string, departmentId?: number) =>
      ["company", companySlug, "teams", departmentId ?? "all"] as const,
    employees: (companySlug: string) =>
      ["company", companySlug, "employees"] as const,
    jobRoles: (companySlug: string) =>
      ["company", companySlug, "job-roles"] as const,
    settings: (companySlug: string) =>
      ["company", companySlug, "settings"] as const,
    projects: (companySlug: string) =>
      ["company", companySlug, "projects"] as const,
    roi: {
      summary: (companySlug: string, period = "month") =>
        ["company", companySlug, "roi", "summary", period] as const,
      department: (companySlug: string, id: number, period = "month") =>
        ["company", companySlug, "roi", "department", id, period] as const,
      team: (companySlug: string, id: number, period = "month") =>
        ["company", companySlug, "roi", "team", id, period] as const,
      employee: (companySlug: string, id: string | number, period = "month") =>
        ["company", companySlug, "roi", "employee", id, period] as const,
      recommendations: (companySlug: string, status = "open") =>
        ["company", companySlug, "roi", "recommendations", status] as const,
    },
    analytics: {
      company: (companySlug: string, period = "day") =>
        ["company", companySlug, "analytics", period] as const,
      department: (companySlug: string, id: number, period = "day") =>
        ["company", companySlug, "analytics", "department", id, period] as const,
      team: (companySlug: string, id: number, period = "day") =>
        ["company", companySlug, "analytics", "team", id, period] as const,
      employee: (companySlug: string, id: string | number, period = "day") =>
        ["company", companySlug, "analytics", "employee", id, period] as const,
      providers: (companySlug: string) =>
        ["company", companySlug, "analytics", "providers"] as const,
      models: (companySlug: string) =>
        ["company", companySlug, "analytics", "models"] as const,
    },
    costs: (companySlug: string) =>
      ["company", companySlug, "costs"] as const,
    budgets: (companySlug: string) =>
      ["company", companySlug, "budgets"] as const,
    conversations: (companySlug: string) =>
      ["company", companySlug, "conversations"] as const,
    conversation: (companySlug: string, id: string) =>
      ["company", companySlug, "conversation", id] as const,
    providers: (companySlug: string) =>
      ["company", companySlug, "providers"] as const,
    providersConfigured: (companySlug: string) =>
      ["company", companySlug, "providers", "configured"] as const,
    usage: (companySlug: string) =>
      ["company", companySlug, "usage"] as const,
    usageRequest: (companySlug: string, requestId: string) =>
      ["company", companySlug, "usage", requestId] as const,
    benchmarks: (companySlug: string, status = "pending") =>
      ["company", companySlug, "benchmarks", status] as const,
    notifications: (companySlug: string, unreadOnly = false) =>
      ["company", companySlug, "notifications", unreadOnly] as const,
    templates: (companySlug: string) =>
      ["company", companySlug, "prompt-templates"] as const,
    audit: (companySlug: string) =>
      ["company", companySlug, "audit"] as const,
  },
  platform: {
    metrics: () => ["platform", "metrics"] as const,
    companies: () => ["platform", "companies"] as const,
    providers: () => ["platform", "providers"] as const,
    audit: () => ["platform", "audit"] as const,
  },
  auth: {
    me: () => ["auth", "me"] as const,
  },
};

export function isSuperAdmin(role?: Role | null): boolean {
  return role === ROLES.SUPER_ADMIN;
}
