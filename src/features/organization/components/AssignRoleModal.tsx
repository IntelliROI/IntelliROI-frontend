"use client";

import { useState, useEffect, type FormEvent } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/constants/locale";
import type { JobRole } from "@/features/organization/types";
import { businessContextApi } from "@/features/business-context/api/business-context.api";

type Props = {
  open: boolean;
  onClose: () => void;
  userUuid: string;
  employeeName: string;
  jobRoles: JobRole[];
  currentJobRoleId?: number | null;
  currentCtcAnnual?: number | null;
  currentCtcCurrency?: string;
  defaultCurrency?: string;
  onSuccess?: () => void;
};

export function AssignRoleModal({
  open,
  onClose,
  userUuid,
  employeeName,
  jobRoles,
  currentJobRoleId,
  currentCtcAnnual,
  currentCtcCurrency,
  defaultCurrency = DEFAULT_CURRENCY,
  onSuccess,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [jobRoleId, setJobRoleId] = useState<string>(
    currentJobRoleId ? String(currentJobRoleId) : "",
  );
  const [ctcAnnual, setCtcAnnual] = useState<string>(
    currentCtcAnnual != null ? String(currentCtcAnnual) : "",
  );
  const [ctcCurrency, setCtcCurrency] = useState<string>(
    currentCtcCurrency || defaultCurrency,
  );
  const [effectiveFrom, setEffectiveFrom] = useState<string>(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setJobRoleId(currentJobRoleId ? String(currentJobRoleId) : "");
      setCtcAnnual(currentCtcAnnual != null ? String(currentCtcAnnual) : "");
      setCtcCurrency(currentCtcCurrency || defaultCurrency);
      setEffectiveFrom(new Date().toISOString().slice(0, 10));
      setError(null);
    }
  }, [open, currentJobRoleId, currentCtcAnnual, currentCtcCurrency, defaultCurrency]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!jobRoleId) {
      setError("Please select a job role");
      return;
    }
    const numericRole = Number(jobRoleId);
    if (!numericRole || numericRole <= 0) {
      setError("Invalid job role");
      return;
    }

    const numericCtc = ctcAnnual.trim() !== "" ? Number(ctcAnnual) : null;
    if (numericCtc != null && (Number.isNaN(numericCtc) || numericCtc <= 0)) {
      setError("Annual CTC must be a positive number");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await businessContextApi.assignEmployeeRole(userUuid, {
        job_role_id: numericRole,
        ctc_annual: numericCtc,
        ctc_currency: ctcCurrency || defaultCurrency,
        effective_from: effectiveFrom || undefined,
      });

      toast.success(`Role & CTC assigned for ${employeeName}`);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Role assignment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Organization"
      title={`Assign Role & CTC · ${employeeName}`}
      description="Assign a job role with annual CTC and effective date. Closes the prior role history and recalculates Estimated ROI."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="assign_job_role">Job Role</Label>
          <Select
            id="assign_job_role"
            value={jobRoleId}
            onChange={(e) => setJobRoleId(e.target.value)}
            required
          >
            <option value="">Select a job role</option>
            {jobRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.role_name} ({r.hourly_cost} {r.currency || defaultCurrency}/hr)
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="assign_ctc_annual">
              Annual CTC <span className="text-text-secondary/60">(optional)</span>
            </Label>
            <Input
              id="assign_ctc_annual"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 1200000"
              value={ctcAnnual}
              onChange={(e) => setCtcAnnual(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assign_ctc_currency">Currency</Label>
            <Select
              id="assign_ctc_currency"
              value={ctcCurrency}
              onChange={(e) => setCtcCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assign_effective_from">Effective Date</Label>
          <Input
            id="assign_effective_from"
            type="date"
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
            required
          />
        </div>

        {!ctcAnnual && (
          <div className="rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-400">
            💡 Without CTC, this employee&apos;s personal Estimated ROI will show as{" "}
            <strong>Setup needed</strong> until entered.
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Assigning…" : "Save Role & CTC"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
