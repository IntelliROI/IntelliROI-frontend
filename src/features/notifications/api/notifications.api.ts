import { apiRequest } from "@/lib/api/client";

export type NotificationItem = {
  id: number;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

export const notificationsApi = {
  async list(unreadOnly = false): Promise<NotificationItem[]> {
    return apiRequest<NotificationItem[]>(
      "notify",
      `/notifications?unread_only=${unreadOnly ? "true" : "false"}`,
    );
  },

  async markRead(id: number): Promise<void> {
    await apiRequest("notify", `/notifications/${id}/read`, { method: "POST" });
  },

  async preferences(): Promise<Record<string, boolean>> {
    return apiRequest("notify", "/notifications/preferences");
  },

  async updatePreferences(
    input: Record<string, boolean>,
  ): Promise<Record<string, boolean>> {
    return apiRequest("notify", "/notifications/preferences", {
      method: "PUT",
      body: input,
    });
  },

  async listAlertRules(): Promise<
    { id: number; name: string; condition: string; enabled: boolean }[]
  > {
    return apiRequest("notify", "/alert-rules");
  },
};
