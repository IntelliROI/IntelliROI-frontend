"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { organizationApi } from "@/features/organization/api/organization.api";
import { roiApi } from "@/features/roi/api/roi.api";
import { analyticsApi } from "@/features/analytics/api/analytics.api";
import { notificationsApi } from "@/features/notifications/api/notifications.api";
import { aiGatewayApi } from "@/features/ai-gateway/api/ai-gateway.api";

export function useDepartments(companySlug: string) {
  return useQuery({
    queryKey: queryKeys.company.departments(companySlug),
    queryFn: () => organizationApi.listDepartments(),
    staleTime: 60_000,
  });
}

export function useDepartment(companySlug: string, departmentId: number) {
  return useQuery({
    queryKey: queryKeys.company.department(companySlug, departmentId),
    queryFn: () => organizationApi.getDepartment(departmentId),
    staleTime: 60_000,
  });
}

export function useTeams(companySlug: string, departmentId?: number) {
  return useQuery({
    queryKey: queryKeys.company.teams(companySlug, departmentId),
    queryFn: () => organizationApi.listTeams(departmentId),
    staleTime: 60_000,
  });
}

export function useEmployees(companySlug: string) {
  return useQuery({
    queryKey: queryKeys.company.employees(companySlug),
    queryFn: () => organizationApi.listEmployees(),
    staleTime: 60_000,
  });
}

export function useCompanyRoi(companySlug: string, period = "month") {
  return useQuery({
    queryKey: queryKeys.company.roi.summary(companySlug, period),
    queryFn: () => roiApi.company(period),
    staleTime: 60_000,
  });
}

export function useScopedAnalytics(
  companySlug: string,
  scope: "company" | "department" | "team" | "employee",
  id?: number | string,
  period = "day",
) {
  return useQuery({
    queryKey:
      scope === "department" && id != null
        ? queryKeys.company.analytics.department(companySlug, Number(id), period)
        : scope === "team" && id != null
          ? queryKeys.company.analytics.team(companySlug, Number(id), period)
          : scope === "employee" && id != null
            ? queryKeys.company.analytics.employee(companySlug, id, period)
            : queryKeys.company.analytics.company(companySlug, period),
    queryFn: () => {
      if (scope === "department" && id != null)
        return analyticsApi.department(Number(id), period);
      if (scope === "team" && id != null)
        return analyticsApi.team(Number(id), period);
      if (scope === "employee" && id != null)
        return analyticsApi.employee(id, period);
      return analyticsApi.company(period);
    },
    staleTime: 60_000,
  });
}

export function useNotifications(companySlug: string, unreadOnly = false) {
  return useQuery({
    queryKey: queryKeys.company.notifications(companySlug, unreadOnly),
    queryFn: () => notificationsApi.list(unreadOnly),
    staleTime: 30_000,
  });
}

export function useConfiguredProviders(companySlug: string) {
  return useQuery({
    queryKey: queryKeys.company.providersConfigured(companySlug),
    queryFn: () => aiGatewayApi.listConfigured(),
    staleTime: 60_000,
  });
}
