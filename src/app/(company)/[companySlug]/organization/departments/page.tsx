"use client";

import Link from "next/link";
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
import { CreateDepartmentForm } from "@/features/organization/components/CreateDepartmentForm";
import { organizationApi } from "@/features/organization/api/organization.api";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";
import { useState } from "react";

export default function DepartmentsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<ViewMode>("table");

  const departments = useQuery({
    queryKey: ["company", params.companySlug, "departments"],
    queryFn: () => organizationApi.listDepartments(),
  });
  const employees = useQuery({
    queryKey: ["company", params.companySlug, "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });

  const rows = (departments.data ?? []).map((d) => ({
    code: (
      <span className="font-mono text-[11px] font-medium text-text-secondary/70">
        {d.department_code}
      </span>
    ),
    name: <span className="font-medium text-text-primary">{d.department_name}</span>,
    people: d.employee_count,
    spend: formatCurrency(d.monthly_spend, "USD", true),
    roi: (
      <span className="font-mono font-medium text-accent">{d.roi_pct}%</span>
    ),
    action: (
      <Link
        href={`/${params.companySlug}/organization/departments/${d.id}`}
        className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent transition-colors hover:text-accent/70"
      >
        Open →
      </Link>
    ),
  }));

  const cards: GridCard[] = (departments.data ?? []).map((d) => ({
    title: d.department_name,
    subtitle: `Code: ${d.department_code}`,
    metrics: [
      { label: "Employees", value: d.employee_count },
      { label: "Est. ROI", value: <span className="text-accent">{d.roi_pct}%</span> },
      { label: "Monthly Spend", value: formatCurrency(d.monthly_spend, "USD", true) },
    ],
    action: (
      <Link
        href={`/${params.companySlug}/organization/departments/${d.id}`}
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
        title="Departments"
        description="Structural units that own teams, budgets, and Estimated ROI rollups."
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} />
            <Can resource="departments" action="create">
              <Button size="sm" onClick={() => setShowForm((v) => !v)}>
                {showForm ? "Close" : "Add department"}
              </Button>
            </Can>
          </div>
        }
      />

      {showForm && (
        <div className="mb-8 border border-hairline p-6">
          <CreateDepartmentForm
            managers={employees.data ?? []}
            onSubmit={async (values) => {
              await organizationApi.createDepartment(values);
              toast.success(`Created ${values.department_name}`);
              setShowForm(false);
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
