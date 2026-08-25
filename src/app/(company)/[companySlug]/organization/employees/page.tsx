"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
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
import { Select, Label } from "@/components/ui/input";
import { ListFilterBar, ListPagination } from "@/components/ui/list-toolbar";
import { organizationApi } from "@/features/organization/api/organization.api";
import { useEmployeesPage } from "@/features/organization/hooks/useOrganizationQueries";
import { roiApi } from "@/features/roi/api/roi.api";
import { ResendInviteButton } from "@/features/organization/components/ResendInviteButton";
import { CreateEmployeeForm } from "@/features/organization/components/CreateEmployeeForm";
import { EntityImportPanel } from "@/features/organization/components/EntityImportPanel";
import { EMPLOYEES_IMPORT_TEMPLATE } from "@/features/organization/data/import-templates";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";
import { RemoveMemberAction } from "@/components/ui/row-actions";
import { Pencil, X } from "lucide-react";
import { queryKeys } from "@/lib/api/query-keys";
import { LIST_PAGE_SIZE_DEFAULT, EMPTY_PAGE_META } from "@/lib/api/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ROLES } from "@/constants/roles";
import { useCompanyCurrency } from "@/hooks/use-company-currency";
import { useAuthStore } from "@/stores/auth-store";
import { can } from "@/lib/rbac/role-matrix";


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
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.user?.permissions);
  const role = user?.role;
  const isTeamLead = role === ROLES.TEAM_LEAD;
  const myTeamId = user?.scope?.team_id ?? user?.team_id ?? null;
  const myDepartmentId =
    user?.scope?.department_id ?? user?.department_id ?? null;
  const canStaffTeam =
    can(role, "teams", "edit", permissions) && Boolean(myTeamId);

  const { currency: companyCurrency } = useCompanyCurrency(params.companySlug);
  const [view, setView] = useState<ViewMode>("table");
  const [showImport, setShowImport] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberUuid, setMemberUuid] = useState("");
  const [addingMember, setAddingMember] = useState(false);

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
  const jobRoles = useQuery({
    queryKey: queryKeys.company.jobRoles(params.companySlug),
    queryFn: () => organizationApi.listJobRoles(),
  });
  const allEmployees = useQuery({
    queryKey: queryKeys.company.employees(params.companySlug),
    queryFn: () => organizationApi.listEmployees(),
    enabled: showInvite || showAddMember,
  });
  const teamsInDept = useMemo(
    () =>
      departmentId === ""
        ? teams.data ?? []
        : (teams.data ?? []).filter((t) => t.department_id === departmentId),
    [teams.data, departmentId],
  );

  const myTeamName = useMemo(() => {
    if (!myTeamId) return null;
    return (teams.data ?? []).find((t) => t.id === myTeamId)?.team_name ?? null;
  }, [teams.data, myTeamId]);

  const addCandidates = useMemo(() => {
    if (!myTeamId) return [];
    return (allEmployees.data ?? []).filter(
      (e) =>
        e.team_id !== myTeamId &&
        e.status !== "invited" &&
        (myDepartmentId == null ||
          e.department_id == null ||
          e.department_id === myDepartmentId),
    );
  }, [allEmployees.data, myTeamId, myDepartmentId]);

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

  async function invalidateEmployees() {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.company.employees(params.companySlug),
    });
    void employees.refetch();
  }

  async function addMemberToTeam() {
    if (!memberUuid || !myTeamId) return;
    setAddingMember(true);
    try {
      await organizationApi.assignUser(memberUuid, {
        department_id: myDepartmentId || undefined,
        team_id: myTeamId,
      });
      try {
        await organizationApi.addTeamMember(myTeamId, memberUuid);
      } catch {
        // already a member after assignUser
      }
      toast.success("Member added to team");
      setMemberUuid("");
      setShowAddMember(false);
      await invalidateEmployees();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add member");
    } finally {
      setAddingMember(false);
    }
  }

  async function removeFromTeam(uuid: string, name: string) {
    if (!myTeamId) return;
    try {
      await organizationApi.assignUser(uuid, { team_id: null });
      try {
        await organizationApi.removeTeamMember(myTeamId, uuid);
      } catch {
        // already cleared
      }
      toast.success(`Removed ${name} from team`);
      await invalidateEmployees();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not remove member",
      );
    }
  }

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
                  · {formatCurrency(e.hourly_cost, companyCurrency)}/hr
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
          {formatCurrency(
            roiById.get(e.id)?.total_spend ?? e.spend,
            companyCurrency,
            true,
          )}
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
          {canStaffTeam && myTeamId && e.team_id === myTeamId && !pending ? (
            <RemoveMemberAction
              onClick={() => removeFromTeam(e.uuid, e.display_name)}
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
              ? `${formatCurrency(e.hourly_cost, companyCurrency)}/hr`
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
          {canStaffTeam && myTeamId && e.team_id === myTeamId && !pending ? (
            <RemoveMemberAction
              onClick={() => removeFromTeam(e.uuid, e.display_name)}
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
        eyebrow={isTeamLead ? "Team" : "Organization"}
        title={isTeamLead ? "Team Members" : "Employees"}
        description={
          isTeamLead
            ? "Staff your team, review spend and Estimated ROI, then open a profile for detail. Owners invite people; you add colleagues already in the company."
            : "Each employee resolves to company → department → team → job role for Estimated ROI. Pending means they have not set a password yet."
        }
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
            {canStaffTeam ? (
              <Button size="sm" onClick={() => setShowAddMember(true)}>
                Add member
              </Button>
            ) : null}
            <Can resource="employees" action="create">
              <Button
                size="sm"
                variant={canStaffTeam ? "secondary" : "default"}
                onClick={() => setShowInvite(true)}
              >
                Invite person
              </Button>
            </Can>
          </div>
        }
      />

      {showAddMember ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-16 sm:pt-20"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-member-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddMember(false);
              setMemberUuid("");
            }
          }}
        >
          <div className="relative w-full max-w-md border border-hairline bg-ink shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-5 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                  Team
                </p>
                <h2
                  id="add-member-title"
                  className="text-lg font-medium text-text-primary"
                >
                  Add member
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddMember(false);
                  setMemberUuid("");
                }}
                className="inline-flex h-8 w-8 items-center justify-center text-text-secondary hover:text-text-primary"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-sm text-text-secondary">
                Pick someone already in your department, then add them to{" "}
                <span className="text-text-primary">
                  {myTeamName ?? "your team"}
                </span>
                .
              </p>
              <div>
                <Label htmlFor="add-team-member">Employee</Label>
                <Select
                  id="add-team-member"
                  value={memberUuid}
                  onChange={(e) => setMemberUuid(e.target.value)}
                >
                  <option value="">Select employee</option>
                  {addCandidates.map((e) => (
                    <option key={e.uuid} value={e.uuid}>
                      {e.display_name}
                      {e.team_name && e.team_name !== "—"
                        ? ` · ${e.team_name}`
                        : ""}
                    </option>
                  ))}
                </Select>
                {allEmployees.isLoading ? (
                  <p className="mt-2 text-xs text-text-secondary">
                    Loading people…
                  </p>
                ) : addCandidates.length === 0 ? (
                  <p className="mt-2 text-xs text-text-secondary">
                    No available people in your department. Ask an owner or
                    manager to invite them first.
                  </p>
                ) : null}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowAddMember(false);
                    setMemberUuid("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!memberUuid || addingMember}
                  onClick={() => void addMemberToTeam()}
                >
                  {addingMember ? "Adding…" : "Add to team"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showInvite ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-16 sm:pt-20">
          <div className="relative w-full max-w-2xl border border-hairline bg-ink shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-hairline bg-surface-2/40 px-5 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                  Invite
                </p>
                <h2 className="text-lg font-medium text-text-primary">
                  Invite person
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="inline-flex h-8 w-8 items-center justify-center text-text-secondary hover:text-text-primary"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto p-5">
              <CreateEmployeeForm
                companySlug={params.companySlug}
                departments={departments.data ?? []}
                teams={teams.data ?? []}
                jobRoles={jobRoles.data ?? []}
                managers={allEmployees.data ?? []}
                onSubmit={async (values) => {
                  const { employee, emailSent, inviteUrl, warnings } =
                    await organizationApi.createEmployee(values);
                  if (emailSent) {
                    toast.success(`Invited ${employee.display_name}`, {
                      description: `An email was sent to ${employee.email}.`,
                    });
                  } else if (inviteUrl) {
                    toast.success(`Invited ${employee.display_name}`, {
                      description:
                        "No mail provider — copy the invite link to activate.",
                      action: {
                        label: "Copy link",
                        onClick: () => {
                          navigator.clipboard?.writeText(inviteUrl);
                          toast.message("Invite link copied");
                        },
                      },
                      duration: 15000,
                    });
                  } else {
                    toast.success(`Invited ${employee.display_name}`);
                  }
                  for (const warning of warnings) {
                    toast.warning(warning);
                  }
                  await queryClient.invalidateQueries({
                    queryKey: queryKeys.company.employees(params.companySlug),
                  });
                  void employees.refetch();
                  if (
                    values.app_role !== ROLES.TEAM_LEAD &&
                    values.app_role !== ROLES.DEPARTMENT_HEAD
                  ) {
                    setShowInvite(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

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
          title={
            hasFilters
              ? isTeamLead
                ? "No members match"
                : "No employees match"
              : isTeamLead
                ? "No team members yet"
                : "No employees yet"
          }
          description={
            hasFilters
              ? "Try a different search, status, department, or team filter."
              : isTeamLead
                ? "Add a colleague already in the company, or ask an owner to invite someone new."
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
