"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, X } from "lucide-react";
import { MetricTile } from "@/components/dashboard/KpiTile";
import {
  InsightRow,
  RankBar,
  SectionLabel,
} from "@/components/dashboard/DashboardChrome";
import { Panel, Provenance, LiveDot } from "@/components/ui/panel";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { TrendAreaChart, ProviderDonut } from "@/components/charts/Charts";
import { Button } from "@/components/ui/button";
import { roiApi } from "@/features/roi/api/roi.api";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { costApi } from "@/features/cost/api/cost.api";
import { organizationApi } from "@/features/organization/api/organization.api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { revealTransition } from "@/lib/motion";

function sparkFromSeries(
  series: { roi_pct?: number; requests?: number; cost?: number }[],
  key: "roi_pct" | "requests" | "cost",
) {
  return series.map((p) => Number(p[key] ?? 0));
}

/**
 * CEO executive console — answers: “Is our AI investment producing value?”
 * Patterns: Advanced Stats hero + Efferd dense mosaic + Stripe rank bars.
 */
export function CeoDashboard({ companySlug }: { companySlug: string }) {
  const company = useAuthStore((s) => s.company);
  const user = useAuthStore((s) => s.user);

  const roi = useQuery({
    queryKey: ["company", companySlug, "roi", "summary"],
    queryFn: () => roiApi.company("month"),
  });
  const analytics = useQuery({
    queryKey: ["company", companySlug, "analytics"],
    queryFn: () => analyticsApi.company("day"),
  });
  const costs = useQuery({
    queryKey: ["company", companySlug, "costs"],
    queryFn: () => costApi.summary("company", "month"),
  });
  const departments = useQuery({
    queryKey: ["company", companySlug, "departments"],
    queryFn: () => organizationApi.listDepartments(),
  });
  const recommendations = useQuery({
    queryKey: ["company", companySlug, "roi", "recommendations"],
    queryFn: () => roiApi.recommendations("open"),
  });

  const series = useMemo(
    () =>
      analytics.data?.series.map((p) => ({
        date: p.date.slice(5),
        value: p.roi_pct,
        secondary: p.cost / 100,
      })) ?? [],
    [analytics.data],
  );

  const deptMax = Math.max(
    ...(departments.data?.map((d) => d.roi_pct) ?? [1]),
    1,
  );

  if (roi.isLoading || analytics.isLoading) {
    return (
      <div className="space-y-px bg-hairline">
        <LoadingBlock className="h-48 border-0" />
        <div className="grid gap-px md:grid-cols-3">
          <LoadingBlock className="h-28 border-0" />
          <LoadingBlock className="h-28 border-0" />
          <LoadingBlock className="h-28 border-0" />
        </div>
        <LoadingBlock className="h-72 border-0" />
      </div>
    );
  }

  const roiData = roi.data!;
  const rawSeries = analytics.data?.series ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Executive · Company"
        title={`Good ${greeting()}, ${user?.first_name ?? "there"}`}
        description={`${company?.name ?? "Company"} — is AI investment producing Estimated ROI?`}
        actions={
          <div className="flex items-center gap-2">
            <LiveDot label="Live MTD" />
            <Button asChild variant="secondary" size="sm">
              <Link href={`/${companySlug}/roi`}>
                Full ROI
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </Button>
          </div>
        }
      />

      {/* Hero mosaic — Estimated ROI dominates */}
      <div className="mb-px grid gap-px bg-hairline lg:grid-cols-12">
        <MetricTile
          className="lg:col-span-5"
          variant="hero"
          label="Estimated ROI"
          value={roiData.roi_pct}
          format="percent"
          delta={roiData.vs_last_month_pct}
          hint={`${formatCurrency(roiData.business_value)} value · ${formatCurrency(roiData.total_spend)} spend`}
          spark={sparkFromSeries(rawSeries, "roi_pct")}
          delay={0}
        />
        <div className="grid gap-px bg-hairline sm:grid-cols-2 lg:col-span-7 lg:grid-cols-2">
          <MetricTile
            label="AI spend MTD"
            value={roiData.total_spend}
            format="currency"
            delta={-4.2}
            hint="vs last month"
            spark={sparkFromSeries(rawSeries, "cost")}
            delay={0.05}
          />
          <MetricTile
            label="Business value"
            value={roiData.business_value}
            format="currency"
            delta={roiData.vs_last_month_pct}
            hint="benchmark-based"
            delay={0.08}
          />
          <MetricTile
            label="Time saved"
            value={roiData.time_saved_hours}
            format="number"
            hint="hours this month"
            delay={0.11}
          />
          <MetricTile
            label="Adoption"
            value={Math.round(roiData.adoption_rate * 100)}
            format="percent"
            hint={`${roiData.active_employees}/${roiData.total_seats} seats active`}
            spark={sparkFromSeries(rawSeries, "requests")}
            delay={0.14}
          />
        </div>
      </div>

      {/* Trend + providers */}
      <div className="grid gap-px bg-hairline lg:grid-cols-12">
        <Panel className="border-0 bg-ink p-5 md:p-6 lg:col-span-8">
          <SectionLabel
            title="Estimated ROI vs spend"
            meta={
              <Provenance
                computedAt={roiData.computed_at}
                formulaVersion={roiData.formula_version}
              />
            }
          />
          <TrendAreaChart data={series} secondaryKey="secondary" height={300} />
          <div className="mt-3 flex gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary">
            <span className="inline-flex items-center gap-2">
              <span className="h-px w-4 bg-accent" /> ROI %
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-px w-4 border-t border-dashed border-accent-blue" />{" "}
              Spend index
            </span>
          </div>
        </Panel>

        <Panel className="border-0 bg-ink p-5 md:p-6 lg:col-span-4">
          <SectionLabel title="Provider mix" meta="Cost share" />
          <ProviderDonut
            data={(costs.data?.by_provider ?? []).map((p) => ({
              name: p.provider,
              value: p.cost,
            }))}
          />
          <ul className="mt-1 space-y-2.5">
            {(costs.data?.by_provider ?? []).map((p, i) => (
              <li
                key={p.provider}
                className="flex items-center justify-between gap-3"
              >
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text-secondary">
                  <span
                    className="h-1.5 w-1.5"
                    style={{
                      background:
                        i === 0
                          ? "var(--role-accent)"
                          : i === 1
                            ? "#4F8CFF"
                            : "#F59E0B",
                    }}
                  />
                  {p.provider}
                </span>
                <span className="font-mono text-[12px] text-text-primary">
                  {formatCurrency(p.cost, "USD", true)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Dept ranks + insights + recommendations */}
      <div className="mt-px grid gap-px bg-hairline lg:grid-cols-12">
        <Panel className="border-0 bg-ink p-5 md:p-6 lg:col-span-5">
          <SectionLabel
            title="ROI by department"
            meta="Drill into org"
            action={
              <Link
                href={`/${companySlug}/organization/departments`}
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent hover:underline"
              >
                All depts
              </Link>
            }
          />
          <div className="divide-y divide-hairline">
            {(departments.data ?? []).map((d) => (
              <RankBar
                key={d.id}
                label={d.department_name}
                valueLabel={`${d.roi_pct}% · ${formatCurrency(d.monthly_spend, "USD", true)}`}
                percent={(d.roi_pct / deptMax) * 100}
                href={`/${companySlug}/organization/departments/${d.id}`}
              />
            ))}
          </div>
        </Panel>

        <Panel className="border-0 bg-ink lg:col-span-3">
          <div className="border-b border-hairline px-5 py-4">
            <SectionLabel title="Executive signals" className="mb-0" />
          </div>
          <InsightRow tone="good" code="TOP">
            Engineering leads Estimated ROI at{" "}
            {departments.data?.[0]?.roi_pct ?? "—"}%.
          </InsightRow>
          <InsightRow tone="warn" code="WATCH">
            Marketing spend rising faster than value — review model mix.
          </InsightRow>
          <InsightRow tone="info" code="ADOPT">
            {Math.round(roiData.adoption_rate * 100)}% seat adoption ·{" "}
            {formatNumber(roiData.active_employees)} active.
          </InsightRow>
          <InsightRow tone="info" code="REQ">
            {formatNumber(analytics.data?.requests ?? 0)} AI requests in window.
          </InsightRow>
        </Panel>

        <Panel className="border-0 bg-ink lg:col-span-4">
          <div className="border-b border-hairline px-5 py-4">
            <SectionLabel
              title="Recommendations"
              meta="Actionable"
              className="mb-0"
              action={
                <Link
                  href={`/${companySlug}/roi/recommendations`}
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent hover:underline"
                >
                  View all
                </Link>
              }
            />
          </div>
          <div className="divide-y divide-hairline">
            {(recommendations.data ?? []).slice(0, 3).map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...revealTransition, delay: 0.1 + i * 0.05 }}
                className="px-5 py-4"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                  Save {formatCurrency(rec.impact_monthly_usd)}/mo
                </p>
                <p className="mt-2 text-[13px] font-medium text-text-primary">
                  {rec.title}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
                  {rec.rationale}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      roiApi.updateRecommendation(rec.id, "accepted")
                    }
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      roiApi.updateRecommendation(rec.id, "dismissed")
                    }
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Dismiss
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
