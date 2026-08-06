"use client";

import { type ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
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
  const nav = getCompanyNav(role, params.companySlug);

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
        contextLabel={`${company?.name ?? params.companySlug} · ${role.replace(/_/g, " ")}`}
      >
        {children}
      </AppShell>
    </RequireAuth>
  );
}
