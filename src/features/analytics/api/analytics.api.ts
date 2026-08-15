import { apiRequest } from "@/lib/api/client";

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

export const analyticsApi = {
  async company(period = "day"): Promise<AnalyticsSummary> {
    return apiRequest<AnalyticsSummary>(
      "analytics",
      `/analytics/company?period=${period}`,
    );
  },

  async department(id: number, period = "day"): Promise<AnalyticsSummary> {
    return apiRequest<AnalyticsSummary>(
      "analytics",
      `/analytics/department/${id}?period=${period}`,
    );
  },

  async team(id: number, period = "day"): Promise<AnalyticsSummary> {
    return apiRequest<AnalyticsSummary>(
      "analytics",
      `/analytics/team/${id}?period=${period}`,
    );
  },

  async employee(
    id: number | string,
    period = "day",
  ): Promise<AnalyticsSummary> {
    return apiRequest<AnalyticsSummary>(
      "analytics",
      `/analytics/employee/${id}?period=${period}`,
    );
  },

  async providers(period = "day"): Promise<ProviderAnalytics[]> {
    return apiRequest<ProviderAnalytics[]>(
      "analytics",
      `/analytics/providers?period=${period}`,
    );
  },

  async models(period = "day"): Promise<ModelAnalytics[]> {
    return apiRequest<ModelAnalytics[]>(
      "analytics",
      `/analytics/models?period=${period}`,
    );
  },
};
