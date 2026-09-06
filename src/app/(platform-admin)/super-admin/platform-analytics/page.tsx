"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Mosaic } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import {
  mergePlatformMetrics,
  platformApi,
} from "@/features/system-config/api/platform.api";

export default function PlatformAnalyticsPage() {
  const companies = useQuery({
    queryKey: ["platform", "companies"],
    queryFn: () => platformApi.companies(),
  });
  const metrics = useQuery({
    queryKey: ["platform", "metrics"],
    queryFn: () => platformApi.metrics(),
  });

  if (companies.isLoading && metrics.isLoading) return <LoadingBlock className="h-64" />;

  const m = mergePlatformMetrics(companies.data ?? [], metrics.data);

  return (
    <div>
      <PageHeader
        eyebrow="Analytics"
        title="Platform Analytics"
        description="Tenant counts from GET /platform/metrics. Cross-tenant AI spend and MRR are not on the API yet."
      />
      <Mosaic cols={4}>
        <KpiTile label="Companies" value={m.tenant_count} format="number" />
        <KpiTile label="Active" value={m.active_companies} format="number" accent />
        <KpiTile label="Suspended" value={m.suspended_companies} format="number" />
        <KpiTile label="Seated users" value={m.seated_users} format="number" />
      </Mosaic>
    </div>
  );
}
