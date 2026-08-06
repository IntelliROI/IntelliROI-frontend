"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { Mosaic } from "@/components/ui/panel";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { organizationApi } from "@/features/organization/api/organization.api";
import { roiApi } from "@/features/roi/api/roi.api";
import { formatCurrency } from "@/lib/utils";

export function TeamDashboard({
  companySlug,
  departmentId,
  teamId,
}: {
  companySlug: string;
  departmentId: number;
  teamId: number;
}) {
  const teams = useQuery({
    queryKey: ["company", companySlug, "teams", departmentId],
    queryFn: () => organizationApi.listTeams(departmentId),
  });
  const employees = useQuery({
    queryKey: ["company", companySlug, "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });
  const roi = useQuery({
    queryKey: ["company", companySlug, "roi", "team", teamId],
    queryFn: () => roiApi.team(teamId),
  });

  if (teams.isLoading || roi.isLoading) return <LoadingBlock className="h-80" />;

  const team = teams.data?.find((t) => t.id === teamId);
  const r = roi.data!;

  return (
    <div>
      <PageHeader
        eyebrow="Team"
        title={team?.team_name ?? `Team ${teamId}`}
        description="Member-level usage, projects, and day-to-day AI operations."
      />

      <Mosaic cols={4}>
        <KpiTile label="Spend" value={r.total_spend} format="currency" />
        <KpiTile label="ROI" value={r.roi_pct} format="percent" accent />
        <KpiTile label="Requests / week" value={186} format="number" />
        <KpiTile label="Members" value={team?.member_count ?? 0} format="number" />
      </Mosaic>

      <div className="mt-8">
        <h2 className="mb-4 font-medium text-text-primary">Members</h2>
        <DataTable
          columns={[
            { key: "name", label: "Employee" },
            { key: "requests", label: "Requests", align: "right" },
            { key: "spend", label: "Spend", align: "right" },
            { key: "roi", label: "ROI", align: "right" },
            { key: "action", label: "" },
          ]}
          rows={(employees.data ?? [])
            .filter((e) => e.team === team?.team_name || teamId === 1)
            .map((e) => ({
              name: e.name,
              requests: e.requests,
              spend: formatCurrency(e.spend, "USD", true),
              roi: <span className="text-accent">{e.roi_pct}%</span>,
              action: (
                <Link
                  href={`/${companySlug}/organization/employees/${e.uuid}`}
                  className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent"
                >
                  Profile
                </Link>
              ),
            }))}
        />
      </div>
    </div>
  );
}
