"use client";

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
 * ROI totals are already in company currency; analytics/cost USD amounts
 * should go through `fromUsd`.
 */
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

  const currency = (
    settings.data?.currency ||
    storeCurrency ||
    DEFAULT_CURRENCY
  ).toUpperCase() as CurrencyCode;

  const usdFxRate =
    settings.data?.usd_fx_rate && settings.data.usd_fx_rate > 0
      ? settings.data.usd_fx_rate
      : defaultUsdFxRate(currency);

  return {
    currency,
    usdFxRate,
    fromUsd: (usdAmount: number) =>
      convertUsdToCompany(usdAmount, currency, usdFxRate),
    isLoading: settings.isLoading,
  };
}
