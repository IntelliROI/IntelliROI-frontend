"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  COUNTRIES,
  CURRENCIES,
  DEFAULT_COUNTRY_ISO,
  DEFAULT_CURRENCY,
  digitsOnly,
  findCountry,
  fromE164,
  type CountryIso,
} from "@/constants/locale";
import { ROLES } from "@/constants/roles";
import { lineManagers } from "@/lib/org/line-managers";
import {
  employeeOrgPatchSchema,
  type EmployeeOrgPatchSchema,
} from "@/features/organization/schemas/organization.schema";
import type {
  Department,
  Employee,
  Team,
} from "@/features/organization/types";

type Props = {
  employee: Employee;
  departments: Department[];
  teams: Team[];
  managers?: Employee[];
  onSubmit: (values: EmployeeOrgPatchSchema) => Promise<void>;
  onCancel: () => void;
  /** Current CTC values to pre-populate the fields. */
  currentCtcAnnual?: number | null;
  currentCtcCurrency?: string;
  /** Company's configured currency — default for CTC currency dropdown. */
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

export function EditEmployeeForm({
  employee,
  departments,
  teams,
  managers = [],
  onSubmit,
  onCancel,
  currentCtcAnnual,
  currentCtcCurrency,
  defaultCurrency = DEFAULT_CURRENCY,
  workingHoursPerDay = 8,
  workingDaysPerMonth = 22,
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
    manager_employee_id: employee.manager_employee_id
      ? String(employee.manager_employee_id)
      : "",
    joining_date: employee.joining_date ?? "",
    ctc_annual: currentCtcAnnual != null ? String(currentCtcAnnual) : "",
    ctc_currency: currentCtcCurrency ?? defaultCurrency,
  });

  const teamsInDept = useMemo(
    () => teams.filter((t) => String(t.department_id) === form.department_id),
    [teams, form.department_id],
  );
  const managerOptions = useMemo(
    () =>
      lineManagers(managers).filter(
        (m) =>
          m.app_role === ROLES.DEPARTMENT_HEAD && m.uuid !== employee.uuid,
      ),
    [managers, employee.uuid],
  );
  const country = findCountry(form.phone_iso);
  const hourlyPreview = computeHourlyPreview(
    form.ctc_annual,
    workingHoursPerDay,
    workingDaysPerMonth,
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = employeeOrgPatchSchema.safeParse({
      ...form,
      team_id: form.team_id ? Number(form.team_id) : null,
      manager_employee_id: form.manager_employee_id
        ? Number(form.manager_employee_id)
        : null,
      ctc_annual: form.ctc_annual !== "" ? Number(form.ctc_annual) : null,
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
        Edit profile · {employee.email}
      </p>

      {/* ── Identity ── */}
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
          <Label>Designation (job title)</Label>
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
                  phone_iso: e.target.value as CountryIso,
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
      </div>

      {/* ── Organisation ── */}
      <div className="grid gap-4 sm:grid-cols-2">
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

      {/* ── Compensation (CTC) ── */}
      <div className="space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary/70">
          Compensation
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit_ctc_annual">
              Annual CTC{" "}
              <span className="text-text-secondary/60">(leave blank to keep current)</span>
            </Label>
            <Input
              id="edit_ctc_annual"
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 1200000"
              value={form.ctc_annual}
              onChange={(e) =>
                setForm((f) => ({ ...f, ctc_annual: e.target.value }))
              }
            />
            {hourlyPreview && (
              <p className="text-[11px] text-emerald-400">
                ≈ {form.ctc_currency} {hourlyPreview}/hr (based on company working hours)
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_ctc_currency">Currency</Label>
            <Select
              id="edit_ctc_currency"
              value={form.ctc_currency}
              onChange={(e) =>
                setForm((f) => ({ ...f, ctc_currency: e.target.value }))
              }
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {!form.ctc_annual && !currentCtcAnnual && (
          <div className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-400">
            ⚠ No CTC set — Estimated ROI will show as{" "}
            <strong>Setup needed</strong> for this employee.
          </div>
        )}
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
