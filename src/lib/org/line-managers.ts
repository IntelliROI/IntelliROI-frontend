import { ROLES } from "@/constants/roles";
import type { Employee } from "@/features/organization/types";

/**
 * Reporting managers on invite/edit — only department heads and team leads.
 * Company owner is the CEO seat, not listed as a line manager.
 */
export function lineManagers(people: Employee[]): Employee[] {
  return people.filter(
    (e) =>
      e.status !== "invited" &&
      (e.app_role === ROLES.DEPARTMENT_HEAD || e.app_role === ROLES.TEAM_LEAD),
  );
}
