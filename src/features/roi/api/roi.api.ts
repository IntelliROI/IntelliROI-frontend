import { apiRequest } from "@/lib/api/client";

export type RoiSummary = {
  period: string;
  total_spend: number;
  business_value: number;
  roi_pct: number;
  time_saved_hours: number;
  formula_version?: string;
  computed_at?: string;
  adoption_rate?: number;
  active_employees?: number;
  total_seats?: number;
  vs_last_month_pct?: number;
  department_id?: number;
  team_id?: number;
  employee_id?: number;
};

export type Recommendation = {
  id: number;
  title: string;
  impact_monthly_usd: number;
  status: string;
  scope: string;
  rationale?: string;
  department_id?: number;
  team_id?: number;
};

export const roiApi = {
  async company(period = "month"): Promise<RoiSummary> {
    return apiRequest("roi", `/roi/company?period=${period}`);
  },

  async department(id: number, period = "month"): Promise<RoiSummary> {
    return apiRequest("roi", `/roi/department/${id}?period=${period}`);
  },

  async team(id: number, period = "month"): Promise<RoiSummary> {
    return apiRequest("roi", `/roi/team/${id}?period=${period}`);
  },

  async employee(id: number | string, period = "month"): Promise<RoiSummary> {
    return apiRequest("roi", `/roi/employee/${id}?period=${period}`);
  },

  async recommendations(status = "open"): Promise<Recommendation[]> {
    return apiRequest("roi", `/roi/recommendations?status=${status}`);
  },

  async updateRecommendation(
    id: number,
    status: "accepted" | "dismissed",
  ): Promise<Recommendation> {
    return apiRequest("roi", `/roi/recommendations/${id}`, {
      method: "PATCH",
      body: { status },
    });
  },

  async formulaVersions(): Promise<{ version: string; effective_from: string }[]> {
    return apiRequest("roi", "/roi/formula-versions");
  },

  async submitFeedback(
    requestUuid: string,
    input: { useful: boolean; notes?: string },
  ): Promise<void> {
    await apiRequest("roi", `/requests/${requestUuid}/feedback`, {
      method: "POST",
      body: input,
    });
  },
};
