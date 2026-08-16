import { apiRequest, getStoredCompany, ApiError } from "@/lib/api/client";
import { DEFAULT_CURRENCY } from "@/constants/locale";
import { authApi } from "@/features/auth/api/auth.api";
import type {
  CompanySettings,
  CreateDepartmentInput,
  CreateEmployeeInput,
  CreateJobRoleInput,
  CreateProjectInput,
  CreateTeamInput,
  Department,
  Employee,
  JobRole,
  Project,
  Team,
  UpdateCompanySettingsInput,
  UpdateDepartmentInput,
  UpdateEmployeeOrgInput,
  UpdateJobRoleInput,
  UpdateTeamInput,
} from "@/features/organization/types";

export type {
  CompanySettings,
  Department,
  Employee,
  JobRole,
  Project,
  Team,
} from "@/features/organization/types";

type DepartmentDto = {
  id: number;
  department_name: string;
  department_code?: string;
  description?: string;
  manager_id?: number | null;
  status: string;
  created_at: string;
};

type TeamDto = {
  id: number;
  department_id: number;
  team_name: string;
  team_code?: string;
  description?: string;
  lead_id?: number | null;
  status: string;
  created_at: string;
};

type ProjectDto = {
  id: number;
  project_name: string;
  description?: string;
  department_id?: number | null;
  team_id?: number | null;
  status: string;
  created_at: string;
};

type JobRoleDto = {
  id: number;
  role_name: string;
  description?: string;
  hourly_cost: number;
  currency: string;
  working_hours_per_day: number;
  working_days_per_month: number;
  status: string;
  created_at: string;
  updated_at: string;
};



function toDepartment(d: DepartmentDto): Department {
  return {
    id: d.id,
    department_name: d.department_name,
    department_code: d.department_code ?? "",
    description: d.description,
    manager_employee_id: d.manager_id ?? null,
    status: d.status === "archived" ? "inactive" : "active",
    created_at: d.created_at,
    employee_count: 0,
    monthly_spend: 0,
    roi_pct: 0,
    budget_limit: 0,
  };
}

function toTeam(t: TeamDto): Team {
  return {
    id: t.id,
    department_id: t.department_id,
    team_name: t.team_name,
    team_code: t.team_code ?? "",
    description: t.description,
    team_lead_employee_id: t.lead_id ?? null,
    status: t.status === "archived" ? "inactive" : "active",
    created_at: t.created_at,
    member_count: 0,
    monthly_spend: 0,
    roi_pct: 0,
  };
}

function toProject(p: ProjectDto): Project {
  return {
    id: p.id,
    department_id: p.department_id ?? 0,
    team_id: p.team_id ?? null,
    project_name: p.project_name,
    description: p.description,
    status: (p.status as Project["status"]) ?? "active",
    created_at: p.created_at,
  };
}

function toJobRole(r: JobRoleDto): JobRole {
  return {
    id: r.id,
    role_name: r.role_name,
    hourly_cost: r.hourly_cost,
    currency: r.currency,
    status: r.status === "archived" ? "inactive" : "active",
  };
}

function toApiStatus(status?: string): "active" | "archived" | undefined {
  if (!status) return undefined;
  return status === "inactive" || status === "archived" ? "archived" : "active";
}

/* ── Departments (organization-service) ─────────────────────── */

async function listDepartments(): Promise<Department[]> {
  const res = await apiRequest<DepartmentDto[]>("org", "/departments");
  return res.map(toDepartment);
}

async function getDepartment(id: number): Promise<Department> {
  const res = await apiRequest<DepartmentDto>("org", `/departments/${id}`);
  return toDepartment(res);
}

async function createDepartment(input: CreateDepartmentInput): Promise<Department> {
  const managerUserUuid = input.manager_employee_id
    ? await getUserUuid(input.manager_employee_id)
    : undefined;
  const res = await apiRequest<DepartmentDto>("org", "/departments", {
    method: "POST",
    body: {
      department_name: input.department_name,
      department_code: input.department_code,
      description: input.description,
      manager_user_uuid: managerUserUuid,
    },
  });
  return toDepartment(res);
}

