"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { Mosaic, Panel } from "@/components/ui/panel";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { PeriodSwitcher } from "@/components/ui/period-switcher";
import { TrendAreaChart } from "@/components/charts/Charts";
import { Button } from "@/components/ui/button";
import { organizationApi } from "@/features/organization/api/organization.api";
import { analyticsApi } from "@/features/analytics/api/analytics.api";

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

  if (analytics.isLoading || projectQuery.isLoading) {
    return <LoadingBlock className="h-80" />;
  }

  const a = analytics.data;

  return (
    <div>
      <PageHeader
        eyebrow="Organization · Project"
        title={project?.project_name ?? `Project ${projectId}`}
        description={[deptName, teamName].filter(Boolean).join(" · ") || "AI usage attributed to this project."}
        actions={
          <div className="flex items-center gap-2">
            <PeriodSwitcher value={period} onChange={(p) => setPeriod(p as typeof period)} variant="analytics" />
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
            <KpiTile label="AI spend" value={a.total_cost} format="currency" />
            <KpiTile label="Business value" value={a.total_business_value} format="currency" />
            <KpiTile label="Estimated ROI" value={a.roi_pct} format="percent" accent />
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
    </div>
  );
}
