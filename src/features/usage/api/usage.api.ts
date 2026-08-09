import { delay } from "@/lib/mocks/data";
import { useMocks } from "@/lib/api/client";

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
  project?: string;
  task_category?: string;
};

const MOCK_USAGE: UsageRequest[] = [
  {
    id: "req-88421",
    user: "Riley Maker",
    model: "gpt-4o-mini",
    provider: "openai",
    tokens_in: 820,
    tokens_out: 420,
    latency_ms: 412,
    status: "ok",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    project: "ROI Console",
    task_category: "Code Generation",
  },
  {
    id: "req-88418",
    user: "Casey Chen",
    model: "claude-sonnet-4-20250514",
    provider: "anthropic",
    tokens_in: 1600,
    tokens_out: 1280,
    latency_ms: 610,
    status: "ok",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    project: "Invoice Builder",
    task_category: "Documentation",
  },
  {
    id: "req-88402",
    user: "Morgan Lee",
    model: "gpt-4o",
    provider: "openai",
    tokens_in: 2100,
    tokens_out: 1002,
    latency_ms: 780,
    status: "ok",
    created_at: new Date(Date.now() - 14400000).toISOString(),
    project: "Outbound Copilot",
    task_category: "Customer Email",
  },
];

export const usageApi = {
  async list(): Promise<UsageRequest[]> {
    if (useMocks) return delay(MOCK_USAGE);
    // Live path will use cost/gateway usage listing when endpoint is exposed via gateway
    return delay(MOCK_USAGE);
  },

  async get(requestId: string): Promise<UsageRequest> {
    if (useMocks) {
      const found = MOCK_USAGE.find((r) => r.id === requestId) ?? MOCK_USAGE[0];
      return delay(found);
    }
    return delay(MOCK_USAGE[0]);
  },
};
