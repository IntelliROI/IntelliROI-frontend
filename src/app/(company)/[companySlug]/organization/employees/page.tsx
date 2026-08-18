"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { ListFilterBar, ListPagination } from "@/components/ui/list-toolbar";
import { organizationApi } from "@/features/organization/api/organization.api";
import { useEmployeesPage } from "@/features/organization/hooks/useOrganizationQueries";
import { roiApi } from "@/features/roi/api/roi.api";
import { ResendInviteButton } from "@/features/organization/components/ResendInviteButton";
import { EntityImportPanel } from "@/features/organization/components/EntityImportPanel";
import { EMPLOYEES_IMPORT_TEMPLATE } from "@/features/organization/data/import-templates";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";
import { Pencil } from "lucide-react";
import { queryKeys } from "@/lib/api/query-keys";
import { LIST_PAGE_SIZE_DEFAULT, EMPTY_PAGE_META } from "@/lib/api/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useQueries } from "@tanstack/react-query";

type EmployeeStatusFilter = "" | "active" | "invited";

function cell(value?: string | null) {
  const text = (value ?? "").trim();
  if (!text || text === "—") {
    return <span className="text-text-secondary/40">—</span>;
  }
  return text;
}

export default function EmployeesPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const [view, setView] = useState<ViewMode>("table");
  const [showImport, setShowImport] = useState(false);

  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search, 300);
  const [status, setStatus] = useState<EmployeeStatusFilter>("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [teamId, setTeamId] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(LIST_PAGE_SIZE_DEFAULT);

  useEffect(() => {
    setPage(1);
  }, [q, status, departmentId, teamId, pageSize]);

  const employees = useEmployeesPage(params.companySlug, {
    page,
    pageSize,
    q,
    status,
    departmentId,
    teamId,
  });
  const items = employees.data?.items ?? [];
  const meta = employees.data?.meta ?? EMPTY_PAGE_META;

  useEffect(() => {
    if (page > 1 && meta.total_pages > 0 && page > meta.total_pages) {
      setPage(meta.total_pages);
    }
  }, [meta.total_pages, page]);

  const departments = useQuery({
    queryKey: queryKeys.company.departments(params.companySlug),
    queryFn: () => organizationApi.listDepartments(),
  });
  const teams = useQuery({
    queryKey: queryKeys.company.teams(params.companySlug),
    queryFn: () => organizationApi.listTeams(),
  });
  const teamsInDept = useMemo(
    () =>
      departmentId === ""
        ? teams.data ?? []
        : (teams.data ?? []).filter((t) => t.department_id === departmentId),
    [teams.data, departmentId],
  );

  // org list endpoint doesn't compute spend/ROI — overlay live figures from roi-engine.
  const activeEmployees = items.filter((e) => e.status !== "invited");
  const employeeRoi = useQueries({
    queries: activeEmployees.map((e) => ({
      queryKey: ["company", params.companySlug, "roi", "employee", e.id],
      queryFn: () => roiApi.employee(e.id),
      enabled: activeEmployees.length > 0,
      staleTime: 30_000,
    })),
  });
  const roiById = new Map(
    activeEmployees.map((e, i) => [e.id, employeeRoi[i]?.data]),
  );

  const errorMessage =
    employees.error instanceof Error
      ? employees.error.message
      : "Could not reach the auth service.";

  const rows = items.map((e) => {
    const pending = e.status === "invited";
    return {
      code: (
        <span className="font-mono text-[11px] text-text-secondary/70">
          {cell(e.employee_code)}
        </span>
      ),
      name: (
        <span className="font-medium text-text-primary">{e.display_name}</span>
      ),
      department: (
        <span className="text-text-primary">{cell(e.department_name)}</span>
      ),
      team: <span className="text-text-primary">{cell(e.team_name)}</span>,
      job: (
        <span className="text-[12px] text-text-secondary">
          {e.job_role_name && e.job_role_name !== "—" ? (
            <>
              {e.job_role_name}
              {e.hourly_cost > 0 ? (
                <span className="font-mono text-text-secondary/50">
                  {" "}
                  · {formatCurrency(e.hourly_cost, e.currency)}/hr
                </span>
              ) : null}
            </>
          ) : (
            cell(null)
          )}
        </span>
      ),
      status: pending ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-warning">
          Pending
        </span>
      ) : (
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/60">
          Active
        </span>
      ),
      spend: (
        <span className="font-mono text-[12px] text-text-secondary">
          {formatCurrency(roiById.get(e.id)?.total_spend ?? e.spend, e.currency, true)}
        </span>
      ),
      roi: (
        <span className="font-mono font-medium text-accent">
          {(roiById.get(e.id)?.roi_pct ?? e.roi_pct).toFixed(0)}%
        </span>
      ),
      action: (
        <div className="flex items-center justify-end gap-1">
          {pending ? (
            <ResendInviteButton
              email={e.email}
              displayName={e.display_name}
              compact
            />
          ) : null}
          <Can resource="employees" action="edit">
            <Link
              href={`/${params.companySlug}/organization/employees/${e.uuid}?edit=1`}
              title="Edit"
              aria-label="Edit"
              className="inline-flex h-8 w-8 items-center justify-center text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </Can>
          <Link
            href={`/${params.companySlug}/organization/employees/${e.uuid}`}
            className="px-1 font-mono text-[10px] uppercase tracking-[0.15em] text-accent transition-colors hover:text-accent/70"
          >
            Profile
          </Link>
        </div>
      ),
    };
  });

  const cards: GridCard[] = items.map((e) => {
    const pending = e.status === "invited";
    return {
      title: e.display_name,
      subtitle: `${e.department_name && e.department_name !== "—" ? e.department_name : "No department"} · ${e.team_name && e.team_name !== "—" ? e.team_name : "No team"}`,
      badge: (
        <span
          className={`font-mono text-[10px] font-semibold uppercase tracking-[0.14em] ${
            pending ? "text-warning" : "text-text-secondary/60"
          }`}
        >
          {pending ? "Pending" : "Active"}
        </span>
      ),
      metrics: [
        { label: "ID", value: cell(e.employee_code) },
        { label: "Role", value: <span className="text-[12px]">{cell(e.job_role_name)}</span> },
        {
          label: "Est. ROI",
          value: (
            <span className="text-accent">
              {(roiById.get(e.id)?.roi_pct ?? e.roi_pct).toFixed(0)}%
            </span>
          ),
        },
        {
          label: "Rate",
          value:
            e.hourly_cost > 0
              ? `${formatCurrency(e.hourly_cost, e.currency)}/hr`
              : "—",
        },
      ],
      action: (
        <div className="flex items-center gap-1">
          {pending ? (
            <ResendInviteButton
              email={e.email}
              displayName={e.display_name}
              compact
            />
          ) : null}
          <Can resource="employees" action="edit">
            <Link
              href={`/${params.companySlug}/organization/employees/${e.uuid}?edit=1`}
              title="Edit"
              aria-label="Edit"
              className="inline-flex h-8 w-8 items-center justify-center text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </Can>
          <Link
            href={`/${params.companySlug}/organization/employees/${e.uuid}`}
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent hover:text-accent/70"
          >
            Profile
          </Link>
        </div>
      ),
    };
  });

  const empty = !employees.isLoading && !employees.isError && items.length === 0;
  const hasFilters = Boolean(q || status || departmentId || teamId);

  return (
    <div>
      <PageHeader
        eyebrow="Organization"
        title="Employees"
        description="Each employee resolves to company → department → team → job role for Estimated ROI. Pending means they have not set a password yet."
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onViewChange={setView} />
            <Can resource="employees" action="manage">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowImport((v) => !v)}
              >
                {showImport ? "Close import" : "Import CSV"}
              </Button>
            </Can>
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

      {showImport && (
        <EntityImportPanel
          companySlug={params.companySlug}
          entity="people"
          title="Import employees"
          description="Columns match the Add employee form: email, first_name, last_name, role, employee_code, phone, designation, department_name, team_name, manager_email, joining_date. Department/team must already exist."
          templateCsv={EMPLOYEES_IMPORT_TEMPLATE}
          templateFilename="employees-import-template.csv"
          showInviteToggle
          onClose={() => setShowImport(false)}
          onImported={() => {
            void employees.refetch();
          }}
        />
      )}

      <ListFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email, or ID"
        showStatus={false}
        extra={
          <>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as EmployeeStatusFilter)}
              className="h-8 w-auto min-w-[9.5rem] shrink-0 font-mono text-[10px] uppercase tracking-[0.08em]"
              aria-label="Status"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="invited">Pending</option>
            </Select>
            <Select
              value={departmentId}
              onChange={(e) => {
                const next = e.target.value === "" ? "" : Number(e.target.value);
                setDepartmentId(next);
                setTeamId("");
              }}
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
            <Select
              value={teamId}
              onChange={(e) =>
                setTeamId(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="h-8 w-auto min-w-[10rem] shrink-0 font-mono text-[10px] uppercase tracking-[0.08em]"
              aria-label="Team"
            >
              <option value="">All teams</option>
              {teamsInDept.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.team_name}
                </option>
              ))}
            </Select>
          </>
        }
      />

      {employees.isLoading && !employees.data ? (
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
      ) : empty ? (
        <EmptyState
          title={hasFilters ? "No employees match" : "No employees yet"}
          description={
            hasFilters
              ? "Try a different search, status, department, or team filter."
              : "Add an employee to start attributing AI usage."
          }
        />
      ) : (
        <>
          {view === "table" ? (
            <DataTable
              columns={[
                { key: "code", label: "ID", mono: true, width: "w-24" },
                { key: "name", label: "Name", sortable: true },
                { key: "department", label: "Department", sortable: true },
                { key: "team", label: "Team" },
                { key: "job", label: "Job role" },
                { key: "status", label: "Status", width: "w-24" },
                { key: "spend", label: "Spend", align: "right", sortable: true },
                { key: "roi", label: "Est. ROI", align: "right", sortable: true },
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
            noun="employees"
          />
        </>
      )}
    </div>
  );
}
