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
};

export type JobRole = {
  id: number;
  company_id?: number;
  role_name: string;
  hourly_cost: number;
  currency: string;
  status: "active" | "inactive";
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

/** Employee record built from the auth user + org/job-role lookups. */
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
  job_role_id: number;
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
  job_role_name: string;
  hourly_cost: number;
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
  job_role_id?: number | null;
  manager_employee_id?: number | null;
  designation?: string;
  joining_date?: string;
  employment_status?: "active" | "inactive" | "on_leave";
  app_role: Role;
};

export type CreateJobRoleInput = {
  role_name: string;
  hourly_cost: number;
  currency?: string;
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

export type UpdateJobRoleInput = {
  role_name?: string;
  hourly_cost?: number;
  currency?: string;
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
  job_role_id?: number | null;
  previous_team_id?: number | null;
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
