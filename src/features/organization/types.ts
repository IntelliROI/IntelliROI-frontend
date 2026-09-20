import { type Role } from "@/constants/roles";

export type CompanySettings = {
  /** Scoped by the logged-in company token — not always returned by the API. */
  company_id?: number;
  working_hours_per_day: number;
  working_days_per_month: number;
  default_currency: string;
  timezone: string;
  date_format: string;
  fiscal_year_start: string;
  /** Company-currency units per 1 USD (e.g. INR ≈ 83). */
  usd_fx_rate: number;
  /** When true, AI requests require an approved task benchmark and assigned CTC. */
  strict_benchmark_policy?: boolean;
};

/** Active CTC record returned alongside an employee profile. */
export type EmployeeCtc = {
  ctc_annual: number;
  ctc_currency: string;
  /** Computed at save time: ctc_annual ÷ (hours_per_day × days_per_month × 12) */
  hourly_cost: number;
  effective_from: string;
};

export type Department = {
  id: number;
  company_id?: number;
  department_name: string;
  department_code: string;
  description?: string;
  manager_employee_id?: number | null;
  manager_user_uuid?: string | null;
  status: "active" | "inactive";
  created_at?: string;
  employee_count: number;
  monthly_spend: number;
  roi_pct: number;
  budget_limit: number;
};

export type Team = {
  id: number;
  company_id?: number;
  department_id: number;
  team_name: string;
  team_code: string;
  description?: string;
  team_lead_employee_id?: number | null;
  lead_user_uuid?: string | null;
  status: "active" | "inactive";
  created_at?: string;
  /** Rollup metrics — default 0 until usage/cost/ROI APIs are wired. */
  member_count: number;
  monthly_spend: number;
  roi_pct: number;
};

export type Project = {
  id: number;
  company_id?: number;
  department_id: number;
  team_id: number | null;
  project_name: string;
  project_code?: string;
  description?: string;
  status: "active" | "archived" | "completed";
  created_at?: string;
};

/** Employee record built from the auth user + org/CTC data. */
export type Employee = {
  id: number;
  uuid: string;
  company_id?: number;
  user_id?: string | null;
  employee_code: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  phone?: string;
  department_id: number;
  team_id: number | null;
  manager_employee_id?: number | null;
  designation?: string;
  joining_date?: string;
  employment_status: "active" | "inactive" | "on_leave";
  /** App role (CEO / manager / lead / employee). */
  app_role: Role;
  status: "active" | "invited";
  /** Denormalized for lists / dashboards */
  department_name: string;
  team_name: string;
  /** Hourly cost derived from CTC — 0 if no CTC assigned yet. */
  hourly_cost: number;
  /** CTC fields — null if no CTC assigned yet. */
  ctc_annual: number | null;
  ctc_currency: string;
  /** Kept for currency display in lists — mirrors ctc_currency. */
  currency: string;
  /** Rollup metrics — default 0 until usage/cost/ROI APIs are wired. */
  spend: number;
  roi_pct: number;
  requests: number;
};

export type CreateDepartmentInput = {
  department_name: string;
  department_code: string;
  description?: string;
  manager_employee_id?: number | null;
  status?: "active" | "inactive";
};

export type CreateTeamInput = {
  team_name: string;
  team_code: string;
  department_id: number;
  description?: string;
  team_lead_employee_id?: number | null;
  status?: "active" | "inactive";
};

export type CreateEmployeeInput = {
  first_name: string;
  last_name: string;
  display_name?: string;
  email: string;
  phone?: string;
  employee_code?: string;
  department_id?: number | null;
  team_id?: number | null;
  manager_employee_id?: number | null;
  designation?: string;
  joining_date?: string;
  employment_status?: "active" | "inactive" | "on_leave";
  app_role: Role;
  /** Annual CTC — required for invite so ROI can be computed. */
  ctc_annual: number;
  /** ISO-4217 currency for ctc_annual. Inherited from company default when omitted. */
  ctc_currency?: string;
};

export type UpdateDepartmentInput = {
  department_name?: string;
  department_code?: string;
  description?: string;
  manager_employee_id?: number | null;
  status?: "active" | "inactive";
};

export type UpdateTeamInput = {
  team_name?: string;
  team_code?: string;
  description?: string;
  team_lead_employee_id?: number | null;
  status?: "active" | "inactive";
};

export type UpdateEmployeeOrgInput = {
  employee_code?: string;
  phone?: string;
  designation?: string;
  department_id?: number | null;
  team_id?: number | null;
  manager_employee_id?: number | null;
  joining_date?: string;
  previous_team_id?: number | null;
  /** Annual CTC — when provided, creates a new CTC history row. */
  ctc_annual?: number | null;
  /** ISO-4217 currency for ctc_annual. */
  ctc_currency?: string;
};

export type CreateProjectInput = {
  project_name: string;
  description?: string;
  department_id?: number | null;
  team_id?: number | null;
};

export type UpdateCompanySettingsInput = Partial<
  Omit<CompanySettings, "company_id">
>;
