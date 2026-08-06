"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { Mosaic, Panel } from "@/components/ui/panel";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { TrendAreaChart } from "@/components/charts/Charts";
import { roiApi } from "@/features/roi/api/roi.api";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { aiGatewayApi } from "@/features/ai-gateway/api/ai-gateway.api";

export function EmployeeDashboard({ companySlug }: { companySlug: string }) {
  const roi = useQuery({
    queryKey: ["company", companySlug, "roi", "employee", "self"],
    queryFn: () => roiApi.employee(1),
  });
  const analytics = useQuery({
    queryKey: ["company", companySlug, "analytics", "employee", "self"],
    queryFn: () => analyticsApi.employee(1),
  });
  const conversations = useQuery({
    queryKey: ["company", companySlug, "conversations"],
    queryFn: () => aiGatewayApi.listConversations(),
  });

  if (roi.isLoading) return <LoadingBlock className="h-80" />;
  const r = roi.data!;

  return (
    <div>
      <PageHeader
        eyebrow="Personal"
        title="My Workspace"
        description="Your AI usage, time saved, and a direct path back into chat."
        actions={
          <Button asChild>
            <Link href={`/${companySlug}/ai-workspace`}>
              Continue chatting
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </Button>
        }
      />

      <Mosaic cols={4}>
        <KpiTile label="My requests" value={146} format="number" />
        <KpiTile label="My spend" value={r.total_spend} format="currency" />
        <KpiTile label="Time saved" value={`${r.time_saved_hours}h`} />
        <KpiTile label="Personal ROI" value={r.roi_pct} format="percent" accent />
      </Mosaic>

      <div className="mt-px grid gap-px bg-hairline lg:grid-cols-5">
        <Panel className="border-0 bg-ink p-6 lg:col-span-3">
          <h2 className="mb-4 font-medium text-text-primary">Usage trend</h2>
          <TrendAreaChart
            data={(analytics.data?.series ?? []).map((p) => ({
              date: p.date.slice(5),
              value: p.requests,
            }))}
          />
        </Panel>
        <Panel className="border-0 bg-ink p-6 lg:col-span-2">
          <h2 className="mb-4 font-medium text-text-primary">
            Recent conversations
          </h2>
          <ul className="space-y-2">
            {(conversations.data ?? []).map((c) => (
              <li key={c.uuid}>
                <Link
                  href={`/${companySlug}/ai-workspace/${c.uuid}`}
                  className="block border border-hairline px-3 py-3 transition-colors hover:border-accent/40"
                >
                  <p className="text-sm text-text-primary">{c.title}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-text-secondary">
                    {c.provider}/{c.model}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
