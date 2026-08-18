"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ListFilterBar, ListPagination, type StatusFilter } from "@/components/ui/list-toolbar";
import { CreateJobRoleForm } from "@/features/organization/components/CreateJobRoleForm";
import { organizationApi } from "@/features/organization/api/organization.api";
import { useJobRolesPage } from "@/features/organization/hooks/useOrganizationQueries";
import type { JobRole } from "@/features/organization/types";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";
import { ArchiveAction, EditAction, RowActions } from "@/components/ui/row-actions";
import { queryKeys } from "@/lib/api/query-keys";
import { LIST_PAGE_SIZE_DEFAULT, EMPTY_PAGE_META } from "@/lib/api/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useEffect, useState } from "react";

export default function JobRolesPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [view, setView] = useState<ViewMode>("table");
  const [editing, setEditing] = useState<JobRole | null>(null);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search, 300);
  const [status, setStatus] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(LIST_PAGE_SIZE_DEFAULT);

  useEffect(() => {
    setPage(1);
  }, [q, status, pageSize]);

  const roles = useJobRolesPage(params.companySlug, { page, pageSize, q, status });
  const items = roles.data?.items ?? [];
  const meta = roles.data?.meta ?? EMPTY_PAGE_META;

  useEffect(() => {
    if (page > 1 && meta.total_pages > 0 && page > meta.total_pages) {
      setPage(meta.total_pages);
    }
  }, [meta.total_pages, page]);

  async function invalidateJobRoles() {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.company.jobRoles(params.companySlug),
    });
  }

  const createRole = useMutation({
    mutationFn: (values: {
      role_name: string;
      hourly_cost: number;
      currency?: string;
    }) => organizationApi.createJobRole(values),
    onSuccess: async (row) => {
      toast.success(`Added ${row.role_name}`);
      await invalidateJobRoles();
    },
  });

  async function onArchive(r: JobRole) {
    const restore = r.status === "inactive";
    try {
      await organizationApi.archiveJobRole(r.id, restore);
      toast.success(
        restore ? `Restored ${r.role_name}` : `Archived ${r.role_name}`,
      );
      await invalidateJobRoles();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status");
    }
  }

  const statusColor = (s: string) =>
    s === "active" ? "text-accent" : "text-text-secondary/50";

  const rows = items.map((r) => ({
    name: <span className="font-medium text-text-primary">{r.role_name}</span>,
    rate: (
      <span className="font-mono font-medium text-text-primary">
        {formatCurrency(r.hourly_cost, r.currency)}
      </span>
    ),
    currency: (
      <span className="font-mono text-[11px] text-text-secondary/70">
        {r.currency}
      </span>
    ),
    status: (
      <span
        className={`font-mono text-[11px] uppercase tracking-[0.12em] ${statusColor(r.status)}`}
      >
        {r.status === "inactive" ? "Archived" : r.status}
      </span>
    ),
    action: (
      <RowActions>
        <Can resource="job_roles" action="edit">
          <EditAction onClick={() => setEditing(r)} />
        </Can>
        <Can resource="job_roles" action="edit">
          <ArchiveAction
            archived={r.status === "inactive"}
            onClick={() => onArchive(r)}
          />
        </Can>
      </RowActions>
    ),
  }));

  const cards: GridCard[] = items.map((r) => ({
    title: r.role_name,
    badge: (
      <span
        className={`font-mono text-[10px] uppercase tracking-[0.14em] ${statusColor(r.status)}`}
      >
        {r.status === "inactive" ? "Archived" : r.status}
      </span>
    ),
    metrics: [
      {
        label: "Hourly Rate",
        value: (
          <span className="font-mono">
            {formatCurrency(r.hourly_cost, r.currency)}
          </span>
        ),
      },
      { label: "Currency", value: r.currency },
    ],
    action: (
      <RowActions>
        <Can resource="job_roles" action="edit">
          <EditAction onClick={() => setEditing(r)} />
        </Can>
        <Can resource="job_roles" action="edit">
          <ArchiveAction
            archived={r.status === "inactive"}
            onClick={() => onArchive(r)}
          />
        </Can>
      </RowActions>
    ),
  }));

  const empty = !roles.isLoading && items.length === 0;

  return (
    <div>
      <PageHeader
        eyebrow="Organization · Config"
        title="Job Roles"
        description="Hourly costs power Estimated ROI. Employees inherit the rate from their job role."
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} />
            <Button asChild size="sm" variant="secondary">
              <Link href={`/${params.companySlug}/organization/employees/new`}>
                Add employee
              </Link>
            </Button>
          </div>
        }
      />

      <Can resource="job_roles" action="manage">
        <div className="mb-8 border border-hairline p-6">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            {editing ? `Edit · ${editing.role_name}` : "New job role"}
          </p>
          <CreateJobRoleForm
            key={editing?.id ?? "new"}
            initial={editing ?? undefined}
            submitLabel={editing ? "Save changes" : "Add job role"}
            onSubmit={async (values) => {
              if (editing) {
                await organizationApi.updateJobRole(editing.id, values);
                toast.success(`Updated ${values.role_name}`);
                setEditing(null);
                await invalidateJobRoles();
              } else {
                await createRole.mutateAsync(values);
              }
            }}
          />
          {editing ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setEditing(null)}
            >
              Cancel edit
            </Button>
          ) : null}
        </div>
      </Can>

      <ListFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search role name"
        status={status}
        onStatusChange={setStatus}
      />

      {roles.isLoading && !roles.data ? (
        <LoadingBlock className="h-64" />
      ) : roles.isError ? (
        <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
          Could not load job roles from business-context (:8083).{" "}
          {roles.error instanceof Error
            ? roles.error.message
            : "Check the service is running and allows this origin."}
        </p>
      ) : empty ? (
        <EmptyState
          title={q || status ? "No job roles match" : "No job roles yet"}
          description={
            q || status
              ? "Try a different search or status filter."
              : "Add a job role to set hourly costs for Estimated ROI."
          }
        />
      ) : (
        <>
          {view === "table" ? (
            <DataTable
              columns={[
                { key: "name", label: "Role", sortable: true },
                { key: "rate", label: "Hourly cost", align: "right", sortable: true },
                { key: "currency", label: "Currency" },
                { key: "status", label: "Status" },
                { key: "action", label: "Actions", align: "right", width: "w-28" },
              ]}
              rows={rows}
              showIndex
            />
          ) : (
            <GridView cards={cards} cols={4} />
          )}
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={meta.total}
            totalPages={meta.total_pages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            noun="job roles"
          />
        </>
      )}
    </div>
  );
}
