"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Mosaic, Panel } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { platformApi } from "@/features/system-config/api/platform.api";

export default function CompanyDetailPage({
  params,
}: {
  params: { companyId: string };
}) {
  const companies = useQuery({
    queryKey: ["platform", "companies"],
    queryFn: () => platformApi.companies(),
  });

  const company = companies.data?.find((c) => c.uuid === params.companyId);

  if (companies.isLoading) return <LoadingBlock className="h-64" />;

  return (
    <div>
      <PageHeader
        eyebrow="Tenant"
        title={company?.name ?? params.companyId}
        description="Impersonation, billing, and health for this company."
      />
      <Mosaic cols={3}>
        <KpiTile label="Plan" value={company?.plan ?? "—"} />
        <KpiTile label="Status" value={company?.status ?? "—"} accent />
        <KpiTile label="Slug" value={company?.slug ?? "—"} />
      </Mosaic>
      <Panel className="mt-6 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
          Support actions
        </p>
        <p className="mt-3 text-sm text-text-secondary">
          Impersonate owner, suspend tenant, and review subscription — wire to
          billing + auth admin endpoints when gateway Phase 10 is live.
        </p>
      </Panel>
    </div>
  );
}
