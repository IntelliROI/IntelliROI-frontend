/**
 * Auth API client (:8081) — live HTTP only, no mocks.
 */
import { apiRequest } from "@/lib/api/client";
import { type AuthSession, type Company, type User } from "@/types/auth.types";
import { resolveRole, toInviteRole, type Role } from "@/constants/roles";
import { slugify } from "@/lib/utils";

export type LoginInput = { email: string; password: string };

export type RegisterInput = {
  company_name: string;
  company_code: string;
  industry: string;
  company_size: string;
  country: string;
  timezone: string;
  currency: string;
  website?: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
};

export type InviteEmployeeInput = {
  email: string;
  first_name: string;
  last_name: string;
  /** App Role — mapped to invite role_name (owner/admin are never invited). */
  role: Role;
  employee_code?: string;
  phone?: string;
  designation?: string;
  department_id?: number | null;
  team_id?: number | null;
  manager_user_id?: number | null;
  joining_date?: string;
};

export type UpdateEmployeeProfileInput = {
  employee_code?: string | null;
  phone?: string | null;
  designation?: string | null;
  department_id?: number | null;
  clear_department_id?: boolean;
  team_id?: number | null;
  clear_team_id?: boolean;
  manager_user_id?: number | null;
  clear_manager_user_id?: boolean;
  joining_date?: string | null;
  clear_joining_date?: boolean;
};

/* ── API response shapes ── */

type UserDto = {
  uuid: string;
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  roles: string[];
  employee_code?: string;
  phone?: string;
  designation?: string;
  department_id?: number | null;
  team_id?: number | null;
  manager_user_id?: number | null;
  joining_date?: string;
};

type CompanyDto = {
  uuid: string;
  id?: number;
  company_name: string;
  company_code?: string;
  industry?: string;
  company_size?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  website?: string;
  status: string;
};

type ScopeDto = {
  level: "company" | "department" | "team" | "self";
  experience: string;
  department_id?: number;
  team_id?: number;
  user_id: number;
  company_id: number;
};

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: UserDto;
  company: CompanyDto;
};

type MeResponse = {
  user: UserDto;
  company: CompanyDto;
  permissions: string[];
  scope: ScopeDto;
};

type JobRoleDto = {
  job_role_id: number;
  role_name: string;
  hourly_cost: number;
  currency: string;
};

type EmployeeProfileDto = {
  user: UserDto;
  job_role?: JobRoleDto;
};

type InviteResponseDto = {
  user: UserDto;
  email_sent: boolean;
  message: string;
  invite_expires_at?: string;
  invite_token?: string; 
  invite_url?: string;
};

export type InviteResult = {
  user: User;
  emailSent: boolean;
  message: string;
  inviteUrl?: string;
};

export type CompanySettingsDto = {
  working_hours_per_day: number;
  working_days_per_month: number;
  currency: string;
  timezone: string;
  date_format: string;
  fiscal_year_start: string;
};

/* ── Map API responses → app types ── */

function toCompany(c: CompanyDto): Company {
  return {
    uuid: c.uuid,
    id: c.id,
    name: c.company_name,
    slug: slugify(c.company_name || c.company_code || c.uuid),
    company_code: c.company_code,
    industry: c.industry,
    company_size: c.company_size,
    country: c.country,
    website: c.website,
    timezone: c.timezone,
    currency: c.currency,
    status: (c.status as Company["status"]) ?? "active",
    plan: "Trial",
  };
}

function toUser(u: UserDto, company?: Company): User {
  return {
    uuid: u.uuid,
    id: u.id,
    email: u.email,
    first_name: u.first_name,
    last_name: u.last_name,
    role: resolveRole(u.roles),
    roles: u.roles,
    status: u.status as User["status"],
    company,
    department_id: u.department_id ?? null,
    team_id: u.team_id ?? null,
    manager_user_id: u.manager_user_id ?? null,
    employee_code: u.employee_code,
    phone: u.phone,
    designation: u.designation,
    joining_date: u.joining_date,
  };
}

function toSession(res: TokenResponse): AuthSession {
  const company = toCompany(res.company);
  return {
    access_token: res.access_token,
    refresh_token: res.refresh_token,
    user: toUser(res.user, company),
    company,
  };
}

