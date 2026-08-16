"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import {
  departmentSchema,
  type DepartmentSchema,
} from "@/features/organization/schemas/organization.schema";
import { lineManagers } from "@/lib/org/line-managers";
import type { Employee } from "@/features/organization/types";

type Props = {
  managers?: Employee[];
  onSubmit: (values: DepartmentSchema) => Promise<void>;
  submitLabel?: string;
};

export function CreateDepartmentForm({
  managers = [],
  onSubmit,
  submitLabel = "Create department",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    department_name: "",
    department_code: "",
    description: "",
    manager_employee_id: "",
    status: "active",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = departmentSchema.safeParse({
      ...form,
      manager_employee_id: form.manager_employee_id
        ? Number(form.manager_employee_id)
        : null,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid department");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(parsed.data);
      setForm({
        department_name: "",
        department_code: "",
        description: "",
        manager_employee_id: "",
        status: "active",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="department_name">Department name</Label>
        <Input
          id="department_name"
          placeholder="Engineering"
          value={form.department_name}
          onChange={(e) =>
            setForm((f) => ({ ...f, department_name: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department_code">Department code</Label>
        <Input
          id="department_code"
          placeholder="ENG"
          value={form.department_code}
          onChange={(e) =>
            setForm((f) => ({ ...f, department_code: e.target.value }))
          }
        />
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
        <Label htmlFor="manager_employee_id">Department manager</Label>
        <Select
          id="manager_employee_id"
          value={form.manager_employee_id}
          onChange={(e) =>
            setForm((f) => ({ ...f, manager_employee_id: e.target.value }))
          }
        >
          <option value="">Assign later</option>
          {lineManagers(managers).map((m) => (
            <option key={m.id} value={m.id}>
              {m.display_name} ({m.employee_code})
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          id="status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>
      {error && <p className="sm:col-span-2 text-sm text-danger">{error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
