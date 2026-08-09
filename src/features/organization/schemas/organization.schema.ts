import { z } from "zod";
import { ROLES } from "@/constants/roles";

const appRoleEnum = z.enum([
  ROLES.COMPANY_OWNER,
  ROLES.DEPARTMENT_HEAD,
  ROLES.TEAM_LEAD,
  ROLES.EMPLOYEE,
]);

export const companySettingsSchema = z.object({
  working_hours_per_day: z.coerce.number().min(1).max(24),
  working_days_per_month: z.coerce.number().min(1).max(31),
  default_currency: z.string().length(3),
  timezone: z.string().min(1),
  date_format: z.string().min(1),
  fiscal_year_start: z.string().min(1),
});

export const jobRoleSchema = z.object({
  role_name: z.string().min(2, "Role name required"),
  hourly_cost: z.coerce.number().positive("Hourly cost must be > 0"),
  currency: z.string().length(3).default("USD"),
});

export const departmentSchema = z.object({
  department_name: z.string().min(2, "Department name required"),
  department_code: z
    .string()
    .min(2)
    .max(12)
    .transform((v) => v.toUpperCase()),
  description: z.string().optional(),
  manager_employee_id: z.coerce.number().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const teamSchema = z.object({
  team_name: z.string().min(2, "Team name required"),
  team_code: z
    .string()
    .min(1)
    .max(12)
    .transform((v) => v.toUpperCase()),
  department_id: z.coerce.number().positive("Select a department"),
  description: z.string().optional(),
  team_lead_employee_id: z.coerce.number().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const employeeSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  display_name: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  employee_code: z.string().min(2, "Employee ID required (e.g. EMP-0041)"),
  department_id: z.coerce.number().positive("Select a department"),
  team_id: z.coerce.number().optional().nullable(),
  job_role_id: z.coerce.number().positive("Select a job role"),
  manager_employee_id: z.coerce.number().optional().nullable(),
  designation: z.string().optional(),
  joining_date: z.string().optional(),
  employment_status: z
    .enum(["active", "inactive", "on_leave"])
    .default("active"),
  app_role: appRoleEnum.default(ROLES.EMPLOYEE),
});

export type CompanySettingsSchema = z.infer<typeof companySettingsSchema>;
export type JobRoleSchema = z.infer<typeof jobRoleSchema>;
export type DepartmentSchema = z.infer<typeof departmentSchema>;
export type TeamSchema = z.infer<typeof teamSchema>;
export type EmployeeSchema = z.infer<typeof employeeSchema>;
