"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { ROLES, ROLE_LABELS, type Role } from "@/constants/roles";
import {
  COUNTRIES,
  CURRENCIES,
  DEFAULT_COUNTRY_ISO,
  DEFAULT_CURRENCY,
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
  managers?: Employee[];
  onSubmit: (values: EmployeeSchema) => Promise<void>;
  submitLabel?: string;
  companySlug?: string;
  /** Roles the actor may invite (Owner: all three; Dept Head: TL + Employee). */
  allowedRoles?: readonly InviteAppRole[];
  defaultDepartmentId?: number;
  defaultTeamId?: number;
  /** Company's configured currency — pre-fills the CTC currency dropdown. */
  defaultCurrency?: string;
  /** Company working hours/day — used for live hourly preview. */
  workingHoursPerDay?: number;
  /** Company working days/month — used for live hourly preview. */
  workingDaysPerMonth?: number;
};

function computeHourlyPreview(
  ctcAnnual: string,
  hoursPerDay: number,
  daysPerMonth: number,
): string | null {
  const val = Number(ctcAnnual);
  if (!val || val <= 0 || !hoursPerDay || !daysPerMonth) return null;
  const hourly = val / (hoursPerDay * daysPerMonth * 12);
  return hourly.toFixed(2);
}

export function CreateEmployeeForm({
  departments,
  teams,
  managers = [],
  onSubmit,
  submitLabel = "Send invite",
  allowedRoles,
  defaultDepartmentId,
  defaultTeamId,
  defaultCurrency = DEFAULT_CURRENCY,
  workingHoursPerDay = 8,
  workingDaysPerMonth = 22,
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
    manager_employee_id: "",
    designation: "",
    joining_date: new Date().toISOString().slice(0, 10),
    employment_status: "active",
    app_role: defaultRole as InviteAppRole,
    ctc_annual: "",
    ctc_currency: defaultCurrency,
  });

  const role = form.app_role;
  const showTeam = role !== ROLES.DEPARTMENT_HEAD;
  const showReportsTo = role !== ROLES.DEPARTMENT_HEAD;
  const deptRequired = true;
  const teamRequired = role === ROLES.TEAM_LEAD;

  const teamsInDept = useMemo(
    () => teams.filter((t) => String(t.department_id) === form.department_id),
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

  const hourlyPreview = computeHourlyPreview(
    form.ctc_annual,
    workingHoursPerDay,
    workingDaysPerMonth,
  );

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
    if (!form.ctc_annual || Number(form.ctc_annual) <= 0) {
      setError("Annual CTC is required to calculate Estimated ROI");
      return;
    }

    const parsed = employeeSchema.safeParse({
      ...form,
      department_id: form.department_id || undefined,
      team_id: form.team_id || undefined,
      manager_employee_id: form.manager_employee_id || undefined,
    });

    if (!parsed.success) {
      const first = parsed.error.errors[0];
      setError(first?.message ?? "Please fix the form errors");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit(parsed.data);
      setNextStep({ role: parsed.data.app_role, name: `${form.first_name} ${form.last_name}`.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed — please try again");
    } finally {
      setLoading(false);
    }
  }

  if (nextStep) {
    const roleLabel = ROLE_LABELS[nextStep.role] ?? nextStep.role;
    return (
      <div className="space-y-4 py-4 text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center border border-emerald-500/30 bg-emerald-500/10">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-emerald-400">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400">Invite sent</p>
        <p className="text-sm text-text-secondary">
          <strong className="text-text-primary">{nextStep.name}</strong> has been invited as{" "}
          <strong className="text-text-primary">{roleLabel}</strong> and will receive an
          email to set up their account.
        </p>
        <Button size="sm" variant="secondary" onClick={() => {
          setNextStep(null);
          setForm({
            first_name: "", last_name: "", display_name: "", email: "",
            phone_iso: DEFAULT_COUNTRY_ISO as CountryIso, phone_national: "",
            employee_code: "",
            department_id: defaultDepartmentId ? String(defaultDepartmentId) : "",
            team_id: defaultTeamId ? String(defaultTeamId) : "",
            manager_employee_id: "", designation: "",
            joining_date: new Date().toISOString().slice(0, 10),
            employment_status: "active", app_role: defaultRole as InviteAppRole,
            ctc_annual: "", ctc_currency: defaultCurrency,
          });
        }}>
          Invite another
        </Button>
      </div>
    );
  }

  function field(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Section 1: Personal Information ── */}
      <div className="space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          1 · Personal information
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="inv_first_name">First name *</Label>
            <Input
              id="inv_first_name"
              value={form.first_name}
              onChange={(e) => field("first_name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv_last_name">Last name *</Label>
            <Input
              id="inv_last_name"
              value={form.last_name}
              onChange={(e) => field("last_name", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inv_email">Work email *</Label>
          <Input
            id="inv_email"
            type="email"
            value={form.email}
            onChange={(e) => field("email", e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inv_phone_national">Mobile number *</Label>
          <div className="flex gap-2">
            <Select
              id="inv_phone_iso"
              value={form.phone_iso}
              onChange={(e) => field("phone_iso", e.target.value)}
              className="w-36 shrink-0"
            >
              {COUNTRIES.map((c) => (
                <option key={c.iso} value={c.iso}>
                  {c.iso} {c.dial} · {c.name}
                </option>
              ))}
            </Select>
            <Input
              id="inv_phone_national"
              type="tel"
              inputMode="numeric"
              placeholder={country ? `${country.min}–${country.max} digits` : ""}
              value={form.phone_national}
              onChange={(e) => field("phone_national", digitsOnly(e.target.value))}
              className="flex-1"
            />
          </div>
          {phoneError && <p className="text-xs text-danger">{phoneError}</p>}
        </div>
      </div>

      {/* ── Section 2: Organisation Placement ── */}
      <div className="space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          2 · Organisation placement
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="inv_app_role">App role *</Label>
          <Select
            id="inv_app_role"
            value={form.app_role}
            onChange={(e) => {
              const r = e.target.value as InviteAppRole;
              setForm((f) => ({ ...f, app_role: r, team_id: "", manager_employee_id: "" }));
            }}
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="inv_department">Department {deptRequired && "*"}</Label>
            <Select
              id="inv_department"
              value={form.department_id}
              onChange={(e) => setForm((f) => ({ ...f, department_id: e.target.value, team_id: "" }))}
            >
              <option value="">Select department</option>
              {departments.filter((d) => d.status === "active").map((d) => (
                <option key={d.id} value={d.id}>{d.department_name}</option>
              ))}
            </Select>
          </div>

          {showTeam && (
            <div className="space-y-1.5">
              <Label htmlFor="inv_team">Team {teamRequired && "*"}</Label>
              <Select
                id="inv_team"
                value={form.team_id}
                onChange={(e) => field("team_id", e.target.value)}
                disabled={!form.department_id}
              >
                <option value="">Select team</option>
                {teamsInDept.filter((t) => t.status === "active").map((t) => (
                  <option key={t.id} value={t.id}>{t.team_name}</option>
                ))}
              </Select>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="inv_designation">Job title / designation</Label>
            <Input
              id="inv_designation"
              placeholder="e.g. Senior Engineer"
              value={form.designation}
              onChange={(e) => field("designation", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv_employee_code">Employee ID</Label>
            <Input
              id="inv_employee_code"
              placeholder="EMP-001"
              value={form.employee_code}
              onChange={(e) => field("employee_code", e.target.value)}
            />
          </div>
        </div>

        {showReportsTo && (
          <div className="space-y-1.5">
            <Label htmlFor="inv_manager">Reports to</Label>
            <Select
              id="inv_manager"
              value={form.manager_employee_id}
              onChange={(e) => field("manager_employee_id", e.target.value)}
            >
              <option value="">Select manager</option>
              {managerOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name} — {ROLE_LABELS[m.app_role]}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="inv_joining_date">Joining date</Label>
          <Input
            id="inv_joining_date"
            type="date"
            value={form.joining_date}
            onChange={(e) => field("joining_date", e.target.value)}
          />
        </div>
      </div>

      {/* ── Section 3: Compensation (CTC) ── */}
      <div className="space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          3 · Compensation
        </p>
        <div className="rounded border border-accent/20 bg-accent/5 px-4 py-3">
          <p className="text-[12px] text-text-secondary">
            CTC is used to auto-calculate the employee&apos;s hourly cost and compute{" "}
            <strong className="text-text-primary">Estimated ROI</strong> in real-time.
            Hourly cost = Annual CTC ÷ (working hours/day × working days/month × 12).
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="inv_ctc_annual">Annual CTC *</Label>
            <Input
              id="inv_ctc_annual"
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 1200000"
              value={form.ctc_annual}
              onChange={(e) => field("ctc_annual", e.target.value)}
              required
            />
            {hourlyPreview && (
              <p className="text-[11px] text-emerald-400">
                ≈ {form.ctc_currency} {hourlyPreview}/hr (based on company working hours)
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inv_ctc_currency">Currency</Label>
            <Select
              id="inv_ctc_currency"
              value={form.ctc_currency}
              onChange={(e) => field("ctc_currency", e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* ── Section 4: System Access ── */}
      <div className="space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
          4 · System access
        </p>
        <p className="text-[12px] text-text-secondary">
          An invite email will be sent to the address above. The employee sets their
          own password when they accept the invite.
        </p>
      </div>

      {error && (
        <div className="rounded border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Sending invite…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
