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
import { organizationApi } from "@/features/organization/api/organization.api";
import { useState } from "react";

export default function ProjectsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [view, setView] = useState<ViewMode>("table");

  const projects = useQuery({
    queryKey: ["company", params.companySlug, "projects"],
    queryFn: () => organizationApi.listProjects(),
  });

  const statusColor = (s: string) =>
    s === "active"
      ? "text-accent"
      : s === "completed"
        ? "text-accent-blue"
        : "text-text-secondary/60";

  const rows = (projects.data ?? []).map((p) => ({
    name: <span className="font-medium text-text-primary">{p.project_name}</span>,
    dept: p.department_id ?? "—",
    team: p.team_id ?? "—",
    status: (
      <span className={`font-mono text-[11px] uppercase tracking-[0.12em] ${statusColor(p.status)}`}>
        {p.status}
      </span>
    ),
  }));

  const cards: GridCard[] = (projects.data ?? []).map((p) => ({
    title: p.project_name,
    badge: (
      <span className={`font-mono text-[10px] uppercase tracking-[0.12em] ${statusColor(p.status)}`}>
        {p.status}
      </span>
    ),
    metrics: [
      { label: "Department", value: p.department_id ?? "—" },
      { label: "Team", value: p.team_id ?? "—" },
    ],
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Organization"
        title="Projects"
        description="Attribute AI usage to delivery workstreams for precise ROI tracking."
        actions={<ViewToggle view={view} onViewChange={setView} />}
      />

      {projects.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : view === "table" ? (
        <DataTable
          columns={[
            { key: "name", label: "Project", sortable: true },
            { key: "dept", label: "Department" },
            { key: "team", label: "Team" },
            { key: "status", label: "Status" },
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
