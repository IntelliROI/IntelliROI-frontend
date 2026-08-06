"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/stores/auth-store";

export function useSession() {
  const user = useAuthStore((s) => s.user);
  const company = useAuthStore((s) => s.company);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  return {
    user,
    company,
    accessToken,
    isHydrated,
    isAuthenticated: Boolean(accessToken && user),
  };
}

export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authApi.me(),
    enabled,
    staleTime: 60_000,
  });
}

export function useLoginMutation() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      setSession({
        user: session.user,
        company: session.company ?? session.user.company,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      });
    },
  });
}

export function useLogoutMutation() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });
}