async function updateDepartment(
  id: number,
  input: UpdateDepartmentInput,
): Promise<Department> {
  const hadManager = Object.prototype.hasOwnProperty.call(
    input,
    "manager_employee_id",
  );
  const managerUserUuid = input.manager_employee_id
    ? await getUserUuid(input.manager_employee_id)
    : undefined;
  const res = await apiRequest<DepartmentDto>("org", `/departments/${id}`, {
    method: "PATCH",
    body: {
      ...(input.department_name != null
        ? { department_name: input.department_name }
        : {}),
      ...(input.department_code != null
        ? { department_code: input.department_code }
        : {}),
      ...(input.description != null ? { description: input.description } : {}),
      ...(hadManager && !input.manager_employee_id
        ? { clear_manager_user_uuid: true }
        : {}),
      ...(managerUserUuid ? { manager_user_uuid: managerUserUuid } : {}),
      ...(input.status ? { status: toApiStatus(input.status) } : {}),
    },
  });
  return toDepartment(res);
}

async function archiveDepartment(
  id: number,
  restore = false,
): Promise<Department> {
  return updateDepartment(id, { status: restore ? "active" : "inactive" });
}

/* ── Teams (organization-service) ────────────────────────────── */

async function listTeams(departmentId?: number): Promise<Team[]> {
  const qs = departmentId ? `?department_id=${departmentId}` : "";
  const res = await apiRequest<TeamDto[]>("org", `/teams${qs}`);
  return res.map(toTeam);
}

async function createTeam(input: CreateTeamInput): Promise<Team> {
  const leadUserUuid = input.team_lead_employee_id
    ? await getUserUuid(input.team_lead_employee_id)
    : undefined;
  const res = await apiRequest<TeamDto>("org", "/teams", {
    method: "POST",
    body: {
      department_id: input.department_id,
      team_name: input.team_name,
      team_code: input.team_code,
      description: input.description,
      lead_user_uuid: leadUserUuid,
    },
  });
  return toTeam(res);
}

async function updateTeam(id: number, input: UpdateTeamInput): Promise<Team> {
  const hadLead = Object.prototype.hasOwnProperty.call(
    input,
    "team_lead_employee_id",
  );
  const leadUserUuid = input.team_lead_employee_id
    ? await getUserUuid(input.team_lead_employee_id)
    : undefined;
  const res = await apiRequest<TeamDto>("org", `/teams/${id}`, {
    method: "PATCH",
    body: {
      ...(input.team_name != null ? { team_name: input.team_name } : {}),
      ...(input.team_code != null ? { team_code: input.team_code } : {}),
      ...(input.description != null ? { description: input.description } : {}),
      ...(hadLead && !input.team_lead_employee_id
        ? { clear_lead_user_uuid: true }
        : {}),
      ...(leadUserUuid ? { lead_user_uuid: leadUserUuid } : {}),
      ...(input.status ? { status: toApiStatus(input.status) } : {}),
    },
  });
  return toTeam(res);
}

async function archiveTeam(id: number, restore = false): Promise<Team> {
  return updateTeam(id, { status: restore ? "active" : "inactive" });
}

async function addTeamMember(teamId: number, userUuid: string): Promise<void> {
  await apiRequest("org", `/teams/${teamId}/members`, {
    method: "POST",
    body: { user_uuid: userUuid },
  });
}

async function removeTeamMember(teamId: number, userUuid: string): Promise<void> {
  await apiRequest("org", `/teams/${teamId}/members/${userUuid}`, {
    method: "DELETE",
  });
}

/* ── Projects (organization-service) ─────────────────────────── */

async function listProjects(): Promise<Project[]> {
  const res = await apiRequest<ProjectDto[]>("org", "/projects");
  return res.map(toProject);
}

