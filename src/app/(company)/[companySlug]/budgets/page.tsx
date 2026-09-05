"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, LoadingBlock, DataTable } from "@/components/feedback/States";
import { ScopeUnassigned } from "@/components/feedback/ScopeUnassigned";
import { Mosaic, Panel } from "@/components/ui/panel";
import { KpiTile } from "@/components/dashboard/KpiTile";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { Budget } from "@/features/cost/api/cost.api";
import { costApi } from "@/features/cost/api/cost.api";
import { organizationApi } from "@/features/organization/api/organization.api";
import { formatCurrency } from "@/lib/utils";
import { Can } from "@/lib/rbac/Can";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/stores/auth-store";
import { resolveIntelligenceScope } from "@/lib/rbac/intelligence-scope";
import { useCompanyCurrency } from "@/hooks/use-company-currency";

export default function BudgetsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { currency: companyCurrency, fromUsd } = useCompanyCurrency(
    params.companySlug,
  );
  const intel = resolveIntelligenceScope(user);
  const [limit, setLimit] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [alertPct, setAlertPct] = useState("80");
  const [editing, setEditing] = useState<Budget | null>(null);
  const [editLimit, setEditLimit] = useState("");
  const [editAlertPct, setEditAlertPct] = useState("");
  const [deleting, setDeleting] = useState<Budget | null>(null);

  const budgets = useQuery({
    queryKey: queryKeys.company.budgets(params.companySlug),
    queryFn: () => costApi.listBudgets(),
  });
  const summary = useQuery({
    queryKey: [
      ...queryKeys.company.costs(params.companySlug),
      intel.kind,
      "id" in intel ? intel.id : null,
    ],
    queryFn: () => {
      if (intel.kind === "department")
        return costApi.summary("department", "month", intel.id);
      if (intel.kind === "team")
        return costApi.summary("team", "month", intel.id);
      return costApi.summary("company", "month");
    },
    enabled: intel.kind !== "unassigned" && intel.kind !== "employee",
  });
  const alerts = useQuery({
    queryKey: ["company", params.companySlug, "cost-alerts"],
    queryFn: () => costApi.costAlerts(),
  });
  const departments = useQuery({
    queryKey: queryKeys.company.departments(params.companySlug),
    queryFn: () => organizationApi.listDepartments(),
    enabled: intel.kind === "company",
  });

  const create = useMutation({
    mutationFn: () =>
      costApi.createBudget({
        monthly_limit: Number(limit),
        department_id: departmentId ? Number(departmentId) : undefined,
        alert_percentage: alertPct ? Number(alertPct) : undefined,
        currency: companyCurrency,
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

  const update = useMutation({
    mutationFn: (input: { id: number; monthly_limit: number; alert_percentage: number }) =>
      costApi.updateBudget(input.id, {
        monthly_limit: input.monthly_limit,
        alert_percentage: input.alert_percentage,
      }),
    onSuccess: async () => {
      toast.success("Budget updated");
      setEditing(null);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.company.budgets(params.companySlug),
      });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not update budget — this action may not be supported yet",
      );
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => costApi.deleteBudget(id),
    onSuccess: async () => {
      toast.success("Budget deleted");
      setDeleting(null);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.company.budgets(params.companySlug),
      });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not delete budget — this action may not be supported yet",
      );
    },
  });

  if (intel.kind === "unassigned") {
    return (
      <ScopeUnassigned
        role={intel.role}
        missing={intel.missing}
        title="Budgets"
      />
    );
  }

  const spendMtd =
    summary.data == null
      ? 0
      : summary.data.currency?.toUpperCase() === companyCurrency
        ? summary.data.total_cost
        : fromUsd(summary.data.total_cost);

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
          value={spendMtd}
          format="currency"
          currency={companyCurrency}
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
            New budget ({companyCurrency})
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
            { key: "action", label: "", align: "right", width: "w-40" },
          ]}
          rows={(budgets.data ?? []).map((b) => {
            const rawCur = (b.currency || "").toUpperCase();
            const amountIsUsd = rawCur === "USD" || rawCur === "";
            const limit =
              amountIsUsd && companyCurrency !== "USD"
                ? fromUsd(b.monthly_limit)
                : b.monthly_limit;
            const consumed =
              amountIsUsd && companyCurrency !== "USD"
                ? fromUsd(b.consumed)
                : b.consumed;
            return {
              scope: `${b.scope}${b.scope_id ? ` #${b.scope_id}` : ""}`,
              limit: formatCurrency(limit, companyCurrency),
              consumed: formatCurrency(consumed, companyCurrency),
              pct: `${b.monthly_limit > 0 ? Math.round((b.consumed / b.monthly_limit) * 100) : 0}%`,
              action: (
                <Can resource="budgets" action="manage">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditing(b);
                        setEditLimit(String(b.monthly_limit));
                        setEditAlertPct("80");
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleting(b)}
                    >
                      Delete
                    </Button>
                  </div>
                </Can>
              ),
            };
          })}
        />
      )}

      <Modal
        open={editing != null}
        onClose={() => setEditing(null)}
        eyebrow="Cost"
        title="Edit budget"
        description="Update the monthly limit or alert threshold for this budget."
        size="sm"
      >
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editLimit || Number(editLimit) <= 0) {
                toast.error("Enter a monthly limit");
                return;
              }
              update.mutate({
                id: editing.id,
                monthly_limit: Number(editLimit),
                alert_percentage: Number(editAlertPct) || 80,
              });
            }}
            className="space-y-3"
          >
            <Label htmlFor="edit_limit">Monthly limit ({companyCurrency})</Label>
            <Input
              id="edit_limit"
              type="number"
              min={1}
              value={editLimit}
              onChange={(e) => setEditLimit(e.target.value)}
            />
            <Label htmlFor="edit_alert_pct">Alert %</Label>
            <Input
              id="edit_alert_pct"
              type="number"
              min={1}
              max={100}
              value={editAlertPct}
              onChange={(e) => setEditAlertPct(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={update.isPending}>
                {update.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={deleting != null}
        onClose={() => setDeleting(null)}
        eyebrow="Cost"
        title="Delete budget"
        description="This removes the spend limit for this scope. Consumption history is not affected."
        size="sm"
      >
        {deleting ? (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Delete the {deleting.scope}
              {deleting.scope_id ? ` #${deleting.scope_id}` : ""} budget of{" "}
              {formatCurrency(deleting.monthly_limit, deleting.currency || companyCurrency)}?
            </p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={remove.isPending}
                onClick={() => remove.mutate(deleting.id)}
              >
                {remove.isPending ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

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
