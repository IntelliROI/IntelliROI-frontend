import { apiRequest, withQuery } from "@/lib/api/client";
import { LIST_DROPDOWN_PAGE_SIZE } from "@/lib/api/types";

export type AnalyticsPoint = {
  date: string;
  requests: number;
  cost: number;
  roi_pct: number;
};

export type AnalyticsSummary = {
  period: string;
  requests: number;
  tokens_in: number;
  tokens_out: number;
  active_users: number;
  total_cost: number;
  total_business_value: number;
  roi_pct: number;
  series?: AnalyticsPoint[];
};

export type ProviderAnalytics = {
  provider: string;
  requests: number;
  cost: number;
  tokens: number;
};

export type ModelAnalytics = {
  model: string;
  requests: number;
  cost: number;
};

type SnapshotDto = {
  id?: number;
  scope_type?: string;
  scope_id?: number;
  period_type?: string;
  period_start?: string;
  total_requests?: number;
  total_tokens?: number;
  total_cost?: number;
  total_time_saved_minutes?: number;
  total_business_value?: number;
  provider?: string;
  model?: string;
};

function asList<T>(raw: unknown): T[] {
  return Array.isArray(raw) ? (raw as T[]) : [];
}

function estimatedRoiPct(value: number, cost: number): number {
  if (cost <= 0) return 0;
  return ((value - cost) / cost) * 100;
}

function toSummary(raw: unknown, period: string): AnalyticsSummary {
  const rows = asList<SnapshotDto>(raw);
  const series = [...rows]
    .sort((a, b) => (a.period_start ?? "").localeCompare(b.period_start ?? ""))
    .map((r) => ({
      date: r.period_start ?? "",
      requests: r.total_requests ?? 0,
      cost: Number(r.total_cost ?? 0),
      roi_pct: estimatedRoiPct(
        Number(r.total_business_value ?? 0),
        Number(r.total_cost ?? 0),
      ),
    }));
  const totals = series.reduce(
    (acc, p) => ({
      requests: acc.requests + p.requests,
      cost: acc.cost + p.cost,
    }),
    { requests: 0, cost: 0 },
  );
  const businessValue = rows.reduce(
    (sum, r) => sum + Number(r.total_business_value ?? 0),
    0,
  );
  const tokens = rows.reduce((sum, r) => sum + (r.total_tokens ?? 0), 0);
  return {
    period,
    requests: totals.requests,
    tokens_in: tokens,
    tokens_out: 0,
    active_users: 0,
    total_cost: totals.cost,
    total_business_value: businessValue,
    roi_pct: estimatedRoiPct(businessValue, totals.cost),
    series,
  };
}

function numericId(id: number | string): number | null {
  if (typeof id === "number" && Number.isFinite(id) && id > 0) return id;
  const n = Number(id);
  if (Number.isFinite(n) && n > 0 && String(n) === String(id).trim()) return n;
  return null;
}

export const analyticsApi = {
  async company(period = "day"): Promise<AnalyticsSummary> {
    const raw = await apiRequest(
      "analytics",
      withQuery("/analytics/company", {
        period,
        page_size: LIST_DROPDOWN_PAGE_SIZE,
      }),
    );
    return toSummary(raw, period);
  },

  async department(id: number, period = "day"): Promise<AnalyticsSummary> {
    const raw = await apiRequest(
      "analytics",
      withQuery(`/analytics/department/${id}`, {
        period,
        page_size: LIST_DROPDOWN_PAGE_SIZE,
      }),
    );
    return toSummary(raw, period);
  },

  async team(id: number, period = "day"): Promise<AnalyticsSummary> {
    const raw = await apiRequest(
      "analytics",
      withQuery(`/analytics/team/${id}`, {
        period,
        page_size: LIST_DROPDOWN_PAGE_SIZE,
      }),
    );
    return toSummary(raw, period);
  },

  async employee(
    id: number | string,
    period = "day",
  ): Promise<AnalyticsSummary> {
    const numeric = numericId(id);
    if (numeric == null) {
      throw new Error("Employee id is required for analytics");
    }
    const raw = await apiRequest(
      "analytics",
      withQuery(`/analytics/employee/${numeric}`, {
        period,
        page_size: LIST_DROPDOWN_PAGE_SIZE,
      }),
    );
    return toSummary(raw, period);
  },

  async project(id: number, period = "day"): Promise<AnalyticsSummary> {
    const raw = await apiRequest(
      "analytics",
      withQuery(`/analytics/project/${id}`, {
        period,
        page_size: LIST_DROPDOWN_PAGE_SIZE,
      }),
    );
    return toSummary(raw, period);
  },

  async providers(period = "day"): Promise<ProviderAnalytics[]> {
    const raw = await apiRequest<SnapshotDto[]>(
      "analytics",
      withQuery("/analytics/providers", {
        period,
        page_size: LIST_DROPDOWN_PAGE_SIZE,
      }),
    );
    return asList<SnapshotDto>(raw).map((r) => ({
      provider: r.provider ?? (r.scope_id ? `Provider ${r.scope_id}` : "Unknown"),
      requests: r.total_requests ?? 0,
      cost: Number(r.total_cost ?? 0),
      tokens: r.total_tokens ?? 0,
    }));
  },

  async models(period = "day"): Promise<ModelAnalytics[]> {
    const raw = await apiRequest<SnapshotDto[]>(
      "analytics",
      withQuery("/analytics/models", {
        period,
        page_size: LIST_DROPDOWN_PAGE_SIZE,
      }),
    );
    return asList<SnapshotDto>(raw).map((r) => ({
      model: r.model ?? (r.scope_id ? `Model ${r.scope_id}` : "Unknown"),
      requests: r.total_requests ?? 0,
      cost: Number(r.total_cost ?? 0),
    }));
  },
};
