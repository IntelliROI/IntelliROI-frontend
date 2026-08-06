"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { organizationApi } from "@/features/organization/api/organization.api";

export default function ProjectsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const projects = useQuery({
    queryKey: ["company", params.companySlug, "projects"],
    queryFn: () => organizationApi.listProjects(),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Organization"
        title="Projects"
        description="Attribute AI usage to delivery workstreams."
      />
      {projects.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : (
        <DataTable
          columns={[
            { key: "name", label: "Project" },
            { key: "dept", label: "Department", align: "right" },
            { key: "team", label: "Team", align: "right" },
            { key: "status", label: "Status" },
          ]}
          rows={(projects.data ?? []).map((p) => ({
            name: p.project_name,
            dept: p.department_id,
            team: p.team_id,
            status: p.status,
          }))}
        />
      )}
    </div>
  );
}
