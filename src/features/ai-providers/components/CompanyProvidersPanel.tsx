"use client";

import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, KeyRound, Trash2 } from "lucide-react";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Can } from "@/lib/rbac/Can";
import { aiGatewayApi } from "@/features/ai-gateway/api/ai-gateway.api";
import { useConfiguredProviders } from "@/features/organization/hooks/useOrganizationQueries";
import { queryKeys } from "@/lib/api/query-keys";
import { toast } from "sonner";

/** Chat is only wired for these providers on the gateway today. */
const CHAT_READY_PROVIDERS = new Set(["openai", "anthropic"]);

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

  const [providerName, setProviderName] = useState("");
  const [keyAlias, setKeyAlias] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const options = catalog.data ?? [];
  const selected = options.find((p) => p.name === providerName);
  const chatReady = providerName ? CHAT_READY_PROVIDERS.has(providerName) : true;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!providerName || !apiKey.trim()) {
      toast.error("Select a provider and paste a real API key");
      return;
    }
    setSubmitting(true);
    try {
      await aiGatewayApi.addKey(providerName, {
        api_key: apiKey.trim(),
        key_alias: keyAlias.trim() || `${providerName}-default`,
      });
      toast.success(`${selected?.display_name ?? providerName} key saved`);
      setApiKey("");
      setKeyAlias("");
      setProviderName("");
      queryClient.invalidateQueries({
        queryKey: queryKeys.company.providersConfigured(companySlug),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onRevoke(id: number, label: string) {
    setRevokingId(id);
    try {
      await aiGatewayApi.deleteKey(id);
      toast.success(`Revoked ${label}`);
      queryClient.invalidateQueries({
        queryKey: queryKeys.company.providersConfigured(companySlug),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Governance · AI Intelligence"
        title="Company AI Providers"
        description="Connect real provider API keys — encrypted at rest, employees never see raw credentials."
      />

      <Can resource="providers_company" action="manage">
        <form
          onSubmit={onSubmit}
          className="mb-10 grid gap-4 border border-hairline p-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <div className="lg:col-span-1">
            <Label>Provider</Label>
            <Select
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              required
            >
              <option value="">Select provider</option>
              {options.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.display_name || p.name}
                  {CHAT_READY_PROVIDERS.has(p.name) ? "" : " (chat not available yet)"}
                </option>
              ))}
            </Select>
          </div>

          <div className="lg:col-span-1">
            <Label>Key alias</Label>
            <Input
              value={keyAlias}
              onChange={(e) => setKeyAlias(e.target.value)}
              placeholder={providerName ? `${providerName}-default` : "production"}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-2">
            <Label>API key</Label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  providerName === "anthropic" ? "sk-ant-…" : "sk-…"
                }
                autoComplete="off"
                className="pr-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-text-secondary/60 hover:text-text-primary"
                aria-label={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? (
                  <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                ) : (
                  <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {providerName && !chatReady && (
            <p className="md:col-span-2 lg:col-span-4 font-mono text-[11px] uppercase tracking-[0.1em] text-warning">
              The key will be saved and encrypted, but AI Workspace chat is not wired for{" "}
              {selected?.display_name ?? providerName} yet — backend gateway support is pending.
            </p>
          )}

          <div className="md:col-span-2 lg:col-span-4 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary/60">
              Keys are AES-GCM encrypted on the gateway — this form never stores demo keys.
            </p>
            <Button type="submit" size="sm" disabled={submitting}>
              <KeyRound className="h-3.5 w-3.5" strokeWidth={1.5} />
              {submitting ? "Saving…" : "Save key"}
            </Button>
          </div>
        </form>
      </Can>

      <h2 className="mb-3 font-medium text-text-primary">Configured keys</h2>
      {configured.isLoading ? (
        <LoadingBlock className="h-32" />
      ) : (
        <DataTable
          columns={[
            { key: "provider", label: "Provider" },
            { key: "alias", label: "Alias" },
            { key: "created", label: "Created" },
            { key: "action", label: "Actions", align: "right", width: "w-24" },
          ]}
          rows={(configured.data ?? []).map((p) => ({
            provider: (
              <span className="font-medium text-text-primary">
                {p.provider}
                {!CHAT_READY_PROVIDERS.has(p.provider) && (
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.1em] text-warning">
                    chat pending
                  </span>
                )}
              </span>
            ),
            alias: p.key_alias,
            created: new Date(p.created_at).toLocaleDateString(),
            action: (
              <Can resource="providers_company" action="manage">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={revokingId === p.id}
                  onClick={() => onRevoke(p.id, p.key_alias || p.provider)}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {revokingId === p.id ? "Revoking…" : "Revoke"}
                </Button>
              </Can>
            ),
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
            name: (
              <span className="text-text-primary">
                {p.display_name}
                {!CHAT_READY_PROVIDERS.has(p.name) && (
                  <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.1em] text-text-secondary/60">
                    key only · chat pending
                  </span>
                )}
              </span>
            ),
            models: p.models.join(", "),
            status: p.status,
          }))}
        />
      )}
    </div>
  );
}
