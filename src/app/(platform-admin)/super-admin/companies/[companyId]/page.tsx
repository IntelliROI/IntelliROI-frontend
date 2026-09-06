"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, LoadingBlock } from "@/components/feedback/States";
import { Mosaic, Panel } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { Button } from "@/components/ui/button";
import { platformApi } from "@/features/system-config/api/platform.api";

export default function CompanyDetailPage({
  params,
}: {
  params: { companyId: string };
}) {
  const queryClient = useQueryClient();
  const company = useQuery({
    queryKey: ["platform", "company", params.companyId],
    queryFn: () => platformApi.company(params.companyId),
  });
  const keys = useQuery({
    queryKey: ["platform", "provider-tenants", params.companyId],
    queryFn: () => platformApi.providerTenants(params.companyId),
  });

  const patch = useMutation({
    mutationFn: (status: "active" | "suspended") =>
      platformApi.patchCompanyStatus(params.companyId, status),
    onSuccess: async (row) => {
      toast.success(
        row.status === "suspended" ? "Tenant suspended" : "Tenant reactivated",
      );
      await queryClient.invalidateQueries({ queryKey: ["platform", "companies"] });
      await queryClient.invalidateQueries({ queryKey: ["platform", "metrics"] });
      await queryClient.invalidateQueries({
        queryKey: ["platform", "company", params.companyId],
      });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Update failed");
    },
  });

  if (company.isLoading) return <LoadingBlock className="h-64" />;

  const c = company.data;
  if (!c) {
    return (
      <p className="border border-hairline px-4 py-8 text-sm text-text-secondary">
        Tenant not found.
      </p>
    );
  }

  const nextStatus = c.status === "suspended" ? "active" : "suspended";

  return (
    <div>
      <PageHeader
        eyebrow="Tenant"
        title={c.name}
        description={`${c.company_code ?? c.slug} · ${c.industry ?? "—"}`}
      />
      <Mosaic cols={3}>
        <KpiTile label="Status" value={c.status ?? "—"} accent />
        <KpiTile label="Seated users" value={c.user_count ?? 0} format="number" />
        <KpiTile label="Country" value={c.country ?? "—"} />
      </Mosaic>
      <Panel className="mt-6 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
          Support actions
        </p>
        <p className="mt-3 text-sm text-text-secondary">
          Suspended companies cannot log in or chat. Impersonation is not available.
        </p>
        <Button
          className="mt-4"
          size="sm"
          variant={nextStatus === "suspended" ? "danger" : "primary"}
          disabled={patch.isPending}
          onClick={() => patch.mutate(nextStatus)}
        >
          {nextStatus === "suspended" ? "Suspend tenant" : "Reactivate tenant"}
        </Button>
      </Panel>
      <Panel className="mt-px p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary">
          Configured AI providers
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          Active keys only. Secrets stay on the tenant — Super Admin sees aliases.
        </p>
        <ul className="mt-4 space-y-2">
          {(keys.data ?? []).length === 0 ? (
            <li className="text-sm text-text-secondary">No active provider keys.</li>
          ) : (
            (keys.data ?? []).map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between border border-hairline px-3 py-2"
              >
                <span className="text-sm text-text-primary">
                  {row.display_name}
                  {row.key_alias ? (
                    <span className="ml-2 font-mono text-[10px] text-text-secondary">
                      {row.key_alias}
                    </span>
                  ) : null}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent">
                  {row.status}
                </span>
              </li>
            ))
          )}
        </ul>
      </Panel>
    </div>
  );
}
