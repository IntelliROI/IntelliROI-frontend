"use client";

import { useState, useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  jobRoleSchema,
  type JobRoleSchema,
} from "@/features/organization/schemas/organization.schema";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/constants/locale";
import type { JobRole } from "@/features/organization/types";

type Props = {
  onSubmit: (values: JobRoleSchema) => Promise<void>;
  submitLabel?: string;
  initial?: Partial<JobRole>;
};

export function CreateJobRoleForm({
  onSubmit,
  submitLabel = "Add job role",
  initial,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    role_name: initial?.role_name ?? "",
    hourly_cost: initial?.hourly_cost != null ? String(initial.hourly_cost) : "",
    currency: initial?.currency ?? DEFAULT_CURRENCY,
    status: initial?.status ?? "active",
  });
  const submitting = useRef(false);
  const isEdit = Boolean(initial?.id);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    const parsed = jobRoleSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid job role");
      return;
    }
    setError(null);
    submitting.current = true;
    setLoading(true);
    try {
      await onSubmit(parsed.data);
      if (!isEdit) {
        setForm({
          role_name: "",
          hourly_cost: "",
          currency: DEFAULT_CURRENCY,
          status: "active",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save job role");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2 sm:col-span-1">
        <Label htmlFor="role_name">Job role name</Label>
        <Input
          id="role_name"
          placeholder="Frontend Developer"
          value={form.role_name}
          onChange={(e) => setForm((f) => ({ ...f, role_name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hourly_cost">Hourly cost</Label>
        <Input
          id="hourly_cost"
          type="number"
          min={1}
          step="0.01"
          value={form.hourly_cost}
          onChange={(e) =>
            setForm((f) => ({ ...f, hourly_cost: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select
          id="currency"
          value={form.currency}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              currency: e.target.value as (typeof CURRENCIES)[number]["code"],
            }))
          }
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>
      {isEdit ? (
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
      ) : null}
      {error && <p className="sm:col-span-3 text-sm text-danger">{error}</p>}
      <div className="sm:col-span-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
