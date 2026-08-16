"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { ROLES, ROLE_LABELS } from "@/constants/roles";
import {
  COUNTRIES,
  DEFAULT_COUNTRY_ISO,
  digitsOnly,
  findCountry,
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

type Props = {
  departments: Department[];
  teams: Team[];
  jobRoles: JobRole[];
  managers?: Employee[];
  onSubmit: (values: EmployeeSchema) => Promise<void>;
  submitLabel?: string;
};

/** Company owner is created at registration — cannot be invited. */
const APP_ROLES = [
  ROLES.EMPLOYEE,
  ROLES.TEAM_LEAD,
  ROLES.DEPARTMENT_HEAD,
] as const;

/**
 * Full org-identity employee form from domain design:
 * personal + organization + access (app role).
 */
export function CreateEmployeeForm({
  departments,
  teams,
  jobRoles,
  managers = [],
  onSubmit,
  submitLabel = "Add employee",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    display_name: "",
    email: "",
    phone_iso: DEFAULT_COUNTRY_ISO,
    phone_national: "",
    employee_code: "",
    department_id: "",
    team_id: "",
    job_role_id: "",
    manager_employee_id: "",
    designation: "",
    joining_date: new Date().toISOString().slice(0, 10),
    employment_status: "active",
    app_role: ROLES.EMPLOYEE,
  });

  const teamsInDept = useMemo(
    () =>
      teams.filter((t) => String(t.department_id) === form.department_id),
    [teams, form.department_id],
  );

  const managerOptions = useMemo(() => lineManagers(managers), [managers]);
  const country = findCountry(form.phone_iso);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = employeeSchema.safeParse({
      ...form,
      team_id: form.team_id ? Number(form.team_id) : null,
      manager_employee_id: form.manager_employee_id
        ? Number(form.manager_employee_id)
        : null,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid employee");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create person");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
            />
          </div>
          <div className="space-y-2">
            <Label>Last name</Label>
            <Input
              value={form.last_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, last_name: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Display name</Label>
            <Input
              placeholder="Optional"
              value={form.display_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, display_name: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Phone (optional)</Label>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,14rem)_1fr]">
              <Select
                value={form.phone_iso}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    phone_iso: e.target.value,
                    phone_national: "",
                  }))
                }
                aria-label="Country code"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.iso} value={c.iso}>
                    {c.iso} {c.dial} · {c.name}
                  </option>
                ))}
              </Select>
              <Input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder={
                  country ? `${country.min} digit number` : "Phone number"
                }
                value={form.phone_national}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    phone_national: digitsOnly(e.target.value).slice(
                      0,
                      country?.max ?? 15,
                    ),
                  }))
                }
              />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-secondary/60">
              Digits only · country list is bundled locally — no network lookup
            </p>
          </div>
        </div>
      </section>

      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
          Organization information
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
            <Label>Department (optional)</Label>
            <Select
              value={form.department_id}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  department_id: e.target.value,
                  team_id: "",
                }))
              }
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Team</Label>
            <Select
              value={form.team_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, team_id: e.target.value }))
              }
            >
              <option value="">No team yet</option>
              {teamsInDept.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.team_name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Job role (optional)</Label>
            <Select
              value={form.job_role_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, job_role_id: e.target.value }))
              }
            >
              <option value="">Select job role</option>
              {jobRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.role_name} · {r.currency} {r.hourly_cost}/hr
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Manager</Label>
            <Select
              value={form.manager_employee_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, manager_employee_id: e.target.value }))
              }
            >
              <option value="">None</option>
              {managerOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name}
                </option>
              ))}
            </Select>
            <p className="text-xs text-text-secondary/70">
              Company owner is not listed — pick a department head or team lead.
            </p>
          </div>
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
          <div className="space-y-2">
            <Label>Employment status</Label>
            <Select
              value={form.employment_status}
              onChange={(e) =>
                setForm((f) => ({ ...f, employment_status: e.target.value }))
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On leave</option>
            </Select>
          </div>
        </div>
      </section>

      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
          Access information
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
                }))
              }
            >
              {APP_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </div>
          <p className="self-end text-sm text-text-secondary">
            Invite sends login access via auth-service. Org fields can be filled
            later — start with a Department Head if you want them to hire the
            rest of the team.
          </p>
        </div>
      </section>

      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
