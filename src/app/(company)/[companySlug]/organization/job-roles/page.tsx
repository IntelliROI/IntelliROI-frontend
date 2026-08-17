"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { CreateJobRoleForm } from "@/features/organization/components/CreateJobRoleForm";
import { organizationApi } from "@/features/organization/api/organization.api";
import type { JobRole } from "@/features/organization/types";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";
import { ArchiveAction, EditAction, RowActions } from "@/components/ui/row-actions";
import { useState } from "react";

export default function JobRolesPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [view, setView] = useState<ViewMode>("table");
  const [editing, setEditing] = useState<JobRole | null>(null);
  const queryClient = useQueryClient();

  const roles = useQuery({
    queryKey: ["company", params.companySlug, "job-roles"],
    queryFn: () => organizationApi.listJobRoles(),
  });

  const createRole = useMutation({
    mutationFn: (values: {
      role_name: string;
      hourly_cost: number;
      currency?: string;
    }) => organizationApi.createJobRole(values),
    onSuccess: (row) => {
      toast.success(`Added ${row.role_name}`);
      void queryClient.invalidateQueries({
        queryKey: ["company", params.companySlug, "job-roles"],
      });
    },
  });

  async function onArchive(r: JobRole) {
    const restore = r.status === "inactive";
    try {
      await organizationApi.archiveJobRole(r.id, restore);
      toast.success(
        restore ? `Restored ${r.role_name}` : `Archived ${r.role_name}`,
      );
      void queryClient.invalidateQueries({
        queryKey: ["company", params.companySlug, "job-roles"],
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status");
    }
  }

  const statusColor = (s: string) =>
    s === "active" ? "text-accent" : "text-text-secondary/50";

  const rows = (roles.data ?? []).map((r) => ({
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

  const cards: GridCard[] = (roles.data ?? []).map((r) => ({
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
                void queryClient.invalidateQueries({
                  queryKey: ["company", params.companySlug, "job-roles"],
                });
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

      {roles.isLoading ? (
        <LoadingBlock className="h-64" />
      ) : roles.isError ? (
        <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
          Could not load job roles from business-context (:8083).{" "}
          {roles.error instanceof Error
            ? roles.error.message
            : "Check the service is running and allows this origin."}
        </p>
      ) : view === "table" ? (
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
    </div>
  );
}
