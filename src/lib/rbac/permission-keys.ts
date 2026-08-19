import { type Action, type Resource } from "@/lib/rbac/role-matrix";

/**
 * Backend JWT / `/auth/me` permission keys → UI resource/action.
 * When `permissions` is present, hide actions the API would 403.
 */
const RESOURCE_ACTION_KEYS: Partial<
  Record<Resource, Partial<Record<Action, string[]>>>
> = {
  companies: {
    view: ["platform.manage"],
    manage: ["platform.manage"],
    edit: ["platform.manage"],
    create: ["platform.manage"],
    delete: ["platform.manage"],
  },
  providers_global: {
    view: ["platform.manage", "providers.manage"],
    manage: ["platform.manage"],
  },
  providers_company: {
    view: ["providers.manage"],
    manage: ["providers.manage"],
  },
  departments: {
    view: ["org.manage", "employees.view"],
    manage: ["org.manage"],
    create: ["org.manage"],
    edit: ["org.manage"],
    delete: ["org.manage"],
  },
  teams: {
    view: ["org.manage", "employees.view"],
    manage: ["org.manage"],
    create: ["org.manage"],
    edit: ["org.manage"],
    delete: ["org.manage"],
  },
  employees: {
    view: ["employees.view"],
    manage: ["employees.manage"],
    create: ["users.invite", "employees.manage"],
    edit: ["employees.manage"],
  },
  projects: {
    view: ["org.manage", "chat.use"],
    manage: ["org.manage"],
    create: ["org.manage"],
    edit: ["org.manage"],
  },
  budgets: {
    view: ["budget.manage", "roi.view"],
    manage: ["budget.manage"],
    create: ["budget.manage"],
    edit: ["budget.manage"],
  },
  benchmarks: {
    view: ["job_roles.manage"],
    manage: ["job_roles.manage"],
    create: ["job_roles.manage"],
    approve: ["job_roles.manage"],
  },
  job_roles: {
    view: ["job_roles.manage"],
    manage: ["job_roles.manage"],
    create: ["job_roles.manage"],
    edit: ["job_roles.manage"],
  },
  workspace: {
    use: ["chat.use"],
    view: ["chat.use"],
  },
  usage: {
    view: ["analytics.view", "roi.view"],
  },
  analytics: {
    view: ["analytics.view", "platform.manage"],
  },
  roi: {
    view: ["roi.view"],
  },
  policies: {
    view: ["policies.manage"],
    manage: ["policies.manage"],
    create: ["policies.manage"],
    edit: ["policies.manage"],
    delete: ["policies.manage"],
  },
  settings: {
    view: ["company_settings.view", "company_settings.manage", "platform.manage"],
    manage: ["company_settings.manage", "platform.manage"],
  },
  notifications: {
    view: ["chat.use", "roi.view", "analytics.view", "platform.manage"],
  },
};

export function permissionAllows(
  permissions: string[] | undefined,
  resource: Resource,
  action: Action,
): boolean {
  if (!permissions || permissions.length === 0) return true;
  const keys = RESOURCE_ACTION_KEYS[resource]?.[action];
  if (!keys?.length) return true;
  const set = new Set(permissions);
  return keys.some((key) => set.has(key));
}
