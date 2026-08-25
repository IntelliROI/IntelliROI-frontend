"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import {
  companySettingsSchema,
  type CompanySettingsSchema,
} from "@/features/organization/schemas/organization.schema";
import type { CompanySettings } from "@/features/organization/types";
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  defaultUsdFxRate,
} from "@/constants/locale";

type Props = {
  initial?: Partial<CompanySettings>;
  onSubmit: (values: CompanySettingsSchema) => Promise<void>;
  submitLabel?: string;
};

export function CompanySettingsForm({
  initial,
  onSubmit,
  submitLabel = "Save settings",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialCurrency = initial?.default_currency ?? DEFAULT_CURRENCY;
  const [form, setForm] = useState({
    working_hours_per_day: String(initial?.working_hours_per_day ?? 8),
    working_days_per_month: String(initial?.working_days_per_month ?? 22),
    default_currency: initialCurrency,
    timezone: initial?.timezone ?? "Asia/Kolkata",
    date_format: initial?.date_format ?? "YYYY-MM-DD",
    fiscal_year_start: initial?.fiscal_year_start ?? "01-01",
    usd_fx_rate: String(
      initial?.usd_fx_rate && initial.usd_fx_rate > 0
        ? initial.usd_fx_rate
        : defaultUsdFxRate(initialCurrency),
    ),
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = companySettingsSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid settings");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      {(
        [
          ["working_hours_per_day", "Working hours / day"],
          ["working_days_per_month", "Working days / month"],
          ["timezone", "Timezone"],
          ["date_format", "Date format"],
          ["fiscal_year_start", "Fiscal year start (MM-DD)"],
        ] as const
      ).map(([key, label]) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{label}</Label>
          <Input
            id={key}
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          />
        </div>
      ))}
      <div className="space-y-2">
        <Label htmlFor="default_currency">Currency</Label>
        <Select
          id="default_currency"
          value={form.default_currency}
          onChange={(e) => {
            const code = e.target.value as (typeof CURRENCIES)[number]["code"];
            setForm((f) => ({
              ...f,
              default_currency: code,
              usd_fx_rate: String(defaultUsdFxRate(code)),
            }));
          }}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="usd_fx_rate">USD → company FX rate</Label>
        <Input
          id="usd_fx_rate"
          type="number"
          min={0.0001}
          step="any"
          value={form.usd_fx_rate}
          onChange={(e) =>
            setForm((f) => ({ ...f, usd_fx_rate: e.target.value }))
          }
        />
        <p className="text-xs text-text-secondary/70">
          Company-currency units per 1 USD (e.g. 83 for INR). Used for AI cost
          and Estimated ROI conversion.
        </p>
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
