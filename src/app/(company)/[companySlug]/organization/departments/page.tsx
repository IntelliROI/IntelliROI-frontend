"use client";

import Link from "next/link";
import { useQuery, useQueries } from "@tanstack/react-query";
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
import { CreateDepartmentForm } from "@/features/organization/components/CreateDepartmentForm";
import { organizationApi } from "@/features/organization/api/organization.api";
import { roiApi } from "@/features/roi/api/roi.api";
import type { Department } from "@/features/organization/types";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";
import { ArchiveAction, EditAction, RowActions } from "@/components/ui/row-actions";
import { useState } from "react";

export default function DepartmentsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [view, setView] = useState<ViewMode>("table");

  const departments = useQuery({
    queryKey: ["company", params.companySlug, "departments"],
    queryFn: () => organizationApi.listDepartments(),
  });
  const employees = useQuery({
    queryKey: ["company", params.companySlug, "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });
  // org list endpoints don't compute spend/ROI — overlay live figures from roi-engine.
  const deptRoi = useQueries({
    queries: (departments.data ?? []).map((d) => ({
      queryKey: ["company", params.companySlug, "roi", "department", d.id],
      queryFn: () => roiApi.department(d.id),
      enabled: Boolean(departments.data?.length),
      staleTime: 30_000,
    })),
  });
  const roiById = new Map(
    (departments.data ?? []).map((d, i) => [d.id, deptRoi[i]?.data]),
  );

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function onArchive(d: Department) {
    const restore = d.status === "inactive";
    try {
      await organizationApi.archiveDepartment(d.id, restore);
      toast.success(
        restore
          ? `Restored ${d.department_name}`
          : `Archived ${d.department_name}`,
      );
      departments.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status");
    }
  }

  const rows = (departments.data ?? []).map((d) => ({
    code: (
      <span className="font-mono text-[11px] font-medium text-text-secondary/70">
        {d.department_code}
      </span>
    ),
    name: <span className="font-medium text-text-primary">{d.department_name}</span>,
    people: d.employee_count,
    spend: formatCurrency(roiById.get(d.id)?.total_spend ?? d.monthly_spend, "USD", true),
    roi: (
      <span className="font-mono font-medium text-accent">
        {(roiById.get(d.id)?.roi_pct ?? d.roi_pct).toFixed(0)}%
      </span>
    ),
    status: (
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/60">
        {d.status === "inactive" ? "Archived" : "Active"}
      </span>
    ),
    action: (
      <RowActions>
        <Can resource="departments" action="edit">
          <EditAction
            onClick={() => {
              setEditing(d);
              setShowForm(true);
            }}
          />
        </Can>
        <Can resource="departments" action="edit">
          <ArchiveAction
            archived={d.status === "inactive"}
            onClick={() => onArchive(d)}
          />
        </Can>
        <Link
          href={`/${params.companySlug}/organization/departments/${d.id}`}
          className="ml-1 font-mono text-[10px] uppercase tracking-[0.15em] text-accent transition-colors hover:text-accent/70"
        >
          Open
        </Link>
      </RowActions>
    ),
  }));

  const cards: GridCard[] = (departments.data ?? []).map((d) => ({
    title: d.department_name,
    subtitle: `Code: ${d.department_code}`,
    badge: (
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/60">
        {d.status === "inactive" ? "Archived" : "Active"}
      </span>
    ),
    metrics: [
      { label: "Employees", value: d.employee_count },
      {
        label: "Est. ROI",
        value: (
          <span className="text-accent">
            {(roiById.get(d.id)?.roi_pct ?? d.roi_pct).toFixed(0)}%
          </span>
        ),
      },
      {
        label: "Monthly Spend",
        value: formatCurrency(roiById.get(d.id)?.total_spend ?? d.monthly_spend, "USD", true),
      },
    ],
    action: (
      <RowActions>
        <Can resource="departments" action="edit">
          <EditAction
            onClick={() => {
              setEditing(d);
              setShowForm(true);
            }}
          />
        </Can>
        <Can resource="departments" action="edit">
          <ArchiveAction
            archived={d.status === "inactive"}
            onClick={() => onArchive(d)}
          />
        </Can>
        <Link
          href={`/${params.companySlug}/organization/departments/${d.id}`}
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
        title="Departments"
        description="Structural units that own teams, budgets, and Estimated ROI rollups."
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} />
            <Can resource="departments" action="create">
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
                {showForm && !editing ? "Close" : "Add department"}
              </Button>
            </Can>
          </div>
        }
      />

      {showForm && (
        <div className="mb-8 border border-hairline p-6">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            {editing ? `Edit · ${editing.department_name}` : "New department"}
          </p>
          <CreateDepartmentForm
            key={editing?.id ?? "new"}
            initial={editing ?? undefined}
            managers={employees.data ?? []}
            submitLabel={editing ? "Save changes" : "Create department"}
            onSubmit={async (values) => {
              if (editing) {
                await organizationApi.updateDepartment(editing.id, values);
                toast.success(`Updated ${values.department_name}`);
              } else {
                await organizationApi.createDepartment(values);
                toast.success(`Created ${values.department_name}`);
              }
              closeForm();
              departments.refetch();
            }}
          />
        </div>
      )}

      {departments.isLoading ? (
        <LoadingBlock className="h-64" />
      ) : view === "table" ? (
        <DataTable
          columns={[
            { key: "code", label: "Code", mono: true, width: "w-24" },
            { key: "name", label: "Department", sortable: true },
            { key: "people", label: "People", align: "right", sortable: true },
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
