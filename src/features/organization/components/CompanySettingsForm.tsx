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

/** Mirrors the backend allowlist in company_settings.go exactly. */
const DATE_FORMAT_OPTIONS = [
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD  (e.g. 2024-09-23)" },
  { value: "DD-MM-YYYY", label: "DD-MM-YYYY  (e.g. 23-09-2024)" },
  { value: "MM-DD-YYYY", label: "MM-DD-YYYY  (e.g. 09-23-2024)" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY  (e.g. 23/09/2024)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY  (e.g. 09/23/2024)" },
] as const;

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
    strict_benchmark_policy: initial?.strict_benchmark_policy ?? false,
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
      {/* Date format — constrained to backend allowlist; must be a Select, not free text. */}
      <div className="space-y-2">
        <Label htmlFor="date_format">Date format</Label>
        <Select
          id="date_format"
          value={form.date_format}
          onChange={(e) =>
            setForm((f) => ({ ...f, date_format: e.target.value as typeof form.date_format }))
          }
        >
          {DATE_FORMAT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
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
      <div className="sm:col-span-2 border border-hairline bg-surface/30 p-4 rounded-[8px] flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Label htmlFor="strict_benchmark_policy" className="font-medium text-text-primary cursor-pointer">
            Enforce Approved Benchmarks for AI Prompts
          </Label>
          <p className="text-xs text-text-secondary leading-relaxed">
            When enabled, employees cannot prompt the AI on tasks that do not have an approved benchmark and assigned CTC.
          </p>
        </div>
        <input
          id="strict_benchmark_policy"
          type="checkbox"
          checked={form.strict_benchmark_policy}
          onChange={(e) =>
            setForm((f) => ({ ...f, strict_benchmark_policy: e.target.checked }))
          }
          className="mt-1 h-5 w-5 rounded border-hairline bg-surface text-accent focus:ring-accent accent-accent cursor-pointer"
        />
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
