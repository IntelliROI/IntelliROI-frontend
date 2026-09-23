"use client";

import { useState, useEffect, type FormEvent } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/constants/locale";
import { businessContextApi } from "@/features/business-context/api/business-context.api";

type Props = {
  open: boolean;
  onClose: () => void;
  userUuid: string;
  employeeName: string;
  currentCtcAnnual?: number | null;
  currentCtcCurrency?: string;
  defaultCurrency?: string;
  onSuccess?: () => void;
};

/**
 * UpdateCtcModal — replaces the old AssignRoleModal.
 * Purely CTC-based: user enters annual CTC + currency + effective date.
 * Hourly cost is auto-calculated by the backend from company settings.
 */
export function AssignRoleModal({
  open,
  onClose,
  userUuid,
  employeeName,
  currentCtcAnnual,
  currentCtcCurrency,
  defaultCurrency = DEFAULT_CURRENCY,
  onSuccess,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
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
      setCtcAnnual(currentCtcAnnual != null ? String(currentCtcAnnual) : "");
      setCtcCurrency(currentCtcCurrency || defaultCurrency);
      setEffectiveFrom(new Date().toISOString().slice(0, 10));
      setError(null);
    }
  }, [open, currentCtcAnnual, currentCtcCurrency, defaultCurrency]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const numericCtc = ctcAnnual.trim() !== "" ? Number(ctcAnnual) : null;
    if (!numericCtc || Number.isNaN(numericCtc) || numericCtc <= 0) {
      setError("Please enter a valid annual CTC greater than 0");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await businessContextApi.assignEmployeeCtc(userUuid, {
        ctc_annual: numericCtc,
        ctc_currency: ctcCurrency || defaultCurrency,
        effective_from: effectiveFrom || undefined,
      });

      toast.success(`CTC updated for ${employeeName}`);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "CTC update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Organization"
      title={`Update CTC · ${employeeName}`}
      description="Enter the employee's annual CTC. Hourly cost is auto-calculated from company working hours. This closes the prior CTC record and recalculates Estimated ROI."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="assign_ctc_annual">
              Annual CTC <span className="text-text-secondary/60">(required)</span>
            </Label>
            <Input
              id="assign_ctc_annual"
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 1200000"
              value={ctcAnnual}
              onChange={(e) => setCtcAnnual(e.target.value)}
              required
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

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Saving…" : "Save CTC"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export const UpdateCtcModal = AssignRoleModal;
