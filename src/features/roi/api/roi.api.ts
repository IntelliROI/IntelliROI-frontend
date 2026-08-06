import { apiRequest, useMocks } from "@/lib/api/client";
import {
  delay,
  mockRoiCompany,
  mockRecommendations,
} from "@/lib/mocks/data";

export type RoiSummary = typeof mockRoiCompany & {
  department_id?: number;
  team_id?: number;
  employee_id?: number;
};

export type Recommendation = (typeof mockRecommendations)[number];

export const roiApi = {
  async company(period = "month"): Promise<RoiSummary> {
    if (useMocks) return delay({ ...mockRoiCompany, period });
    return apiRequest("roi", `/roi/company?period=${period}`);
  },

  async department(id: number, period = "month"): Promise<RoiSummary> {
    if (useMocks) {
      return delay({
        ...mockRoiCompany,
        period,
        department_id: id,
        total_spend: 18420,
        business_value: 75800,
        roi_pct: 312,
      });
    }
    return apiRequest("roi", `/roi/department/${id}?period=${period}`);
  },

  async team(id: number, period = "month"): Promise<RoiSummary> {
    if (useMocks) {
      return delay({
        ...mockRoiCompany,
        period,
        team_id: id,
        total_spend: 6200,
        business_value: 27300,
        roi_pct: 340,
      });
    }
    return apiRequest("roi", `/roi/team/${id}?period=${period}`);
  },

  async employee(id: number | string, period = "month"): Promise<RoiSummary> {
    if (useMocks) {
      return delay({
        ...mockRoiCompany,
        period,
        employee_id: Number(id) || 1,
        total_spend: 420,
        business_value: 2016,
        roi_pct: 380,
        time_saved_hours: 28,
      });
    }
    return apiRequest("roi", `/roi/employee/${id}?period=${period}`);
  },

  async recommendations(status = "open"): Promise<Recommendation[]> {
    if (useMocks) return delay(mockRecommendations.filter((r) => r.status === status || status === "all"));
    return apiRequest("roi", `/roi/recommendations?status=${status}`);
  },

  async updateRecommendation(
    id: number,
    status: "accepted" | "dismissed",
  ): Promise<Recommendation> {
    if (useMocks) {
      const found = mockRecommendations.find((r) => r.id === id);
      if (!found) throw new Error("Recommendation not found");
      return delay({ ...found, status });
    }
    return apiRequest("roi", `/roi/recommendations/${id}`, {
      method: "PATCH",
      body: { status },
    });
  },

  async formulaVersions(): Promise<{ version: string; effective_from: string }[]> {
    if (useMocks) {
      return delay([
        { version: "roi-v2.4", effective_from: "2026-06-01" },
        { version: "roi-v2.3", effective_from: "2026-01-01" },
      ]);
    }
    return apiRequest("roi", "/roi/formula-versions");
  },

  async submitFeedback(
    requestUuid: string,
    input: { useful: boolean; notes?: string },
  ): Promise<void> {
    if (useMocks) return delay(undefined);
    await apiRequest("roi", `/requests/${requestUuid}/feedback`, {
      method: "POST",
      body: input,
    });
  },
};
