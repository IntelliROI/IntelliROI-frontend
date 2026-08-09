"use client";

import { useAuthStore } from "@/stores/auth-store";
import { ROLES } from "@/constants/roles";
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

  if (role === ROLES.EMPLOYEE) {
    return <EmployeeDashboard companySlug={params.companySlug} />;
  }

  if (role === ROLES.TEAM_LEAD && user?.team_id && user.department_id) {
    return (
      <TeamDashboard
        companySlug={params.companySlug}
        departmentId={user.department_id}
        teamId={user.team_id}
      />
    );
  }

  if (role === ROLES.DEPARTMENT_HEAD && user?.department_id) {
    return (
      <DepartmentDashboard
        companySlug={params.companySlug}
        departmentId={user.department_id}
      />
    );
  }

  return <CeoDashboard companySlug={params.companySlug} />;
}
