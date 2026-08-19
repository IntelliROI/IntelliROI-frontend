import { apiRequest, withQuery } from "@/lib/api/client";
import { LIST_DROPDOWN_PAGE_SIZE } from "@/lib/api/types";
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
  async listTaskCategories(): Promise<TaskCategory[]> {
    return apiRequest<TaskCategory[]>(
      "bc",
      withQuery("/task-categories", { page_size: LIST_DROPDOWN_PAGE_SIZE }),
    );
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
    return apiRequest<Benchmark[]>(
      "bc",
      withQuery("/task-benchmarks", { page_size: LIST_DROPDOWN_PAGE_SIZE }),
    );
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

  async roleAssignments(
    userUuid: string,
  ): Promise<{ id: number; job_role_id: number; effective_from?: string }[]> {
    const raw = await apiRequest<
      { id: number; job_role_id: number; effective_from?: string }[]
    >(
      "bc",
      withQuery(`/employees/${userUuid}/role-assignments`, {
        page_size: LIST_DROPDOWN_PAGE_SIZE,
      }),
    );
    return Array.isArray(raw) ? raw : [];
  },
};