export const authApi = {
  async login(input: LoginInput): Promise<AuthSession> {
    const res = await apiRequest<TokenResponse>("auth", "/auth/login", {
      method: "POST",
      body: input,
      token: null,
    });
    return toSession(res);
  },

  async register(input: RegisterInput): Promise<AuthSession> {
    const res = await apiRequest<TokenResponse>("auth", "/auth/register", {
      method: "POST",
      body: input,
      token: null,
    });
    return toSession(res);
  },

  async me(): Promise<User> {
    const res = await apiRequest<MeResponse>("auth", "/auth/me");
    const company = toCompany(res.company);
    const user = toUser(res.user, company);
    user.permissions = res.permissions;
    return user;
  },

  async refresh(refreshToken: string): Promise<AuthSession> {
    const res = await apiRequest<TokenResponse>("auth", "/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
      token: null,
    });
    return toSession(res);
  },

  async logout(refreshToken?: string | null, revokeAll = false): Promise<void> {
    await apiRequest("auth", "/auth/logout", {
      method: "POST",
      body: { refresh_token: refreshToken ?? undefined, revoke_all: revokeAll },
    });
  },

  async forgotPassword(email: string): Promise<void> {
    await apiRequest("auth", "/auth/password/forgot", {
      method: "POST",
      body: { email },
      token: null,
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiRequest("auth", "/auth/password/reset", {
      method: "POST",
      body: { token, new_password: newPassword },
      token: null,
    });
  },

  /**
   * Invite an employee. The backend never issues a temporary password —
   * the invited user is created with status "invited" and must set their
   * own password from the emailed accept-invite link (same mechanism as
   * forgot/reset password). In development, `invite_url` is echoed back so
   * the inviter can share it without a mail provider configured.
   */
  async invite(input: InviteEmployeeInput): Promise<InviteResult> {
    const res = await apiRequest<InviteResponseDto>("auth", "/auth/invite", {
      method: "POST",
      body: {
        email: input.email,
        first_name: input.first_name,
        last_name: input.last_name,
        role_name: toInviteRole(input.role),
        employee_code: input.employee_code,
        phone: input.phone,
        designation: input.designation,
        department_id: input.department_id ?? undefined,
        team_id: input.team_id ?? undefined,
        manager_user_id: input.manager_user_id ?? undefined,
        joining_date: input.joining_date,
      },
    });
    return {
      user: toUser(res.user),
      emailSent: res.email_sent,
      message: res.message,
      inviteUrl: res.invite_url,
    };
  },

  /** Resend an invite (new token + email) for a user still pending activation. */
  async resendInvite(email: string): Promise<InviteResult> {
    const res = await apiRequest<InviteResponseDto>(
      "auth",
      "/auth/invite/resend",
      { method: "POST", body: { email } },
    );
    return {
      user: toUser(res.user),
      emailSent: res.email_sent,
      message: res.message,
      inviteUrl: res.invite_url,
    };
  },

  async listEmployees(): Promise<{ user: User; job_role?: JobRoleDto }[]> {
    const res = await apiRequest<EmployeeProfileDto[]>("auth", "/auth/users");
    return res.map((p) => ({ user: toUser(p.user), job_role: p.job_role }));
  },

  async getEmployee(
    userUuid: string,
  ): Promise<{ user: User; job_role?: JobRoleDto }> {
    const res = await apiRequest<EmployeeProfileDto>(
      "auth",
      `/auth/users/${userUuid}`,
    );
    return { user: toUser(res.user), job_role: res.job_role };
  },

  async updateEmployee(
    userUuid: string,
    patch: UpdateEmployeeProfileInput,
  ): Promise<User> {
    const res = await apiRequest<UserDto>(
      "auth",
      `/auth/users/${userUuid}/profile`,
      { method: "PATCH", body: patch },
    );
    return toUser(res);
  },

  async getCompanySettings(): Promise<CompanySettingsDto> {
    return apiRequest<CompanySettingsDto>("auth", "/auth/company/settings");
  },

  async updateCompanySettings(
    patch: Partial<CompanySettingsDto>,
  ): Promise<CompanySettingsDto> {
    return apiRequest<CompanySettingsDto>("auth", "/auth/company/settings", {
      method: "PUT",
      body: patch,
    });
  },
};
