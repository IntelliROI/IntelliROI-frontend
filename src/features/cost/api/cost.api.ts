import { apiRequest, useMocks } from "@/lib/api/client";
import { delay, mockBudgets, mockCostSummary } from "@/lib/mocks/data";

export type CostSummary = typeof mockCostSummary;
export type Budget = (typeof mockBudgets)[number] & { scope_id?: number };

export type CostAlert = {
  id: number;
  severity: string;
  message: string;
  created_at: string;
};

export const costApi = {
  async summary(scope = "company", period = "month"): Promise<CostSummary> {
    if (useMocks) return delay({ ...mockCostSummary, scope, period });
    return apiRequest<CostSummary>(
      "cost",
      `/costs/summary?scope=${scope}&period=${period}`,
    );
  },

  async listBudgets(): Promise<Budget[]> {
    if (useMocks) return delay(mockBudgets);
    return apiRequest<Budget[]>("cost", "/budgets");
  },

  async createBudget(input: {
    scope: string;
    scope_id?: number;
    monthly_limit: number;
  }): Promise<Budget> {
    if (useMocks) {
      return delay({
        id: Date.now(),
        ...input,
        consumed: 0,
        period: "month",
      });
    }
    return apiRequest<Budget>("cost", "/budgets", { method: "POST", body: input });
  },

  async budgetConsumption(id: number) {
    if (useMocks) {
      const budget = mockBudgets.find((b) => b.id === id) ?? mockBudgets[0];
      return delay({
        ...budget,
        daily: Array.from({ length: 14 }).map((_, i) => ({
          date: new Date(Date.now() - (13 - i) * 86400000)
            .toISOString()
            .slice(0, 10),
          amount: Math.round(budget.consumed / 14 + Math.sin(i) * 40),
        })),
      });
    }
    return apiRequest("cost", `/budgets/${id}/consumption`);
  },

  async costAlerts(): Promise<CostAlert[]> {
    if (useMocks) {
      return delay([
        {
          id: 1,
          severity: "warning",
          message: "Engineering budget crossed 70%",
          created_at: new Date().toISOString(),
        },
      ]);
    }
    return apiRequest<CostAlert[]>("cost", "/cost-alerts");
  },
};
