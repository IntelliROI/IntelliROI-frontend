import { apiRequest, useMocks } from "@/lib/api/client";
import { type AuthSession, type User } from "@/types/auth.types";
import { delay, mockCompany, mockUsers } from "@/lib/mocks/data";
import { ROLES } from "@/constants/roles";
import { slugify } from "@/lib/utils";

export type LoginInput = { email: string; password: string };

export type RegisterInput = {
  company_name: string;
  industry: string;
  company_size: string;
  timezone: string;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
};

function stripPassword<T extends { password?: string }>(user: T): Omit<T, "password"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
  return rest;
}

export const authApi = {
  async login(input: LoginInput): Promise<AuthSession> {
    if (useMocks) {
      const found = mockUsers[input.email.toLowerCase()];
      if (!found || found.password !== input.password) {
        throw new Error("Invalid email or password");
      }
      const user = stripPassword(found) as User;
      return delay({
        access_token: `mock-access-${user.uuid}`,
        refresh_token: `mock-refresh-${user.uuid}`,
        user,
        company: user.company,
      });
    }
    return apiRequest<AuthSession>("auth", "/auth/login", {
      method: "POST",
      body: input,
      token: null,
    });
  },

  async register(input: RegisterInput): Promise<AuthSession> {
    if (useMocks) {
      const company = {
        uuid: `cmp-${Date.now()}`,
        id: Date.now(),
        name: input.company_name,
        slug: slugify(input.company_name),
        industry: input.industry,
        company_size: input.company_size,
        timezone: input.timezone,
        currency: input.currency,
        status: "active" as const,
        plan: "Trial",
      };
      const user: User = {
        uuid: `usr-${Date.now()}`,
        email: input.email,
        first_name: input.first_name,
        last_name: input.last_name,
        role: ROLES.COMPANY_OWNER,
        company,
      };
      return delay({
        access_token: `mock-access-${user.uuid}`,
        refresh_token: `mock-refresh-${user.uuid}`,
        user,
        company,
      });
    }
    return apiRequest<AuthSession>("auth", "/auth/register", {
      method: "POST",
      body: input,
      token: null,
    });
  },

  async me(): Promise<User> {
    if (useMocks) {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("intelliroi_access_token")
          : null;
      const uuid = token?.replace("mock-access-", "");
      const found = Object.values(mockUsers).find((u) => u.uuid === uuid);
      if (!found) return delay(stripPassword(mockUsers["ceo@acme.test"]) as User);
      return delay(stripPassword(found) as User);
    }
    return apiRequest<User>("auth", "/auth/me");
  },

  async refresh(refreshToken: string): Promise<AuthSession> {
    if (useMocks) {
      return delay({
        access_token: refreshToken.replace("refresh", "access"),
        refresh_token: refreshToken,
        user: stripPassword(mockUsers["ceo@acme.test"]) as User,
        company: mockCompany,
      });
    }
    return apiRequest<AuthSession>("auth", "/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
      token: null,
    });
  },

  async logout(): Promise<void> {
    if (useMocks) return delay(undefined);
    await apiRequest("auth", "/auth/logout", { method: "POST" });
  },

  async invite(input: {
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  }): Promise<{ user_uuid: string }> {
    if (useMocks) return delay({ user_uuid: `usr-invite-${Date.now()}` });
    return apiRequest("auth", "/auth/invite", { method: "POST", body: input });
  },

  async forgotPassword(email: string): Promise<void> {
    if (useMocks) return delay(undefined);
    await apiRequest("auth", "/auth/password/forgot", {
      method: "POST",
      body: { email },
      token: null,
    });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    if (useMocks) return delay(undefined);
    await apiRequest("auth", "/auth/password/reset", {
      method: "POST",
      body: { token, password },
      token: null,
    });
  },
};
