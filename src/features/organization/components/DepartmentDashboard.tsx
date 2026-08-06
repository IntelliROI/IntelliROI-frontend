"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { Mosaic } from "@/components/ui/panel";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { organizationApi } from "@/features/organization/api/organization.api";
import { roiApi } from "@/features/roi/api/roi.api";
import { businessContextApi } from "@/features/business-context/api/business-context.api";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DepartmentDashboard({
  companySlug,
  departmentId,
}: {
  companySlug: string;
  departmentId: number;
}) {
  const department = useQuery({
    queryKey: ["company", companySlug, "department", departmentId],
    queryFn: () => organizationApi.getDepartment(departmentId),
  });
  const teams = useQuery({
    queryKey: ["company", companySlug, "teams", departmentId],
    queryFn: () => organizationApi.listTeams(departmentId),
  });
  const roi = useQuery({
    queryKey: ["company", companySlug, "roi", "department", departmentId],
    queryFn: () => roiApi.department(departmentId),
  });
  const benchmarks = useQuery({
    queryKey: ["company", companySlug, "benchmarks", "pending"],
    queryFn: () => businessContextApi.listBenchmarks("pending"),
  });

  if (department.isLoading || roi.isLoading) {
    return <LoadingBlock className="h-80" />;
  }

  const d = department.data!;
  const r = roi.data!;

  return (
    <div>
      <PageHeader
        eyebrow="Department"
        title={d.department_name}
        description="Team performance, budget burn, and benchmark approvals."
      />

      <Mosaic cols={4}>
        <KpiTile label="Spend" value={r.total_spend} format="currency" />
        <KpiTile label="ROI" value={r.roi_pct} format="percent" accent />
        <KpiTile
          label="Budget remaining"
          value={Math.max(0, d.budget_limit - d.monthly_spend)}
          format="currency"
        />
        <KpiTile label="Active people" value={d.employee_count} format="number" />
      </Mosaic>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-medium text-text-primary">Teams</h2>
          <DataTable
            columns={[
              { key: "name", label: "Team" },
              { key: "spend", label: "Spend", align: "right" },
              { key: "roi", label: "ROI", align: "right" },
              { key: "members", label: "Members", align: "right" },
              { key: "action", label: "" },
            ]}
            rows={(teams.data ?? []).map((t) => ({
              name: t.team_name,
              spend: formatCurrency(t.monthly_spend, "USD", true),
              roi: <span className="text-accent">{t.roi_pct}%</span>,
              members: t.member_count,
              action: (
                <Link
                  href={`/${companySlug}/organization/departments/${departmentId}/teams/${t.id}`}
                  className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent"
                >
                  Open
                </Link>
              ),
            }))}
          />
        </div>

        <div>
          <h2 className="mb-4 font-medium text-text-primary">
            Benchmark approval queue
          </h2>
          <div className="space-y-px bg-hairline">
            {(benchmarks.data ?? []).map((b) => (
              <div key={b.id} className="bg-ink p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                  {b.task_category}
                </p>
                <p className="mt-2 text-sm text-text-primary">
                  {b.baseline_minutes}m → {b.ai_assisted_minutes}m with AI
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  Proposed by {b.proposed_by}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      await businessContextApi.approveBenchmark(b.id);
                      toast.success("Benchmark approved");
                      benchmarks.refetch();
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      await businessContextApi.rejectBenchmark(b.id);
                      toast.message("Benchmark rejected");
                      benchmarks.refetch();
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
