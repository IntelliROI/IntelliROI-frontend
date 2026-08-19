"use client";

import { PageHeader, EmptyState } from "@/components/feedback/States";

export function TenantAuditLog({ companySlug }: { companySlug: string }) {
  return (
    <div>
      <PageHeader
        eyebrow="Security"
        title="Audit Logs"
        description="Tenant activity is written to the gateway audit schema. A list API is not exposed yet."
      />
      <EmptyState
        title="Audit list unavailable"
        description={`GET /audit-logs is not on the public API. ${companySlug} events still persist server-side.`}
      />
    </div>
  );
}

export function PlatformAuditLog() {
  return (
    <div>
      <PageHeader
        eyebrow="Security"
        title="Platform Audit Logs"
        description="GET /platform/audit-logs is not implemented. Super Admin tenant list and suspend remain live."
      />
      <EmptyState
        title="Audit list unavailable"
        description="Use Organizations to inspect and suspend tenants until a platform audit HTTP API ships."
      />
    </div>
  );
}
