import { apiRequest, pagedRequest, withQuery, ApiError } from "@/lib/api/client";
import { LIST_DROPDOWN_PAGE_SIZE, LIST_PAGE_SIZE_MAX } from "@/lib/api/types";
import { estimatedRoiPct } from "@/features/roi/lib/aggregate";

export type RoiSummary = {
  period: string;
  total_spend: number;
  business_value: number;
  roi_pct: number;
  time_saved_hours: number;
  requests: number;
  formula_version?: string;
  computed_at?: string;
  adoption_rate?: number;
  active_employees?: number;
  total_seats?: number;
  vs_last_month_pct?: number;
  department_id?: number;
  team_id?: number;
  employee_id?: number;
};

/** Scoped rollup with children — single source for KPIs + member tables. */
export type RoiScopeMember = {
  employee_id: number;
  display_name: string;
  requests: number;
  spend: number;
  business_value: number;
  roi_pct: number;
};

export type RoiScopeSummary = {
  scope: string;
  scope_id: number;
  period: string;
  period_start?: string;
  period_end?: string;
  currency?: string;
  member_count: number;
  requests: number;
  spend: number;
  business_value: number;
  roi_pct: number;
  members: RoiScopeMember[];
};

export type Recommendation = {
  id: number;
  title: string;
  impact_monthly_usd: number;
  status: string;
  scope: string;
  rationale?: string;
  department_id?: number;
  team_id?: number;
};

type RoiSummaryDto = {
  id?: number;
  period_type?: string;
  period_start?: string;
  total_ai_cost?: number;
  total_spend?: number;
  total_business_value?: number;
  business_value?: number;
  overall_roi_percentage?: number;
  roi_pct?: number;
  total_time_saved_minutes?: number;
  time_saved_hours?: number;
  total_requests?: number;
  department_id?: number | null;
  team_id?: number | null;
  employee_id?: number | null;
};

type RecommendationDto = {
  id: number;
  title: string;
  estimated_savings?: number | null;
  impact_monthly_usd?: number;
  status: string;
  description?: string | null;
  rationale?: string;
  recommendation_type?: string;
  priority?: string;
  department_id?: number | null;
  team_id?: number | null;
  employee_id?: number | null;
};

type FormulaDto = {
  id?: number;
  version_name?: string;
  version?: string;
  effective_from?: string | null;
  status?: string;
};

const EMPTY_ROI: RoiSummary = {
  period: "month",
  total_spend: 0,
  business_value: 0,
  roi_pct: 0,
  time_saved_hours: 0,
  requests: 0,
  adoption_rate: 0,
  active_employees: 0,
  total_seats: 0,
};

function asList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object") return [raw as T];
  return [];
}

function toRoiSummary(row: RoiSummaryDto, fallbackPeriod = "month"): RoiSummary {
  const minutes = row.total_time_saved_minutes ?? 0;
  return {
    period: row.period_type ?? fallbackPeriod,
    total_spend: Number(row.total_ai_cost ?? row.total_spend ?? 0),
    business_value: Number(row.total_business_value ?? row.business_value ?? 0),
    roi_pct: Number(row.overall_roi_percentage ?? row.roi_pct ?? 0),
    time_saved_hours: row.time_saved_hours ?? minutes / 60,
    requests: row.total_requests ?? 0,
    computed_at: row.period_start,
    department_id: row.department_id ?? undefined,
    team_id: row.team_id ?? undefined,
    employee_id: row.employee_id ?? undefined,
    adoption_rate: 0,
    active_employees: 0,
    total_seats: 0,
  };
}

function latestRoi(raw: unknown, period: string): RoiSummary {
  const rows = asList<RoiSummaryDto>(raw);
  if (!rows.length) return { ...EMPTY_ROI, period };
  const matching = rows.filter(
    (r) => !r.period_type || r.period_type === period,
  );
  const pool = matching.length ? matching : rows;
  const sorted = [...pool].sort((a, b) =>
    (a.period_start ?? "").localeCompare(b.period_start ?? ""),
  );
  return toRoiSummary(sorted[sorted.length - 1]!, period);
}

function recScope(r: RecommendationDto): string {
  if (r.employee_id) return "employee";
  if (r.team_id) return "team";
  if (r.department_id) return "department";
  return r.recommendation_type || "company";
}

function toRecommendation(r: RecommendationDto): Recommendation {
  return {
    id: r.id,
    title: r.title,
    impact_monthly_usd: Number(r.estimated_savings ?? r.impact_monthly_usd ?? 0),
    status: r.status,
    scope: recScope(r),
    rationale: r.description ?? r.rationale ?? undefined,
    department_id: r.department_id ?? undefined,
    team_id: r.team_id ?? undefined,
  };
}

function numericId(id: number | string): number | null {
  if (typeof id === "number" && Number.isFinite(id) && id > 0) return id;
  const n = Number(id);
  if (Number.isFinite(n) && n > 0 && String(n) === String(id).trim()) return n;
  return null;
}

