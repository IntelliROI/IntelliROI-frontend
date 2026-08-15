import { apiRequest } from "@/lib/api/client";

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

export const usageApi = {
  async list(): Promise<UsageRequest[]> {
    return apiRequest<UsageRequest[]>("cost", "/usage/requests");
  },

  async get(requestId: string): Promise<UsageRequest> {
    return apiRequest<UsageRequest>("cost", `/usage/requests/${requestId}`);
  },
};
