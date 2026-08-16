"use client";

import { type ReactNode, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { RouteGuard } from "@/features/auth/components/RouteGuard";
import { getCompanyNav } from "@/config/navigation";
import { ROLES } from "@/constants/roles";
import { useAuthStore } from "@/stores/auth-store";

export default function CompanyLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { companySlug: string };
}) {
  const user = useAuthStore((s) => s.user);
  const company = useAuthStore((s) => s.company);
  const role = user?.role ?? ROLES.EMPLOYEE;
  const nav = useMemo(
    () => getCompanyNav(role, params.companySlug),
    [role, params.companySlug],
  );

  return (
    <RequireAuth
      roles={[
        ROLES.COMPANY_OWNER,
        ROLES.DEPARTMENT_HEAD,
        ROLES.TEAM_LEAD,
        ROLES.EMPLOYEE,
      ]}
    >
      <AppShell
        nav={nav}
        companySlug={params.companySlug}
        contextLabel={`${company?.name ?? params.companySlug}`}
      >
        <RouteGuard companySlug={params.companySlug}>{children}</RouteGuard>
      </AppShell>
    </RequireAuth>
  );
}
