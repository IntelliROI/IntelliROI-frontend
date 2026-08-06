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
  | "system_health";

export type Action =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "manage"
  | "use";

type PermissionMap = Partial<Record<Resource, Partial<Record<Action, boolean>>>>;

const ALL_FALSE: PermissionMap = {};

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
  [ROLES.COMPANY_OWNER]: {
    departments: { view: true, create: true, edit: true, delete: true, manage: true },
    teams: { view: true, create: true, edit: true, delete: true, manage: true },
    employees: { view: true, create: true, edit: true, manage: true },
    projects: { view: true, create: true, edit: true, manage: true },
    providers_company: { view: true, manage: true },
    budgets: { view: true, create: true, edit: true, manage: true },
    benchmarks: { view: true, approve: true, manage: true },
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
  [ROLES.DEPARTMENT_HEAD]: {
    departments: { view: true },
    teams: { view: true, create: true, edit: true, manage: true },
    employees: { view: true, edit: true },
    projects: { view: true, create: true, edit: true },
    budgets: { view: true },
    benchmarks: { view: true, approve: true, create: true },
    workspace: { use: true, view: true },
    usage: { view: true },
    analytics: { view: true },
    roi: { view: true },
    reports: { view: true },
    notifications: { view: true },
  },
  [ROLES.TEAM_LEAD]: {
    teams: { view: true },
    employees: { view: true, edit: true },
    projects: { view: true, create: true, edit: true },
    benchmarks: { view: true, create: true },
    workspace: { use: true, view: true },
    usage: { view: true },
    analytics: { view: true },
    roi: { view: true },
    notifications: { view: true },
  },
  [ROLES.EMPLOYEE]: {
    workspace: { use: true, view: true },
    usage: { view: true },
    analytics: { view: true },
    roi: { view: true },
    benchmarks: { create: true },
    notifications: { view: true },
  },
};

export function can(
  role: Role | null | undefined,
  resource: Resource,
  action: Action,
): boolean {
  if (!role) return false;
  return Boolean(matrix[role]?.[resource]?.[action] ?? ALL_FALSE);
}

export function getRoleMatrix(role: Role): PermissionMap {
  return matrix[role] ?? {};
}