async function createProject(input: CreateProjectInput): Promise<Project> {
  const res = await apiRequest<ProjectDto>("org", "/projects", {
    method: "POST",
    body: {
      project_name: input.project_name,
      description: input.description,
      department_id: input.department_id ?? undefined,
      team_id: input.team_id ?? undefined,
    },
  });
  return toProject(res);
}

async function addProjectMember(
  projectId: number,
  userUuid: string,
  roleInProject?: string,
): Promise<void> {
  await apiRequest("org", `/projects/${projectId}/members`, {
    method: "POST",
    body: { user_uuid: userUuid, role_in_project: roleInProject },
  });
}

async function assignUser(
  userUuid: string,
  input: { department_id?: number | null; team_id?: number | null },
): Promise<void> {
  await apiRequest("org", `/users/${userUuid}/assignment`, {
    method: "PATCH",
    body: input,
  });
}

/* ── Job roles (business-context-service — config entity) ──────── */

async function listJobRoles(): Promise<JobRole[]> {
  const res = await apiRequest<JobRoleDto[]>("bc", "/job-roles");
  return res.map(toJobRole);
}

async function createJobRole(input: CreateJobRoleInput): Promise<JobRole> {
  const company = getStoredCompany();
  const company_id = input.company_id ?? company?.id;
  const company_uuid = input.company_uuid ?? company?.uuid;
  const res = await apiRequest<JobRoleDto>("bc", "/job-roles", {
    method: "POST",
    body: {
      role_name: input.role_name,
      hourly_cost: input.hourly_cost,
      currency: input.currency ?? DEFAULT_CURRENCY,
      ...(company_id != null ? { company_id } : {}),
      ...(company_uuid ? { company_uuid } : {}),
    },
  });
  return toJobRole(res);
}

async function updateJobRole(
  id: number,
  input: UpdateJobRoleInput,
): Promise<JobRole> {
  const res = await apiRequest<JobRoleDto>("bc", `/job-roles/${id}`, {
    method: "PATCH",
    body: {
      ...(input.role_name != null ? { role_name: input.role_name } : {}),
      ...(input.hourly_cost != null ? { hourly_cost: input.hourly_cost } : {}),
      ...(input.currency != null ? { currency: input.currency } : {}),
      ...(input.status ? { status: toApiStatus(input.status) } : {}),
    },
  });
  return toJobRole(res);
}

async function archiveJobRole(id: number, restore = false): Promise<JobRole> {
  return updateJobRole(id, { status: restore ? "active" : "inactive" });
}

async function assignEmployeeJobRole(
  userUuid: string,
  jobRoleId: number,
): Promise<void> {
  await apiRequest("bc", `/employees/${userUuid}/role-assignment`, {
    method: "POST",
    body: { job_role_id: jobRoleId },
  });
}

/* ── Employees — ── */

async function getUserUuid(id: number): Promise<string | undefined> {
  const employees = await authApi.listEmployees();
  return employees.find((e) => e.user.id === id)?.user.uuid;
}

async function loadOrgMaps() {
  const [departments, teams, jobRoles] = await Promise.all([
    listDepartments().catch(() => [] as Department[]),
    listTeams().catch(() => [] as Team[]),
    listJobRoles().catch(() => [] as JobRole[]),
  ]);
  return {
    deptName: new Map(departments.map((d) => [d.id, d.department_name])),
    teamName: new Map(teams.map((t) => [t.id, t.team_name])),
    jobRoleById: new Map(jobRoles.map((r) => [r.id, r])),
  };
}

