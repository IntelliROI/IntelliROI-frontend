"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  PageHeader,
  LoadingBlock,
  DataTable,
  EmptyState,
} from "@/components/feedback/States";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { policiesApi, type CreatePolicyInput } from "@/features/ai-gateway/api/policies.api";
import { aiGatewayApi } from "@/features/ai-gateway/api/ai-gateway.api";
import { organizationApi } from "@/features/organization/api/organization.api";
import { queryKeys } from "@/lib/api/query-keys";
import { Can } from "@/lib/rbac/Can";

export function PoliciesGovernance({ companySlug }: { companySlug: string }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    scope_type: "company" as CreatePolicyInput["scope_type"],
    effect: "deny" as CreatePolicyInput["effect"],
    department_id: "",
    team_id: "",
    provider_id: "",
    model_id: "",
    daily_token_cap: "",
  });

  const policies = useQuery({
    queryKey: queryKeys.company.policies(companySlug),
    queryFn: () => policiesApi.list(),
  });
  const providers = useQuery({
    queryKey: queryKeys.company.providers(companySlug),
    queryFn: () => aiGatewayApi.listProviders(),
  });
  const departments = useQuery({
    queryKey: queryKeys.company.departments(companySlug),
    queryFn: () => organizationApi.listDepartments(),
  });
  const teams = useQuery({
    queryKey: queryKeys.company.teams(companySlug),
    queryFn: () => organizationApi.listTeams(),
  });

  const selectedProvider = (providers.data ?? []).find(
    (p) => String(p.id) === form.provider_id,
  );
  const modelOptions = selectedProvider?.model_entries ?? [];

  const providerName = useMemo(() => {
    const map = new Map((providers.data ?? []).map((p) => [p.id, p.display_name || p.name]));
    return (id?: number) => (id ? map.get(id) ?? `#${id}` : "Any");
  }, [providers.data]);

  const modelName = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of providers.data ?? []) {
      for (const m of p.model_entries) {
        if (m.id) map.set(m.id, m.name);
      }
    }
    return (id?: number) => (id ? map.get(id) ?? `#${id}` : "Any");
  }, [providers.data]);

  const create = useMutation({
    mutationFn: (input: CreatePolicyInput) => policiesApi.create(input),
    onSuccess: async () => {
      toast.success("Policy created — enforced on the next chat request");
      setForm({
        scope_type: "company",
        effect: "deny",
        department_id: "",
        team_id: "",
        provider_id: "",
        model_id: "",
        daily_token_cap: "",
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.company.policies(companySlug),
      });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Could not create policy");
    },
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.scope_type === "department" && !form.department_id) {
      toast.error("Pick a department for department-scoped rules");
      return;
    }
    if (form.scope_type === "team" && !form.team_id) {
      toast.error("Pick a team for team-scoped rules");
      return;
    }
    await create.mutateAsync({
      scope_type: form.scope_type,
      effect: form.effect,
      department_id:
        form.scope_type === "department" ? Number(form.department_id) : undefined,
      team_id: form.scope_type === "team" ? Number(form.team_id) : undefined,
      provider_id: form.provider_id ? Number(form.provider_id) : undefined,
      model_id: form.model_id ? Number(form.model_id) : undefined,
      daily_token_cap: form.daily_token_cap
        ? Number(form.daily_token_cap)
        : undefined,
    });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Governance"
        title="AI Policies"
        description="Allow or deny providers and models by company, department, or team. Most specific scope wins. Chat returns 403 POLICY_DENIED when a rule blocks the request."
      />

      <Can resource="policies" action="manage">
        <Panel className="mb-px border-0 bg-ink p-6">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            New rule
          </p>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="scope_type">Scope</Label>
              <Select
                id="scope_type"
                value={form.scope_type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    scope_type: e.target.value as CreatePolicyInput["scope_type"],
                  }))
                }
              >
                <option value="company">Company</option>
                <option value="department">Department</option>
                <option value="team">Team</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="effect">Effect</Label>
              <Select
                id="effect"
                value={form.effect}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    effect: e.target.value as CreatePolicyInput["effect"],
                  }))
                }
              >
                <option value="deny">Deny</option>
                <option value="allow">Allow</option>
              </Select>
            </div>
            {form.scope_type === "department" ? (
              <div>
                <Label htmlFor="department_id">Department</Label>
                <Select
                  id="department_id"
                  value={form.department_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, department_id: e.target.value }))
                  }
                >
                  <option value="">Select…</option>
                  {(departments.data ?? []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.department_name}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
            {form.scope_type === "team" ? (
              <div>
                <Label htmlFor="team_id">Team</Label>
                <Select
                  id="team_id"
                  value={form.team_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, team_id: e.target.value }))
                  }
                >
                  <option value="">Select…</option>
                  {(teams.data ?? []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.team_name}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
            <div>
              <Label htmlFor="provider_id">Provider</Label>
              <Select
                id="provider_id"
                value={form.provider_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, provider_id: e.target.value, model_id: "" }))
                }
              >
                <option value="">Any</option>
                {(providers.data ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.display_name || p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="model_id">Model</Label>
              <Select
                id="model_id"
                value={form.model_id}
                onChange={(e) => setForm((f) => ({ ...f, model_id: e.target.value }))}
                disabled={!form.provider_id}
              >
                <option value="">Any</option>
                {modelOptions.map((m) => (
                  <option key={m.id || m.name} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="daily_token_cap">Daily token cap (employee)</Label>
              <Input
                id="daily_token_cap"
                type="number"
                min={1}
                placeholder="Optional"
                value={form.daily_token_cap}
                onChange={(e) =>
                  setForm((f) => ({ ...f, daily_token_cap: e.target.value }))
                }
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" size="sm" disabled={create.isPending}>
                {create.isPending ? "Saving…" : "Add policy"}
              </Button>
            </div>
          </form>
        </Panel>
      </Can>

      {policies.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : (policies.data ?? []).length === 0 ? (
        <EmptyState
          title="No policies yet"
          description="Without rules, chat is allowed for any configured provider. Add a deny or allow list to govern usage."
        />
      ) : (
        <DataTable
          columns={[
            { key: "scope", label: "Scope" },
            { key: "effect", label: "Effect" },
            { key: "provider", label: "Provider" },
            { key: "model", label: "Model" },
            { key: "cap", label: "Daily cap" },
            { key: "status", label: "Status" },
            { key: "action", label: "" },
          ]}
          rows={(policies.data ?? []).map((p) => ({
            scope: `${p.scope_type}${p.department_id ? ` #${p.department_id}` : ""}${p.team_id ? ` #${p.team_id}` : ""}`,
            effect: (
              <span className={p.effect === "deny" ? "text-danger" : "text-accent"}>
                {p.effect}
              </span>
            ),
            provider: providerName(p.provider_id),
            model: modelName(p.model_id),
            cap: p.daily_token_cap ?? "—",
            status: p.status,
            action: (
              <Can resource="policies" action="manage">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={async () => {
                    try {
                      await policiesApi.remove(p.id);
                      toast.success("Policy removed");
                      queryClient.invalidateQueries({
                        queryKey: queryKeys.company.policies(companySlug),
                      });
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Delete failed");
                    }
                  }}
                >
                  Delete
                </Button>
              </Can>
            ),
          }))}
        />
      )}
    </div>
  );
}
