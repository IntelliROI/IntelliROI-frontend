import { apiRequest, withQuery } from "@/lib/api/client";
import { LIST_DROPDOWN_PAGE_SIZE } from "@/lib/api/types";

export type TaskCategory = {
  id: number;
  name: string;
  description?: string;
  status?: string;
};

/**
 * Task benchmark — minutes saved per task category.
 * job_role_id has been removed; benchmarks are now task-category-level only.
 */
export type Benchmark = {
  id: number;
  task_category_id: number;
  estimated_minutes_saved: number;
  confidence_score: number;
  status: string;
  created_at?: string;
};

export type EmployeeCtcRecord = {
  id: number;
  ctc_annual: number;
  ctc_currency: string;
  hourly_cost: number;
  effective_from: string;
  effective_to: string | null;
};

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
    estimated_minutes_saved: number;
    confidence_score?: number;
  }): Promise<Benchmark> {
    const raw = await apiRequest<Record<string, unknown>>("bc", "/task-benchmarks", {
      method: "POST",
      body: {
        task_category_id: input.task_category_id,
        estimated_minutes_saved: input.estimated_minutes_saved,
        confidence_score: input.confidence_score ?? 50,
      },
    });
    return (
      toBenchmark(raw) ?? {
        id: 0,
        task_category_id: input.task_category_id,
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
        estimated_minutes_saved: 0,
        confidence_score: 0,
        status: "approved",
      }
    );
  },

  async rejectBenchmark(id: number, feedback?: string): Promise<Benchmark> {
    const raw = await apiRequest<Record<string, unknown>>(
      "bc",
      `/task-benchmarks/${id}/reject`,
      {
        method: "PATCH",
        body: feedback ? { feedback, rejection_reason: feedback } : undefined,
      },
    );
    return (
      toBenchmark(raw) ?? {
        id,
        task_category_id: 0,
        estimated_minutes_saved: 0,
        confidence_score: 0,
        status: "rejected",
      }
    );
  },

  async updateBenchmark(
    id: number,
    patch: { estimated_minutes_saved?: number; confidence_score?: number },
  ): Promise<Benchmark> {
    const raw = await apiRequest<Record<string, unknown>>(
      "bc",
      `/task-benchmarks/${id}`,
      { method: "PATCH", body: patch },
    );
    return (
      toBenchmark(raw) ?? {
        id,
        task_category_id: 0,
        estimated_minutes_saved: patch.estimated_minutes_saved ?? 0,
        confidence_score: patch.confidence_score ?? 0,
        status: "pending",
      }
    );
  },

  async archiveBenchmark(id: number): Promise<Benchmark> {
    const raw = await apiRequest<Record<string, unknown>>(
      "bc",
      `/task-benchmarks/${id}/archive`,
      { method: "PATCH" },
    );
    return (
      toBenchmark(raw) ?? {
        id,
        task_category_id: 0,
        estimated_minutes_saved: 0,
        confidence_score: 0,
        status: "archived",
      }
    );
  },

  /**
   * Assign or update CTC for an employee.
   * The backend computes hourly_cost = ctc_annual ÷ (hours_per_day × days_per_month × 12)
   * and stores a new employee_ctc_history row (closing the previous active row).
   */
  async assignEmployeeCtc(
    userUuid: string,
    input: {
      ctc_annual: number;
      ctc_currency?: string;
      effective_from?: string;
    },
  ): Promise<EmployeeCtcRecord> {
    const body: Record<string, unknown> = {
      ctc_annual: input.ctc_annual,
      ctc_currency: (input.ctc_currency ?? "USD").toUpperCase(),
    };
    if (input.effective_from) {
      body.effective_from = input.effective_from;
    }
    const raw = await apiRequest<Record<string, unknown>>(
      "bc",
      `/employees/${userUuid}/ctc`,
      { method: "POST", body },
    );
    return {
      id: Number(raw.id ?? 0),
      ctc_annual: Number(raw.ctc_annual ?? input.ctc_annual),
      ctc_currency: String(raw.ctc_currency ?? input.ctc_currency ?? "USD"),
      hourly_cost: Number(raw.hourly_cost ?? 0),
      effective_from: String(raw.effective_from ?? new Date().toISOString().slice(0, 10)),
      effective_to: raw.effective_to ? String(raw.effective_to) : null,
    };
  },

  /** Get full CTC history for an employee (most recent first). */
  async getEmployeeCtcHistory(userUuid: string): Promise<EmployeeCtcRecord[]> {
    const raw = await apiRequest<unknown>(
      "bc",
      withQuery(`/employees/${userUuid}/ctc-history`, { page_size: LIST_DROPDOWN_PAGE_SIZE }),
    );
    return asList<Record<string, unknown>>(raw).map((r) => ({
      id: Number(r.id),
      ctc_annual: Number(r.ctc_annual),
      ctc_currency: String(r.ctc_currency ?? "USD"),
      hourly_cost: Number(r.hourly_cost),
      effective_from: String(r.effective_from),
      effective_to: r.effective_to ? String(r.effective_to) : null,
    }));
  },
};
