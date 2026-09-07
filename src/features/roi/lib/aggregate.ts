import type { RoiSummary } from "@/features/roi/api/roi.api";
import type { RoiPeriod } from "@/components/ui/period-switcher";

/**
 * App-wide Estimated ROI formula — never average child ROI percentages.
 * spend / business_value must already be in company currency.
 */
export function estimatedRoiPct(
  businessValue: number,
  spend: number,
): number {
  if (!(spend > 0)) return 0;
  return ((businessValue - spend) / spend) * 100;
}

export type AggregatedRoi = {
  requests: number;
  total_spend: number;
  business_value: number;
  roi_pct: number;
};

/** Sum child ROI rows into parent totals with formula ROI. */
export function aggregateRoiSummaries(
  rows: Array<Pick<
    RoiSummary,
    "requests" | "total_spend" | "business_value"
  > | null | undefined>,
): AggregatedRoi {
  let requests = 0;
  let total_spend = 0;
  let business_value = 0;
  for (const row of rows) {
    if (!row) continue;
    requests += Number(row.requests) || 0;
    total_spend += Number(row.total_spend) || 0;
    business_value += Number(row.business_value) || 0;
  }
  return {
    requests,
    total_spend,
    business_value,
    roi_pct: estimatedRoiPct(business_value, total_spend),
  };
}

/**
 * Analytics workers do not support `week`. Map ROI period → analytics period
 * for trend charts only; executive spend/ROI KPIs should still use ROI period.
 */
export function toAnalyticsPeriod(period: RoiPeriod): "day" | "month" {
  return period === "week" ? "day" : period;
}

/**
 * Spend display rule (app-wide):
 * - ROI service totals are already company currency → never pass through fromUsd.
 * - Analytics/cost USD amounts → use fromUsd only for non-KPI trends until BE
 *   returns company currency on those services.
 */
export function isRoiCompanyCurrencySpend(_source: "roi" | "analytics" | "cost") {
  return _source === "roi";
}
