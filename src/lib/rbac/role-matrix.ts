import { type Role, ROLES } from "@/constants/roles";

export type Resource =
  | "companies"
  | "providers_global"
  | "providers_company"
  | "departments"
  | "teams"
  | "employees"
  | "projects"
  | "budgets"
  | "benchmarks"
  | "workspace"
  | "usage"
  | "analytics"
  | "roi"
  | "reports"
  | "notifications"
  | "settings"
  | "audit"
  | "billing"
  | "feature_flags"
  | "system_health"
  | "job_roles";

export type Action =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "manage"
  | "use";

type PermissionMap = Partial<Record<Resource, Partial<Record<Action, boolean>>>>;

const matrix: Record<Role, PermissionMap> = {
  [ROLES.SUPER_ADMIN]: {
    companies: { view: true, create: true, edit: true, delete: true, manage: true },
    providers_global: { view: true, manage: true },
    analytics: { view: true },
    audit: { view: true },
    billing: { view: true, manage: true },
    feature_flags: { view: true, manage: true },
    system_health: { view: true, manage: true },
    notifications: { view: true },
    settings: { view: true, manage: true },
  },

  /** CEO — full company control center */
  [ROLES.COMPANY_OWNER]: {
    departments: { view: true, create: true, edit: true, delete: true, manage: true },
    teams: { view: true, create: true, edit: true, delete: true, manage: true },
    employees: { view: true, create: true, edit: true, manage: true },
    projects: { view: true, create: true, edit: true, manage: true },
    providers_company: { view: true, manage: true },
    budgets: { view: true, create: true, edit: true, manage: true },
    benchmarks: { view: true, approve: true, create: true, manage: true },
    job_roles: { view: true, create: true, edit: true, manage: true },
    workspace: { use: true, view: true },
    usage: { view: true },
    analytics: { view: true },
    roi: { view: true },
    reports: { view: true, create: true },
    notifications: { view: true },
    settings: { view: true, manage: true },
    audit: { view: true },
    billing: { view: true, manage: true },
  },

  /**
   * Department Manager — own department only.
   * No company AI providers / company settings / job-role company config.
   */
  [ROLES.DEPARTMENT_HEAD]: {
    departments: { view: true },
    teams: { view: true, create: true, edit: true, manage: true },
    employees: { view: true, create: true, edit: true },
    projects: { view: true, create: true, edit: true },
    budgets: { view: true },
    benchmarks: { view: true, approve: true, create: true },
    workspace: { use: true, view: true },
    usage: { view: true },
    analytics: { view: true },
    roi: { view: true },
    reports: { view: true },
    notifications: { view: true },
    audit: { view: true },
  },

  /**
   * Team Lead — own team only.
   * No company settings, providers, dept management, job roles.
   */
  [ROLES.TEAM_LEAD]: {
    teams: { view: true },
    employees: { view: true, edit: true },
    projects: { view: true, create: true, edit: true },
    workspace: { use: true, view: true },
    usage: { view: true },
    analytics: { view: true },
    roi: { view: true },
    notifications: { view: true },
  },

  /**
   * Employee — workspace + personal intelligence only.
   * Never company org management, providers, company analytics, settings.
   */
  [ROLES.EMPLOYEE]: {
    workspace: { use: true, view: true },
    projects: { view: true },
    notifications: { view: true },
  },
};

export function can(
  role: Role | null | undefined,
  resource: Resource,
  action: Action,
): boolean {
  if (!role) return false;
  return Boolean(matrix[role]?.[resource]?.[action]);
}

export function getRoleMatrix(role: Role): PermissionMap {
  return matrix[role] ?? {};
}
