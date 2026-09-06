"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { ROLES, ROLE_LABELS, type Role } from "@/constants/roles";
import {
  COUNTRIES,
  DEFAULT_COUNTRY_ISO,
  digitsOnly,
  findCountry,
  isValidNationalNumber,
  type CountryIso,
} from "@/constants/locale";
import { lineManagers } from "@/lib/org/line-managers";
import {
  employeeSchema,
  type EmployeeSchema,
} from "@/features/organization/schemas/organization.schema";
import type {
  Department,
  Employee,
  JobRole,
  Team,
} from "@/features/organization/types";

const APP_ROLES = [
  ROLES.EMPLOYEE,
  ROLES.TEAM_LEAD,
  ROLES.DEPARTMENT_HEAD,
] as const;

type InviteAppRole = (typeof APP_ROLES)[number];

type Props = {
  departments: Department[];
  teams: Team[];
  jobRoles: JobRole[];
  managers?: Employee[];
  onSubmit: (values: EmployeeSchema) => Promise<void>;
  submitLabel?: string;
  companySlug?: string;
  /** Roles the actor may invite (Owner: all three; Dept Head: TL + Employee). */
  allowedRoles?: readonly InviteAppRole[];
  defaultDepartmentId?: number;
  defaultTeamId?: number;
};

