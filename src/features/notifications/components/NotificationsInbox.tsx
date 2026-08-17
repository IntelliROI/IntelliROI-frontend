"use client";

import { toast } from "sonner";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/features/organization/hooks/useOrganizationQueries";
import { notificationsApi } from "@/features/notifications/api/notifications.api";
import { queryKeys } from "@/lib/api/query-keys";
import { useQueryClient } from "@tanstack/react-query";

export function NotificationsInbox({ companySlug }: { companySlug: string }) {
  const queryClient = useQueryClient();
  const notifications = useNotifications(companySlug, false);

  return (
    <div>
      <PageHeader
        eyebrow="Alerts"
        title="Notifications"
        description="Budget, ROI, and system alerts for your scope."
      />
      {notifications.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : (
        <DataTable
          columns={[
            { key: "title", label: "Title" },
            { key: "body", label: "Message" },
            { key: "status", label: "Status" },
            { key: "action", label: "" },
          ]}
          rows={(notifications.data ?? []).map((n) => ({
            title: n.title,
            body: n.body,
            status: n.read ? "Read" : "Unread",
            action: !n.read ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  try {
                    await notificationsApi.markRead(n.id);
                    toast.success("Marked read");
                    queryClient.invalidateQueries({
                      queryKey: queryKeys.company.notifications(companySlug, false),
                    });
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Request failed");
                  }
                }}
              >
                Mark read
              </Button>
            ) : (
              "—"
            ),
          }))}
        />
      )}
    </div>
  );
}
