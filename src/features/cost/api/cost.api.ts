import { apiRequest, withQuery } from "@/lib/api/client";
import { LIST_DROPDOWN_PAGE_SIZE } from "@/lib/api/types";

export type CostSummary = {
  scope: string;
  period: string;
  total_cost: number;
  currency: string;
  event_count: number;
  by_provider?: { provider: string; cost: number }[];
  by_department?: {
    department_id: number;
    department_name: string;
    cost: number;
  }[];
};

export type Budget = {
  id: number;
  scope: string;
  scope_id?: number;
  monthly_limit: number;
  consumed: number;
  period: string;
  currency: string;
};

export type CostAlert = {
  id: number;
  severity: string;
  message: string;
  created_at: string;
};

type CostSummaryDto = {
  scope?: string;
  scope_id?: number;
  period?: string;
  total_cost?: number;
  currency?: string;
  event_count?: number;
};

type BudgetDto = {
  id: number;
  company_id?: number;
  department_id?: number | null;
  team_id?: number | null;
  monthly_limit: number;
  alert_percentage?: number;
  currency?: string;
  status?: string;
  created_at?: string;
};

type ConsumptionDto = {
  budget_id?: number;
  period_month?: string;
  consumed_amount?: number;
  monthly_limit?: number;
  currency?: string;
};

type AlertDto = {
  id: number;
  budget_id?: number;
  triggered_at?: string;
  threshold_percentage?: number;
  consumed_amount?: number;
  acknowledged?: boolean;
};

function asList<T>(raw: unknown): T[] {
  return Array.isArray(raw) ? (raw as T[]) : [];
}

/** Backend cost APIs require `YYYY-MM`. Aliases like month/day/week become the current UTC month. */
export function toCostPeriodMonth(period?: string): string {
  const raw = (period ?? "").trim();
  if (/^\d{4}-\d{2}$/.test(raw)) return raw;
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${now.getUTCFullYear()}-${month}`;
}

function budgetScope(b: BudgetDto): { scope: string; scope_id?: number } {
  if (b.team_id) return { scope: "team", scope_id: b.team_id };
  if (b.department_id) return { scope: "department", scope_id: b.department_id };
  return { scope: "company" };
}

function toBudget(b: BudgetDto, consumed = 0, period = ""): Budget {
  const scoped = budgetScope(b);
  return {
    id: b.id,
    scope: scoped.scope,
    scope_id: scoped.scope_id,
    monthly_limit: b.monthly_limit,
    consumed,
    period,
    currency: b.currency ?? "USD",
  };
}

export const costApi = {
  async summary(
    scope = "company",
    period = "month",
    scopeId?: number,
  ): Promise<CostSummary> {
    const periodMonth = toCostPeriodMonth(period);
    const qs = new URLSearchParams({ scope, period: periodMonth });
    if (scopeId) qs.set("scope_id", String(scopeId));
    const raw = await apiRequest<CostSummaryDto>(
      "cost",
      `/costs/summary?${qs.toString()}`,
    );
    return {
      scope: raw.scope ?? scope,
      period: raw.period ?? periodMonth,
      total_cost: Number(raw.total_cost ?? 0),
      currency: raw.currency ?? "USD",
      event_count: raw.event_count ?? 0,
    };
  },

  async listBudgets(): Promise<Budget[]> {
    const raw = await apiRequest<BudgetDto[]>(
      "cost",
      withQuery("/budgets", { page_size: LIST_DROPDOWN_PAGE_SIZE }),
    );
    const rows = asList<BudgetDto>(raw);
    return Promise.all(
      rows.map(async (b) => {
        try {
          const cons = await apiRequest<ConsumptionDto>(
            "cost",
            `/budgets/${b.id}/consumption?period=${toCostPeriodMonth()}`,
          );
          return toBudget(
            b,
            Number(cons.consumed_amount ?? 0),
            cons.period_month ?? "",
          );
        } catch {
          return toBudget(b);
        }
      }),
    );
  },

  async createBudget(input: {
    monthly_limit: number;
    department_id?: number;
    team_id?: number;
    currency?: string;
    alert_percentage?: number;
  }): Promise<Budget> {
    const raw = await apiRequest<BudgetDto>("cost", "/budgets", {
      method: "POST",
      body: {
        monthly_limit: input.monthly_limit,
        department_id: input.department_id,
        team_id: input.team_id,
        currency: input.currency ?? "USD",
        alert_percentage: input.alert_percentage,
      },
    });
    return toBudget(raw);
  },

  async costAlerts(): Promise<CostAlert[]> {
    const raw = await apiRequest<AlertDto[]>(
      "cost",
      withQuery("/cost-alerts", { page_size: LIST_DROPDOWN_PAGE_SIZE }),
    );
    return asList<AlertDto>(raw).map((a) => {
      const pct = a.threshold_percentage ?? 0;
      return {
        id: a.id,
        severity: pct >= 100 ? "critical" : "warning",
        message: `Budget ${a.budget_id ?? ""} reached ${pct}% (${Number(a.consumed_amount ?? 0).toFixed(2)})`,
        created_at: a.triggered_at ?? "",
      };
    });
  },
};
