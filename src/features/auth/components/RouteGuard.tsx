"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import {
  canAccessCompanyPath,
  getHomePath,
} from "@/lib/rbac/route-access";
import { LoadingBlock } from "@/components/feedback/States";

/**
 * Client-side route ACL — employees/managers cannot deep-link into forbidden pages.
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
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (!isHydrated || !user) return;
    if (!canAccessCompanyPath(user.role, companySlug, pathname)) {
      router.replace(getHomePath(user.role, companySlug));
    }
  }, [isHydrated, user, companySlug, pathname, router]);

  if (!isHydrated || !user) {
    return <LoadingBlock className="h-40" />;
  }

  if (!canAccessCompanyPath(user.role, companySlug, pathname)) {
    return <LoadingBlock className="h-40" />;
  }

  return <>{children}</>;
}
