"use client";

import { type ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { getPlatformNav } from "@/config/navigation";
import { ROLES } from "@/constants/roles";
import { useAuthStore } from "@/stores/auth-store";

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const role = useAuthStore((s) => s.user?.role) ?? ROLES.SUPER_ADMIN;
  const nav = getPlatformNav(role);

  return (
    <RequireAuth roles={[ROLES.SUPER_ADMIN]}>
      <AppShell nav={nav} contextLabel="Platform · Super Admin">
        {children}
      </AppShell>
    </RequireAuth>
  );
}