export function CreateEmployeeForm({
  departments,
  teams,
  jobRoles,
  managers = [],
  onSubmit,
  submitLabel = "Send invite",
  companySlug,
  allowedRoles,
  defaultDepartmentId,
  defaultTeamId,
}: Props) {
  const roleOptions = allowedRoles?.length
    ? APP_ROLES.filter((r) => allowedRoles.includes(r))
    : [...APP_ROLES];
  const defaultRole = roleOptions.includes(ROLES.EMPLOYEE)
    ? ROLES.EMPLOYEE
    : roleOptions[0] ?? ROLES.EMPLOYEE;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [nextStep, setNextStep] = useState<{
    role: Role;
    name: string;
  } | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    display_name: "",
    email: "",
    phone_iso: DEFAULT_COUNTRY_ISO as CountryIso,
    phone_national: "",
    employee_code: "",
    department_id: defaultDepartmentId ? String(defaultDepartmentId) : "",
    team_id: defaultTeamId ? String(defaultTeamId) : "",
    job_role_id: "",
    manager_employee_id: "",
    designation: "",
    joining_date: new Date().toISOString().slice(0, 10),
    employment_status: "active",
    app_role: defaultRole as InviteAppRole,
  });

  const role = form.app_role;
  const showTeam = role !== ROLES.DEPARTMENT_HEAD;
  const showReportsTo = role !== ROLES.DEPARTMENT_HEAD;
  const deptRequired = true;
  const teamRequired = role === ROLES.TEAM_LEAD;

  const teamsInDept = useMemo(
    () =>
      teams.filter((t) => String(t.department_id) === form.department_id),
    [teams, form.department_id],
  );

  const managerOptions = useMemo(() => {
    const base = lineManagers(managers);
    if (role === ROLES.TEAM_LEAD) {
      return base.filter((m) => m.app_role === ROLES.DEPARTMENT_HEAD);
    }
    return base;
  }, [managers, role]);

  const country = findCountry(form.phone_iso);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const national = form.phone_national.trim();
    if (!national) {
      setPhoneError("Mobile number is required");
      setError(null);
      return;
    }
    if (!isValidNationalNumber(form.phone_iso, national)) {
      setPhoneError(
        country
          ? `Enter a ${country.min === country.max ? country.min : `${country.min}–${country.max}`}-digit mobile number for ${country.name}`
          : "Enter a valid mobile number for the selected country",
      );
      setError(null);
      return;
    }
    setPhoneError(null);
    if (!form.department_id) {
      setError(
        role === ROLES.DEPARTMENT_HEAD
          ? "Department is required to seat a Department Head as manager"
          : "Department is required for this role",
      );
      return;
    }
    if (teamRequired && !form.team_id) {
      setError("Team is required to seat a Team Lead");
      return;
    }
    if (jobRoles.length > 0 && !form.job_role_id) {
      setError(
        "Job role is required — it sets the hourly cost used to compute Estimated ROI.",
      );
      return;
    }
    const parsed = employeeSchema.safeParse({
      ...form,
      team_id:
        showTeam && form.team_id ? Number(form.team_id) : null,
      manager_employee_id:
        showReportsTo && form.manager_employee_id
          ? Number(form.manager_employee_id)
          : null,
      department_id: form.department_id ? Number(form.department_id) : undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid employee");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(parsed.data);
      if (
        parsed.data.app_role === ROLES.TEAM_LEAD ||
        parsed.data.app_role === ROLES.DEPARTMENT_HEAD
      ) {
        setNextStep({
          role: parsed.data.app_role,
          name: `${parsed.data.first_name} ${parsed.data.last_name}`.trim(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create person");
    } finally {
      setLoading(false);
    }
  }

  if (nextStep) {
    const isLead = nextStep.role === ROLES.TEAM_LEAD;
    return (
      <div className="space-y-4 border border-hairline bg-ink p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
          Seated
        </p>
        <h3 className="text-lg font-medium text-text-primary">
          Invite sent for {nextStep.name}
        </h3>
        <p className="text-sm text-text-secondary">
          {isLead
            ? "They are seated as Team Lead on the selected team. You can change the lead later from Edit team."
            : "They are seated as Department Manager on the selected department. You can change the manager later from Edit department."}
        </p>
        <Button size="sm" variant="ghost" onClick={() => setNextStep(null)}>
          Invite another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
          Access
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Application role</Label>
            <Select
              value={form.app_role}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  app_role: e.target.value as typeof form.app_role,
                  team_id:
                    e.target.value === ROLES.DEPARTMENT_HEAD ? "" : f.team_id,
                  manager_employee_id:
                    e.target.value === ROLES.DEPARTMENT_HEAD
                      ? ""
                      : f.manager_employee_id,
                }))
              }
            >
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </div>
          <p className="self-end text-sm text-text-secondary">
            {role === ROLES.DEPARTMENT_HEAD
              ? "Invite seats them as Department Manager on the selected department."
              : role === ROLES.TEAM_LEAD
                ? "Invite seats them as Team Lead on the selected team."
                : "Employees need department (and ideally team + reports-to) for AI attribution."}
          </p>
        </div>
      </section>

      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
          Personal information
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>First name</Label>
            <Input
              value={form.first_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, first_name: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Last name</Label>
            <Input
              value={form.last_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, last_name: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Phone country</Label>
            <Select
              value={form.phone_iso}
              onChange={(e) => {
                setPhoneError(null);
                setForm((f) => ({
                  ...f,
                  phone_iso: e.target.value as CountryIso,
                  phone_national: "",
                }));
              }}
            >
              {COUNTRIES.map((c) => (
                <option key={c.iso} value={c.iso}>
                  {c.name} ({c.dial})
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Mobile number</Label>
            <Input
              type="tel"
              inputMode="numeric"
              value={form.phone_national}
              onChange={(e) => {
                setPhoneError(null);
                setForm((f) => ({
                  ...f,
                  phone_national: digitsOnly(e.target.value).slice(
                    0,
                    country?.max ?? 15,
                  ),
                }));
              }}
              placeholder={country ? `${country.min}–${country.max} digits` : ""}
              required
            />
            {phoneError ? (
              <p className="text-xs text-danger">{phoneError}</p>
            ) : (
              <p className="text-[11px] text-text-secondary/70">
                Digits only, without the country code
                {country ? ` (${country.dial})` : ""}.
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
          Organization
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Employee ID (optional)</Label>
            <Input
              placeholder="EMP-0041"
              value={form.employee_code}
              onChange={(e) =>
                setForm((f) => ({ ...f, employee_code: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Designation</Label>
            <Input
              placeholder="Software Engineer"
              value={form.designation}
              onChange={(e) =>
                setForm((f) => ({ ...f, designation: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Department *</Label>
            <Select
              value={form.department_id}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  department_id: e.target.value,
                  team_id: "",
                }))
              }
              required={deptRequired}
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name}
                </option>
              ))}
            </Select>
          </div>
          {showTeam ? (
            <div className="space-y-2">
              <Label>{teamRequired ? "Team *" : "Team"}</Label>
              <Select
                value={form.team_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, team_id: e.target.value }))
                }
                required={teamRequired}
              >
                <option value="">
                  {teamRequired ? "Select team to lead" : "No team yet"}
                </option>
                {teamsInDept.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.team_name}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
          <div className="space-y-2 sm:col-span-2">
            <Label>{jobRoles.length > 0 ? "Job role *" : "Job role"}</Label>
            <Select
              value={form.job_role_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, job_role_id: e.target.value }))
              }
              required={jobRoles.length > 0}
              disabled={jobRoles.length === 0}
            >
              <option value="">
                {jobRoles.length === 0
                  ? "No job roles yet — create one first"
                  : "Select job role"}
              </option>
              {jobRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.role_name} · {r.currency} {r.hourly_cost}/hr
                </option>
              ))}
            </Select>
            {jobRoles.length === 0 ? (
              <p className="text-xs text-danger">
                No job roles exist yet. Estimated ROI cannot be calculated for
                this person until one is assigned.{" "}
                {companySlug ? (
                  <Link
                    href={`/${companySlug}/organization/job-roles`}
                    className="text-accent underline-offset-2 hover:underline"
                  >
                    Create a job role
                  </Link>
                ) : (
                  "Create one under Organization → Job Roles."
                )}
              </p>
            ) : (
              <p className="text-xs text-text-secondary/70">
                Sets the hourly cost used to compute Estimated ROI. Required
                for anyone who will use the AI Workspace — without it,
                Estimated ROI stays at 0 for this person.
              </p>
            )}
          </div>
          {showReportsTo ? (
            <div className="space-y-2">
              <Label>
                {role === ROLES.TEAM_LEAD
                  ? "Reports to (dept head)"
                  : "Reports to"}
              </Label>
              <Select
                value={form.manager_employee_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, manager_employee_id: e.target.value }))
                }
              >
                <option value="">None</option>
                {managerOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.display_name} · {ROLE_LABELS[m.app_role]}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-text-secondary/70">
                Line manager for the person — separate from their org seat
                (dept manager / team lead), which is set automatically on invite.
              </p>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label>Joining date</Label>
            <Input
              type="date"
              value={form.joining_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, joining_date: e.target.value }))
              }
            />
          </div>
        </div>
      </section>

      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
