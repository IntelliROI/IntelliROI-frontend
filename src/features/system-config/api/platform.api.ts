import { apiRequest, pagedRequest, withQuery } from "@/lib/api/client";
import { LIST_PAGE_SIZE_MAX } from "@/lib/api/types";
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

export type GatewayHealth = {
  live: boolean;
  ready: boolean;
  detail: string;
};

export type PlatformProviderTenant = {
  id: number;
  company_uuid: string;
  company_name: string;
  provider_name: string;
  display_name: string;
  key_alias: string;
  has_key: boolean;
  status: string;
};

type PlatformProviderTenantDto = {
  id?: number;
  company_uuid?: string;
  company_name?: string;
  provider_name?: string;
  display_name?: string;
  key_alias?: string;
  has_key?: boolean;
  status?: string;
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

export function tenantKpisFromList(tenants: PlatformTenant[]): PlatformMetrics {
  const statusOf = (s?: string) => (s ?? "").trim().toLowerCase();
  return {
    tenant_count: tenants.length,
    active_companies: tenants.filter((t) => statusOf(t.status) === "active").length,
    suspended_companies: tenants.filter((t) => statusOf(t.status) === "suspended")
      .length,
    seated_users: tenants.reduce((n, t) => n + (t.user_count ?? 0), 0),
  };
}

/** Prefer API totals, but never show fewer suspended/active than the visible tenant list. */
export function mergePlatformMetrics(
  tenants: PlatformTenant[],
  metrics?: PlatformMetrics | null,
): PlatformMetrics {
  const fromList = tenantKpisFromList(tenants);
  if (!metrics) return fromList;
  return {
    tenant_count: Math.max(metrics.tenant_count, fromList.tenant_count),
    active_companies: Math.max(metrics.active_companies, fromList.active_companies),
    suspended_companies: Math.max(
      metrics.suspended_companies,
      fromList.suspended_companies,
    ),
    seated_users: metrics.seated_users || fromList.seated_users,
  };
}

export const platformApi = {
  async companies(): Promise<PlatformTenant[]> {
    const page = await pagedRequest<TenantDto>(
      "auth",
      withQuery("/platform/companies", { page: 1, page_size: LIST_PAGE_SIZE_MAX }),
    );
    return page.items.map(toTenant);
  },

  async providerTenants(companyUuid?: string): Promise<PlatformProviderTenant[]> {
    try {
      const page = await pagedRequest<PlatformProviderTenantDto>(
        "ai",
        withQuery("/providers/platform/tenants", {
          page: 1,
          page_size: LIST_PAGE_SIZE_MAX,
          company_uuid: companyUuid,
        }),
      );
      return page.items.map((row) => ({
        id: row.id ?? 0,
        company_uuid: row.company_uuid ?? "",
        company_name: row.company_name ?? "",
        provider_name: row.provider_name ?? "",
        display_name: row.display_name ?? row.provider_name ?? "",
        key_alias: row.key_alias ?? "",
        has_key: row.has_key !== false,
        status: row.status ?? "active",
      }));
    } catch {
      return [];
    }
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
