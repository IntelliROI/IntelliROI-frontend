import { type Role } from "@/constants/roles";

export type Company = {
  uuid: string;
  id?: number;
  name: string;
  slug: string;
  industry?: string;
  company_size?: string;
  timezone?: string;
  currency?: string;
  status?: "active" | "suspended" | "trial";
  plan?: string;
};

export type User = {
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  company?: Company;
  department_id?: number | null;
  team_id?: number | null;
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
