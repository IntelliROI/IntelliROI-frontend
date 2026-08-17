"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Can } from "@/lib/rbac/Can";
import { aiGatewayApi } from "@/features/ai-gateway/api/ai-gateway.api";
import { useConfiguredProviders } from "@/features/organization/hooks/useOrganizationQueries";
import { queryKeys } from "@/lib/api/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function CompanyProvidersPanel({
  companySlug,
}: {
  companySlug: string;
}) {
  const queryClient = useQueryClient();
  const configured = useConfiguredProviders(companySlug);
  const catalog = useQuery({
    queryKey: queryKeys.company.providers(companySlug),
    queryFn: () => aiGatewayApi.listProviders(),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Gateway"
        title="Company AI Providers"
        description="Connect API keys — employees never see raw provider credentials."
        actions={
          <Can resource="providers_company" action="manage">
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await aiGatewayApi.addKey("openai", {
                    api_key: "sk-demo",
                    key_alias: `key-${Date.now() % 1000}`,
                  });
                  toast.success("Provider key added");
                  queryClient.invalidateQueries({
                    queryKey: queryKeys.company.providersConfigured(companySlug),
                  });
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Request failed");
                }
              }}
            >
              Add OpenAI key
            </Button>
          </Can>
        }
      />

      <h2 className="mb-3 font-medium text-text-primary">Configured keys</h2>
      {configured.isLoading ? (
        <LoadingBlock className="h-32" />
      ) : (
        <DataTable
          columns={[
            { key: "provider", label: "Provider" },
            { key: "alias", label: "Alias" },
            { key: "created", label: "Created" },
          ]}
          rows={(configured.data ?? []).map((p) => ({
            provider: p.provider,
            alias: p.key_alias,
            created: new Date(p.created_at).toLocaleDateString(),
          }))}
        />
      )}

      <h2 className="mb-3 mt-10 font-medium text-text-primary">Catalog</h2>
      {catalog.isLoading ? (
        <LoadingBlock className="h-32" />
      ) : (
        <DataTable
          columns={[
            { key: "name", label: "Provider" },
            { key: "models", label: "Models" },
            { key: "status", label: "Status" },
          ]}
          rows={(catalog.data ?? []).map((p) => ({
            name: p.display_name,
            models: p.models.join(", "),
            status: p.status,
          }))}
        />
      )}
    </div>
  );
}
