"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { Mosaic } from "@/components/ui/panel";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Select, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PeriodSwitcher, type RoiPeriod } from "@/components/ui/period-switcher";
import { organizationApi } from "@/features/organization/api/organization.api";
import { CreateEmployeeForm } from "@/features/organization/components/CreateEmployeeForm";
import { CreateProjectForm } from "@/features/organization/components/CreateProjectForm";
import { roiApi } from "@/features/roi/api/roi.api";
import { formatCurrency } from "@/lib/utils";
import { useCompanyCurrency } from "@/hooks/use-company-currency";
import { can } from "@/lib/rbac/role-matrix";
import { RemoveMemberAction, RowActions } from "@/components/ui/row-actions";
import { useAuthStore } from "@/stores/auth-store";
import { ROLES } from "@/constants/roles";
import { queryKeys } from "@/lib/api/query-keys";

export function TeamDashboard({
  companySlug,
  departmentId,
  teamId,
}: {
  companySlug: string;
  departmentId: number;
  teamId: number;
}) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.user?.permissions);
  const role = user?.role;
  const canStaff = can(role, "teams", "edit", permissions);
  const canInvite = can(role, "employees", "create", permissions);
  const canCreateProject = can(role, "projects", "create", permissions);

  const [period, setPeriod] = useState<RoiPeriod>("month");
  const [showAddMember, setShowAddMember] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [memberUuid, setMemberUuid] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const { currency: companyCurrency } = useCompanyCurrency(companySlug);

  const teams = useQuery({
    queryKey: ["company", companySlug, "teams", departmentId],
    queryFn: () => organizationApi.listTeams(departmentId),
  });
  const departments = useQuery({
    queryKey: queryKeys.company.departments(companySlug),
    queryFn: () => organizationApi.listDepartments(),
    enabled: showInvite || showAddProject,
  });
  const allTeams = useQuery({
    queryKey: queryKeys.company.teams(companySlug),
    queryFn: () => organizationApi.listTeams(),
    enabled: showInvite || showAddProject,
  });
  const jobRoles = useQuery({
    queryKey: queryKeys.company.jobRoles(companySlug),
    queryFn: () => organizationApi.listJobRoles(),
    enabled: showInvite,
  });
  const employees = useQuery({
    queryKey: ["company", companySlug, "employees"],
    queryFn: () => organizationApi.listEmployees(),
  });
  const projects = useQuery({
    queryKey: ["company", companySlug, "projects"],
    queryFn: () => organizationApi.listProjects(),
  });
  const roi = useQuery({
    queryKey: ["company", companySlug, "roi", "team", teamId, period],
    queryFn: () => roiApi.team(teamId, period),
  });

  const members = (employees.data ?? []).filter((e) => e.team_id === teamId);
  const teamProjects = (projects.data ?? []).filter((p) => p.team_id === teamId);
  const candidates = useMemo(
    () =>
      (employees.data ?? []).filter(
        (e) =>
          e.team_id !== teamId &&
          e.status !== "invited" &&
          (departmentId === 0 ||
            e.department_id == null ||
            e.department_id === departmentId),
      ),
    [employees.data, teamId, departmentId],
  );

  const memberRoi = useQueries({
    queries: members.map((e) => ({
      queryKey: ["company", companySlug, "roi", "employee", e.id, period],
      queryFn: () => roiApi.employee(e.id, period),
      enabled: Boolean(e.id),
      staleTime: 60_000,
    })),
  });

  const inviteRoles =
    role === ROLES.COMPANY_OWNER
      ? ([ROLES.EMPLOYEE, ROLES.TEAM_LEAD, ROLES.DEPARTMENT_HEAD] as const)
      : ([ROLES.EMPLOYEE, ROLES.TEAM_LEAD] as const);

  async function invalidateOrg() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.company.employees(companySlug),
      }),
      queryClient.invalidateQueries({
        queryKey: ["company", companySlug, "employees"],
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.company.departments(companySlug),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.company.teams(companySlug),
      }),
      queryClient.invalidateQueries({
        queryKey: ["company", companySlug, "teams", departmentId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["company", companySlug, "projects"],
      }),
    ]);
    void employees.refetch();
    void projects.refetch();
    void teams.refetch();
  }

  async function addMemberToTeam() {
    if (!memberUuid) return;
    setAddingMember(true);
    try {
      await organizationApi.assignUser(memberUuid, {
        department_id: departmentId || undefined,
        team_id: teamId,
      });
      try {
        await organizationApi.addTeamMember(teamId, memberUuid);
      } catch {
        // already a member after assignUser
      }
      toast.success("Member added to team");
      setMemberUuid("");
      setShowAddMember(false);
      await invalidateOrg();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add member");
    } finally {
      setAddingMember(false);
    }
  }

  async function removeFromTeam(uuid: string, name: string) {
    try {
      await organizationApi.assignUser(uuid, { team_id: null });
      try {
        await organizationApi.removeTeamMember(teamId, uuid);
      } catch {
        // already cleared
      }
      toast.success(`Removed ${name} from team`);
      await invalidateOrg();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not remove member",
      );
    }
  }

  if (teams.isLoading || roi.isLoading) return <LoadingBlock className="h-80" />;

  const team = teams.data?.find((t) => t.id === teamId);

  return (
    <div>
      <PageHeader
        eyebrow="Team"
        title={team?.team_name ?? `Team ${teamId}`}
        description="Staff this team, review Estimated ROI, then attach projects for delivery attribution."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PeriodSwitcher
              value={period}
              onChange={(p) => setPeriod(p as RoiPeriod)}
              variant="roi"
            />
            {canStaff ? (
              <Button size="sm" onClick={() => setShowAddMember(true)}>
                Add member
              </Button>
            ) : null}
            {canInvite ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowInvite(true)}
              >
                Invite person
              </Button>
            ) : null}
          </div>
        }
      />

      {roi.data ? (
        <Mosaic cols={4}>
          <KpiTile
            label="Spend"
            value={roi.data.total_spend}
            format="currency"
            currency={companyCurrency}
          />
          <KpiTile
            label="Estimated ROI"
            value={roi.data.roi_pct}
            format="percent"
            accent
          />
          <KpiTile label="Requests" value={roi.data.requests} format="number" />
          <KpiTile label="Members" value={members.length} format="number" />
        </Mosaic>
      ) : (
        <p className="border border-hairline px-4 py-6 text-sm text-text-secondary">
          Estimated ROI is unavailable for this period.
        </p>
      )}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-medium text-text-primary">Members</h2>
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Employee" },
            { key: "requests", label: "Requests", align: "right" },
            { key: "spend", label: "Spend", align: "right" },
            { key: "roi", label: "Est. ROI", align: "right" },
            { key: "action", label: "Actions", align: "right" },
          ]}
          rows={members.map((e, i) => {
            const m = memberRoi[i]?.data;
            return {
              name: e.display_name,
              requests: m?.requests ?? "—",
              spend: m
                ? formatCurrency(m.total_spend, companyCurrency, true)
                : "—",
              roi: m ? (
                <span className="text-accent">{m.roi_pct}%</span>
              ) : (
                "—"
              ),
              action: (
                <RowActions>
                  {canStaff ? (
                    <RemoveMemberAction
                      onClick={() => removeFromTeam(e.uuid, e.display_name)}
                    />
                  ) : null}
                  <Link
                    href={`/${companySlug}/organization/employees/${e.uuid}`}
                    className="ml-1 font-mono text-[10px] uppercase tracking-[0.15em] text-accent"
                  >
                    Profile
                  </Link>
                </RowActions>
              ),
            };
          })}
        />
      </div>

      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-medium text-text-primary">Projects</h2>
          <div className="flex items-center gap-3">
            {canCreateProject ? (
              <Button size="sm" onClick={() => setShowAddProject(true)}>
                Add project
              </Button>
            ) : null}
            <Link
              href={`/${companySlug}/organization/projects`}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent hover:text-accent/70"
            >
              All projects
            </Link>
          </div>
        </div>
        {projects.isLoading ? (
          <LoadingBlock className="h-32" />
        ) : teamProjects.length === 0 ? (
          <p className="border border-hairline px-4 py-6 text-sm text-text-secondary">
            No projects on this team yet. Add a project to attribute AI usage.
          </p>
        ) : (
          <DataTable
            columns={[
              { key: "name", label: "Project" },
              { key: "status", label: "Status" },
              { key: "action", label: "Actions", align: "right" },
            ]}
            rows={teamProjects.map((p) => ({
              name: (
                <span className="font-medium text-text-primary">
                  {p.project_name}
                </span>
              ),
              status: (
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/60">
                  {p.status}
                </span>
              ),
              action: (
                <Link
                  href={`/${companySlug}/organization/projects/${p.id}`}
                  className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent"
                >
                  Monitor
                </Link>
              ),
            }))}
          />
        )}
      </div>

      <Modal
        open={showAddMember}
        onClose={() => {
          setShowAddMember(false);
          setMemberUuid("");
        }}
        eyebrow="Team"
        title="Add member"
        description={`Pick someone already in the company, then add them to ${team?.team_name ?? "this team"}.`}
        size="sm"
        footer={
          <>
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
          </>
        }
      >
        <div>
          <Label htmlFor="team-dash-add-member">Employee</Label>
          <Select
            id="team-dash-add-member"
            value={memberUuid}
            onChange={(e) => setMemberUuid(e.target.value)}
          >
            <option value="">Select employee</option>
            {candidates.map((e) => (
              <option key={e.uuid} value={e.uuid}>
                {e.display_name}
                {e.team_name && e.team_name !== "—"
                  ? ` · ${e.team_name}`
                  : ""}
              </option>
            ))}
          </Select>
          {employees.isLoading ? (
            <p className="mt-2 text-xs text-text-secondary">Loading people…</p>
          ) : candidates.length === 0 ? (
            <p className="mt-2 text-xs text-text-secondary">
              No available people. Invite someone first, then add them here.
            </p>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        eyebrow="Invite"
        title="Invite person"
        description={`Invite into ${team?.team_name ?? "this team"} (department prefilled).`}
        size="lg"
      >
        <CreateEmployeeForm
          companySlug={companySlug}
          departments={departments.data ?? []}
          teams={allTeams.data ?? []}
          jobRoles={jobRoles.data ?? []}
          managers={employees.data ?? []}
          allowedRoles={inviteRoles}
          defaultDepartmentId={departmentId || undefined}
          defaultTeamId={teamId}
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
            await invalidateOrg();
            if (
              values.app_role !== ROLES.TEAM_LEAD &&
              values.app_role !== ROLES.DEPARTMENT_HEAD
            ) {
              setShowInvite(false);
            }
          }}
        />
      </Modal>

      <Modal
        open={showAddProject}
        onClose={() => setShowAddProject(false)}
        eyebrow="Projects"
        title="Add project"
        description={`Create a project on ${team?.team_name ?? "this team"}.`}
        size="lg"
      >
        <CreateProjectForm
          departments={departments.data ?? []}
          teams={allTeams.data ?? []}
          defaultDepartmentId={departmentId || undefined}
          defaultTeamId={teamId}
          onSubmit={async (values) => {
            await organizationApi.createProject(values);
            toast.success(`Created ${values.project_name}`);
            setShowAddProject(false);
            await invalidateOrg();
          }}
        />
      </Modal>
    </div>
  );
}
