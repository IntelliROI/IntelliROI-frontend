"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  PageHeader,
  LoadingBlock,
  DataTable,
  GridView,
  ViewToggle,
  EmptyState,
  type ViewMode,
  type GridCard,
} from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { ListFilterBar, ListPagination } from "@/components/ui/list-toolbar";
import { organizationApi } from "@/features/organization/api/organization.api";
import { useProjectsPage } from "@/features/organization/hooks/useOrganizationQueries";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { CreateProjectForm } from "@/features/organization/components/CreateProjectForm";
import { EntityImportPanel } from "@/features/organization/components/EntityImportPanel";
import { PROJECTS_IMPORT_TEMPLATE } from "@/features/organization/data/import-templates";
import { Can } from "@/lib/rbac/Can";
import { AddMemberAction, RowActions } from "@/components/ui/row-actions";
import { formatCurrency } from "@/lib/utils";
import type { Project } from "@/features/organization/types";
import { queryKeys } from "@/lib/api/query-keys";
import { LIST_PAGE_SIZE_DEFAULT, EMPTY_PAGE_META } from "@/lib/api/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

type ProjectStatusFilter = "" | "active" | "completed" | "archived";

export default function ProjectsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [view, setView] = useState<ViewMode>("table");
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [assigning, setAssigning] = useState<Project | null>(null);
  const [memberUuid, setMemberUuid] = useState("");

  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search, 300);
  const [status, setStatus] = useState<ProjectStatusFilter>("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [teamId, setTeamId] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(LIST_PAGE_SIZE_DEFAULT);

  useEffect(() => {
    setPage(1);
  }, [q, status, departmentId, teamId, pageSize]);

  const projects = useProjectsPage(params.companySlug, {
    page,
    pageSize,
    q,
    status,
    departmentId,
    teamId,
  });
  const items = projects.data?.items ?? [];
  const meta = projects.data?.meta ?? EMPTY_PAGE_META;

  useEffect(() => {
    if (page > 1 && meta.total_pages > 0 && page > meta.total_pages) {
      setPage(meta.total_pages);
    }
  }, [meta.total_pages, page]);

  const departments = useQuery({
    queryKey: queryKeys.company.departments(params.companySlug),
    queryFn: () => organizationApi.listDepartments(),
  });
  const teams = useQuery({
    queryKey: queryKeys.company.teams(params.companySlug),
    queryFn: () => organizationApi.listTeams(),
  });
  const employees = useQuery({
    queryKey: queryKeys.company.employees(params.companySlug),
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
  const teamsInDept = useMemo(
    () =>
      departmentId === ""
        ? teams.data ?? []
        : (teams.data ?? []).filter((t) => t.department_id === departmentId),
    [teams.data, departmentId],
  );

  // Live per-project monitor — worker writes scope_type=project snapshots.
  const projectAnalytics = useQueries({
    queries: items.map((p) => ({
      queryKey: ["company", params.companySlug, "analytics", "project", p.id],
      queryFn: () => analyticsApi.project(p.id, "month"),
      enabled: items.length > 0,
      staleTime: 30_000,
    })),
  });
  const analyticsById = new Map(
    items.map((p, i) => [p.id, projectAnalytics[i]?.data]),
  );

  const statusColor = (s: string) =>
    s === "active"
      ? "text-accent"
      : s === "completed"
        ? "text-accent-blue"
        : "text-text-secondary/60";

  async function assignMember() {
    if (!assigning || !memberUuid) return;
    try {
      await organizationApi.addProjectMember(assigning.id, memberUuid);
      toast.success(`Added member to ${assigning.project_name}`);
      setAssigning(null);
      setMemberUuid("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    }
  }

  const rows = items.map((p) => ({
    name: <span className="font-medium text-text-primary">{p.project_name}</span>,
    dept: p.department_id ? deptMap[p.department_id] ?? p.department_id : "—",
    team: p.team_id ? teamMap[p.team_id] ?? p.team_id : "—",
    requests: analyticsById.get(p.id)?.requests ?? 0,
    spend: formatCurrency(analyticsById.get(p.id)?.total_cost ?? 0, "USD", true),
    roi: (
      <span className="font-mono font-medium text-accent">
        {(analyticsById.get(p.id)?.roi_pct ?? 0).toFixed(0)}%
      </span>
    ),
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
        <Link
          href={`/${params.companySlug}/organization/projects/${p.id}`}
          className="ml-1 font-mono text-[10px] uppercase tracking-[0.15em] text-accent hover:text-accent/70"
        >
          Monitor
        </Link>
      </RowActions>
    ),
  }));

  const cards: GridCard[] = items.map((p) => ({
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
      { label: "Requests", value: analyticsById.get(p.id)?.requests ?? 0 },
      {
        label: "Est. ROI",
        value: (
          <span className="text-accent">
            {(analyticsById.get(p.id)?.roi_pct ?? 0).toFixed(0)}%
          </span>
        ),
      },
    ],
    action: (
      <RowActions>
        <Can resource="projects" action="edit">
          <AddMemberAction onClick={() => setAssigning(p)} />
        </Can>
        <Link
          href={`/${params.companySlug}/organization/projects/${p.id}`}
          className="ml-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent hover:text-accent/70"
        >
          Monitor
        </Link>
      </RowActions>
    ),
  }));

  const empty = !projects.isLoading && items.length === 0;
  const hasFilters = Boolean(q || status || departmentId || teamId);

  return (
    <div>
      <PageHeader
        eyebrow="Organization"
        title="Projects"
        description="Attribute AI usage to delivery workstreams for precise ROI tracking."
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} />
            <Can resource="projects" action="manage">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowImport((v) => !v)}
              >
                {showImport ? "Close import" : "Import CSV"}
              </Button>
            </Can>
            <Can resource="projects" action="create">
              <Button size="sm" onClick={() => setShowForm((v) => !v)}>
                {showForm ? "Close" : "Add project"}
              </Button>
            </Can>
          </div>
        }
      />

      {showImport && (
        <EntityImportPanel
          companySlug={params.companySlug}
          entity="projects"
          title="Import projects"
          description="Columns match the Add project form: project_name, description, department_name, team_name, plus an optional project_members list (semicolon-separated emails)."
          templateCsv={PROJECTS_IMPORT_TEMPLATE}
          templateFilename="projects-import-template.csv"
          onClose={() => setShowImport(false)}
          onImported={() => {
            void projects.refetch();
          }}
        />
      )}

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
              await projects.refetch();
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

      <ListFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search project name"
        showStatus={false}
        extra={
          <>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatusFilter)}
              className="h-8 w-auto min-w-[9.5rem] shrink-0 font-mono text-[10px] uppercase tracking-[0.08em]"
              aria-label="Status"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </Select>
            <Select
              value={departmentId}
              onChange={(e) => {
                const next = e.target.value === "" ? "" : Number(e.target.value);
                setDepartmentId(next);
                setTeamId("");
              }}
              className="h-8 w-auto min-w-[11rem] shrink-0 font-mono text-[10px] uppercase tracking-[0.08em]"
              aria-label="Department"
            >
              <option value="">All departments</option>
              {(departments.data ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name}
                </option>
              ))}
            </Select>
            <Select
              value={teamId}
              onChange={(e) =>
                setTeamId(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="h-8 w-auto min-w-[10rem] shrink-0 font-mono text-[10px] uppercase tracking-[0.08em]"
              aria-label="Team"
            >
              <option value="">All teams</option>
              {teamsInDept.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.team_name}
                </option>
              ))}
            </Select>
          </>
        }
      />

      {projects.isLoading && !projects.data ? (
        <LoadingBlock className="h-48" />
      ) : empty ? (
        <EmptyState
          title={hasFilters ? "No projects match" : "No projects yet"}
          description={
            hasFilters
              ? "Try a different search, status, department, or team filter."
              : "Add a project to start attributing AI usage."
          }
        />
      ) : (
        <>
          {view === "table" ? (
            <DataTable
              columns={[
                { key: "name", label: "Project", sortable: true },
                { key: "dept", label: "Department" },
                { key: "team", label: "Team" },
                { key: "requests", label: "Requests", align: "right", sortable: true },
                { key: "spend", label: "Spend", align: "right" },
                { key: "roi", label: "Est. ROI", align: "right", sortable: true },
                { key: "status", label: "Status" },
                { key: "action", label: "Actions", align: "right", width: "w-32" },
              ]}
              rows={rows}
              showIndex
            />
          ) : (
            <GridView cards={cards} cols={3} />
          )}
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={meta.total}
            totalPages={meta.total_pages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            noun="projects"
          />
        </>
      )}
    </div>
  );
}
