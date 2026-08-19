"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
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

export function useDepartmentsPage(
  companySlug: string,
  query: { page: number; pageSize: number; q: string; status: string },
) {
  return useQuery({
    queryKey: queryKeys.company.departmentsPage(companySlug, query),
    queryFn: () =>
      organizationApi.listDepartmentsPage({
        page: query.page,
        page_size: query.pageSize,
        q: query.q,
        status: query.status,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
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

export function useTeamsPage(
  companySlug: string,
  query: {
    page: number;
    pageSize: number;
    q: string;
    status: string;
    departmentId: number | "";
  },
) {
  return useQuery({
    queryKey: queryKeys.company.teamsPage(companySlug, query),
    queryFn: () =>
      organizationApi.listTeamsPage({
        page: query.page,
        page_size: query.pageSize,
        q: query.q,
        status: query.status,
        department_id: query.departmentId === "" ? undefined : query.departmentId,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useProjectsPage(
  companySlug: string,
  query: {
    page: number;
    pageSize: number;
    q: string;
    status: string;
    departmentId: number | "";
    teamId: number | "";
  },
) {
  return useQuery({
    queryKey: queryKeys.company.projectsPage(companySlug, query),
    queryFn: () =>
      organizationApi.listProjectsPage({
        page: query.page,
        page_size: query.pageSize,
        q: query.q,
        status: query.status,
        department_id: query.departmentId === "" ? undefined : query.departmentId,
        team_id: query.teamId === "" ? undefined : query.teamId,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useEmployees(companySlug: string) {
  return useQuery({
    queryKey: queryKeys.company.employees(companySlug),
    queryFn: () => organizationApi.listEmployees(),
    staleTime: 60_000,
  });
}

export function useEmployeesPage(
  companySlug: string,
  query: {
    page: number;
    pageSize: number;
    q: string;
    status: string;
    departmentId: number | "";
    teamId: number | "";
  },
) {
  return useQuery({
    queryKey: queryKeys.company.employeesPage(companySlug, query),
    queryFn: () =>
      organizationApi.listEmployeesPage({
        page: query.page,
        page_size: query.pageSize,
        q: query.q,
        status: query.status,
        department_id: query.departmentId === "" ? undefined : query.departmentId,
        team_id: query.teamId === "" ? undefined : query.teamId,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useJobRolesPage(
  companySlug: string,
  query: { page: number; pageSize: number; q: string; status: string },
) {
  return useQuery({
    queryKey: queryKeys.company.jobRolesPage(companySlug, query),
    queryFn: () =>
      organizationApi.listJobRolesPage({
        page: query.page,
        page_size: query.pageSize,
        q: query.q,
        status: query.status,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useImportJob(companySlug: string, uuid: string | null) {
  return useQuery({
    queryKey: queryKeys.company.importJob(companySlug, uuid ?? ""),
    queryFn: () => organizationApi.getImportJob(uuid as string),
    enabled: Boolean(uuid),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "queued" || status === "running" ? 2000 : false;
    },
  });
}

export function useImportRows(
  companySlug: string,
  uuid: string | null,
  query: { page: number; pageSize: number; status: string },
) {
  return useQuery({
    queryKey: queryKeys.company.importRows(companySlug, uuid ?? "", query),
    queryFn: () =>
      organizationApi.listImportRows(uuid as string, {
        page: query.page,
        page_size: query.pageSize,
        status: query.status || undefined,
      }),
    enabled: Boolean(uuid),
    placeholderData: keepPreviousData,
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
