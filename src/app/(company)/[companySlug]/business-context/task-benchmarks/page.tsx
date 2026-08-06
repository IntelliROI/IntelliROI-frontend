"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { businessContextApi } from "@/features/business-context/api/business-context.api";
import { Can } from "@/lib/rbac/Can";
import { toast } from "sonner";

export default function TaskBenchmarksPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const benchmarks = useQuery({
    queryKey: ["company", params.companySlug, "benchmarks"],
    queryFn: () => businessContextApi.listBenchmarks("pending"),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Business Context"
        title="Task Benchmarks"
        description="Baseline vs AI-assisted time — the backbone of ROI math."
      />
      {benchmarks.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : (
        <DataTable
          columns={[
            { key: "category", label: "Category" },
            { key: "baseline", label: "Baseline", align: "right" },
            { key: "ai", label: "With AI", align: "right" },
            { key: "by", label: "Proposed by" },
            { key: "action", label: "" },
          ]}
          rows={(benchmarks.data ?? []).map((b) => ({
            category: b.task_category,
            baseline: `${b.baseline_minutes}m`,
            ai: `${b.ai_assisted_minutes}m`,
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
          }))}
        />
      )}
    </div>
  );
}
