"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  canAccessCompanyPath,
  getHomePath,
} from "@/lib/rbac/route-access";

/**
 * Client ACL for tenant routes. Middleware already checked cookies;
 * this covers client-side clicks without a second loading screen.
 */
export function RouteGuard({
  companySlug,
  children,
}: {
  companySlug: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const allowed =
    Boolean(user) && canAccessCompanyPath(user!.role, companySlug, pathname);

  useEffect(() => {
    if (!user) return;
    if (!canAccessCompanyPath(user.role, companySlug, pathname)) {
      router.replace(getHomePath(user.role, companySlug));
    }
  }, [user, companySlug, pathname, router]);

  if (!allowed) return null;
  return <>{children}</>;
}
