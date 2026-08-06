import { apiRequest, useMocks } from "@/lib/api/client";
import {
  delay,
  mockCompany,
  mockCompanies,
  mockPlatformMetrics,
} from "@/lib/mocks/data";
import { type Company } from "@/types/auth.types";

export type PlatformMetrics = typeof mockPlatformMetrics;

export type Subscription = {
  plan?: string;
  status: string;
  seats: number;
  renews_at: string;
};

export type BillingUsage = {
  seats_used: number;
  seats_limit: number;
  requests_month: number;
  requests_limit: number;
};

export type Plan = {
  id: number;
  name: string;
  price_monthly: number;
  seats: number;
};

export const billingApi = {
  async plans(): Promise<Plan[]> {
    if (useMocks) {
      return delay([
        { id: 1, name: "Free", price_monthly: 0, seats: 5 },
        { id: 2, name: "Pro", price_monthly: 499, seats: 50 },
        { id: 3, name: "Enterprise", price_monthly: 2499, seats: 500 },
      ]);
    }
    return apiRequest<Plan[]>("billing", "/subscription-plans");
  },

  async mySubscription(): Promise<Subscription> {
    if (useMocks) {
      return delay({
        plan: mockCompany.plan,
        status: "active",
        seats: 116,
        renews_at: "2026-09-01",
      });
    }
    return apiRequest<Subscription>("billing", "/companies/me/subscription");
  },

  async myUsage(): Promise<BillingUsage> {
    if (useMocks) {
      return delay({
        seats_used: 86,
        seats_limit: 116,
        requests_month: 4820,
        requests_limit: 100000,
      });
    }
    return apiRequest<BillingUsage>("billing", "/companies/me/usage");
  },
};

export const platformApi = {
  async metrics(): Promise<PlatformMetrics> {
    if (useMocks) return delay(mockPlatformMetrics);
    return apiRequest<PlatformMetrics>(
      "analytics",
      "/analytics/company?period=month",
    );
  },

  async companies(): Promise<Company[]> {
    if (useMocks) return delay(mockCompanies);
    return apiRequest<Company[]>("auth", "/companies");
  },
};
