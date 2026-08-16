import { apiRequest } from "@/lib/api/client";

export type CostSummary = {
  scope: string;
  period: string;
  total_cost: number;
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
};

export type CostAlert = {
  id: number;
  severity: string;
  message: string;
  created_at: string;
};

export const costApi = {
  async summary(scope = "company", period = "month"): Promise<CostSummary> {
    return apiRequest<CostSummary>(
      "cost",
      `/costs/summary?scope=${scope}&period=${period}`,
    );
  },

  async listBudgets(): Promise<Budget[]> {
    return apiRequest<Budget[]>("cost", "/budgets");
  },

  async createBudget(input: {
    scope: string;
    scope_id?: number;
    monthly_limit: number;
  }): Promise<Budget> {
    return apiRequest<Budget>("cost", "/budgets", { method: "POST", body: input });
  },

  async budgetConsumption(id: number) {
    return apiRequest("cost", `/budgets/${id}/consumption`);
  },

  async costAlerts(): Promise<CostAlert[]> {
    return apiRequest<CostAlert[]>("cost", "/cost-alerts");
  },
};
