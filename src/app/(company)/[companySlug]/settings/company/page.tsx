"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Panel } from "@/components/ui/panel";
import { billingApi } from "@/features/system-config/api/platform.api";

export default function CompanySettingsPage({
  params,
}: {
  params: { companySlug: string };
}) {
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
        description="Subscription, seats, and tenant preferences."
      />
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
