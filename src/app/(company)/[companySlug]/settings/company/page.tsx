"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Panel } from "@/components/ui/panel";
import { CompanySettingsForm } from "@/features/organization/components/CompanySettingsForm";
import { organizationApi } from "@/features/organization/api/organization.api";
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

  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="Company Settings"
        description="Working hours and currency feed Estimated ROI. Billing is paused for MVP."
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
                try {
                  await organizationApi.updateSettings(values);
                  toast.success("Settings saved");
                  settings.refetch();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Request failed");
                  throw err;
                }
              }}
            />
          </div>
        )}
      </Can>

      <Panel className="border-0 bg-ink p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          Subscription
        </p>
        <p className="mt-3 text-sm text-text-secondary">
          Billing is paused for MVP. Invites and chat have no seat or request caps
          until billing-service is enabled.
        </p>
      </Panel>
    </div>
  );
}
