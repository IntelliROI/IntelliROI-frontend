import { apiRequest, useMocks } from "@/lib/api/client";
import { ROLES } from "@/constants/roles";
import { delay } from "@/lib/mocks/data";
import {
  mockCompanySettings,
  mockDepartmentsStore,
  mockEmployeesStore,
  mockJobRoles,
  mockProjectsStore,
  mockTeamsStore,
  nextMockId,
  resolveDepartmentName,
  resolveJobRole,
  resolveTeamName,
} from "@/lib/mocks/org-store";
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

export const organizationApi = {
  /* ── Company settings (ROI working config) ───────────────── */
  async getSettings(): Promise<CompanySettings> {
    if (useMocks) return delay({ ...mockCompanySettings });
    return apiRequest<CompanySettings>("org", "/company-settings");
  },

  async updateSettings(
    input: UpdateCompanySettingsInput,
  ): Promise<CompanySettings> {
    if (useMocks) {
      Object.assign(mockCompanySettings, input);
      return delay({ ...mockCompanySettings });
    }
    return apiRequest("org", "/company-settings", {
      method: "PATCH",
      body: input,
    });
  },

  /* ── Job roles (config entity — hourly cost for Estimated ROI) ─ */
  async listJobRoles(): Promise<JobRole[]> {
    if (useMocks) return delay([...mockJobRoles]);
    return apiRequest<JobRole[]>("bc", "/job-roles");
  },

  async createJobRole(input: CreateJobRoleInput): Promise<JobRole> {
    if (useMocks) {
      const row: JobRole = {
        id: nextMockId(),
        company_id: 1,
        role_name: input.role_name,
        hourly_cost: input.hourly_cost,
        currency: input.currency ?? "USD",
        status: "active",
      };
      mockJobRoles.push(row);
      return delay(row);
    }
    return apiRequest<JobRole>("bc", "/job-roles", {
      method: "POST",
      body: input,
    });
  },

  /* ── Departments ─────────────────────────────────────────── */
  async listDepartments(): Promise<Department[]> {
    if (useMocks) return delay([...mockDepartmentsStore]);
    return apiRequest<Department[]>("org", "/departments");
  },

  async getDepartment(id: number): Promise<Department> {
    if (useMocks) {
      const found = mockDepartmentsStore.find((d) => d.id === id);
      if (!found) throw new Error("Department not found");
      return delay(found);
    }
    return apiRequest<Department>("org", `/departments/${id}`);
  },

  async createDepartment(input: CreateDepartmentInput): Promise<Department> {
    if (useMocks) {
      const row: Department = {
        id: nextMockId(),
        company_id: 1,
        department_name: input.department_name,
        department_code: input.department_code.toUpperCase(),
        description: input.description,
        manager_employee_id: input.manager_employee_id ?? null,
        status: input.status ?? "active",
        employee_count: 0,
        monthly_spend: 0,
        roi_pct: 0,
        budget_limit: 5000,
      };
      mockDepartmentsStore.push(row);
      return delay(row);
    }
    return apiRequest("org", "/departments", { method: "POST", body: input });
  },

  /* ── Teams ───────────────────────────────────────────────── */
  async listTeams(departmentId?: number): Promise<Team[]> {
    if (useMocks) {
      const rows = departmentId
        ? mockTeamsStore.filter((t) => t.department_id === departmentId)
        : mockTeamsStore;
      return delay([...rows]);
    }
    const qs = departmentId ? `?department_id=${departmentId}` : "";
    return apiRequest<Team[]>("org", `/teams${qs}`);
  },

  async createTeam(input: CreateTeamInput): Promise<Team> {
    if (useMocks) {
      const row: Team = {
        id: nextMockId(),
        company_id: 1,
        department_id: input.department_id,
        team_name: input.team_name,
        team_code: input.team_code.toUpperCase(),
        description: input.description,
        team_lead_employee_id: input.team_lead_employee_id ?? null,
        status: input.status ?? "active",
        member_count: 0,
        monthly_spend: 0,
        roi_pct: 0,
      };
      mockTeamsStore.push(row);
      return delay(row);
    }
    return apiRequest("org", "/teams", { method: "POST", body: input });
  },

  async addTeamMember(teamId: number, userUuid: string): Promise<void> {
    if (useMocks) return delay(undefined);
    await apiRequest("org", `/teams/${teamId}/members`, {
      method: "POST",
      body: { user_uuid: userUuid },
    });
  },

  async removeTeamMember(teamId: number, userUuid: string): Promise<void> {
    if (useMocks) return delay(undefined);
    await apiRequest("org", `/teams/${teamId}/members/${userUuid}`, {
      method: "DELETE",
    });
  },

  /* ── Projects ────────────────────────────────────────────── */
  async listProjects(): Promise<Project[]> {
    if (useMocks) return delay([...mockProjectsStore]);
    return apiRequest<Project[]>("org", "/projects");
  },

  async createProject(input: {
    project_name: string;
    project_code?: string;
    department_id?: number;
    team_id?: number;
  }): Promise<Project> {
    if (useMocks) {
      const row: Project = {
        id: nextMockId(),
        company_id: 1,
        project_name: input.project_name,
        project_code: input.project_code,
        department_id: input.department_id ?? 1,
        team_id: input.team_id ?? null,
        status: "active",
      };
      mockProjectsStore.push(row);
      return delay(row);
    }
    return apiRequest("org", "/projects", { method: "POST", body: input });
  },

  /* ── Employees (org identity — not just auth invite) ─────── */
  async listEmployees(): Promise<Employee[]> {
    if (useMocks) return delay([...mockEmployeesStore]);
    return apiRequest<Employee[]>("org", "/employees");
  },

  async getEmployee(uuid: string): Promise<Employee> {
    if (useMocks) {
      const found = mockEmployeesStore.find((e) => e.uuid === uuid);
      if (!found) throw new Error("Employee not found");
      return delay(found);
    }
    return apiRequest<Employee>("org", `/employees/${uuid}`);
  },

  async createEmployee(input: CreateEmployeeInput): Promise<Employee> {
    if (useMocks) {
      const role = resolveJobRole(input.job_role_id);
      if (!role) throw new Error("Job role not found — create job roles first");
      const dept = mockDepartmentsStore.find((d) => d.id === input.department_id);
      if (!dept) throw new Error("Department not found");
      if (input.team_id) {
        const team = mockTeamsStore.find((t) => t.id === input.team_id);
        if (!team) throw new Error("Team not found");
        if (team.department_id !== input.department_id) {
          throw new Error("Team must belong to the selected department");
        }
      }
      const id = nextMockId();
      const row: Employee = {
        id,
        uuid: `emp-${id}`,
        company_id: 1,
        user_id: null,
        employee_code: input.employee_code,
        first_name: input.first_name,
        last_name: input.last_name,
        display_name:
          input.display_name ||
          `${input.first_name} ${input.last_name}`.trim(),
        email: input.email,
        phone: input.phone,
        department_id: input.department_id,
        team_id: input.team_id ?? null,
        job_role_id: input.job_role_id,
        manager_employee_id: input.manager_employee_id ?? null,
        designation: input.designation,
        joining_date: input.joining_date,
        employment_status: input.employment_status ?? "active",
        app_role: input.app_role ?? ROLES.EMPLOYEE,
        status: "invited",
        department_name: resolveDepartmentName(input.department_id),
        team_name: resolveTeamName(input.team_id),
        job_role_name: role.role_name,
        hourly_cost: role.hourly_cost,
        spend: 0,
        roi_pct: 0,
        requests: 0,
      };
      mockEmployeesStore.push(row);
      dept.employee_count += 1;
      return delay(row);
    }
    return apiRequest<Employee>("org", "/employees", {
      method: "POST",
      body: input,
    });
  },

  async assignUser(
    userUuid: string,
    input: { department_id?: number; team_id?: number },
  ): Promise<void> {
    if (useMocks) return delay(undefined);
    await apiRequest("org", `/users/${userUuid}/assignment`, {
      method: "PATCH",
      body: input,
    });
  },
};
