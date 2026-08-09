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
import { CreateJobRoleForm } from "@/features/organization/components/CreateJobRoleForm";
import { organizationApi } from "@/features/organization/api/organization.api";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";
import { useState } from "react";

export default function JobRolesPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [view, setView] = useState<ViewMode>("table");

  const roles = useQuery({
    queryKey: ["company", params.companySlug, "job-roles"],
    queryFn: () => organizationApi.listJobRoles(),
  });

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
      <span className={`font-mono text-[11px] uppercase tracking-[0.12em] ${statusColor(r.status)}`}>
        {r.status}
      </span>
    ),
  }));

  const cards: GridCard[] = (roles.data ?? []).map((r) => ({
    title: r.role_name,
    badge: (
      <span className={`font-mono text-[10px] uppercase tracking-[0.14em] ${statusColor(r.status)}`}>
        {r.status}
      </span>
    ),
    metrics: [
      { label: "Hourly Rate", value: <span className="font-mono">{formatCurrency(r.hourly_cost, r.currency)}</span> },
      { label: "Currency", value: r.currency },
    ],
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
          <CreateJobRoleForm
            onSubmit={async (values) => {
              await organizationApi.createJobRole(values);
              toast.success(`Added ${values.role_name}`);
              roles.refetch();
            }}
          />
        </div>
      </Can>

      {roles.isLoading ? (
        <LoadingBlock className="h-64" />
      ) : view === "table" ? (
        <DataTable
          columns={[
            { key: "name", label: "Role", sortable: true },
            { key: "rate", label: "Hourly cost", align: "right", sortable: true },
            { key: "currency", label: "Currency" },
            { key: "status", label: "Status" },
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
