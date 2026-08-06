"use client";

import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/features/audit/api/audit.api";
import { queryKeys } from "@/lib/api/query-keys";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";

export function TenantAuditLog({ companySlug }: { companySlug: string }) {
  const logs = useQuery({
    queryKey: queryKeys.company.audit(companySlug),
    queryFn: () => auditApi.listTenant(),
    staleTime: 60_000,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Security"
        title="Audit Logs"
        description="Tenant-scoped activity trail."
      />
      {logs.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : (
        <DataTable
          columns={[
            { key: "time", label: "Time" },
            { key: "actor", label: "Actor" },
            { key: "action", label: "Action" },
            { key: "target", label: "Target" },
          ]}
          rows={(logs.data ?? []).map((r) => ({
            time: r.time,
            actor: r.actor,
            action: r.action,
            target: r.target,
          }))}
        />
      )}
    </div>
  );
}

export function PlatformAuditLog() {
  const logs = useQuery({
    queryKey: queryKeys.platform.audit(),
    queryFn: () => auditApi.listPlatform(),
    staleTime: 60_000,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Security"
        title="Platform Audit Logs"
        description="Security-relevant events across tenants."
      />
      {logs.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : (
        <DataTable
          columns={[
            { key: "time", label: "Time" },
            { key: "actor", label: "Actor" },
            { key: "action", label: "Action" },
            { key: "target", label: "Target" },
          ]}
          rows={(logs.data ?? []).map((r) => ({
            time: r.time,
            actor: r.actor,
            action: r.action,
            target: r.target,
          }))}
        />
      )}
    </div>
  );
}
