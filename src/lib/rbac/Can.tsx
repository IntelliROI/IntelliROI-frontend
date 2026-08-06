"use client";

import { type ReactNode } from "react";
import { can, type Action, type Resource } from "@/lib/rbac/role-matrix";
import { useAuthStore } from "@/stores/auth-store";

type CanProps = {
  resource: Resource;
  action: Action;
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({ resource, action, children, fallback = null }: CanProps) {
  const role = useAuthStore((s) => s.user?.role);
  if (!can(role, resource, action)) return <>{fallback}</>;
  return <>{children}</>;
}
