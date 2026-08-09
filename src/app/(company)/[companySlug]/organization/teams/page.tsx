"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
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
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";

export default function TeamsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [showForm, setShowForm] = useState(false);
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

  const deptMap = Object.fromEntries(
    (departments.data ?? []).map((d) => [d.id, d.department_name]),
  );

  const rows = (teams.data ?? []).map((t) => ({
    code: (
      <span className="font-mono text-[11px] font-medium text-text-secondary/70">
        {t.team_code}
      </span>
    ),
    name: (
      <span className="font-medium text-text-primary">{t.team_name}</span>
    ),
    dept: deptMap[t.department_id] ?? "—",
    people: t.member_count,
    spend: formatCurrency(t.monthly_spend, "USD", true),
    roi: (
      <span className="font-mono font-medium text-accent">{t.roi_pct}%</span>
    ),
    action: (
      <Link
        href={`/${params.companySlug}/organization/departments/${t.department_id}/teams/${t.id}`}
        className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent transition-colors hover:text-accent/70"
      >
        Open →
      </Link>
    ),
    // raw values for sorting
    _name: t.team_name,
    _spend: t.monthly_spend,
    _roi: t.roi_pct,
    _people: t.member_count,
  }));

  const cards: GridCard[] = (teams.data ?? []).map((t) => ({
    title: t.team_name,
    subtitle: deptMap[t.department_id] ?? "No department",
    badge: (
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary/60">
        {t.team_code}
      </span>
    ),
    metrics: [
      { label: "Members", value: t.member_count },
      { label: "Est. ROI", value: <span className="text-accent">{t.roi_pct}%</span> },
      { label: "Spend", value: formatCurrency(t.monthly_spend, "USD", true) },
      { label: "Status", value: <span className="text-accent text-[12px]">Active</span> },
    ],
    action: (
      <Link
        href={`/${params.companySlug}/organization/departments/${t.department_id}/teams/${t.id}`}
        className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent transition-colors hover:text-accent/70"
      >
        Open →
      </Link>
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
              <Button size="sm" onClick={() => setShowForm((v) => !v)}>
                {showForm ? "Close" : "Add team"}
              </Button>
            </Can>
          </div>
        }
      />

      {showForm && departments.data && (
        <div className="mb-8 border border-hairline p-6">
          <CreateTeamForm
            departments={departments.data}
            leads={employees.data ?? []}
            onSubmit={async (values) => {
              await organizationApi.createTeam(values);
              toast.success(`Created ${values.team_name}`);
              setShowForm(false);
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
            { key: "action", label: "", width: "w-20" },
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
