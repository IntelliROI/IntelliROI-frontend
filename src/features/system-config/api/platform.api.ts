import { apiRequest, pagedRequest } from "@/lib/api/client";
import { type Company } from "@/types/auth.types";
import { slugify } from "@/lib/utils";

export type PlatformTenant = Company & {
  user_count?: number;
  created_at?: string;
};

export type PlatformMetrics = {
  tenant_count: number;
  active_companies: number;
  suspended_companies: number;
  seated_users: number;
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

export type GatewayHealth = {
  live: boolean;
  ready: boolean;
  detail: string;
};

type TenantDto = {
  uuid: string;
  id?: number;
  company_name: string;
  company_code?: string;
  industry?: string;
  company_size?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  status: string;
  user_count?: number;
  created_at?: string;
};

type HealthDto = {
  status?: string;
  service?: string;
  time?: string;
};

function toTenant(c: TenantDto): PlatformTenant {
  return {
    uuid: c.uuid,
    id: c.id,
    name: c.company_name,
    slug: slugify(c.company_name || c.company_code || c.uuid),
    company_code: c.company_code,
    industry: c.industry,
    company_size: c.company_size,
    country: c.country,
    timezone: c.timezone,
    currency: c.currency,
    status: (c.status as Company["status"]) ?? "active",
    user_count: c.user_count,
    created_at: c.created_at,
  };
}

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
  async companies(): Promise<PlatformTenant[]> {
    const page = await pagedRequest<TenantDto>("auth", "/platform/companies");
    return page.items.map(toTenant);
  },

  async company(uuid: string): Promise<PlatformTenant> {
    const raw = await apiRequest<TenantDto>("auth", `/platform/companies/${uuid}`);
    return toTenant(raw);
  },

  async patchCompanyStatus(
    uuid: string,
    status: "active" | "suspended",
  ): Promise<PlatformTenant> {
    const raw = await apiRequest<TenantDto>(
      "auth",
      `/platform/companies/${uuid}`,
      { method: "PATCH", body: { status } },
    );
    return toTenant({
      ...raw,
      company_name: raw.company_name || uuid,
      status: raw.status,
    });
  },

  /** Tenant counts from GET /platform/metrics (no MRR/spend). */
  async metrics(): Promise<PlatformMetrics> {
    return apiRequest<PlatformMetrics>("auth", "/platform/metrics");
  },

  async gatewayHealth(): Promise<GatewayHealth> {
    try {
      const live = await apiRequest<HealthDto>("auth", "/healthz");
      let ready = false;
      try {
        await apiRequest<HealthDto>("auth", "/readyz");
        ready = true;
      } catch {
        ready = false;
      }
      return {
        live: live.status === "ok" || Boolean(live.service),
        ready,
        detail: live.service ?? live.status ?? "gateway",
      };
    } catch (err) {
      return {
        live: false,
        ready: false,
        detail: err instanceof Error ? err.message : "unreachable",
      };
    }
  },
};
