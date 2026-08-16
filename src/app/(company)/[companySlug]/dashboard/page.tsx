"use client";

import dynamic from "next/dynamic";
import { useAuthStore } from "@/stores/auth-store";
import { ROLES } from "@/constants/roles";
import { LoadingBlock } from "@/components/feedback/States";

const CeoDashboard = dynamic(
  () =>
    import("@/features/roi/components/CeoDashboard").then((m) => m.CeoDashboard),
  { loading: () => <LoadingBlock className="h-64" /> },
);
const DepartmentDashboard = dynamic(
  () =>
    import("@/features/organization/components/DepartmentDashboard").then(
      (m) => m.DepartmentDashboard,
    ),
  { loading: () => <LoadingBlock className="h-64" /> },
);
const TeamDashboard = dynamic(
  () =>
    import("@/features/organization/components/TeamDashboard").then(
      (m) => m.TeamDashboard,
    ),
  { loading: () => <LoadingBlock className="h-64" /> },
);
const EmployeeDashboard = dynamic(
  () =>
    import("@/features/organization/components/EmployeeDashboard").then(
      (m) => m.EmployeeDashboard,
    ),
  { loading: () => <LoadingBlock className="h-64" /> },
);

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

  if (role === ROLES.TEAM_LEAD && teamId) {
    return (
      <TeamDashboard
        companySlug={params.companySlug}
        departmentId={departmentId ?? 0}
        teamId={teamId}
      />
    );
  }

  if (role === ROLES.DEPARTMENT_HEAD && departmentId) {
    return (
      <DepartmentDashboard
        companySlug={params.companySlug}
        departmentId={departmentId}
      />
    );
  }

  return <CeoDashboard companySlug={params.companySlug} />;
}
