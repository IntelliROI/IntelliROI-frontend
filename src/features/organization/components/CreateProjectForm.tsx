"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  projectSchema,
  type ProjectSchema,
} from "@/features/organization/schemas/organization.schema";
import type { Department, Team } from "@/features/organization/types";

type Props = {
  departments: Department[];
  teams: Team[];
  onSubmit: (values: ProjectSchema) => Promise<void>;
};

export function CreateProjectForm({ departments, teams, onSubmit }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    project_name: "",
    description: "",
    department_id: "",
    team_id: "",
  });

  const teamsInDept = useMemo(
    () => teams.filter((t) => String(t.department_id) === form.department_id),
    [teams, form.department_id],
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = projectSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid project");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(parsed.data);
      setForm({
        project_name: "",
        description: "",
        department_id: "",
        team_id: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="project_name">Project name</Label>
        <Input
          id="project_name"
          placeholder="Q3 Launch"
          value={form.project_name}
          onChange={(e) =>
            setForm((f) => ({ ...f, project_name: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department_id">Department</Label>
        <Select
          id="department_id"
          value={form.department_id}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              department_id: e.target.value,
              team_id: "",
            }))
          }
        >
          <option value="">Company-wide</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.department_name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="team_id">Team</Label>
        <Select
          id="team_id"
          value={form.team_id}
          onChange={(e) => setForm((f) => ({ ...f, team_id: e.target.value }))}
        >
          <option value="">No team</option>
          {teamsInDept.map((t) => (
            <option key={t.id} value={t.id}>
              {t.team_name}
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
      {error && <p className="sm:col-span-2 text-sm text-danger">{error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
