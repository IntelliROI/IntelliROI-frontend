import { apiRequest, useMocks } from "@/lib/api/client";
import {
  delay,
  mockDepartments,
  mockEmployees,
  mockProjects,
  mockTeams,
} from "@/lib/mocks/data";

export type Department = (typeof mockDepartments)[number];
export type Team = (typeof mockTeams)[number];
export type Project = (typeof mockProjects)[number];

export const organizationApi = {
  async listDepartments(): Promise<Department[]> {
    if (useMocks) return delay(mockDepartments);
    return apiRequest<Department[]>("org", "/departments");
  },

  async getDepartment(id: number): Promise<Department> {
    if (useMocks) {
      const found = mockDepartments.find((d) => d.id === id);
      if (!found) throw new Error("Department not found");
      return delay(found);
    }
    return apiRequest<Department>("org", `/departments/${id}`);
  },

  async createDepartment(input: {
    department_name: string;
    manager_user_uuid?: string | null;
  }): Promise<Department> {
    if (useMocks) {
      return delay({
        id: Date.now(),
        department_name: input.department_name,
        manager_user_uuid: input.manager_user_uuid ?? null,
        employee_count: 0,
        monthly_spend: 0,
        roi_pct: 0,
        budget_limit: 5000,
      });
    }
    return apiRequest("org", "/departments", { method: "POST", body: input });
  },

  async listTeams(departmentId?: number): Promise<Team[]> {
    if (useMocks) {
      const rows = departmentId
        ? mockTeams.filter((t) => t.department_id === departmentId)
        : mockTeams;
      return delay(rows);
    }
    const qs = departmentId ? `?department_id=${departmentId}` : "";
    return apiRequest<Team[]>("org", `/teams${qs}`);
  },

  async createTeam(input: {
    team_name: string;
    department_id: number;
    lead_user_uuid?: string | null;
  }): Promise<Team> {
    if (useMocks) {
      return delay({
        id: Date.now(),
        team_name: input.team_name,
        department_id: input.department_id,
        lead_user_uuid: input.lead_user_uuid ?? null,
        member_count: 0,
        monthly_spend: 0,
        roi_pct: 0,
      });
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

  async listProjects(): Promise<Project[]> {
    if (useMocks) return delay(mockProjects);
    return apiRequest<Project[]>("org", "/projects");
  },

  async createProject(input: {
    project_name: string;
    department_id?: number;
    team_id?: number;
  }): Promise<Project> {
    if (useMocks) {
      return delay({
        id: Date.now(),
        project_name: input.project_name,
        department_id: input.department_id ?? 1,
        team_id: input.team_id ?? 1,
        status: "active",
      });
    }
    return apiRequest("org", "/projects", { method: "POST", body: input });
  },

  async listEmployees(): Promise<(typeof mockEmployees)[number][]> {
    if (useMocks) return delay(mockEmployees);
    return apiRequest<(typeof mockEmployees)[number][]>("org", "/users");
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
