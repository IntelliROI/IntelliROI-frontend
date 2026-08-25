import { analyticsApi } from "@/features/analytics/api/analytics.api";

export type UsageRequest = {
  id: string;
  user: string;
  model: string;
  provider: string;
  tokens: number;
  latency_ms: number;
  status: "ok" | "error";
  created_at: string;
  requests: number;
  cost: number;
  project?: string;
  task_category?: string;
};

/** URL-safe key for ISO period_start (colons break naive path matching). */
export function encodeUsagePeriodId(iso: string): string {
  const bytes = encodeURIComponent(iso).replace(/%([0-9A-F]{2})/g, (_, h) =>
    String.fromCharCode(parseInt(h, 16)),
  );
  return btoa(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeUsagePeriodId(key: string): string {
  try {
    const pad = key.replace(/-/g, "+").replace(/_/g, "/");
    const padded = pad + "=".repeat((4 - (pad.length % 4)) % 4);
    const raw = atob(padded);
    try {
      return decodeURIComponent(
        Array.from(raw, (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(
          "",
        ),
      );
    } catch {
      return raw;
    }
  } catch {
    try {
      return decodeURIComponent(key);
    } catch {
      return key;
    }
  }
}

function periodsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  return Number.isFinite(ta) && Number.isFinite(tb) && ta === tb;
}

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
      tokens: p.tokens,
      latency_ms: 0,
      status: "ok" as const,
      created_at: p.date,
      requests: p.requests,
      cost: p.cost,
    }));
  },

  async get(requestId: string): Promise<UsageRequest> {
    const rows = await usageApi.list();
    const decoded = decodeUsagePeriodId(requestId);
    const row = rows.find(
      (r) =>
        periodsMatch(r.id, decoded) ||
        periodsMatch(r.id, requestId) ||
        encodeUsagePeriodId(r.id) === requestId,
    );
    if (!row) throw new Error("Usage period not found");
    return row;
  },
};
