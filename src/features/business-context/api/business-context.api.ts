import { apiRequest, getStoredCompany } from "@/lib/api/client";
import type { JobRole } from "@/features/organization/types";

export type Benchmark = {
  id: number;
  task_category: string;
  baseline_minutes: number;
  ai_assisted_minutes: number;
  status: string;
  proposed_by?: string;
};

export type { JobRole };
export type TaskCategory = { id: number; name: string };

export const businessContextApi = {
  async listJobRoles(): Promise<JobRole[]> {
    return apiRequest<JobRole[]>("bc", "/job-roles");
  },

  async createJobRole(input: {
    role_name: string;
    hourly_cost: number;
    currency?: string;
  }): Promise<JobRole> {
    const company = getStoredCompany();
    return apiRequest<JobRole>("bc", "/job-roles", {
      method: "POST",
      body: {
        ...input,
        currency: input.currency ?? "USD",
        ...(company?.id != null ? { company_id: company.id } : {}),
        ...(company?.uuid ? { company_uuid: company.uuid } : {}),
      },
    });
  },

  async listTaskCategories(): Promise<TaskCategory[]> {
    return apiRequest<TaskCategory[]>("bc", "/task-categories");
  },

  async createTaskCategory(input: { name: string }): Promise<TaskCategory> {
    return apiRequest<TaskCategory>("bc", "/task-categories", {
      method: "POST",
      body: input,
    });
  },

  async listBenchmarks(status = "pending"): Promise<Benchmark[]> {
    return apiRequest<Benchmark[]>("bc", `/task-benchmarks?status=${status}`);
  },

  async createBenchmark(input: {
    task_category_id: number;
    baseline_minutes: number;
    ai_assisted_minutes: number;
  }): Promise<Benchmark> {
    return apiRequest<Benchmark>("bc", "/task-benchmarks", {
      method: "POST",
      body: input,
    });
  },

  async approveBenchmark(id: number): Promise<Benchmark> {
    return apiRequest("bc", `/task-benchmarks/${id}/approve`, {
      method: "POST",
    });
  },

  async rejectBenchmark(id: number): Promise<Benchmark> {
    return apiRequest("bc", `/task-benchmarks/${id}/reject`, {
      method: "POST",
    });
  },
};
