"use client";

import Link from "next/link";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useState } from "react";
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
import {
  ListFilterBar,
  ListPagination,
  type StatusFilter,
} from "@/components/ui/list-toolbar";
import { CreateTeamForm } from "@/features/organization/components/CreateTeamForm";
import { EntityImportPanel } from "@/features/organization/components/EntityImportPanel";
import { TEAMS_IMPORT_TEMPLATE } from "@/features/organization/data/import-templates";
import { organizationApi } from "@/features/organization/api/organization.api";
import { useTeamsPage } from "@/features/organization/hooks/useOrganizationQueries";
import { roiApi } from "@/features/roi/api/roi.api";
import type { Team } from "@/features/organization/types";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";
import { ArchiveAction, EditAction, RowActions } from "@/components/ui/row-actions";
import { queryKeys } from "@/lib/api/query-keys";
import { LIST_PAGE_SIZE_DEFAULT, EMPTY_PAGE_META } from "@/lib/api/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export default function TeamsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search, 300);
  const [status, setStatus] = useState<StatusFilter>("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(LIST_PAGE_SIZE_DEFAULT);

  useEffect(() => {
    setPage(1);
  }, [q, status, departmentId, pageSize]);

  const teams = useTeamsPage(params.companySlug, {
    page,
    pageSize,
    q,
    status,
    departmentId,
  });
  const items = teams.data?.items ?? [];
  const meta = teams.data?.meta ?? EMPTY_PAGE_META;

  useEffect(() => {
    if (page > 1 && meta.total_pages > 0 && page > meta.total_pages) {
      setPage(meta.total_pages);
    }
  }, [meta.total_pages, page]);

  const departments = useQuery({
    queryKey: queryKeys.company.departments(params.companySlug),
    queryFn: () => organizationApi.listDepartments(),
  });
  const employees = useQuery({
    queryKey: queryKeys.company.employees(params.companySlug),
    queryFn: () => organizationApi.listEmployees(),
  });
  // org list endpoint doesn't compute spend/ROI — overlay live figures from roi-engine.
  const teamRoi = useQueries({
    queries: items.map((t) => ({
      queryKey: ["company", params.companySlug, "roi", "team", t.id],
      queryFn: () => roiApi.team(t.id),
      enabled: items.length > 0,
      staleTime: 30_000,
    })),
  });
  const roiById = new Map(items.map((t, i) => [t.id, teamRoi[i]?.data]));

  const deptMap = Object.fromEntries(
    (departments.data ?? []).map((d) => [d.id, d.department_name]),
  );

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function invalidateTeams() {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.company.teams(params.companySlug),
    });
  }

  async function onArchive(t: Team) {
    const restore = t.status === "inactive";
    try {
      await organizationApi.archiveTeam(t.id, restore);
      toast.success(
        restore ? `Restored ${t.team_name}` : `Archived ${t.team_name}`,
      );
      await invalidateTeams();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status");
    }
  }

  const rows = items.map((t) => ({
    code: (
      <span className="font-mono text-[11px] font-medium text-text-secondary/70">
        {t.team_code}
      </span>
    ),
    name: <span className="font-medium text-text-primary">{t.team_name}</span>,
    dept: deptMap[t.department_id] ?? "—",
    people: t.member_count,
    spend: formatCurrency(roiById.get(t.id)?.total_spend ?? t.monthly_spend, "USD", true),
    roi: (
      <span className="font-mono font-medium text-accent">
        {(roiById.get(t.id)?.roi_pct ?? t.roi_pct).toFixed(0)}%
      </span>
    ),
    status: (
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/60">
        {t.status === "inactive" ? "Archived" : "Active"}
      </span>
    ),
    action: (
      <RowActions>
        <Can resource="teams" action="edit">
          <EditAction
            onClick={() => {
              setEditing(t);
              setShowForm(true);
            }}
          />
        </Can>
        <Can resource="teams" action="edit">
          <ArchiveAction
            archived={t.status === "inactive"}
            onClick={() => onArchive(t)}
          />
        </Can>
        <Link
          href={`/${params.companySlug}/organization/departments/${t.department_id}/teams/${t.id}`}
          className="ml-1 font-mono text-[10px] uppercase tracking-[0.15em] text-accent hover:text-accent/70"
        >
          Open
        </Link>
      </RowActions>
    ),
  }));

  const cards: GridCard[] = items.map((t) => ({
    title: t.team_name,
    subtitle: deptMap[t.department_id] ?? "No department",
    badge: (
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary/60">
        {t.status === "inactive" ? "Archived" : t.team_code}
      </span>
    ),
    metrics: [
      { label: "Members", value: t.member_count },
      {
        label: "Est. ROI",
        value: (
          <span className="text-accent">
            {(roiById.get(t.id)?.roi_pct ?? t.roi_pct).toFixed(0)}%
          </span>
        ),
      },
      {
        label: "Spend",
        value: formatCurrency(roiById.get(t.id)?.total_spend ?? t.monthly_spend, "USD", true),
      },
      {
        label: "Status",
        value: (
          <span className="text-[12px] text-accent">
            {t.status === "inactive" ? "Archived" : "Active"}
          </span>
        ),
      },
    ],
    action: (
      <RowActions>
        <Can resource="teams" action="edit">
          <EditAction
            onClick={() => {
              setEditing(t);
              setShowForm(true);
            }}
          />
        </Can>
        <Can resource="teams" action="edit">
          <ArchiveAction
            archived={t.status === "inactive"}
            onClick={() => onArchive(t)}
          />
        </Can>
        <Link
          href={`/${params.companySlug}/organization/departments/${t.department_id}/teams/${t.id}`}
          className="ml-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent hover:text-accent/70"
        >
          Open
        </Link>
      </RowActions>
    ),
  }));

  const empty = !teams.isLoading && items.length === 0;

  return (
    <div>
      <PageHeader
        eyebrow="Organization"
        title="Teams"
        description="Teams belong to a department and own projects + AI usage."
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} />
            {/* Bulk import is enforced owner-only on the backend (ensureOwner),
                regardless of entity — gate on "departments:manage" (owner-exclusive)
                rather than "teams:manage" (also granted to department managers). */}
            <Can resource="departments" action="manage">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowImport((v) => !v)}
              >
                {showImport ? "Close import" : "Import CSV"}
              </Button>
            </Can>
            <Can resource="teams" action="create">
              <Button
                size="sm"
                onClick={() => {
                  if (showForm && !editing) {
                    closeForm();
                    return;
                  }
                  setEditing(null);
                  setShowForm(true);
                }}
              >
                {showForm && !editing ? "Close" : "Add team"}
              </Button>
            </Can>
          </div>
        }
      />

      {showImport && (
        <EntityImportPanel
          companySlug={params.companySlug}
          entity="teams"
          title="Import teams"
          description="Columns match the Add team form: team_name, team_code, department_name (must already exist), description, lead_email."
          templateCsv={TEAMS_IMPORT_TEMPLATE}
          templateFilename="teams-import-template.csv"
          onClose={() => setShowImport(false)}
          onImported={() => {
            void invalidateTeams();
          }}
        />
      )}

      {showForm && departments.data && (
        <div className="mb-8 border border-hairline p-6">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            {editing ? `Edit · ${editing.team_name}` : "New team"}
          </p>
          <CreateTeamForm
            key={editing?.id ?? "new"}
            initial={editing ?? undefined}
            departments={departments.data}
            leads={employees.data ?? []}
            submitLabel={editing ? "Save changes" : "Create team"}
            onSubmit={async (values) => {
              if (editing) {
                await organizationApi.updateTeam(editing.id, values);
                toast.success(`Updated ${values.team_name}`);
              } else {
                await organizationApi.createTeam(values);
                toast.success(`Created ${values.team_name}`);
              }
              closeForm();
              await invalidateTeams();
            }}
          />
        </div>
      )}

      <ListFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name or code"
        status={status}
        onStatusChange={setStatus}
        extra={
          <Select
            value={departmentId}
            onChange={(e) =>
              setDepartmentId(e.target.value === "" ? "" : Number(e.target.value))
            }
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
        }
      />

      {teams.isLoading && !teams.data ? (
        <LoadingBlock className="h-64" />
      ) : empty ? (
        <EmptyState
          title={q || status || departmentId ? "No teams match" : "No teams yet"}
          description={
            q || status || departmentId
              ? "Try a different search, status, or department filter."
              : "Add a team once a department exists."
          }
        />
      ) : (
        <>
          {view === "table" ? (
            <DataTable
              columns={[
                { key: "code", label: "Code", mono: true, width: "w-20" },
                { key: "name", label: "Team", sortable: true },
                { key: "dept", label: "Department" },
                { key: "people", label: "Members", align: "right", sortable: true },
                { key: "spend", label: "Spend", align: "right", sortable: true },
                { key: "roi", label: "Est. ROI", align: "right", sortable: true },
                { key: "status", label: "Status", width: "w-24" },
                { key: "action", label: "Actions", align: "right", width: "w-40" },
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
            noun="teams"
          />
        </>
      )}
    </div>
  );
}
