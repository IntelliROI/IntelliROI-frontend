import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Company, type User } from "@/types/auth.types";
import { clearAuthCookies, syncAuthCookies } from "@/lib/auth/cookies";

type AuthState = {
  user: User | null;
  company: Company | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  onboardingComplete: boolean;
  setSession: (payload: {
    user: User;
    company?: Company | null;
    accessToken: string;
    refreshToken: string;
    onboardingComplete?: boolean;
  }) => void;
  setUser: (user: User | null) => void;
  setOnboardingComplete: (value: boolean) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      company: null,
      accessToken: null,
      refreshToken: null,
      isHydrated: false,
      onboardingComplete: true,
      setSession: ({
        user,
        company,
        accessToken,
        refreshToken,
        onboardingComplete,
      }) => {
        const nextCompany = company ?? user.company ?? null;
        const complete =
          onboardingComplete ??
          (user.role === "SUPER_ADMIN" ? true : get().onboardingComplete);
        if (typeof window !== "undefined") {
          localStorage.setItem("intelliroi_access_token", accessToken);
          localStorage.setItem("intelliroi_refresh_token", refreshToken);
        }
        syncAuthCookies({
          accessToken,
          role: user.role,
          companySlug: nextCompany?.slug,
          onboardingComplete: complete,
        });
        set({
          user,
          company: nextCompany,
          accessToken,
          refreshToken,
          onboardingComplete: complete,
        });
      },
      setUser: (user) =>
        set({
          user,
          company: user?.company ?? get().company,
        }),
      setOnboardingComplete: (value) => {
        const state = get();
        if (state.accessToken && state.user) {
          syncAuthCookies({
            accessToken: state.accessToken,
            role: state.user.role,
            companySlug: state.company?.slug,
            onboardingComplete: value,
          });
        }
        set({ onboardingComplete: value });
      },
      clearSession: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("intelliroi_access_token");
          localStorage.removeItem("intelliroi_refresh_token");
        }
        clearAuthCookies();
        set({
          user: null,
          company: null,
          accessToken: null,
          refreshToken: null,
          onboardingComplete: true,
        });
      },
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: "intelliroi-auth",
      partialize: (state) => ({
        user: state.user,
        company: state.company,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        onboardingComplete: state.onboardingComplete,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (state?.accessToken && state.user) {
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "intelliroi_access_token",
              state.accessToken,
            );
          }
          syncAuthCookies({
            accessToken: state.accessToken,
            role: state.user.role,
            companySlug: state.company?.slug,
            onboardingComplete: state.onboardingComplete,
          });
        }
      },
    },
  ),
);
