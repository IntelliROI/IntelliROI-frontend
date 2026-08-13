import { apiRequest } from "@/lib/api/client";
import { authApi } from "@/features/auth/api/auth.api";
import type {
  CompanySettings,
  CreateDepartmentInput,
  CreateEmployeeInput,
  CreateJobRoleInput,
  CreateTeamInput,
  Department,
  Employee,
  JobRole,
  Project,
  Team,
  UpdateCompanySettingsInput,
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

async function createProject(input: {
  project_name: string;
  project_code?: string;
  department_id?: number;
  team_id?: number;
}): Promise<Project> {
  const res = await apiRequest<ProjectDto>("org", "/projects", {
    method: "POST",
    body: {
      project_name: input.project_name,
      department_id: input.department_id,
      team_id: input.team_id,
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
  const res = await apiRequest<JobRoleDto>("bc", "/job-roles", {
    method: "POST",
    body: {
      role_name: input.role_name,
      hourly_cost: input.hourly_cost,
      currency: input.currency ?? "USD",
    },
  });
  return toJobRole(res);
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
    listDepartments(),
    listTeams(),
    listJobRoles(),
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

async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  const { user } = await authApi.invite({
    email: input.email,
    first_name: input.first_name,
    last_name: input.last_name,
    role: input.app_role,
    employee_code: input.employee_code,
    phone: input.phone,
    designation: input.designation,
    department_id: input.department_id,
    team_id: input.team_id ?? undefined,
    manager_user_id: input.manager_employee_id ?? undefined,
    joining_date: input.joining_date,
  });

  if (input.job_role_id) {
    await assignEmployeeJobRole(user.uuid, input.job_role_id);
  }

  const maps = await loadOrgMaps();
  return toEmployee(
    {
      user: { ...user, department_id: input.department_id, team_id: input.team_id ?? null },
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
}

/* ── Company settings  ────── */

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

export const organizationApi = {
  getSettings,
  updateSettings,
  listJobRoles,
  createJobRole,
  listDepartments,
  getDepartment,
  createDepartment,
  listTeams,
  createTeam,
  addTeamMember,
  removeTeamMember,
  listProjects,
  createProject,
  addProjectMember,
  listEmployees,
  getEmployee,
  createEmployee,
  assignUser,
};
