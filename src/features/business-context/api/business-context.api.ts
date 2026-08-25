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

function asList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)) {
    return (raw as { data: T[] }).data;
  }
  return [];
}

function toCategory(raw: Record<string, unknown>): TaskCategory | null {
  const id = Number(raw.id);
  if (!Number.isFinite(id) || id <= 0) return null;
  const name = String(raw.name ?? raw.category_name ?? raw.title ?? `Category ${id}`);
  return {
    id,
    name,
    description: raw.description ? String(raw.description) : undefined,
    status: raw.status ? String(raw.status) : undefined,
  };
}

function toBenchmark(raw: Record<string, unknown>): Benchmark | null {
  const id = Number(raw.id);
  if (!Number.isFinite(id) || id <= 0) return null;
  return {
    id,
    task_category_id: Number(raw.task_category_id ?? 0),
    job_role_id: Number(raw.job_role_id ?? 0),
    estimated_minutes_saved: Number(raw.estimated_minutes_saved ?? 0),
    confidence_score: Number(raw.confidence_score ?? 0),
    status: String(raw.status ?? "pending"),
    created_at: raw.created_at ? String(raw.created_at) : undefined,
  };
}

export const businessContextApi = {
  async listTaskCategories(): Promise<TaskCategory[]> {
    const raw = await apiRequest<unknown>(
      "bc",
      withQuery("/task-categories", { page_size: LIST_DROPDOWN_PAGE_SIZE }),
    );
    return asList<Record<string, unknown>>(raw)
      .map(toCategory)
      .filter((c): c is TaskCategory => c != null);
  },

  async createTaskCategory(input: {
    name: string;
    description?: string;
  }): Promise<TaskCategory> {
    const raw = await apiRequest<Record<string, unknown>>("bc", "/task-categories", {
      method: "POST",
      body: input,
    });
    return toCategory(raw) ?? { id: 0, name: input.name };
  },

  async listBenchmarks(): Promise<Benchmark[]> {
    const raw = await apiRequest<unknown>(
      "bc",
      withQuery("/task-benchmarks", { page_size: LIST_DROPDOWN_PAGE_SIZE }),
    );
    return asList<Record<string, unknown>>(raw)
      .map(toBenchmark)
      .filter((b): b is Benchmark => b != null);
  },

  async createBenchmark(input: {
    task_category_id: number;
    job_role_id: number;
    estimated_minutes_saved: number;
    confidence_score?: number;
  }): Promise<Benchmark> {
    const raw = await apiRequest<Record<string, unknown>>("bc", "/task-benchmarks", {
      method: "POST",
      body: {
        task_category_id: input.task_category_id,
        job_role_id: input.job_role_id,
        estimated_minutes_saved: input.estimated_minutes_saved,
        confidence_score: input.confidence_score ?? 50,
      },
    });
    return (
      toBenchmark(raw) ?? {
        id: 0,
        task_category_id: input.task_category_id,
        job_role_id: input.job_role_id,
        estimated_minutes_saved: input.estimated_minutes_saved,
        confidence_score: input.confidence_score ?? 50,
        status: "pending",
      }
    );
  },

  async approveBenchmark(id: number): Promise<Benchmark> {
    const raw = await apiRequest<Record<string, unknown>>(
      "bc",
      `/task-benchmarks/${id}/approve`,
      { method: "PATCH" },
    );
    return (
      toBenchmark(raw) ?? {
        id,
        task_category_id: 0,
        job_role_id: 0,
        estimated_minutes_saved: 0,
        confidence_score: 0,
        status: "approved",
      }
    );
  },

  async rejectBenchmark(id: number): Promise<Benchmark> {
    const raw = await apiRequest<Record<string, unknown>>(
      "bc",
      `/task-benchmarks/${id}/reject`,
      { method: "PATCH" },
    );
    return (
      toBenchmark(raw) ?? {
        id,
        task_category_id: 0,
        job_role_id: 0,
        estimated_minutes_saved: 0,
        confidence_score: 0,
        status: "rejected",
      }
    );
  },

  async roleAssignments(
    userUuid: string,
  ): Promise<{ id: number; job_role_id: number; effective_from?: string }[]> {
    const raw = await apiRequest<unknown>(
      "bc",
      withQuery(`/employees/${userUuid}/role-assignments`, {
        page_size: LIST_DROPDOWN_PAGE_SIZE,
      }),
    );
    return asList<Record<string, unknown>>(raw)
      .map((r) => ({
        id: Number(r.id),
        job_role_id: Number(r.job_role_id),
        effective_from: r.effective_from ? String(r.effective_from) : undefined,
      }))
      .filter((r) => Number.isFinite(r.id) && r.id > 0);
  },
};
