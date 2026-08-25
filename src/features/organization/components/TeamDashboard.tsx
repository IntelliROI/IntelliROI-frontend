"use client";

import { useState } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import Link from "next/link";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { Mosaic } from "@/components/ui/panel";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { PeriodSwitcher, type RoiPeriod } from "@/components/ui/period-switcher";
import { organizationApi } from "@/features/organization/api/organization.api";
import { roiApi } from "@/features/roi/api/roi.api";
import { formatCurrency } from "@/lib/utils";
import { useCompanyCurrency } from "@/hooks/use-company-currency";

export function TeamDashboard({
  companySlug,
  departmentId,
  teamId,
}: {
  companySlug: string;
  departmentId: number;
  teamId: number;
}) {
  const [period, setPeriod] = useState<RoiPeriod>("month");
  const { currency: companyCurrency } = useCompanyCurrency(companySlug);

  const teams = useQuery({
    queryKey: ["company", companySlug, "teams", departmentId],
    queryFn: () => organizationApi.listTeams(departmentId),
  });
  const employees = useQuery({
    queryKey: ["company", companySlug, "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });
  const roi = useQuery({
    queryKey: ["company", companySlug, "roi", "team", teamId, period],
    queryFn: () => roiApi.team(teamId, period),
  });

  const members = (employees.data ?? []).filter((e) => e.team_id === teamId);
  const memberRoi = useQueries({
    queries: members.map((e) => ({
      queryKey: ["company", companySlug, "roi", "employee", e.id, period],
      queryFn: () => roiApi.employee(e.id, period),
      enabled: Boolean(e.id),
      staleTime: 60_000,
    })),
  });

  if (teams.isLoading || roi.isLoading) return <LoadingBlock className="h-80" />;

  const team = teams.data?.find((t) => t.id === teamId);

  return (
    <div>
      <PageHeader
        eyebrow="Team"
        title={team?.team_name ?? `Team ${teamId}`}
        description="Review Estimated ROI for your team. Add or remove members from Team Members."
        actions={
          <div className="flex items-center gap-2">
            <PeriodSwitcher value={period} onChange={(p) => setPeriod(p as RoiPeriod)} variant="roi" />
            <Button asChild size="sm" variant="secondary">
              <Link href={`/${companySlug}/organization/employees`}>
                Team Members
              </Link>
            </Button>
          </div>
        }
      />

      {roi.data ? (
        <Mosaic cols={4}>
          <KpiTile
            label="Spend"
            value={roi.data.total_spend}
            format="currency"
            currency={companyCurrency}
          />
          <KpiTile
            label="Estimated ROI"
            value={roi.data.roi_pct}
            format="percent"
            accent
          />
          <KpiTile label="Requests" value={roi.data.requests} format="number" />
          <KpiTile label="Members" value={members.length} format="number" />
        </Mosaic>
      ) : (
        <p className="border border-hairline px-4 py-6 text-sm text-text-secondary">
          Estimated ROI is unavailable for this period.
        </p>
      )}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-medium text-text-primary">Members</h2>
          <Link
            href={`/${companySlug}/organization/employees`}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent hover:text-accent/70"
          >
            Manage members
          </Link>
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Employee" },
            { key: "requests", label: "Requests", align: "right" },
            { key: "spend", label: "Spend", align: "right" },
            { key: "roi", label: "Est. ROI", align: "right" },
            { key: "action", label: "Actions", align: "right" },
          ]}
          rows={members.map((e, i) => {
            const m = memberRoi[i]?.data;
            return {
              name: e.display_name,
              requests: m?.requests ?? "—",
              spend: m
                ? formatCurrency(m.total_spend, companyCurrency, true)
                : "—",
              roi: m ? (
                <span className="text-accent">{m.roi_pct}%</span>
              ) : (
                "—"
              ),
              action: (
                <Link
                  href={`/${companySlug}/organization/employees/${e.uuid}`}
                  className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent"
                >
                  Profile
                </Link>
              ),
            };
          })}
        />
      </div>
    </div>
  );
}
