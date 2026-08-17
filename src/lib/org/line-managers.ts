import { ROLES } from "@/constants/roles";
import type { Employee } from "@/features/organization/types";

/**
 * Line managers / team leads — company owner is the CEO seat, not a
 * reporting manager on invite/dept/team forms.
 */
export function lineManagers(people: Employee[]): Employee[] {
  return people.filter(
    (e) => e.app_role !== ROLES.COMPANY_OWNER && e.status !== "invited",
  );
}
