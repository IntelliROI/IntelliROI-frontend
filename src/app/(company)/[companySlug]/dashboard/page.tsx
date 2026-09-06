"use client";

import { useAuthStore } from "@/stores/auth-store";
import { ROLES } from "@/constants/roles";
import { ScopeUnassigned } from "@/components/feedback/ScopeUnassigned";
import { CeoDashboard } from "@/features/roi/components/CeoDashboard";
import { DepartmentDashboard } from "@/features/organization/components/DepartmentDashboard";
import { TeamDashboard } from "@/features/organization/components/TeamDashboard";
import { EmployeeDashboard } from "@/features/organization/components/EmployeeDashboard";

export default function CompanyDashboardPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const departmentId = user?.scope?.department_id ?? user?.department_id ?? null;
  const teamId = user?.scope?.team_id ?? user?.team_id ?? null;

  if (role === ROLES.EMPLOYEE) {
    return <EmployeeDashboard companySlug={params.companySlug} />;
  }

  if (role === ROLES.TEAM_LEAD) {
    if (!teamId) {
      return (
        <ScopeUnassigned role={ROLES.TEAM_LEAD} missing="team" title="Team Dashboard" />
      );
    }
    return (
      <TeamDashboard
        companySlug={params.companySlug}
        departmentId={departmentId ?? 0}
        teamId={teamId}
      />
    );
  }

  if (role === ROLES.DEPARTMENT_HEAD) {
    if (!departmentId) {
      return (
        <ScopeUnassigned
          role={ROLES.DEPARTMENT_HEAD}
          missing="department"
          title="Department Dashboard"
        />
      );
    }
    return (
      <DepartmentDashboard
        companySlug={params.companySlug}
        departmentId={departmentId}
      />
    );
  }

  return <CeoDashboard companySlug={params.companySlug} />;
}
