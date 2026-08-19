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

  const recommendations = useQuery({
    queryKey: ["company", params.companySlug, "roi", "recommendations"],
    queryFn: () => roiApi.recommendations("open"),
  });

  const rows = (recommendations.data ?? []).map((r) => ({
    title: <span className="font-medium text-text-primary">{r.title}</span>,
    impact: (
      <span className="font-mono font-medium text-accent">
        {formatCurrency(r.impact_monthly_usd)}
        <span className="text-text-secondary/60">/mo</span>
      </span>
    ),
    scope: (
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-secondary/70">
        {r.scope}
      </span>
    ),
    action: <RecActions id={r.id} onDone={() => recommendations.refetch()} />,
  }));

  const cards: GridCard[] = (recommendations.data ?? []).map((r) => ({
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
          <span className="text-accent font-mono">
            {formatCurrency(r.impact_monthly_usd)}
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
        description="AI cost optimization suggestions ranked by monthly impact."
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
      ) : view === "table" ? (
        <DataTable
          columns={[
            { key: "title", label: "Recommendation", sortable: true },
            { key: "impact", label: "Impact / mo", align: "right", sortable: true },
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
