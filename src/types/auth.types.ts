import { type Role } from "@/constants/roles";

export type Company = {
  uuid: string;
  id?: number;
  name: string;
  slug: string;
  company_code?: string;
  industry?: string;
  company_size?: string;
  country?: string;
  website?: string;
  timezone?: string;
  currency?: string;
  status?: "active" | "suspended" | "trial";
  plan?: string;
};

export type User = {
  uuid: string;
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  roles?: string[];
  permissions?: string[];
  status?: "active" | "invited" | "suspended" | "deactivated";
  company?: Company;
  department_id?: number | null;
  team_id?: number | null;
  manager_user_id?: number | null;
  employee_code?: string;
  phone?: string;
  designation?: string;
  joining_date?: string;
  job_role?: string | null;
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  user: User;
  company?: Company;
};

export type ApiEnvelope<T> = {
  data: T;
  message?: string;
};
