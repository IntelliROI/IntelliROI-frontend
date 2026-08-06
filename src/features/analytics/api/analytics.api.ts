import { apiRequest, useMocks } from "@/lib/api/client";
import { delay, mockAnalyticsCompany } from "@/lib/mocks/data";

export type AnalyticsSummary = typeof mockAnalyticsCompany;

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

export const analyticsApi = {
  async company(period = "day"): Promise<AnalyticsSummary> {
    if (useMocks) return delay({ ...mockAnalyticsCompany, period });
    return apiRequest<AnalyticsSummary>(
      "analytics",
      `/analytics/company?period=${period}`,
    );
  },

  async department(id: number, period = "day"): Promise<AnalyticsSummary> {
    if (useMocks) {
      return delay({
        ...mockAnalyticsCompany,
        period,
        requests: 1620,
        active_users: 42,
      });
    }
    return apiRequest<AnalyticsSummary>(
      "analytics",
      `/analytics/department/${id}?period=${period}`,
    );
  },

  async team(id: number, period = "day"): Promise<AnalyticsSummary> {
    if (useMocks) {
      return delay({
        ...mockAnalyticsCompany,
        period,
        requests: 540,
        active_users: 8,
      });
    }
    return apiRequest<AnalyticsSummary>(
      "analytics",
      `/analytics/team/${id}?period=${period}`,
    );
  },

  async employee(
    id: number | string,
    period = "day",
  ): Promise<AnalyticsSummary> {
    if (useMocks) {
      return delay({
        ...mockAnalyticsCompany,
        period,
        requests: 146,
        active_users: 1,
      });
    }
    return apiRequest<AnalyticsSummary>(
      "analytics",
      `/analytics/employee/${id}?period=${period}`,
    );
  },

  async providers(period = "day"): Promise<ProviderAnalytics[]> {
    if (useMocks) {
      return delay([
        { provider: "openai", requests: 2800, cost: 21400, tokens: 9_200_000 },
        { provider: "anthropic", requests: 1400, cost: 11200, tokens: 5_100_000 },
        { provider: "google", requests: 620, cost: 6520, tokens: 2_900_000 },
      ]);
    }
    return apiRequest<ProviderAnalytics[]>(
      "analytics",
      `/analytics/providers?period=${period}`,
    );
  },

  async models(period = "day"): Promise<ModelAnalytics[]> {
    if (useMocks) {
      return delay([
        { model: "gpt-4o-mini", requests: 2100, cost: 4200 },
        { model: "gpt-4o", requests: 700, cost: 17200 },
        { model: "claude-sonnet-4-20250514", requests: 1400, cost: 11200 },
      ]);
    }
    return apiRequest<ModelAnalytics[]>(
      "analytics",
      `/analytics/models?period=${period}`,
    );
  },
};
