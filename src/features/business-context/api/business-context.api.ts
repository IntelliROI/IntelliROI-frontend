import { apiRequest, getStoredCompany } from "@/lib/api/client";
import { DEFAULT_CURRENCY } from "@/constants/locale";
import type { JobRole } from "@/features/organization/types";

export type TaskCategory = {
  id: number;
  name: string;
  description?: string;
  status?: string;
};

export type Benchmark = {
  id: number;
  task_category_id: number;
  job_role_id: number;
  estimated_minutes_saved: number;
  confidence_score: number;
  status: string;
  created_at?: string;
};

export type { JobRole };

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
        currency: input.currency ?? DEFAULT_CURRENCY,
        ...(company?.id != null ? { company_id: company.id } : {}),
        ...(company?.uuid ? { company_uuid: company.uuid } : {}),
      },
    });
  },

  async listTaskCategories(): Promise<TaskCategory[]> {
    return apiRequest<TaskCategory[]>("bc", "/task-categories");
  },

  async createTaskCategory(input: {
    name: string;
    description?: string;
  }): Promise<TaskCategory> {
    return apiRequest<TaskCategory>("bc", "/task-categories", {
      method: "POST",
      body: input,
    });
  },

  async listBenchmarks(): Promise<Benchmark[]> {
    return apiRequest<Benchmark[]>("bc", "/task-benchmarks");
  },

  async createBenchmark(input: {
    task_category_id: number;
    job_role_id: number;
    estimated_minutes_saved: number;
    confidence_score?: number;
  }): Promise<Benchmark> {
    return apiRequest<Benchmark>("bc", "/task-benchmarks", {
      method: "POST",
      body: input,
    });
  },

  async approveBenchmark(id: number): Promise<Benchmark> {
    return apiRequest("bc", `/task-benchmarks/${id}/approve`, {
      method: "PATCH",
    });
  },

  async rejectBenchmark(id: number): Promise<Benchmark> {
    return apiRequest("bc", `/task-benchmarks/${id}/reject`, {
      method: "PATCH",
    });
  },
};
