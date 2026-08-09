import { apiRequest, useMocks } from "@/lib/api/client";
import { delay, mockBenchmarks } from "@/lib/mocks/data";
import { mockJobRoles, nextMockId } from "@/lib/mocks/org-store";
import type { JobRole } from "@/features/organization/types";

export type Benchmark = (typeof mockBenchmarks)[number];

export type { JobRole };
export type TaskCategory = { id: number; name: string };

export const businessContextApi = {
  async listJobRoles(): Promise<JobRole[]> {
    if (useMocks) return delay([...mockJobRoles]);
    return apiRequest<JobRole[]>("bc", "/job-roles");
  },

  async createJobRole(input: {
    role_name: string;
    hourly_cost: number;
  }): Promise<JobRole> {
    if (useMocks) {
      const row: JobRole = {
        id: nextMockId(),
        company_id: 1,
        role_name: input.role_name,
        hourly_cost: input.hourly_cost,
        currency: "USD",
        status: "active",
      };
      mockJobRoles.push(row);
      return delay(row);
    }
    return apiRequest<JobRole>("bc", "/job-roles", { method: "POST", body: input });
  },

  async listTaskCategories(): Promise<TaskCategory[]> {
    if (useMocks) {
      return delay([
        { id: 1, name: "Code Generation" },
        { id: 2, name: "Documentation" },
        { id: 3, name: "Testing" },
        { id: 4, name: "Customer Email" },
        { id: 5, name: "Debugging" },
        { id: 6, name: "Research" },
      ]);
    }
    return apiRequest<TaskCategory[]>("bc", "/task-categories");
  },

  async createTaskCategory(input: { name: string }): Promise<TaskCategory> {
    if (useMocks) return delay({ id: Date.now(), ...input });
    return apiRequest<TaskCategory>("bc", "/task-categories", {
      method: "POST",
      body: input,
    });
  },

  async listBenchmarks(status = "pending"): Promise<Benchmark[]> {
    if (useMocks) {
      return delay(
        status === "all"
          ? mockBenchmarks
          : mockBenchmarks.filter((b) => b.status === status),
      );
    }
    return apiRequest<Benchmark[]>("bc", `/task-benchmarks?status=${status}`);
  },

  async createBenchmark(input: {
    task_category_id: number;
    baseline_minutes: number;
    ai_assisted_minutes: number;
  }): Promise<Benchmark> {
    if (useMocks) {
      return delay({
        id: Date.now(),
        task_category: "Custom",
        baseline_minutes: input.baseline_minutes,
        ai_assisted_minutes: input.ai_assisted_minutes,
        status: "pending",
        proposed_by: "You",
      });
    }
    return apiRequest<Benchmark>("bc", "/task-benchmarks", {
      method: "POST",
      body: input,
    });
  },

  async approveBenchmark(id: number): Promise<Benchmark> {
    if (useMocks) {
      const found = mockBenchmarks.find((b) => b.id === id);
      if (!found) throw new Error("Not found");
      return delay({ ...found, status: "approved" });
    }
    return apiRequest("bc", `/task-benchmarks/${id}/approve`, {
      method: "POST",
    });
  },

  async rejectBenchmark(id: number): Promise<Benchmark> {
    if (useMocks) {
      const found = mockBenchmarks.find((b) => b.id === id);
      if (!found) throw new Error("Not found");
      return delay({ ...found, status: "rejected" });
    }
    return apiRequest("bc", `/task-benchmarks/${id}/reject`, {
      method: "POST",
    });
  },
};
