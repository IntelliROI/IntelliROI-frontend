import { apiRequest } from "@/lib/api/client";

export type NotificationItem = {
  id: number;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

export type NotificationPreference = {
  id?: number;
  notification_type: string;
  channel: string;
  enabled: boolean;
};

export type AlertRule = {
  id: number;
  rule_type: string;
  condition_json?: unknown;
  status: string;
  created_at: string;
};

function asList<T>(raw: unknown): T[] {
  return Array.isArray(raw) ? (raw as T[]) : [];
}

export const notificationsApi = {
  async list(unreadOnly = false): Promise<NotificationItem[]> {
    const raw = await apiRequest<
      {
        id: number;
        title: string;
        body?: string;
        read_at?: string | null;
        created_at: string;
      }[]
    >("notify", `/notifications?unread_only=${unreadOnly ? "true" : "false"}`);
    return asList<{
      id: number;
      title: string;
      body?: string;
      read_at?: string | null;
      created_at: string;
    }>(raw).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body ?? "",
      read: Boolean(n.read_at),
      created_at: n.created_at,
    }));
  },

  async markRead(id: number): Promise<void> {
    await apiRequest("notify", `/notifications/${id}/read`, { method: "POST" });
  },

  async markAllRead(): Promise<void> {
    await apiRequest("notify", "/notifications/read-all", { method: "POST" });
  },

  async preferences(): Promise<NotificationPreference[]> {
    const raw = await apiRequest<NotificationPreference[]>(
      "notify",
      "/notifications/preferences",
    );
    return asList<NotificationPreference>(raw);
  },

  async updatePreferences(
    items: { notification_type: string; channel: string; enabled: boolean }[],
  ): Promise<NotificationPreference[]> {
    const raw = await apiRequest<NotificationPreference[]>(
      "notify",
      "/notifications/preferences",
      { method: "PUT", body: { items } },
    );
    return asList<NotificationPreference>(raw);
  },

  async listAlertRules(): Promise<AlertRule[]> {
    const raw = await apiRequest<AlertRule[]>("notify", "/alert-rules");
    return asList<AlertRule>(raw);
  },

  async createAlertRule(input: {
    rule_type: string;
    condition_json?: unknown;
  }): Promise<AlertRule> {
    return apiRequest<AlertRule>("notify", "/alert-rules", {
      method: "POST",
      body: input,
    });
  },

  async patchAlertRule(id: number, status: string): Promise<AlertRule> {
    return apiRequest<AlertRule>("notify", `/alert-rules/${id}`, {
      method: "PATCH",
      body: { status },
    });
  },
};
