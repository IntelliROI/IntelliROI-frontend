"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
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
import { organizationApi } from "@/features/organization/api/organization.api";
import { ResendInviteButton } from "@/features/organization/components/ResendInviteButton";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";
import { useState } from "react";

export default function EmployeesPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [view, setView] = useState<ViewMode>("table");

  const employees = useQuery({
    queryKey: ["company", params.companySlug, "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });

  const errorMessage =
    employees.error instanceof Error
      ? employees.error.message
      : "Could not reach the auth service.";

  const rows = (employees.data ?? []).map((e) => ({
    code: (
      <span className="font-mono text-[11px] font-medium text-text-secondary/70">
        {e.employee_code}
      </span>
    ),
    name: (
      <div>
        <span className="font-medium text-text-primary">{e.display_name}</span>
        {e.status === "invited" ? (
          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
            Invited
          </span>
        ) : null}
      </div>
    ),
    department: e.department_name ?? "—",
    team: e.team_name ?? "—",
    job: (
      <span className="text-[12px] text-text-secondary">
        {e.job_role_name}{" "}
        <span className="font-mono text-text-secondary/50">
          · ${e.hourly_cost}/hr
        </span>
      </span>
    ),
    spend: formatCurrency(e.spend, "USD", true),
    roi: (
      <span className="font-mono font-medium text-accent">{e.roi_pct}%</span>
    ),
    action: (
      <div className="flex items-center justify-end gap-3">
        {e.status === "invited" ? (
          <ResendInviteButton
            email={e.email}
            displayName={e.display_name}
            compact
          />
        ) : null}
        <Link
          href={`/${params.companySlug}/organization/employees/${e.uuid}`}
          className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent transition-colors hover:text-accent/70"
        >
          Profile →
        </Link>
      </div>
    ),
  }));

  const cards: GridCard[] = (employees.data ?? []).map((e) => ({
    title: e.display_name,
    subtitle: `${e.department_name ?? "—"} · ${e.team_name ?? "—"}`,
    badge: (
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-text-secondary/60">
        {e.status === "invited" ? "Invited" : e.employee_code}
      </span>
    ),
    metrics: [
      { label: "Role", value: <span className="text-[12px]">{e.job_role_name}</span> },
      { label: "Est. ROI", value: <span className="text-accent">{e.roi_pct}%</span> },
      { label: "Spend", value: formatCurrency(e.spend, "USD", true) },
      { label: "Rate", value: `$${e.hourly_cost}/hr` },
    ],
    action: (
      <div className="flex items-center gap-3">
        {e.status === "invited" ? (
          <ResendInviteButton
            email={e.email}
            displayName={e.display_name}
            compact
          />
        ) : null}
        <Link
          href={`/${params.companySlug}/organization/employees/${e.uuid}`}
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent hover:text-accent/70"
        >
          View profile →
        </Link>
      </div>
    ),
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Organization"
        title="Employees"
        description="Each employee resolves to company → department → team → job role for Estimated ROI."
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} />
            <Can resource="employees" action="create">
              <Button asChild size="sm">
                <Link href={`/${params.companySlug}/organization/employees/new`}>
                  Add employee
                </Link>
              </Button>
            </Can>
          </div>
        }
      />

      {employees.isLoading ? (
        <LoadingBlock className="h-64" />
      ) : employees.isError ? (
        <div className="border border-hairline px-4 py-8 text-sm text-text-secondary">
          <p>Could not load employees. {errorMessage}</p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-4"
            onClick={() => employees.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : view === "table" ? (
        <DataTable
          columns={[
            { key: "code", label: "ID", mono: true, width: "w-24" },
            { key: "name", label: "Name", sortable: true },
            { key: "department", label: "Department", sortable: true },
            { key: "team", label: "Team" },
            { key: "job", label: "Job role" },
            { key: "spend", label: "Spend", align: "right", sortable: true },
            { key: "roi", label: "Est. ROI", align: "right", sortable: true },
            { key: "action", label: "", width: "w-48" },
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
