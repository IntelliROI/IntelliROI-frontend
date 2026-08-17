"use client";

import Link from "next/link";
import { useQuery, useQueries } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
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
import { CreateTeamForm } from "@/features/organization/components/CreateTeamForm";
import { organizationApi } from "@/features/organization/api/organization.api";
import { roiApi } from "@/features/roi/api/roi.api";
import type { Team } from "@/features/organization/types";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";
import { ArchiveAction, EditAction, RowActions } from "@/components/ui/row-actions";

export default function TeamsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [view, setView] = useState<ViewMode>("table");

  const teams = useQuery({
    queryKey: ["company", params.companySlug, "teams"],
    queryFn: () => organizationApi.listTeams(),
  });
  const departments = useQuery({
    queryKey: ["company", params.companySlug, "departments"],
    queryFn: () => organizationApi.listDepartments(),
  });
  const employees = useQuery({
    queryKey: ["company", params.companySlug, "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });
  // org list endpoint doesn't compute spend/ROI — overlay live figures from roi-engine.
  const teamRoi = useQueries({
    queries: (teams.data ?? []).map((t) => ({
      queryKey: ["company", params.companySlug, "roi", "team", t.id],
      queryFn: () => roiApi.team(t.id),
      enabled: Boolean(teams.data?.length),
      staleTime: 30_000,
    })),
  });
  const roiById = new Map(
    (teams.data ?? []).map((t, i) => [t.id, teamRoi[i]?.data]),
  );

  const deptMap = Object.fromEntries(
    (departments.data ?? []).map((d) => [d.id, d.department_name]),
  );

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function onArchive(t: Team) {
    const restore = t.status === "inactive";
    try {
      await organizationApi.archiveTeam(t.id, restore);
      toast.success(
        restore ? `Restored ${t.team_name}` : `Archived ${t.team_name}`,
      );
      teams.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status");
    }
  }

  const rows = (teams.data ?? []).map((t) => ({
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

  const cards: GridCard[] = (teams.data ?? []).map((t) => ({
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

  return (
    <div>
      <PageHeader
        eyebrow="Organization"
        title="Teams"
        description="Teams belong to a department and own projects + AI usage."
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} />
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
              teams.refetch();
            }}
          />
        </div>
      )}

      {teams.isLoading ? (
        <LoadingBlock className="h-64" />
      ) : view === "table" ? (
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
    </div>
  );
}
