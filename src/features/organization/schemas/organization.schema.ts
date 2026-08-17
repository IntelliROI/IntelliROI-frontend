import { z } from "zod";
import { ROLES } from "@/constants/roles";
import {
  CURRENCIES,
  COUNTRIES,
  isValidNationalNumber,
  toE164,
} from "@/constants/locale";

const currencyCodes = CURRENCIES.map((c) => c.code) as [string, ...string[]];
const countryIsos = COUNTRIES.map((c) => c.iso) as [string, ...string[]];

/** Company owner is created only at registration */
const appRoleEnum = z.enum([
  ROLES.DEPARTMENT_HEAD,
  ROLES.TEAM_LEAD,
  ROLES.EMPLOYEE,
]);

export const companySettingsSchema = z.object({
  working_hours_per_day: z.coerce.number().min(1).max(24),
  working_days_per_month: z.coerce.number().min(1).max(31),
  default_currency: z.enum(currencyCodes),
  timezone: z.string().min(1),
  date_format: z.string().min(1),
  fiscal_year_start: z.string().min(1),
});

export const jobRoleSchema = z.object({
  role_name: z.string().min(2, "Role name required"),
  hourly_cost: z.coerce.number().positive("Hourly cost must be > 0"),
  currency: z.enum(currencyCodes),
  status: z.enum(["active", "inactive"]).optional(),
});

export const projectSchema = z.object({
  project_name: z.string().min(2, "Project name required"),
  description: z.string().optional(),
  department_id: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive().nullable().optional(),
  ),
  team_id: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive().nullable().optional(),
  ),
});

export const employeeOrgPatchSchema = z.object({
  employee_code: z.string().optional(),
  phone_iso: z.enum(countryIsos).optional(),
  phone_national: z.string().optional(),
  designation: z.string().optional(),
  department_id: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive().nullable().optional(),
  ),
  team_id: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive().nullable().optional(),
  ),
  job_role_id: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive().nullable().optional(),
  ),
  manager_employee_id: z.coerce.number().optional().nullable(),
  joining_date: z.string().optional(),
}).superRefine((data, ctx) => {
  const national = (data.phone_national ?? "").trim();
  if (!national) return;
  const iso = data.phone_iso ?? "IN";
  if (!isValidNationalNumber(iso, national)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone_national"],
      message: "Enter a valid phone number for the selected country (digits only)",
    });
  }
}).transform((data) => {
  const iso = data.phone_iso ?? "IN";
  return {
    ...data,
    phone: toE164(iso, data.phone_national ?? "") || undefined,
  };
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
  phone_iso: z.enum(countryIsos).optional(),
  phone_national: z.string().optional(),
  phone: z.string().optional(),
  employee_code: z.string().optional(),
  department_id: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive().nullable().optional(),
  ),
  team_id: z.coerce.number().optional().nullable(),
  job_role_id: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive().nullable().optional(),
  ),
  manager_employee_id: z.coerce.number().optional().nullable(),
  designation: z.string().optional(),
  joining_date: z.string().optional(),
  employment_status: z
    .enum(["active", "inactive", "on_leave"])
    .default("active"),
  app_role: appRoleEnum.default(ROLES.EMPLOYEE),
}).superRefine((data, ctx) => {
  const national = (data.phone_national ?? "").trim();
  if (!national) return;
  const iso = data.phone_iso ?? "IN";
  if (!isValidNationalNumber(iso, national)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone_national"],
      message: "Enter a valid phone number for the selected country (digits only)",
    });
  }
}).transform((data) => {
  const iso = data.phone_iso ?? "IN";
  return {
    ...data,
    phone: toE164(iso, data.phone_national ?? "") || undefined,
  };
});

export type CompanySettingsSchema = z.infer<typeof companySettingsSchema>;
export type JobRoleSchema = z.infer<typeof jobRoleSchema>;
export type DepartmentSchema = z.infer<typeof departmentSchema>;
export type TeamSchema = z.infer<typeof teamSchema>;
export type EmployeeSchema = z.infer<typeof employeeSchema>;
export type ProjectSchema = z.infer<typeof projectSchema>;
export type EmployeeOrgPatchSchema = z.infer<typeof employeeOrgPatchSchema>;
