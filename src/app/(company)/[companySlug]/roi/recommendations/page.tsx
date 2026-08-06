"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { roiApi } from "@/features/roi/api/roi.api";
import { toast } from "sonner";

export default function RecommendationsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const recommendations = useQuery({
    queryKey: ["company", params.companySlug, "roi", "recommendations"],
    queryFn: () => roiApi.recommendations("open"),
  });

  return (
    <div>
      <PageHeader
        eyebrow="ROI"
        title="Recommendations"
        description="Cost optimization suggestions from the ROI engine."
        actions={
          <Button asChild size="sm" variant="secondary">
            <Link href={`/${params.companySlug}/roi`}>Back to ROI</Link>
          </Button>
        }
      />
      {recommendations.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : (
        <DataTable
          columns={[
            { key: "title", label: "Recommendation" },
            { key: "impact", label: "Impact / mo", align: "right" },
            { key: "scope", label: "Scope" },
            { key: "action", label: "" },
          ]}
          rows={(recommendations.data ?? []).map((r) => ({
            title: r.title,
            impact: formatCurrency(r.impact_monthly_usd),
            scope: r.scope,
            action: (
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await roiApi.updateRecommendation(r.id, "accepted");
                  toast.success("Accepted");
                  recommendations.refetch();
                }}
              >
                Accept
              </Button>
            ),
          }))}
        />
      )}
    </div>
  );
}
