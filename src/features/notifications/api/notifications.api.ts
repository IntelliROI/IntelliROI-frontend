import { apiRequest, useMocks } from "@/lib/api/client";
import { delay, mockNotifications } from "@/lib/mocks/data";

export type NotificationItem = (typeof mockNotifications)[number];

export const notificationsApi = {
  async list(unreadOnly = false): Promise<NotificationItem[]> {
    if (useMocks) {
      return delay(
        unreadOnly
          ? mockNotifications.filter((n) => !n.read)
          : mockNotifications,
      );
    }
    return apiRequest<NotificationItem[]>(
      "notify",
      `/notifications?unread_only=${unreadOnly ? "true" : "false"}`,
    );
  },

  async markRead(id: number): Promise<void> {
    if (useMocks) return delay(undefined);
    await apiRequest("notify", `/notifications/${id}/read`, { method: "POST" });
  },

  async preferences(): Promise<Record<string, boolean>> {
    if (useMocks) {
      return delay({
        email_digest: true,
        budget_alerts: true,
        roi_recommendations: true,
      });
    }
    return apiRequest("notify", "/notifications/preferences");
  },

  async updatePreferences(
    input: Record<string, boolean>,
  ): Promise<Record<string, boolean>> {
    if (useMocks) return delay(input);
    return apiRequest("notify", "/notifications/preferences", {
      method: "PUT",
      body: input,
    });
  },

  async listAlertRules(): Promise<
    { id: number; name: string; condition: string; enabled: boolean }[]
  > {
    if (useMocks) {
      return delay([
        {
          id: 1,
          name: "Budget 80%",
          condition: "budget_consumed >= 0.8",
          enabled: true,
        },
      ]);
    }
    return apiRequest("notify", "/alert-rules");
  },
};
