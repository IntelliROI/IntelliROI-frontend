"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Panel } from "@/components/ui/panel";
import { CompanySettingsForm } from "@/features/organization/components/CompanySettingsForm";
import { organizationApi } from "@/features/organization/api/organization.api";
import { billingApi } from "@/features/system-config/api/platform.api";
import { Can } from "@/lib/rbac/Can";

export default function CompanySettingsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const settings = useQuery({
    queryKey: ["company", params.companySlug, "settings"],
    queryFn: () => organizationApi.getSettings(),
  });
  const sub = useQuery({
    queryKey: ["company", params.companySlug, "subscription"],
    queryFn: () => billingApi.mySubscription(),
  });
  const usage = useQuery({
    queryKey: ["company", params.companySlug, "billing-usage"],
    queryFn: () => billingApi.myUsage(),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Company Settings"
        description="Working hours & currency feed Estimated ROI. Subscription is billing only."
      />

      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
        ROI working configuration
      </p>
      <Can resource="settings" action="manage">
        {settings.isLoading || !settings.data ? (
          <LoadingBlock className="mb-10 h-40" />
        ) : (
          <div className="mb-10 border border-hairline p-6">
            <CompanySettingsForm
              initial={settings.data}
              onSubmit={async (values) => {
                await organizationApi.updateSettings(values);
                toast.success("Settings saved");
                settings.refetch();
              }}
            />
          </div>
        )}
      </Can>

      {sub.isLoading || usage.isLoading ? (
        <LoadingBlock className="h-40" />
      ) : (
        <div className="grid gap-px bg-hairline md:grid-cols-2">
          <Panel className="border-0 bg-ink p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Subscription
            </p>
            <p className="mt-3 text-2xl font-light text-text-primary">
              {sub.data?.plan}
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Status {sub.data?.status} · renews {sub.data?.renews_at}
            </p>
          </Panel>
          <Panel className="border-0 bg-ink p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Seat usage
            </p>
            <p className="mt-3 text-2xl font-light text-text-primary">
              {usage.data?.seats_used}/{usage.data?.seats_limit}
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              {usage.data?.requests_month} requests this month
            </p>
          </Panel>
        </div>
      )}
    </div>
  );
}
