"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  PageHeader,
  LoadingBlock,
  DataTable,
  GridView,
  ViewToggle,
  type ViewMode,
  type GridCard,
} from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { organizationApi } from "@/features/organization/api/organization.api";
import { CreateProjectForm } from "@/features/organization/components/CreateProjectForm";
import { Can } from "@/lib/rbac/Can";
import { AddMemberAction, RowActions } from "@/components/ui/row-actions";
import type { Project } from "@/features/organization/types";

export default function ProjectsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [view, setView] = useState<ViewMode>("table");
  const [showForm, setShowForm] = useState(false);
  const [assigning, setAssigning] = useState<Project | null>(null);
  const [memberUuid, setMemberUuid] = useState("");

  const projects = useQuery({
    queryKey: ["company", params.companySlug, "projects"],
    queryFn: () => organizationApi.listProjects(),
  });
  const departments = useQuery({
    queryKey: ["company", params.companySlug, "departments"],
    queryFn: () => organizationApi.listDepartments(),
  });
  const teams = useQuery({
    queryKey: ["company", params.companySlug, "teams"],
    queryFn: () => organizationApi.listTeams(),
  });
  const employees = useQuery({
    queryKey: ["company", params.companySlug, "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });

  const deptMap = useMemo(
    () =>
      Object.fromEntries(
        (departments.data ?? []).map((d) => [d.id, d.department_name]),
      ),
    [departments.data],
  );
  const teamMap = useMemo(
    () =>
      Object.fromEntries((teams.data ?? []).map((t) => [t.id, t.team_name])),
    [teams.data],
  );

  const statusColor = (s: string) =>
    s === "active"
      ? "text-accent"
      : s === "completed"
        ? "text-accent-blue"
        : "text-text-secondary/60";

  async function assignMember() {
    if (!assigning || !memberUuid) return;
    await organizationApi.addProjectMember(assigning.id, memberUuid);
    toast.success(`Added member to ${assigning.project_name}`);
    setAssigning(null);
    setMemberUuid("");
  }

  const rows = (projects.data ?? []).map((p) => ({
    name: <span className="font-medium text-text-primary">{p.project_name}</span>,
    dept: p.department_id ? deptMap[p.department_id] ?? p.department_id : "—",
    team: p.team_id ? teamMap[p.team_id] ?? p.team_id : "—",
    status: (
      <span
        className={`font-mono text-[11px] uppercase tracking-[0.12em] ${statusColor(p.status)}`}
      >
        {p.status}
      </span>
    ),
    action: (
      <RowActions>
        <Can resource="projects" action="edit">
          <AddMemberAction onClick={() => setAssigning(p)} />
        </Can>
      </RowActions>
    ),
  }));

  const cards: GridCard[] = (projects.data ?? []).map((p) => ({
    title: p.project_name,
    badge: (
      <span
        className={`font-mono text-[10px] uppercase tracking-[0.12em] ${statusColor(p.status)}`}
      >
        {p.status}
      </span>
    ),
    metrics: [
      {
        label: "Department",
        value: p.department_id ? deptMap[p.department_id] ?? "—" : "—",
      },
      { label: "Team", value: p.team_id ? teamMap[p.team_id] ?? "—" : "—" },
    ],
    action: (
      <Can resource="projects" action="edit">
        <AddMemberAction onClick={() => setAssigning(p)} />
      </Can>
    ),
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Organization"
        title="Projects"
        description="Attribute AI usage to delivery workstreams for precise ROI tracking."
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} />
            <Can resource="projects" action="create">
              <Button size="sm" onClick={() => setShowForm((v) => !v)}>
                {showForm ? "Close" : "Add project"}
              </Button>
            </Can>
          </div>
        }
      />

      {showForm && (
        <div className="mb-8 border border-hairline p-6">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            New project
          </p>
          <CreateProjectForm
            departments={departments.data ?? []}
            teams={teams.data ?? []}
            onSubmit={async (values) => {
              await organizationApi.createProject(values);
              toast.success(`Created ${values.project_name}`);
              setShowForm(false);
              projects.refetch();
            }}
          />
        </div>
      )}

      {assigning && (
        <div className="mb-8 flex flex-wrap items-end gap-3 border border-hairline p-4">
          <div className="min-w-[16rem] flex-1">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              Add member · {assigning.project_name}
            </p>
            <Select
              value={memberUuid}
              onChange={(e) => setMemberUuid(e.target.value)}
            >
              <option value="">Select employee</option>
              {(employees.data ?? []).map((e) => (
                <option key={e.uuid} value={e.uuid}>
                  {e.display_name}
                </option>
              ))}
            </Select>
          </div>
          <Button size="sm" disabled={!memberUuid} onClick={assignMember}>
            Assign
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setAssigning(null);
              setMemberUuid("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {projects.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : view === "table" ? (
        <DataTable
          columns={[
            { key: "name", label: "Project", sortable: true },
            { key: "dept", label: "Department" },
            { key: "team", label: "Team" },
            { key: "status", label: "Status" },
            { key: "action", label: "Actions", align: "right", width: "w-20" },
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
