"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { aiGatewayApi } from "@/features/ai-gateway/api/ai-gateway.api";
import { platformApi } from "@/features/system-config/api/platform.api";

export default function ProvidersPage() {
  const providers = useQuery({
    queryKey: ["platform", "providers"],
    queryFn: () => aiGatewayApi.listProviders(),
  });
  const bindings = useQuery({
    queryKey: ["platform", "provider-tenants"],
    queryFn: () => platformApi.providerTenants(),
  });

  const rows = (providers.data ?? []).map((p) => {
    const usedBy = (bindings.data ?? []).filter((b) => b.provider_name === p.name);
    const names = usedBy.map((b) => b.company_name).filter(Boolean);
    return {
      name: p.display_name,
      models: p.models.join(", ") || "—",
      tenants: names.length ? names.join(", ") : "None configured",
      status: p.status,
    };
  });

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Global AI Providers"
        description="Seeded catalog plus which customer tenants have an active key. Secrets are never shown."
      />
      {providers.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : (
        <DataTable
          columns={[
            { key: "name", label: "Provider" },
            { key: "models", label: "Models" },
            { key: "tenants", label: "Tenants with key" },
            { key: "status", label: "Status" },
          ]}
          rows={rows}
        />
      )}
      <p className="mt-4 text-xs text-text-secondary">
        Company keys are added on each tenant AI Providers screen.{" "}
        <Link href="/super-admin/companies" className="text-accent">
          Inspect a company
        </Link>
        .
      </p>
    </div>
  );
}
