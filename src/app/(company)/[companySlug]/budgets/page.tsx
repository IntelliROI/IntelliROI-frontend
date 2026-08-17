"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Mosaic } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { costApi } from "@/features/cost/api/cost.api";
import { formatCurrency } from "@/lib/utils";

export default function BudgetsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const budgets = useQuery({
    queryKey: ["company", params.companySlug, "budgets"],
    queryFn: () => costApi.listBudgets(),
  });
  const summary = useQuery({
    queryKey: ["company", params.companySlug, "costs"],
    queryFn: () => costApi.summary(),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Cost"
        title="Budgets"
        description="Company and department spend limits with consumption tracking."
      />
      <Mosaic cols={2} className="mb-8">
        <KpiTile
          label="Total spend MTD"
          value={summary.data?.total_cost ?? 0}
          format="currency"
        />
        <KpiTile
          label="Open budgets"
          value={budgets.data?.length ?? 0}
          format="number"
          accent
        />
      </Mosaic>
      {budgets.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : (
        <DataTable
          columns={[
            { key: "scope", label: "Scope" },
            { key: "limit", label: "Limit", align: "right" },
            { key: "consumed", label: "Consumed", align: "right" },
            { key: "pct", label: "Used", align: "right" },
          ]}
          rows={(budgets.data ?? []).map((b) => ({
            scope: `${b.scope}${b.scope_id ? ` #${b.scope_id}` : ""}`,
            limit: formatCurrency(b.monthly_limit, "USD", true),
            consumed: formatCurrency(b.consumed, "USD", true),
            pct: `${b.monthly_limit > 0 ? Math.round((b.consumed / b.monthly_limit) * 100) : 0}%`,
          }))}
        />
      )}
    </div>
  );
}
