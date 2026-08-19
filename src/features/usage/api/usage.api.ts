import { analyticsApi } from "@/features/analytics/api/analytics.api";

export type UsageRequest = {
  id: string;
  user: string;
  model: string;
  provider: string;
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  status: "ok" | "error";
  created_at: string;
  requests: number;
  cost: number;
  project?: string;
  task_category?: string;
};

/**
 * Request-level usage list is not on usage-cost-service. Daily analytics
 * snapshots keep the metering page on live pipeline totals.
 */
export const usageApi = {
  async list(): Promise<UsageRequest[]> {
    const summary = await analyticsApi.company("day");
    return (summary.series ?? []).map((p) => ({
      id: p.date,
      user: "Company",
      model: "all",
      provider: "all",
      tokens_in: p.requests,
      tokens_out: 0,
      latency_ms: 0,
      status: "ok" as const,
      created_at: p.date,
      requests: p.requests,
      cost: p.cost,
    }));
  },

  async get(requestId: string): Promise<UsageRequest> {
    const rows = await usageApi.list();
    const row = rows.find((r) => r.id === requestId);
    if (!row) throw new Error("Usage period not found");
    return row;
  },
};
