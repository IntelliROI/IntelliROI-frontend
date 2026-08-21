"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, EmptyState, LoadingBlock, DataTable } from "@/components/feedback/States";
import { auditApi, type AuditEntry } from "@/features/audit/api/audit.api";
import { queryKeys } from "@/lib/api/query-keys";

function AuditTable({ items }: { items: AuditEntry[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="HTTP activity and auth events appear here after users hit the gateway."
      />
    );
  }
  return (
    <DataTable
      columns={[
        { key: "time", label: "Time" },
        { key: "actor", label: "Actor" },
        { key: "action", label: "Action" },
        { key: "target", label: "Target" },
      ]}
      rows={items.map((row) => ({
        id: row.id,
        time: row.time,
        actor: row.actor || "—",
        action: row.action,
        target: row.target || "—",
      }))}
      rowKey="id"
    />
  );
}

export function TenantAuditLog({ companySlug }: { companySlug: string }) {
  const logs = useQuery({
    queryKey: queryKeys.company.audit(companySlug),
    queryFn: () => auditApi.listTenant(),
  });

  if (logs.isLoading) return <LoadingBlock className="h-64" />;

  return (
    <div>
      <PageHeader
        eyebrow="Security"
        title="Audit Logs"
        description="Company HTTP activity from the gateway plus auth events. Prompt bodies are not stored."
      />
      {logs.isError ? (
        <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
          {logs.error instanceof Error ? logs.error.message : "Could not load audit logs."}
        </p>
      ) : (
        <AuditTable items={logs.data?.items ?? []} />
      )}
    </div>
  );
}

export function PlatformAuditLog() {
  const logs = useQuery({
    queryKey: queryKeys.platform.audit(),
    queryFn: () => auditApi.listPlatform(),
  });

  if (logs.isLoading) return <LoadingBlock className="h-64" />;

  return (
    <div>
      <PageHeader
        eyebrow="Security"
        title="Platform Audit Logs"
        description="Customer activity across tenants. Prompt bodies are not stored in this table."
      />
      {logs.isError ? (
        <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
          {logs.error instanceof Error ? logs.error.message : "Could not load audit logs."}
        </p>
      ) : (
        <AuditTable items={logs.data?.items ?? []} />
      )}
    </div>
  );
}
