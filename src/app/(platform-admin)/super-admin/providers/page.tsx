"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { aiGatewayApi } from "@/features/ai-gateway/api/ai-gateway.api";

export default function ProvidersPage() {
  const providers = useQuery({
    queryKey: ["platform", "providers"],
    queryFn: () => aiGatewayApi.listProviders(),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Catalog"
        title="Global AI Providers"
        description="Platform-wide provider catalog and health."
      />
      {providers.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : (
        <DataTable
          columns={[
            { key: "name", label: "Provider" },
            { key: "models", label: "Models" },
            { key: "status", label: "Status" },
            { key: "latency", label: "Latency", align: "right" },
          ]}
          rows={(providers.data ?? []).map((p) => ({
            name: p.display_name,
            models: p.models.join(", "),
            status: p.status,
            latency: p.latency_ms > 0 ? `${p.latency_ms}ms` : "—",
          }))}
        />
      )}
    </div>
  );
}
