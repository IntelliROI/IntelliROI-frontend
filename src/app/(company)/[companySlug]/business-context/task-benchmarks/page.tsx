"use client";

import { useQuery } from "@tanstack/react-query";
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
import { businessContextApi } from "@/features/business-context/api/business-context.api";
import { Can } from "@/lib/rbac/Can";
import { toast } from "sonner";
import { useState } from "react";

export default function TaskBenchmarksPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [view, setView] = useState<ViewMode>("table");

  const benchmarks = useQuery({
    queryKey: ["company", params.companySlug, "benchmarks"],
    queryFn: () => businessContextApi.listBenchmarks("pending"),
  });

  const timeSaved = (b: { baseline_minutes: number; ai_assisted_minutes: number }) => {
    const saved = b.baseline_minutes - b.ai_assisted_minutes;
    const pct = Math.round((saved / b.baseline_minutes) * 100);
    return { saved, pct };
  };

  const rows = (benchmarks.data ?? []).map((b) => {
    const { saved, pct } = timeSaved(b);
    return {
      category: <span className="font-medium text-text-primary">{b.task_category}</span>,
      baseline: (
        <span className="font-mono text-[12px] text-text-secondary">{b.baseline_minutes}m</span>
      ),
      ai: (
        <span className="font-mono text-[12px] text-text-secondary">{b.ai_assisted_minutes}m</span>
      ),
      saved: (
        <span className="font-mono text-[12px] font-medium text-accent">
          −{saved}m ({pct}%)
        </span>
      ),
      by: b.proposed_by,
      action: (
        <Can resource="benchmarks" action="approve">
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              await businessContextApi.approveBenchmark(b.id);
              toast.success("Approved");
              benchmarks.refetch();
            }}
          >
            Approve
          </Button>
        </Can>
      ),
    };
  });

  const cards: GridCard[] = (benchmarks.data ?? []).map((b) => {
    const { saved, pct } = timeSaved(b);
    return {
      title: b.task_category,
      subtitle: `Proposed by ${b.proposed_by}`,
      metrics: [
        { label: "Baseline", value: `${b.baseline_minutes}m` },
        { label: "With AI", value: `${b.ai_assisted_minutes}m` },
        { label: "Time saved", value: <span className="text-accent">−{saved}m ({pct}%)</span> },
      ],
    };
  });

  return (
    <div>
      <PageHeader
        eyebrow="Governance · Business Context"
        title="Task Benchmarks"
        description="Baseline vs AI-assisted time — the backbone of ROI math."
        actions={<ViewToggle view={view} onViewChange={setView} />}
      />

      {benchmarks.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : view === "table" ? (
        <DataTable
          columns={[
            { key: "category", label: "Category", sortable: true },
            { key: "baseline", label: "Baseline", align: "right" },
            { key: "ai", label: "With AI", align: "right" },
            { key: "saved", label: "Time Saved", align: "right" },
            { key: "by", label: "Proposed by" },
            { key: "action", label: "" },
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
