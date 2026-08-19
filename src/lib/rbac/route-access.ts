/**
 * Path ACL for tenant routes — mirrors architecture doc experiences.
 * Middleware + client RouteGuard both use this.
 */
import { ROLES, type Role } from "@/constants/roles";

/** Path suffixes under /{companySlug}/ that each role may access. */
const ROLE_ALLOWED_PREFIXES: Record<Role, string[]> = {
  [ROLES.SUPER_ADMIN]: [], // never on company tenant UI
  [ROLES.COMPANY_OWNER]: ["*"],
  [ROLES.DEPARTMENT_HEAD]: [
    "dashboard",
    "organization/departments",
    "organization/teams",
    "organization/employees",
    "organization/projects",
    "ai-workspace",
    "usage",
    "analytics",
    "roi",
    "budgets",
    "business-context",
    "notifications",
    "my-workspace",
  ],
  [ROLES.TEAM_LEAD]: [
    "dashboard",
    "organization/teams",
    "organization/employees",
    "organization/projects",
    "ai-workspace",
    "usage",
    "analytics",
    "roi",
    "notifications",
    "my-workspace",
  ],
  [ROLES.EMPLOYEE]: [
    "dashboard",
    "ai-workspace",
    "my-workspace",
    "notifications",
    "organization/projects", // assigned projects only (UI scopes)
  ],
};

/** Explicit denials even if a broader prefix might match later. */
const ROLE_DENIED_PREFIXES: Partial<Record<Role, string[]>> = {
  [ROLES.DEPARTMENT_HEAD]: [
    "ai-providers",
    "organization/job-roles",
    "settings",
    "governance",
  ],
  [ROLES.TEAM_LEAD]: [
    "ai-providers",
    "organization/departments",
    "organization/job-roles",
    "organization/employees/new",
    "budgets",
    "business-context",
    "reports",
    "settings",
    "governance",
    "roi/recommendations",
  ],
  [ROLES.EMPLOYEE]: [
    "organization/departments",
    "organization/teams",
    "organization/employees",
    "organization/job-roles",
    "ai-providers",
    "usage",
    "analytics",
    "roi",
    "budgets",
    "business-context",
    "reports",
    "settings",
    "governance",
  ],
};

export function getHomePath(role: Role, companySlug: string): string {
  const base = `/${companySlug}`;
  switch (role) {
    case ROLES.EMPLOYEE:
      return `${base}/ai-workspace`;
    case ROLES.TEAM_LEAD:
    case ROLES.DEPARTMENT_HEAD:
    case ROLES.COMPANY_OWNER:
      return `${base}/dashboard`;
    case ROLES.SUPER_ADMIN:
      return "/super-admin/dashboard";
    default:
      return `${base}/dashboard`;
  }
}

/**
 * @param pathname full path e.g. /acme/organization/departments
 * @param companySlug tenant slug
 */
export function canAccessCompanyPath(
  role: Role | null | undefined,
  companySlug: string,
  pathname: string,
): boolean {
  if (!role || role === ROLES.SUPER_ADMIN) return false;

  const prefix = `/${companySlug}`;
  if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) return false;

  const rest =
    pathname === prefix ? "dashboard" : pathname.slice(prefix.length + 1);

  const denied = ROLE_DENIED_PREFIXES[role] ?? [];
  if (denied.some((d) => rest === d || rest.startsWith(`${d}/`))) {
    return false;
  }

  const allowed = ROLE_ALLOWED_PREFIXES[role] ?? [];
  if (allowed.includes("*")) return true;

  return allowed.some((a) => rest === a || rest.startsWith(`${a}/`));
}
