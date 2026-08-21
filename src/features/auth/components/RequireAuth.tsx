"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useMeQuery } from "@/features/auth/hooks/useAuth";
import { type Role } from "@/constants/roles";
import { LoadingBlock } from "@/components/feedback/States";

export function RequireAuth({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Role[];
}) {
  const router = useRouter();
  const { user, isHydrated, accessToken } = useAuthStore();
  const me = useMeQuery(isHydrated && Boolean(accessToken));

  const meReady =
    !isHydrated || !accessToken || me.isSuccess || me.isError;

  useEffect(() => {
    if (!isHydrated) return;
    if (!accessToken || !user) {
      router.replace("/login");
      return;
    }
    if (roles && !roles.includes(user.role)) {
      router.replace("/forbidden");
    }
  }, [isHydrated, accessToken, user, roles, router]);

  if (!isHydrated || !user || !meReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink p-8">
        <LoadingBlock className="h-24 w-full max-w-md" />
      </div>
    );
  }

  if (roles && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