function toEmployee(
  profile: Awaited<ReturnType<typeof authApi.listEmployees>>[number],
  maps: {
    deptName: Map<number, string>;
    teamName: Map<number, string>;
    jobRoleById: Map<number, JobRole>;
  },
): Employee {
  const { user, job_role } = profile;
  const jobRole = job_role
    ? maps.jobRoleById.get(job_role.job_role_id) ?? {
        id: job_role.job_role_id,
        role_name: job_role.role_name,
        hourly_cost: job_role.hourly_cost,
        currency: job_role.currency,
        status: "active" as const,
      }
    : undefined;
  const departmentId = user.department_id ?? 0;
  const teamId = user.team_id ?? null;
  return {
    id: user.id ?? 0,
    uuid: user.uuid,
    user_id: user.uuid,
    employee_code: user.employee_code ?? "",
    first_name: user.first_name,
    last_name: user.last_name,
    display_name: `${user.first_name} ${user.last_name}`.trim(),
    email: user.email,
    phone: user.phone,
    department_id: departmentId,
    team_id: teamId,
    job_role_id: jobRole?.id ?? 0,
    manager_employee_id: user.manager_user_id ?? null,
    designation: user.designation,
    joining_date: user.joining_date,
    employment_status:
      user.status === "suspended" || user.status === "deactivated"
        ? "inactive"
        : "active",
    app_role: user.role,
    status: user.status === "invited" ? "invited" : "active",
    department_name: maps.deptName.get(departmentId) ?? "—",
    team_name: teamId != null ? (maps.teamName.get(teamId) ?? "—") : "—",
    job_role_name: jobRole?.role_name ?? "—",
    hourly_cost: jobRole?.hourly_cost ?? 0,
    currency: jobRole?.currency ?? DEFAULT_CURRENCY,
    spend: 0,
    roi_pct: 0,
    requests: 0,
  };
}

async function listEmployees(): Promise<Employee[]> {
  const [profiles, maps] = await Promise.all([
    authApi.listEmployees(),
    loadOrgMaps(),
  ]);
  return profiles.map((p) => toEmployee(p, maps));
}

async function getEmployee(uuid: string): Promise<Employee> {
  const [profile, maps] = await Promise.all([
    authApi.getEmployee(uuid),
    loadOrgMaps(),
  ]);
  return toEmployee(profile, maps);
}

async function createEmployee(
  input: CreateEmployeeInput,
): Promise<{
  employee: Employee;
  emailSent: boolean;
  inviteUrl?: string;
  warnings: string[];
}> {
  const { user, emailSent, inviteUrl } = await authApi.invite({
    email: input.email,
    first_name: input.first_name,
    last_name: input.last_name,
    role: input.app_role,
    employee_code: input.employee_code || undefined,
    phone: input.phone,
    designation: input.designation,
    department_id: input.department_id || undefined,
    team_id: input.team_id || undefined,
    manager_user_id: input.manager_employee_id || undefined,
    joining_date: input.joining_date,
  });

  const warnings: string[] = [];
  const departmentId = input.department_id || undefined;
  const teamId = input.team_id || undefined;

  if (user.uuid && (departmentId || teamId != null)) {
    try {
      await assignUser(user.uuid, {
        department_id: departmentId ?? null,
        team_id: teamId ?? null,
      });
    } catch (err) {
      warnings.push(
        err instanceof Error
          ? `Org assignment: ${err.message}`
          : "Org assignment failed",
      );
    }
  }

  if (user.uuid && teamId) {
    try {
      await addTeamMember(teamId, user.uuid);
    } catch (err) {
      const alreadyMember =
        err instanceof ApiError && (err.status === 409 || err.status === 422);
      if (!alreadyMember) {
        warnings.push(
          err instanceof Error
            ? `Team membership: ${err.message}`
            : "Could not add team member",
        );
      }
    }
  }

  if (input.job_role_id) {
    try {
      await assignEmployeeJobRole(user.uuid, input.job_role_id);
    } catch (err) {
      warnings.push(
        err instanceof Error
          ? `Job role: ${err.message}`
          : "Job role could not be assigned",
      );
    }
  }

  const maps = await loadOrgMaps();
  const employee = toEmployee(
    {
      user: {
        ...user,
        department_id: input.department_id || user.department_id || null,
        team_id: input.team_id ?? user.team_id ?? null,
      },
      job_role: input.job_role_id
        ? maps.jobRoleById.get(input.job_role_id) && {
            job_role_id: input.job_role_id,
            role_name: maps.jobRoleById.get(input.job_role_id)!.role_name,
            hourly_cost: maps.jobRoleById.get(input.job_role_id)!.hourly_cost,
            currency: maps.jobRoleById.get(input.job_role_id)!.currency,
          }
        : undefined,
    },
    maps,
  );
  return { employee, emailSent, inviteUrl, warnings };
}

