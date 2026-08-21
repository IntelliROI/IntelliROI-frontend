"use client";

import { useState } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import Link from "next/link";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { Mosaic } from "@/components/ui/panel";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { PeriodSwitcher, type RoiPeriod } from "@/components/ui/period-switcher";
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
  const [period, setPeriod] = useState<RoiPeriod>("month");

  const department = useQuery({
    queryKey: ["company", companySlug, "department", departmentId],
    queryFn: () => organizationApi.getDepartment(departmentId),
  });
  const teams = useQuery({
    queryKey: ["company", companySlug, "teams", departmentId],
    queryFn: () => organizationApi.listTeams(departmentId),
  });
  const teamRoi = useQueries({
    queries: (teams.data ?? []).map((t) => ({
      queryKey: ["company", companySlug, "roi", "team", t.id, period],
      queryFn: () => roiApi.team(t.id, period),
      enabled: Boolean(teams.data?.length),
    })),
  });
  const roi = useQuery({
    queryKey: ["company", companySlug, "roi", "department", departmentId, period],
    queryFn: () => roiApi.department(departmentId, period),
  });
  const benchmarks = useQuery({
    queryKey: ["company", companySlug, "benchmarks", "pending"],
    queryFn: () => businessContextApi.listBenchmarks(),
  });

  if (department.isLoading || roi.isLoading) {
    return <LoadingBlock className="h-80" />;
  }

  if (!department.data || !roi.data) {
    return (
      <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
        Could not load department data from the live service.
      </p>
    );
  }

  const d = department.data;
  const r = roi.data;

  return (
    <div>
      <PageHeader
        eyebrow="Department"
        title={d.department_name}
        description="Team performance, budget burn, and benchmark approvals."
        actions={<PeriodSwitcher value={period} onChange={(p) => setPeriod(p as RoiPeriod)} variant="roi" />}
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
            rows={(teams.data ?? []).map((t, i) => ({
              name: t.team_name,
              spend: formatCurrency(
                teamRoi[i]?.data?.total_spend ?? 0,
                "USD",
                true,
              ),
              roi: (
                <span className="text-accent">
                  {(teamRoi[i]?.data?.roi_pct ?? 0).toFixed(0)}%
                </span>
              ),
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
            {(benchmarks.data ?? [])
              .filter((b) => b.status === "pending")
              .map((b) => (
              <div key={b.id} className="bg-ink p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                  Category {b.task_category_id} · Role {b.job_role_id}
                </p>
                <p className="mt-2 text-sm text-text-primary">
                  {b.estimated_minutes_saved} min saved
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  Status {b.status}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await businessContextApi.approveBenchmark(b.id);
                        toast.success("Benchmark approved");
                        benchmarks.refetch();
                      } catch (err) {
                        toast.error(
                          err instanceof Error ? err.message : "Request failed",
                        );
                      }
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        await businessContextApi.rejectBenchmark(b.id);
                        toast.message("Benchmark rejected");
                        benchmarks.refetch();
                      } catch (err) {
                        toast.error(
                          err instanceof Error ? err.message : "Request failed",
                        );
                      }
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
