/**
 * Role → visual theme mapping (shared chassis, unique accent).
 * See `.cursor/docs/ROLE_COLOR_IDENTITY.md`
 */
import { ROLES, type Role } from "@/constants/roles";

export type RoleThemeId =
  | "super-admin"
  | "ceo"
  | "department-manager"
  | "team-lead"
  | "employee";

export const ROLE_THEME_BY_ROLE: Record<Role, RoleThemeId> = {
  [ROLES.SUPER_ADMIN]: "super-admin",
  [ROLES.COMPANY_OWNER]: "ceo",
  [ROLES.DEPARTMENT_HEAD]: "department-manager",
  [ROLES.TEAM_LEAD]: "team-lead",
  [ROLES.EMPLOYEE]: "employee",
};

export const ROLE_ACCENT_HEX: Record<RoleThemeId, string> = {
  "super-admin": "#67E8F9",
  ceo: "#E8C547",
  "department-manager": "#4F8CFF",
  "team-lead": "#2DD4BF",
  employee: "#00E5A8",
};

export function roleThemeFromRole(role?: Role | null): RoleThemeId {
  if (!role) return "employee";
  return ROLE_THEME_BY_ROLE[role] ?? "employee";
}
