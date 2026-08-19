"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  ListFilterBar,
  ListPagination,
  type StatusFilter,
} from "@/components/ui/list-toolbar";
import { CreateDepartmentForm } from "@/features/organization/components/CreateDepartmentForm";
import { EntityImportPanel } from "@/features/organization/components/EntityImportPanel";
import { DEPARTMENTS_IMPORT_TEMPLATE } from "@/features/organization/data/import-templates";
import { organizationApi } from "@/features/organization/api/organization.api";
import { useDepartmentsPage } from "@/features/organization/hooks/useOrganizationQueries";
import { roiApi } from "@/features/roi/api/roi.api";
import type { Department } from "@/features/organization/types";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";
import { ArchiveAction, EditAction, RowActions } from "@/components/ui/row-actions";
import { queryKeys } from "@/lib/api/query-keys";
import { LIST_PAGE_SIZE_DEFAULT, EMPTY_PAGE_META } from "@/lib/api/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export default function DepartmentsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [view, setView] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search, 300);
  const [status, setStatus] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(LIST_PAGE_SIZE_DEFAULT);

  useEffect(() => {
    setPage(1);
  }, [q, status, pageSize]);

  const departments = useDepartmentsPage(params.companySlug, {
    page,
    pageSize,
    q,
    status,
  });
  const items = departments.data?.items ?? [];
  const meta = departments.data?.meta ?? EMPTY_PAGE_META;

  useEffect(() => {
    if (page > 1 && meta.total_pages > 0 && page > meta.total_pages) {
      setPage(meta.total_pages);
    }
  }, [meta.total_pages, page]);

  const employees = useQuery({
    queryKey: queryKeys.company.employees(params.companySlug),
    queryFn: () => organizationApi.listEmployees(),
  });
  const deptRoi = useQueries({
    queries: items.map((d) => ({
      queryKey: ["company", params.companySlug, "roi", "department", d.id],
      queryFn: () => roiApi.department(d.id),
      enabled: items.length > 0,
      staleTime: 30_000,
    })),
  });
  const roiById = new Map(items.map((d, i) => [d.id, deptRoi[i]?.data]));

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function invalidateDepartments() {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.company.departments(params.companySlug),
    });
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
      await invalidateDepartments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status");
    }
  }

  const rows = items.map((d) => ({
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

  const cards: GridCard[] = items.map((d) => ({
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

  const empty = !departments.isLoading && items.length === 0;

  return (
    <div>
      <PageHeader
        eyebrow="Organization"
        title="Departments"
        description="Structural units that own teams, budgets, and Estimated ROI rollups."
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} />
            <Can resource="departments" action="manage">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowImport((v) => !v)}
              >
                {showImport ? "Close import" : "Import CSV"}
              </Button>
            </Can>
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

      {showImport && (
        <EntityImportPanel
          companySlug={params.companySlug}
          entity="departments"
          title="Import departments"
          description="Columns match the Add department form: department_name, department_code, description, manager_email."
          templateCsv={DEPARTMENTS_IMPORT_TEMPLATE}
          templateFilename="departments-import-template.csv"
          onClose={() => setShowImport(false)}
          onImported={() => {
            void invalidateDepartments();
          }}
        />
      )}

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
              await invalidateDepartments();
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
      />

      {departments.isLoading && !departments.data ? (
        <LoadingBlock className="h-64" />
      ) : empty ? (
        <EmptyState
          title={q || status ? "No departments match" : "No departments yet"}
          description={
            q || status
              ? "Try a different search or status filter."
              : "Add a department to start the org hierarchy."
          }
        />
      ) : (
        <>
          {view === "table" ? (
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
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={meta.total}
            totalPages={meta.total_pages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            noun="departments"
          />
        </>
      )}
    </div>
  );
}
