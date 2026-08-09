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
