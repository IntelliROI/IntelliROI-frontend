"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { Mosaic, Panel } from "@/components/ui/panel";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { PeriodSwitcher } from "@/components/ui/period-switcher";
import { TrendAreaChart } from "@/components/charts/Charts";
import { Button } from "@/components/ui/button";
import { organizationApi } from "@/features/organization/api/organization.api";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { useCompanyCurrency } from "@/hooks/use-company-currency";
import { queryKeys } from "@/lib/api/query-keys";
import { estimatedRoiPct } from "@/features/roi/lib/aggregate";

/**
 * Project-wise AI usage monitor — GET /analytics/project/:id.
 * Analytics service accepts day|month (no week, no year).
 */
export function ProjectMonitor({
  companySlug,
  projectId,
}: {
  companySlug: string;
  projectId: number;
}) {
  const [period, setPeriod] = useState<"day" | "month">("month");
  const { currency: companyCurrency, fromUsd } = useCompanyCurrency(companySlug);

  const projectQuery = useQuery({
    queryKey: ["company", companySlug, "projects", projectId],
    queryFn: () => organizationApi.getProject(projectId),
  });
  const departments = useQuery({
    queryKey: ["company", companySlug, "departments"],
    queryFn: () => organizationApi.listDepartments(),
  });
  const teams = useQuery({
    queryKey: ["company", companySlug, "teams"],
    queryFn: () => organizationApi.listTeams(),
  });
  const members = useQuery({
    queryKey: ["company", companySlug, "projects", projectId, "members"],
    queryFn: () => organizationApi.listProjectMembers(projectId),
  });
  const employees = useQuery({
    queryKey: queryKeys.company.employees(companySlug),
    queryFn: () => organizationApi.listEmployees(),
    enabled: (members.data?.length ?? 0) > 0,
  });
  const analytics = useQuery({
    queryKey: ["company", companySlug, "analytics", "project", projectId, period],
    queryFn: () => analyticsApi.project(projectId, period),
  });

  const project = projectQuery.data;
  const deptName = project?.department_id
    ? departments.data?.find((d) => d.id === project.department_id)?.department_name
    : undefined;
  const teamName = project?.team_id
    ? teams.data?.find((t) => t.id === project.team_id)?.team_name
    : undefined;

  const employeeByUuid = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of employees.data ?? []) {
      map.set(e.uuid, e.display_name);
    }
    return map;
  }, [employees.data]);

  if (analytics.isLoading || projectQuery.isLoading) {
    return <LoadingBlock className="h-80" />;
  }

  const a = analytics.data;
  const memberRows = members.data ?? [];
  // Analytics cost is treated as USD until BE returns company currency on
  // project snapshots; BV from analytics is shown as company currency when
  // workers already emit local amounts. ROI % always from formula on these KPIs.
  const spendLocal = a ? fromUsd(a.total_cost) : 0;
  const businessValue = a?.total_business_value ?? 0;
  const projectRoiPct = a
    ? estimatedRoiPct(businessValue, spendLocal)
    : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Organization · Project"
        title={project?.project_name ?? `Project ${projectId}`}
        description={
          [deptName, teamName, project?.status]
            .filter(Boolean)
            .join(" · ") || "AI usage attributed to this project."
        }
        actions={
          <div className="flex items-center gap-2">
            <PeriodSwitcher
              value={period}
              onChange={(p) => setPeriod(p as typeof period)}
              variant="analytics"
            />
            <Button asChild variant="secondary" size="sm">
              <Link href={`/${companySlug}/organization/projects`}>
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                All projects
              </Link>
            </Button>
          </div>
        }
      />

      {a ? (
        <>
          <Mosaic cols={4}>
            <KpiTile label="Requests" value={a.requests} format="number" />
            <KpiTile
              label="AI spend"
              value={spendLocal}
              format="currency"
              currency={companyCurrency}
            />
            <KpiTile
              label="Business value"
              value={businessValue}
              format="currency"
              currency={companyCurrency}
            />
            <KpiTile
              label="Estimated ROI"
              value={projectRoiPct}
              format="percent"
              accent
            />
          </Mosaic>

          <Panel className="mt-px border-0 bg-ink p-5 md:p-6">
            <h2 className="mb-4 font-medium text-text-primary">Requests over time</h2>
            <TrendAreaChart
              data={(a.series ?? []).map((p) => ({
                date: p.date.slice(5),
                value: p.requests,
                secondary: p.cost,
              }))}
              secondaryKey="secondary"
              height={280}
            />
          </Panel>
        </>
      ) : (
        <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
          No analytics snapshots yet for this project — chat from AI Workspace
          with this project selected to populate the monitor.
        </p>
      )}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-medium text-text-primary">Members</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/60">
            {memberRows.length} assigned
          </span>
        </div>
        {members.isLoading ? (
          <LoadingBlock className="h-24" />
        ) : memberRows.length === 0 ? (
          <p className="border border-hairline px-4 py-6 text-sm text-text-secondary">
            No members assigned yet. Add people from the Projects list.
          </p>
        ) : (
          <DataTable
            columns={[
              { key: "name", label: "Person" },
              { key: "email", label: "Email" },
              { key: "role", label: "Role" },
            ]}
            rows={memberRows.map((m) => ({
              name:
                (m.user_uuid && employeeByUuid.get(m.user_uuid)) ||
                m.email ||
                m.user_uuid ||
                `User ${m.user_id}`,
              email: m.email || "—",
              role: m.role_in_project || "member",
            }))}
          />
        )}
      </div>
    </div>
  );
}
