import { apiRequest } from "@/lib/api/client";
import { type Company } from "@/types/auth.types";

export type PlatformMetrics = {
  active_companies: number;
  new_signups_month: number;
  mrr: number;
  platform_ai_spend: number;
  active_employees: number;
  plan_distribution?: { plan: string; count: number }[];
};

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
    return apiRequest<Plan[]>("billing", "/subscription-plans");
  },

  async mySubscription(): Promise<Subscription> {
    return apiRequest<Subscription>("billing", "/companies/me/subscription");
  },

  async myUsage(): Promise<BillingUsage> {
    return apiRequest<BillingUsage>("billing", "/companies/me/usage");
  },
};

export const platformApi = {
  async metrics(): Promise<PlatformMetrics> {
    return apiRequest<PlatformMetrics>(
      "analytics",
      "/analytics/company?period=month",
    );
  },

  async companies(): Promise<Company[]> {
    return apiRequest<Company[]>("auth", "/companies");
  },
};
