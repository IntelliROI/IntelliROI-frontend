"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import {
  DEFAULT_CURRENCY,
  convertUsdToCompany,
  defaultUsdFxRate,
  type CurrencyCode,
} from "@/constants/locale";
import { authApi } from "@/features/auth/api/auth.api";
import { queryKeys } from "@/lib/api/query-keys";

/**
 * Single display currency for the tenant: company settings currency + FX.
 *
 * App-wide spend rule:
 * - ROI service totals (`total_spend`, `business_value`) are already in
 *   company currency — never pass them through `fromUsd`.
 * - Analytics / cost USD amounts may use `fromUsd` for charts until those
 *   services return company currency. Do not use converted analytics spend
 *   as the executive number next to Estimated ROI when an ROI total exists.
 */

const FX_CACHE_KEY = "intelliroi:company-fx";

type CachedFx = { currency: string; usdFxRate: number };

/**
 * Bug fix: while `/auth/company/settings` is still loading (first mount of a
 * session, or after a hard refresh), `fromUsd` used to silently fall back to
 * a hardcoded default FX rate (e.g. INR 83) instead of the company's real
 * configured `usd_fx_rate` (e.g. 71). Screens that mounted before the
 * settings query resolved (Usage, Projects) rendered a *different* converted
 * cost than screens that mounted after it was cached (Executive dashboard,
 * which reused a warm cache) — same underlying spend, two different rupee
 * amounts on screen. We persist the last confirmed real rate for this
 * session so every screen — even the very first one to mount — uses the
 * true rate immediately instead of a generic default.
 */
function readCachedFx(): CachedFx | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(FX_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedFx>;
    if (!parsed.currency || !parsed.usdFxRate || parsed.usdFxRate <= 0) {
      return null;
    }
    return { currency: parsed.currency, usdFxRate: parsed.usdFxRate };
  } catch {
    return null;
  }
}

function writeCachedFx(currency: string, usdFxRate: number) {
  if (typeof window === "undefined") return;
  if (!currency || !usdFxRate || usdFxRate <= 0) return;
  try {
    window.sessionStorage.setItem(
      FX_CACHE_KEY,
      JSON.stringify({ currency, usdFxRate }),
    );
  } catch {
    /* best-effort cache — safe to ignore storage failures */
  }
}

export function useCompanyCurrency(companySlug?: string) {
  const storeCurrency = useAuthStore((s) => s.company?.currency);
  const storeSlug = useAuthStore((s) => s.company?.slug);
  const slug = companySlug || storeSlug || "";

  const settings = useQuery({
    queryKey: queryKeys.company.settings(slug || "_"),
    queryFn: () => authApi.getCompanySettings(),
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  });

  const cached = readCachedFx();

  const currency = (
    settings.data?.currency ||
    (cached?.currency ?? undefined) ||
    storeCurrency ||
    DEFAULT_CURRENCY
  ).toUpperCase() as CurrencyCode;

  const usdFxRate =
    settings.data?.usd_fx_rate && settings.data.usd_fx_rate > 0
      ? settings.data.usd_fx_rate
      : cached && cached.currency.toUpperCase() === currency
        ? cached.usdFxRate
        : defaultUsdFxRate(currency);

  // Persist the confirmed real rate once the settings call resolves so the
  // next screen (or the next tab) never has to guess with a default again.
  useEffect(() => {
    if (settings.data?.currency && settings.data.usd_fx_rate) {
      writeCachedFx(settings.data.currency, settings.data.usd_fx_rate);
    }
  }, [settings.data?.currency, settings.data?.usd_fx_rate]);

  return {
    currency,
    usdFxRate,
    fromUsd: (usdAmount: number) =>
      convertUsdToCompany(usdAmount, currency, usdFxRate),
    isLoading: settings.isLoading && !cached,
  };
}
