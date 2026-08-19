export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  COMPANY_OWNER: "COMPANY_OWNER",
  DEPARTMENT_HEAD: "DEPARTMENT_HEAD",
  TEAM_LEAD: "TEAM_LEAD",
  EMPLOYEE: "EMPLOYEE",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  COMPANY_OWNER: "Company Owner",
  DEPARTMENT_HEAD: "Department Head",
  TEAM_LEAD: "Team Lead",
  EMPLOYEE: "Employee",
};

/** API role_name values → app Role. */
const ROLE_ALIASES: Record<string, Role> = {
  super_admin: ROLES.SUPER_ADMIN,
  "super-admin": ROLES.SUPER_ADMIN,
  superadmin: ROLES.SUPER_ADMIN,
  company_owner: ROLES.COMPANY_OWNER,
  owner: ROLES.COMPANY_OWNER,
  admin: ROLES.COMPANY_OWNER,
  department_head: ROLES.DEPARTMENT_HEAD,
  department_manager: ROLES.DEPARTMENT_HEAD,
  manager: ROLES.DEPARTMENT_HEAD,
  team_lead: ROLES.TEAM_LEAD,
  employee: ROLES.EMPLOYEE,
};

/** Highest-privilege role wins when a user has more than one. */
const ROLE_PRIORITY: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.COMPANY_OWNER,
  ROLES.DEPARTMENT_HEAD,
  ROLES.TEAM_LEAD,
  ROLES.EMPLOYEE,
];

/** Pick one app Role from the API `roles` list. */
export function resolveRole(roleNames: string[] | null | undefined): Role {
  const mapped = (roleNames ?? [])
    .map((name) => ROLE_ALIASES[name.toLowerCase().trim()])
    .filter((r): r is Role => Boolean(r));
  for (const candidate of ROLE_PRIORITY) {
    if (mapped.includes(candidate)) return candidate;
  }
  return ROLES.EMPLOYEE;
}

/**
 * Map app Role → invite `role_name`.
 * Owner/admin are created at register — they cannot be invited.
 */
export function toInviteRole(
  role: Role,
): "department_manager" | "team_lead" | "employee" {
  switch (role) {
    case ROLES.DEPARTMENT_HEAD:
      return "department_manager";
    case ROLES.TEAM_LEAD:
      return "team_lead";
    default:
      return "employee";
  }
}
