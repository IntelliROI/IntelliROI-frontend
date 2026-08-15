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
        Could not load platform analytics from the live service.
      </p>
    );
  }

  const m = metrics.data;

  return (
    <div>
      <PageHeader
        eyebrow="Analytics"
        title="Platform Analytics"
        description="Cross-tenant usage and revenue signals."
      />
      <Mosaic cols={4}>
        <KpiTile label="Companies" value={m.active_companies} format="number" />
        <KpiTile label="MRR" value={m.mrr} format="currency" accent />
        <KpiTile label="AI spend" value={m.platform_ai_spend} format="currency" />
        <KpiTile label="Employees" value={m.active_employees} format="number" />
      </Mosaic>
    </div>
  );
}
