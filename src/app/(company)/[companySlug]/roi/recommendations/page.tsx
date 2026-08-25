"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  PageHeader,
  LoadingBlock,
  DataTable,
  GridView,
  ViewToggle,
  type ViewMode,
  type GridCard,
} from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCompanyCurrency } from "@/hooks/use-company-currency";
import { roiApi } from "@/features/roi/api/roi.api";
import { toast } from "sonner";
import { useState } from "react";

function RecActions({
  id,
  onDone,
}: {
  id: number;
  onDone: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={async () => {
          try {
            await roiApi.updateRecommendation(id, "accepted");
            toast.success("Accepted");
            onDone();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Request failed");
          }
        }}
      >
        Accept
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={async () => {
          try {
            await roiApi.updateRecommendation(id, "dismissed");
            toast.success("Dismissed");
            onDone();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Request failed");
          }
        }}
      >
        Dismiss
      </Button>
    </div>
  );
}

export default function RecommendationsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [view, setView] = useState<ViewMode>("table");
  const { currency: companyCurrency, fromUsd } = useCompanyCurrency(
    params.companySlug,
  );

  const recommendations = useQuery({
    queryKey: ["company", params.companySlug, "roi", "recommendations"],
    queryFn: () => roiApi.recommendations("open"),
  });

  const list = recommendations.data ?? [];

  const rows = list.map((r) => ({
    title: (
      <div>
        <p className="font-medium text-text-primary">{r.title}</p>
        {r.rationale ? (
          <p className="mt-1 text-[12px] text-text-secondary">{r.rationale}</p>
        ) : null}
      </div>
    ),
    impact: (
      <span className="font-mono font-medium text-accent">
        {r.impact_monthly_usd > 0
          ? formatCurrency(fromUsd(r.impact_monthly_usd), companyCurrency)
          : "—"}
        {r.impact_monthly_usd > 0 ? (
          <span className="text-text-secondary/60">/mo</span>
        ) : null}
      </span>
    ),
    scope: (
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-secondary/70">
        {r.scope}
      </span>
    ),
    action: <RecActions id={r.id} onDone={() => recommendations.refetch()} />,
  }));

  const cards: GridCard[] = list.map((r) => ({
    title: r.title,
    badge: (
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-secondary/60">
        {r.scope}
      </span>
    ),
    metrics: [
      {
        label: "Monthly Impact",
        value: (
          <span className="font-mono text-accent">
            {r.impact_monthly_usd > 0
              ? formatCurrency(fromUsd(r.impact_monthly_usd), companyCurrency)
              : "Setup"}
          </span>
        ),
      },
    ],
    action: <RecActions id={r.id} onDone={() => recommendations.refetch()} />,
    accent: true,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="ROI · Governance"
        title="Recommendations"
        description="Setup gaps and cost-optimization suggestions for Estimated ROI."
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} />
            <Button asChild size="sm" variant="secondary">
              <Link href={`/${params.companySlug}/roi`}>Back to ROI</Link>
            </Button>
          </div>
        }
      />

      {recommendations.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : recommendations.isError ? (
        <div className="rounded-[12px] border border-danger/30 bg-danger/5 px-5 py-8 text-center text-[13px] text-text-secondary">
          Could not load recommendations.{" "}
          {recommendations.error instanceof Error
            ? recommendations.error.message
            : "Try again."}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-[12px] border border-hairline bg-surface/20 px-5 py-10 text-center">
          <p className="text-[14px] font-medium text-text-primary">
            No open recommendations yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-[13px] text-text-secondary">
            Suggestions appear when AI spend exists without Estimated ROI setup
            (job roles / benchmarks), or when a cheaper model fits the same
            task. Send chats with project + task attributed, then refresh.
          </p>
          <Button asChild size="sm" className="mt-5" variant="secondary">
            <Link href={`/${params.companySlug}/organization/job-roles`}>
              Review job roles
            </Link>
          </Button>
        </div>
      ) : view === "table" ? (
        <DataTable
          columns={[
            { key: "title", label: "Recommendation", sortable: true },
            {
              key: "impact",
              label: "Impact / mo",
              align: "right",
              sortable: true,
            },
            { key: "scope", label: "Scope" },
            { key: "action", label: "", width: "w-24" },
          ]}
          rows={rows}
          showIndex
        />
      ) : (
        <GridView cards={cards} cols={3} />
      )}
    </div>
  );
}
