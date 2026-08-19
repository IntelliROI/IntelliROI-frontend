"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Mosaic } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { platformApi } from "@/features/system-config/api/platform.api";

export default function PlatformAnalyticsPage() {
  const metrics = useQuery({
    queryKey: ["platform", "metrics"],
    queryFn: () => platformApi.metrics(),
  });

  if (metrics.isLoading) return <LoadingBlock className="h-64" />;

  if (!metrics.data) {
    return (
      <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
        Could not load tenant counts from /platform/companies.
      </p>
    );
  }

  const m = metrics.data;

  return (
    <div>
      <PageHeader
        eyebrow="Analytics"
        title="Platform Analytics"
        description="Derived from the customer-tenant list. Cross-tenant AI spend and MRR are not on the API yet."
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