type ScopeSummaryDto = {
  scope?: string;
  scope_id?: number;
  team_id?: number;
  period?: string;
  period_type?: string;
  period_start?: string;
  period_end?: string;
  currency?: string;
  member_count?: number;
  requests?: number;
  total_requests?: number;
  spend?: number;
  total_spend?: number;
  total_ai_cost?: number;
  business_value?: number;
  total_business_value?: number;
  roi_pct?: number;
  overall_roi_percentage?: number;
  members?: Array<{
    employee_id?: number;
    id?: number;
    display_name?: string;
    name?: string;
    requests?: number;
    total_requests?: number;
    spend?: number;
    total_spend?: number;
    total_ai_cost?: number;
    business_value?: number;
    total_business_value?: number;
    roi_pct?: number;
    overall_roi_percentage?: number;
  }>;
};

function toScopeSummary(
  raw: ScopeSummaryDto,
  scope: string,
  scopeId: number,
  period: string,
): RoiScopeSummary {
  const members = (raw.members ?? []).map((m) => {
    const spend = Number(m.total_ai_cost ?? m.total_spend ?? m.spend ?? 0);
    const business_value = Number(
      m.total_business_value ?? m.business_value ?? 0,
    );
    const requests = Number(m.total_requests ?? m.requests ?? 0);
    const roi_pct = Number(
      m.overall_roi_percentage ??
        m.roi_pct ??
        estimatedRoiPct(business_value, spend),
    );
    return {
      employee_id: m.employee_id ?? m.id ?? 0,
      display_name: m.display_name ?? m.name ?? `Employee ${m.employee_id ?? m.id ?? ""}`,
      requests,
      spend,
      business_value,
      roi_pct,
    };
  });

  const spend = Number(
    raw.total_ai_cost ?? raw.total_spend ?? raw.spend ?? 0,
  );
  const business_value = Number(
    raw.total_business_value ?? raw.business_value ?? 0,
  );
  const requests = Number(raw.total_requests ?? raw.requests ?? 0);
  const fromMembers =
    members.length > 0
      ? {
          requests: members.reduce((s, m) => s + m.requests, 0),
          spend: members.reduce((s, m) => s + m.spend, 0),
          business_value: members.reduce((s, m) => s + m.business_value, 0),
        }
      : null;

  const totalSpend = fromMembers?.spend ?? spend;
  const totalBv = fromMembers?.business_value ?? business_value;
  const totalReq = fromMembers?.requests ?? requests;

  return {
    scope: raw.scope ?? scope,
    scope_id: raw.scope_id ?? raw.team_id ?? scopeId,
    period: raw.period_type ?? raw.period ?? period,
    period_start: raw.period_start,
    period_end: raw.period_end,
    currency: raw.currency,
    member_count: raw.member_count ?? members.length,
    requests: totalReq,
    spend: totalSpend,
    business_value: totalBv,
    roi_pct: Number(
      raw.overall_roi_percentage ??
        raw.roi_pct ??
        estimatedRoiPct(totalBv, totalSpend),
    ),
    members,
  };
}

export const roiApi = {
  async company(period = "month"): Promise<RoiSummary> {
    const raw = await apiRequest("roi", `/roi/company?period=${period}`);
    return latestRoi(raw, period);
  },

  async department(id: number, period = "month"): Promise<RoiSummary> {
    const raw = await apiRequest("roi", `/roi/department/${id}?period=${period}`);
    const summary = latestRoi(raw, period);
    return { ...summary, department_id: id };
  },

  async team(id: number, period = "month"): Promise<RoiSummary> {
    const raw = await apiRequest("roi", `/roi/team/${id}?period=${period}`);
    const summary = latestRoi(raw, period);
    return { ...summary, team_id: id };
  },

  /**
   * Prefer this for Team Dashboard KPIs + Members.
   * Returns null when the gateway has not shipped the summary route yet (404).
   */
  async teamSummary(
    id: number,
    period = "month",
  ): Promise<RoiScopeSummary | null> {
    try {
      const raw = await apiRequest<ScopeSummaryDto>(
        "roi",
        `/roi/team/${id}/summary?period=${period}`,
      );
      return toScopeSummary(raw, "team", id, period);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 501)) {
        return null;
      }
      throw err;
    }
  },

  async employee(id: number | string, period = "month"): Promise<RoiSummary> {
    const numeric = numericId(id);
    if (numeric == null) {
      throw new Error("Employee id is required for Estimated ROI");
    }
    const raw = await apiRequest(
      "roi",
      `/roi/employee/${numeric}?period=${period}`,
    );
    const summary = latestRoi(raw, period);
    return { ...summary, employee_id: numeric };
  },

  async recommendations(status = "open"): Promise<Recommendation[]> {
    const page = await pagedRequest<RecommendationDto>(
      "roi",
      withQuery("/roi/recommendations", {
        status,
        page: 1,
        page_size: LIST_PAGE_SIZE_MAX,
      }),
    );
    return page.items.map(toRecommendation);
  },

  async updateRecommendation(
    id: number,
    status: "accepted" | "dismissed",
  ): Promise<Recommendation> {
    const raw = await apiRequest<RecommendationDto>(
      "roi",
      `/roi/recommendations/${id}`,
      { method: "PATCH", body: { status } },
    );
    return toRecommendation(raw);
  },

  async formulaVersions(): Promise<{ version: string; effective_from: string }[]> {
    const raw = await apiRequest<FormulaDto[]>(
      "roi",
      withQuery("/roi/formula-versions", { page_size: LIST_DROPDOWN_PAGE_SIZE }),
    );
    return asList<FormulaDto>(raw).map((f) => ({
      version: f.version_name ?? f.version ?? "",
      effective_from: f.effective_from ?? "",
    }));
  },
};
