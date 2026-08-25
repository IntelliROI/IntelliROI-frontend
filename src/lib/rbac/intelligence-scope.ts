import { ROLES, type Role } from "@/constants/roles";
import type { User } from "@/types/auth.types";

export type IntelligenceScope =
  | { kind: "company"; title: string }
  | { kind: "department"; id: number; title: string }
  | { kind: "team"; id: number; title: string }
  | { kind: "employee"; id: string | number; title: string }
  | { kind: "unassigned"; role: Role; missing: "department" | "team"; title: string };

/**
 * Resolve which analytics / ROI / cost endpoints a user may call.
 * Dept managers and team leads must never hit company-wide APIs.
 */
export function resolveIntelligenceScope(user: User | null | undefined): IntelligenceScope {
  const role = user?.role ?? ROLES.EMPLOYEE;
  const departmentId = user?.scope?.department_id ?? user?.department_id ?? null;
  const teamId = user?.scope?.team_id ?? user?.team_id ?? null;
  const employeeId = user?.id ?? user?.uuid;

  if (role === ROLES.EMPLOYEE) {
    return {
      kind: "employee",
      id: employeeId ?? "",
      title: "My Analytics",
    };
  }

  if (role === ROLES.TEAM_LEAD) {
    if (teamId == null) {
      return {
        kind: "unassigned",
        role,
        missing: "team",
        title: "Team Analytics",
      };
    }
    return { kind: "team", id: teamId, title: "Team Analytics" };
  }

  if (role === ROLES.DEPARTMENT_HEAD) {
    if (departmentId == null) {
      return {
        kind: "unassigned",
        role,
        missing: "department",
        title: "Department Analytics",
      };
    }
    return {
      kind: "department",
      id: departmentId,
      title: "Department Analytics",
    };
  }

  return { kind: "company", title: "Company Analytics" };
}

export function isCompanyWideScope(scope: IntelligenceScope): boolean {
  return scope.kind === "company";
}
