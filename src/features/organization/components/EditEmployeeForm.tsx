"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  COUNTRIES,
  DEFAULT_COUNTRY_ISO,
  digitsOnly,
  findCountry,
  fromE164,
} from "@/constants/locale";
import { lineManagers } from "@/lib/org/line-managers";
import {
  employeeOrgPatchSchema,
  type EmployeeOrgPatchSchema,
} from "@/features/organization/schemas/organization.schema";
import type {
  Department,
  Employee,
  JobRole,
  Team,
} from "@/features/organization/types";

type Props = {
  employee: Employee;
  departments: Department[];
  teams: Team[];
  jobRoles: JobRole[];
  managers?: Employee[];
  onSubmit: (values: EmployeeOrgPatchSchema) => Promise<void>;
  onCancel: () => void;
};

export function EditEmployeeForm({
  employee,
  departments,
  teams,
  jobRoles,
  managers = [],
  onSubmit,
  onCancel,
}: Props) {
  const parsedPhone = fromE164(employee.phone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    employee_code: employee.employee_code ?? "",
    phone_iso: parsedPhone.iso || DEFAULT_COUNTRY_ISO,
    phone_national: parsedPhone.national,
    designation: employee.designation ?? "",
    department_id: employee.department_id ? String(employee.department_id) : "",
    team_id: employee.team_id ? String(employee.team_id) : "",
    job_role_id: employee.job_role_id ? String(employee.job_role_id) : "",
    manager_employee_id: employee.manager_employee_id
      ? String(employee.manager_employee_id)
      : "",
    joining_date: employee.joining_date ?? "",
  });

  const teamsInDept = useMemo(
    () => teams.filter((t) => String(t.department_id) === form.department_id),
    [teams, form.department_id],
  );
  const managerOptions = useMemo(
    () => lineManagers(managers).filter((m) => m.uuid !== employee.uuid),
    [managers, employee.uuid],
  );
  const country = findCountry(form.phone_iso);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = employeeOrgPatchSchema.safeParse({
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
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
        Edit assignment · {employee.email}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Employee ID</Label>
          <Input
            value={form.employee_code}
            onChange={(e) =>
              setForm((f) => ({ ...f, employee_code: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Designation</Label>
          <Input
            value={form.designation}
            onChange={(e) =>
              setForm((f) => ({ ...f, designation: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Phone</Label>
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
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
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
            <option value="">No department</option>
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
            <option value="">No team</option>
            {teamsInDept.map((t) => (
              <option key={t.id} value={t.id}>
                {t.team_name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Job role</Label>
          <Select
            value={form.job_role_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, job_role_id: e.target.value }))
            }
          >
            <option value="">No job role</option>
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
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
