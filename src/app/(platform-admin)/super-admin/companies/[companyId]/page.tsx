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

  const patch = useMutation({
    mutationFn: (status: "active" | "suspended") =>
      platformApi.patchCompanyStatus(params.companyId, status),
    onSuccess: async (row) => {
      toast.success(
        row.status === "suspended" ? "Tenant suspended" : "Tenant reactivated",
      );
      await queryClient.invalidateQueries({ queryKey: ["platform", "companies"] });
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
    </div>
  );
}
