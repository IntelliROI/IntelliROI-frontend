"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { Mosaic, Panel } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { costApi } from "@/features/cost/api/cost.api";
import { organizationApi } from "@/features/organization/api/organization.api";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";
import { queryKeys } from "@/lib/api/query-keys";

export default function BudgetsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const queryClient = useQueryClient();
  const [limit, setLimit] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [alertPct, setAlertPct] = useState("80");

  const budgets = useQuery({
    queryKey: queryKeys.company.budgets(params.companySlug),
    queryFn: () => costApi.listBudgets(),
  });
  const summary = useQuery({
    queryKey: queryKeys.company.costs(params.companySlug),
    queryFn: () => costApi.summary(),
  });
  const alerts = useQuery({
    queryKey: ["company", params.companySlug, "cost-alerts"],
    queryFn: () => costApi.costAlerts(),
  });
  const departments = useQuery({
    queryKey: queryKeys.company.departments(params.companySlug),
    queryFn: () => organizationApi.listDepartments(),
  });

  const create = useMutation({
    mutationFn: () =>
      costApi.createBudget({
        monthly_limit: Number(limit),
        department_id: departmentId ? Number(departmentId) : undefined,
        alert_percentage: alertPct ? Number(alertPct) : undefined,
      }),
    onSuccess: async () => {
      toast.success("Budget created");
      setLimit("");
      setDepartmentId("");
      await queryClient.invalidateQueries({
        queryKey: queryKeys.company.budgets(params.companySlug),
      });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Could not create budget");
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!limit || Number(limit) <= 0) {
      toast.error("Enter a monthly limit");
      return;
    }
    create.mutate();
  }

  return (
    <div>
      <PageHeader
        eyebrow="Cost"
        title="Budgets"
        description="Company and department spend limits with consumption tracking."
      />
      <Mosaic cols={2} className="mb-px">
        <KpiTile
          label="Total spend MTD"
          value={summary.data?.total_cost ?? 0}
          format="currency"
        />
        <KpiTile
          label="Open budgets"
          value={budgets.data?.length ?? 0}
          format="number"
          accent
        />
      </Mosaic>

      <Can resource="budgets" action="manage">
        <Panel className="mb-px border-0 bg-ink p-6">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
            New budget
          </p>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="monthly_limit">Monthly limit</Label>
              <Input
                id="monthly_limit"
                type="number"
                min={1}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="department_id">Department (optional)</Label>
              <Select
                id="department_id"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="">Company-wide</option>
                {(departments.data ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.department_name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="alert_pct">Alert %</Label>
              <Input
                id="alert_pct"
                type="number"
                min={1}
                max={100}
                value={alertPct}
                onChange={(e) => setAlertPct(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" size="sm" disabled={create.isPending}>
                {create.isPending ? "Saving…" : "Create"}
              </Button>
            </div>
          </form>
        </Panel>
      </Can>

      {budgets.isLoading ? (
        <LoadingBlock className="h-48" />
      ) : (
        <DataTable
          columns={[
            { key: "scope", label: "Scope" },
            { key: "limit", label: "Limit", align: "right" },
            { key: "consumed", label: "Consumed", align: "right" },
            { key: "pct", label: "Used", align: "right" },
          ]}
          rows={(budgets.data ?? []).map((b) => ({
            scope: `${b.scope}${b.scope_id ? ` #${b.scope_id}` : ""}`,
            limit: formatCurrency(b.monthly_limit, "USD", true),
            consumed: formatCurrency(b.consumed, "USD", true),
            pct: `${b.monthly_limit > 0 ? Math.round((b.consumed / b.monthly_limit) * 100) : 0}%`,
          }))}
        />
      )}

      <Panel className="mt-px border-0 bg-ink p-6">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
          Cost alerts
        </p>
        {alerts.isLoading ? (
          <LoadingBlock className="h-24" />
        ) : (alerts.data ?? []).length === 0 ? (
          <p className="text-sm text-text-secondary">No unacknowledged cost alerts.</p>
        ) : (
          <ul className="space-y-2">
            {(alerts.data ?? []).map((a) => (
              <li key={a.id} className="border border-hairline px-3 py-2 text-sm">
                <span className={a.severity === "critical" ? "text-danger" : "text-warning"}>
                  {a.severity}
                </span>
                {" · "}
                {a.message}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
