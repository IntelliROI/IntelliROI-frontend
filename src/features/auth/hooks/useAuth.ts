"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/auth.types";

/** So RequireAuth does not wait on a second /auth/me after login/register. */
export function seedMeCache(queryClient: QueryClient, user: User) {
  queryClient.setQueryData(queryKeys.auth.me(), user);
}

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

/** Live /auth/me — writes scope + permissions into the persisted session. */
export function useMeQuery(enabled = true) {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const me = await authApi.me();
      setUser(me);
      return me;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useLoginMutation() {
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      setSession({
        user: session.user,
        company: session.company ?? session.user.company,
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      });
      seedMeCache(queryClient, session.user);
    },
  });
}

export function useLogoutMutation() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      return authApi.logout(refreshToken);
    },
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });
}
