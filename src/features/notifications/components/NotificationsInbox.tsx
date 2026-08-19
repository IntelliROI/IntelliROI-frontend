"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { useNotifications } from "@/features/organization/hooks/useOrganizationQueries";
import { notificationsApi } from "@/features/notifications/api/notifications.api";
import { queryKeys } from "@/lib/api/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function NotificationsInbox({ companySlug }: { companySlug: string }) {
  const queryClient = useQueryClient();
  const notifications = useNotifications(companySlug, false);
  const [ruleType, setRuleType] = useState("budget_threshold");

  const prefs = useQuery({
    queryKey: queryKeys.company.notificationPrefs(companySlug),
    queryFn: () => notificationsApi.preferences(),
  });
  const rules = useQuery({
    queryKey: queryKeys.company.alertRules(companySlug),
    queryFn: () => notificationsApi.listAlertRules(),
  });

  const inAppPref = (prefs.data ?? []).find(
    (p) => p.channel === "in_app" || p.notification_type === "in_app",
  );

  async function invalidateInbox() {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.company.notifications(companySlug, false),
    });
  }

  const createRule = useMutation({
    mutationFn: () =>
      notificationsApi.createAlertRule({
        rule_type: ruleType,
        condition_json: { channel: "in_app" },
      }),
    onSuccess: async () => {
      toast.success("Alert rule created");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.company.alertRules(companySlug),
      });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Could not create rule");
    },
  });

  async function onPrefSubmit(e: FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const enabled = (form.elements.namedItem("in_app") as HTMLInputElement).checked;
    try {
      await notificationsApi.updatePreferences([
        { notification_type: "budget", channel: "in_app", enabled },
      ]);
      toast.success("Preferences saved (in-app only)");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.company.notificationPrefs(companySlug),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save preferences");
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Alerts"
        title="Notifications"
        description="In-app inbox. Email, Slack, and webhook channels are not accepted by the API."
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              try {
                await notificationsApi.markAllRead();
                toast.success("All marked read");
                await invalidateInbox();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Request failed");
              }
            }}
          >
            Mark all read
          </Button>
        }
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
                    await invalidateInbox();
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

      <div className="mt-px grid gap-px bg-hairline lg:grid-cols-2">
        <Panel className="border-0 bg-ink p-6">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            In-app preference
          </p>
          <form onSubmit={onPrefSubmit} className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                name="in_app"
                defaultChecked={inAppPref?.enabled ?? true}
                className="accent-[var(--role-accent)]"
              />
              Budget and ROI alerts
            </label>
            <Button type="submit" size="sm">
              Save
            </Button>
          </form>
        </Panel>
        <Panel className="border-0 bg-ink p-6">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            Alert rules
          </p>
          <form
            className="mb-4 flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              createRule.mutate();
            }}
          >
            <div>
              <Label htmlFor="rule_type">Rule type</Label>
              <Select
                id="rule_type"
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value)}
              >
                <option value="budget_threshold">Budget threshold</option>
                <option value="roi_drop">ROI drop</option>
                <option value="policy_denied">Policy denied</option>
              </Select>
            </div>
            <Button type="submit" size="sm" disabled={createRule.isPending}>
              Add rule
            </Button>
          </form>
          {rules.isLoading ? (
            <LoadingBlock className="h-24" />
          ) : (
            <ul className="space-y-2">
              {(rules.data ?? []).map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between border border-hairline px-3 py-2 text-sm"
                >
                  <span>
                    {r.rule_type} · {r.status}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      const next = r.status === "active" ? "inactive" : "active";
                      try {
                        await notificationsApi.patchAlertRule(r.id, next);
                        queryClient.invalidateQueries({
                          queryKey: queryKeys.company.alertRules(companySlug),
                        });
                      } catch (err) {
                        toast.error(
                          err instanceof Error ? err.message : "Update failed",
                        );
                      }
                    }}
                  >
                    {r.status === "active" ? "Pause" : "Activate"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