async function updateEmployee(
  uuid: string,
  input: UpdateEmployeeOrgInput,
): Promise<{ employee: Employee; warnings: string[] }> {
  const warnings: string[] = [];

  await authApi.updateEmployee(uuid, {
    employee_code: input.employee_code,
    phone: input.phone ?? null,
    designation: input.designation,
    manager_user_id: input.manager_employee_id ?? null,
    clear_manager_user_id: input.manager_employee_id == null,
    joining_date: input.joining_date || null,
    clear_joining_date: !input.joining_date,
  });

  try {
    await assignUser(uuid, {
      department_id: input.department_id ?? null,
      team_id: input.team_id ?? null,
    });
  } catch (err) {
    warnings.push(
      err instanceof Error
        ? `Org assignment: ${err.message}`
        : "Org assignment failed",
    );
  }

  const nextTeam = input.team_id ?? null;
  const prevTeam = input.previous_team_id ?? null;
  if (nextTeam && nextTeam !== prevTeam) {
    try {
      await addTeamMember(nextTeam, uuid);
    } catch (err) {
      const alreadyMember =
        err instanceof ApiError && (err.status === 409 || err.status === 422);
      if (!alreadyMember) {
        warnings.push(
          err instanceof Error
            ? `Team membership: ${err.message}`
            : "Could not add team member",
        );
      }
    }
  }
  if (prevTeam && prevTeam !== nextTeam) {
    try {
      await removeTeamMember(prevTeam, uuid);
    } catch (err) {
      warnings.push(
        err instanceof Error
          ? `Remove from previous team: ${err.message}`
          : "Could not leave previous team",
      );
    }
  }

  if (input.job_role_id) {
    try {
      await assignEmployeeJobRole(uuid, input.job_role_id);
    } catch (err) {
      warnings.push(
        err instanceof Error
          ? `Job role: ${err.message}`
          : "Job role could not be assigned",
      );
    }
  }

  const employee = await getEmployee(uuid);
  return { employee, warnings };
}

async function getSettings(): Promise<CompanySettings> {
  const s = await authApi.getCompanySettings();
  return {
    working_hours_per_day: s.working_hours_per_day,
    working_days_per_month: s.working_days_per_month,
    default_currency: s.currency,
    timezone: s.timezone,
    date_format: s.date_format,
    fiscal_year_start: s.fiscal_year_start,
  };
}

async function updateSettings(
  input: UpdateCompanySettingsInput,
): Promise<CompanySettings> {
  const s = await authApi.updateCompanySettings({
    working_hours_per_day: input.working_hours_per_day,
    working_days_per_month: input.working_days_per_month,
    currency: input.default_currency,
    timezone: input.timezone,
    date_format: input.date_format,
    fiscal_year_start: input.fiscal_year_start,
  });
  return {
    working_hours_per_day: s.working_hours_per_day,
    working_days_per_month: s.working_days_per_month,
    default_currency: s.currency,
    timezone: s.timezone,
    date_format: s.date_format,
    fiscal_year_start: s.fiscal_year_start,
  };
}

async function resendInvite(email: string) {
  return authApi.resendInvite(email);
}

export const organizationApi = {
  getSettings,
  updateSettings,
  listJobRoles,
  createJobRole,
  updateJobRole,
  archiveJobRole,
  assignEmployeeJobRole,
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  archiveDepartment,
  listTeams,
  createTeam,
  updateTeam,
  archiveTeam,
  addTeamMember,
  removeTeamMember,
  listProjects,
  createProject,
  addProjectMember,
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  resendInvite,
  assignUser,
};
