"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import {
  teamSchema,
  type TeamSchema,
} from "@/features/organization/schemas/organization.schema";
import type { Department, Employee } from "@/features/organization/types";
import { lineManagers } from "@/lib/org/line-managers";

type Props = {
  departments: Department[];
  leads?: Employee[];
  defaultDepartmentId?: number;
  onSubmit: (values: TeamSchema) => Promise<void>;
  submitLabel?: string;
  initial?: Partial<Team>;
};

export function CreateTeamForm({
  departments,
  leads = [],
  defaultDepartmentId,
  onSubmit,
  submitLabel = "Create team",
  initial,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    team_name: initial?.team_name ?? "",
    team_code: initial?.team_code ?? "",
    department_id: String(
      initial?.department_id ?? defaultDepartmentId ?? departments[0]?.id ?? "",
    ),
    description: initial?.description ?? "",
    team_lead_employee_id: initial?.team_lead_employee_id
      ? String(initial.team_lead_employee_id)
      : "",
    status: initial?.status ?? "active",
  });
  const isEdit = Boolean(initial?.id);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = teamSchema.safeParse({
      ...form,
      team_lead_employee_id: form.team_lead_employee_id
        ? Number(form.team_lead_employee_id)
        : null,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid team");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(parsed.data);
      if (!isEdit) {
        setForm((f) => ({
          ...f,
          team_name: "",
          team_code: "",
          description: "",
          team_lead_employee_id: "",
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save team");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="team_name">Team name</Label>
        <Input
          id="team_name"
          placeholder="Frontend Team"
          value={form.team_name}
          onChange={(e) => setForm((f) => ({ ...f, team_name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="team_code">Team code</Label>
        <Input
          id="team_code"
          placeholder="FE"
          value={form.team_code}
          onChange={(e) => setForm((f) => ({ ...f, team_code: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department_id">Department</Label>
        <Select
          id="department_id"
          value={form.department_id}
          disabled={isEdit}
          onChange={(e) =>
            setForm((f) => ({ ...f, department_id: e.target.value }))
          }
        >
          <option value="">Select department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.department_name} ({d.department_code})
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="team_lead_employee_id">Team lead</Label>
        <Select
          id="team_lead_employee_id"
          value={form.team_lead_employee_id}
          onChange={(e) =>
            setForm((f) => ({ ...f, team_lead_employee_id: e.target.value }))
          }
        >
          <option value="">Assign later</option>
          {lineManagers(leads).map((m) => (
            <option key={m.id} value={m.id}>
              {m.display_name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          id="status"
          value={form.status}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              status: e.target.value as "active" | "inactive",
            }))
          }
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>
      {error && <p className="sm:col-span-2 text-sm text-danger">{error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
